import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import {
  VendorApprovalNotificationPayload,
  VendorOnboardingNotificationService,
} from './vendor-onboarding-notification.service';

export interface VendorApprovalNotificationDispatchResult {
  queued: boolean;
  sent: boolean;
  jobId?: string;
  queuedAt?: string;
}

@Injectable()
export class VendorOnboardingNotificationQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    VendorOnboardingNotificationQueueService.name,
  );
  private readonly queueName = 'vendor-onboarding-approval-notifications';

  private queue: Queue<VendorApprovalNotificationPayload, boolean> | null =
    null;
  private worker: Worker<VendorApprovalNotificationPayload, boolean> | null =
    null;
  private producerRedis: IORedis | null = null;
  private workerRedis: IORedis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationService: VendorOnboardingNotificationService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.readEnabledFlag()) {
      this.logger.log(
        'Vendor onboarding approval queue is disabled (VENDOR_ONBOARDING_NOTIFICATION_QUEUE_ENABLED=false).',
      );
      return;
    }

    try {
      this.producerRedis = this.createRedisClient();
      this.workerRedis = this.createRedisClient();

      this.queue = new Queue<VendorApprovalNotificationPayload, boolean>(
        this.queueName,
        {
          connection: this.producerRedis,
          defaultJobOptions: {
            removeOnComplete: 500,
            removeOnFail: 500,
            attempts: this.readNumericConfig(
              'VENDOR_ONBOARDING_NOTIFICATION_JOB_ATTEMPTS',
              3,
              1,
            ),
            backoff: {
              type: 'exponential',
              delay: this.readNumericConfig(
                'VENDOR_ONBOARDING_NOTIFICATION_BACKOFF_MS',
                2_000,
                100,
              ),
            },
          },
        },
      );

      this.worker = new Worker<VendorApprovalNotificationPayload, boolean>(
        this.queueName,
        async (job) => {
          return this.notificationService.sendApprovalNotification(job.data);
        },
        {
          connection: this.workerRedis,
          concurrency: this.readNumericConfig(
            'VENDOR_ONBOARDING_NOTIFICATION_WORKER_CONCURRENCY',
            2,
            1,
          ),
        },
      );

      this.worker.on('failed', (job, error) => {
        this.logger.warn(
          `Vendor onboarding notification job ${job?.id ?? 'unknown'} failed: ${error.message}`,
        );
      });

      this.worker.on('completed', (job) => {
        this.logger.log(
          `Vendor onboarding notification job ${job.id} completed.`,
        );
      });

      this.logger.log(
        'Vendor onboarding approval queue is enabled and worker is running.',
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize vendor onboarding approval queue. Falling back to sync mode.',
        error instanceof Error ? error.stack : undefined,
      );

      await this.shutdownQueueResources();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdownQueueResources();
  }

  async dispatchApprovalNotification(
    payload: VendorApprovalNotificationPayload,
  ): Promise<VendorApprovalNotificationDispatchResult> {
    if (!this.queue) {
      const sent =
        await this.notificationService.sendApprovalNotification(payload);

      return {
        queued: false,
        sent,
      };
    }

    const job = await this.queue.add('vendor-approval-notification', payload);
    return {
      queued: true,
      sent: false,
      jobId: String(job.id),
      queuedAt: new Date().toISOString(),
    };
  }

  private readEnabledFlag(): boolean {
    const raw = this.configService
      .get<string>('VENDOR_ONBOARDING_NOTIFICATION_QUEUE_ENABLED')
      ?.trim()
      .toLowerCase();

    return raw === '1' || raw === 'true' || raw === 'yes';
  }

  private createRedisClient(): IORedis {
    const redisUrl = this.configService.get<string>('REDIS_URL')?.trim();
    if (redisUrl) {
      return new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
      });
    }

    const host =
      this.configService.get<string>('REDIS_HOST')?.trim() || '127.0.0.1';
    const port = this.readNumericConfig('REDIS_PORT', 6379, 1);
    const db = this.readNumericConfig('REDIS_DB', 0, 0);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    return new IORedis({
      host,
      port,
      db,
      password: password && password.length > 0 ? password : undefined,
      maxRetriesPerRequest: null,
    });
  }

  private readNumericConfig(
    key: string,
    fallback: number,
    minimum: number,
  ): number {
    const raw = this.configService.get<string>(key);
    if (!raw) {
      return fallback;
    }

    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < minimum) {
      this.logger.warn(
        `${key}="${raw}" is invalid. Falling back to ${fallback}.`,
      );
      return fallback;
    }

    return parsed;
  }

  private async shutdownQueueResources(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }

    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }

    if (this.workerRedis) {
      await this.workerRedis.quit();
      this.workerRedis = null;
    }

    if (this.producerRedis) {
      await this.producerRedis.quit();
      this.producerRedis = null;
    }
  }
}
