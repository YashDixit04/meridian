import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import {
  BulkCreateOfferingsProgress,
  BulkCreateOfferingsResult,
  CatalogService,
} from './catalog.service';
import { CreateOfferingInput } from '../repository/catalog.repository';

export interface CatalogBulkUploadJobPayload {
  tenantId: string;
  catalogId: string;
  offerings: CreateOfferingInput[];
}

export interface CatalogBulkUploadEnqueueResult {
  queueEnabled: true;
  jobId: string;
  status: 'queued';
  queuedAt: string;
}

export interface CatalogBulkUploadJobStatus {
  queueEnabled: true;
  jobId: string;
  state: string;
  progress: BulkCreateOfferingsProgress | null;
  attemptsMade: number;
  queuedAt: string | null;
  processedAt: string | null;
  finishedAt: string | null;
  failedReason: string | null;
  result: BulkCreateOfferingsResult | null;
}

export interface CatalogBulkUploadJobSummary {
  queueEnabled: true;
  jobId: string;
  state: string;
  progress: BulkCreateOfferingsProgress | null;
  attemptsMade: number;
  queuedAt: string | null;
  finishedAt: string | null;
  failedReason: string | null;
}

@Injectable()
export class CatalogBulkUploadQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CatalogBulkUploadQueueService.name);
  private readonly queueName = 'catalog-bulk-upload';

  private queue: Queue<
    CatalogBulkUploadJobPayload,
    BulkCreateOfferingsResult
  > | null = null;
  private worker: Worker<
    CatalogBulkUploadJobPayload,
    BulkCreateOfferingsResult
  > | null = null;

  private producerRedis: IORedis | null = null;
  private workerRedis: IORedis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly catalogService: CatalogService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.readEnabledFlag()) {
      this.logger.log(
        'Catalog bulk upload queue is disabled (CATALOG_BULK_UPLOAD_QUEUE_ENABLED=false).',
      );
      return;
    }

    try {
      this.producerRedis = this.createRedisClient();
      this.workerRedis = this.createRedisClient();

      this.queue = new Queue<
        CatalogBulkUploadJobPayload,
        BulkCreateOfferingsResult
      >(this.queueName, {
        connection: this.producerRedis,
        defaultJobOptions: {
          removeOnComplete: 500,
          removeOnFail: 500,
          attempts: this.readNumericConfig(
            'CATALOG_BULK_UPLOAD_JOB_ATTEMPTS',
            3,
            1,
          ),
          backoff: {
            type: 'exponential',
            delay: this.readNumericConfig(
              'CATALOG_BULK_UPLOAD_BACKOFF_MS',
              2_000,
              100,
            ),
          },
        },
      });

      this.worker = new Worker<
        CatalogBulkUploadJobPayload,
        BulkCreateOfferingsResult
      >(
        this.queueName,
        async (job) => {
          await job.updateProgress({
            total: job.data.offerings.length,
            processed: 0,
            createdCount: 0,
            failedCount: 0,
            lastIndex: -1,
          });

          return this.catalogService.createOfferingsBulk(
            job.data.tenantId,
            job.data.catalogId,
            job.data.offerings,
            {
              onProgress: async (progress) => {
                await job.updateProgress(progress);
              },
            },
          );
        },
        {
          connection: this.workerRedis,
          concurrency: this.readNumericConfig(
            'CATALOG_BULK_UPLOAD_WORKER_CONCURRENCY',
            2,
            1,
          ),
        },
      );

      this.worker.on('failed', (job, error) => {
        this.logger.warn(
          `Catalog bulk upload job ${job?.id ?? 'unknown'} failed: ${error.message}`,
        );
      });

      this.worker.on('completed', (job) => {
        this.logger.log(`Catalog bulk upload job ${job.id} completed.`);
      });

      this.logger.log(
        'Catalog bulk upload queue is enabled and worker is running.',
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize catalog bulk upload queue. Falling back to sync mode.',
        error instanceof Error ? error.stack : undefined,
      );

      await this.shutdownQueueResources();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdownQueueResources();
  }

  isQueueEnabled(): boolean {
    return !!this.queue && !!this.worker;
  }

  async enqueueBulkCreateOfferings(
    tenantId: string,
    catalogId: string,
    offerings: CreateOfferingInput[],
  ): Promise<CatalogBulkUploadEnqueueResult> {
    if (!this.queue) {
      throw new ServiceUnavailableException(
        'Catalog bulk upload queue is disabled. Use the synchronous bulk endpoint or enable Redis queue.',
      );
    }

    const maxItems = this.readNumericConfig(
      'CATALOG_BULK_UPLOAD_MAX_ITEMS',
      1000,
      1,
    );

    if (offerings.length > maxItems) {
      throw new BadRequestException(
        `Bulk upload jobs are limited to ${maxItems} offerings per request.`,
      );
    }

    const job = await this.queue.add('catalog-offerings-bulk', {
      tenantId,
      catalogId,
      offerings,
    });

    return {
      queueEnabled: true,
      jobId: String(job.id),
      status: 'queued',
      queuedAt: new Date().toISOString(),
    };
  }

  async getBulkCreateOfferingsJobStatus(
    tenantId: string,
    catalogId: string,
    jobId: string,
  ): Promise<CatalogBulkUploadJobStatus> {
    if (!this.queue) {
      throw new ServiceUnavailableException(
        'Catalog bulk upload queue is disabled. No async jobs are available.',
      );
    }

    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Bulk upload job not found.');
    }

    this.ensureJobScope(job, tenantId, catalogId);

    const state = await job.getState();

    return {
      queueEnabled: true,
      jobId,
      state,
      progress: this.normalizeProgress(job.progress),
      attemptsMade: job.attemptsMade,
      queuedAt: this.toIsoString(job.timestamp),
      processedAt: this.toIsoString(job.processedOn),
      finishedAt: this.toIsoString(job.finishedOn),
      failedReason: job.failedReason ?? null,
      result:
        (job.returnvalue as BulkCreateOfferingsResult | undefined) ?? null,
    };
  }

  async listBulkCreateOfferingsJobs(
    tenantId: string,
    catalogId: string,
    state: string = 'waiting',
    limit = 20,
  ): Promise<CatalogBulkUploadJobSummary[]> {
    if (!this.queue) {
      throw new ServiceUnavailableException(
        'Catalog bulk upload queue is disabled. No async jobs are available.',
      );
    }

    const jobState = this.normalizeJobState(state);
    const requestedLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const boundedLimit = this.readNumericConfig(
      'CATALOG_BULK_UPLOAD_LIST_LIMIT',
      requestedLimit,
      1,
    );

    const jobs = await this.queue.getJobs(
      [jobState],
      0,
      boundedLimit - 1,
      true,
    );
    return jobs
      .filter(
        (job) =>
          job.data.tenantId === tenantId && job.data.catalogId === catalogId,
      )
      .map((job) => ({
        queueEnabled: true,
        jobId: String(job.id),
        state: jobState,
        progress: this.normalizeProgress(job.progress),
        attemptsMade: job.attemptsMade,
        queuedAt: this.toIsoString(job.timestamp),
        finishedAt: this.toIsoString(job.finishedOn),
        failedReason: job.failedReason ?? null,
      }));
  }

  private ensureJobScope(
    job: Job<CatalogBulkUploadJobPayload, BulkCreateOfferingsResult>,
    tenantId: string,
    catalogId: string,
  ): void {
    if (job.data.tenantId !== tenantId || job.data.catalogId !== catalogId) {
      throw new NotFoundException(
        'Bulk upload job not found for this tenant/catalog.',
      );
    }
  }

  private toIsoString(value: number | null | undefined): string | null {
    if (!value || Number.isNaN(value)) {
      return null;
    }

    return new Date(value).toISOString();
  }

  private normalizeProgress(
    progress: unknown,
  ): BulkCreateOfferingsProgress | null {
    if (!progress || typeof progress !== 'object') {
      return null;
    }

    const candidate = progress as Partial<BulkCreateOfferingsProgress>;
    if (
      typeof candidate.total !== 'number' ||
      typeof candidate.processed !== 'number' ||
      typeof candidate.createdCount !== 'number' ||
      typeof candidate.failedCount !== 'number' ||
      typeof candidate.lastIndex !== 'number'
    ) {
      return null;
    }

    return {
      total: candidate.total,
      processed: candidate.processed,
      createdCount: candidate.createdCount,
      failedCount: candidate.failedCount,
      lastIndex: candidate.lastIndex,
      lastProductId:
        typeof candidate.lastProductId === 'string'
          ? candidate.lastProductId
          : undefined,
    };
  }

  private normalizeJobState(
    state: string,
  ): 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused' {
    const normalized = state.trim().toLowerCase();
    if (
      normalized === 'waiting' ||
      normalized === 'active' ||
      normalized === 'completed' ||
      normalized === 'failed' ||
      normalized === 'delayed' ||
      normalized === 'paused'
    ) {
      return normalized;
    }

    throw new BadRequestException(
      `Unsupported bulk upload job state: ${state}`,
    );
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

  private readEnabledFlag(): boolean {
    const raw = this.configService
      .get<string>('CATALOG_BULK_UPLOAD_QUEUE_ENABLED')
      ?.trim()
      .toLowerCase();

    return raw === '1' || raw === 'true' || raw === 'yes';
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
