import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VendorApprovalNotificationPayload {
  approvalRecipientEmail: string;
  vendorName: string;
  vendorEmail: string;
  tenantId: string;
  tenantLinkedByEmail: boolean;
  tenantCreated: boolean;
}

@Injectable()
export class VendorOnboardingNotificationService {
  private readonly logger = new Logger(
    VendorOnboardingNotificationService.name,
  );

  constructor(private readonly configService: ConfigService) {}

  async sendApprovalNotification(
    payload: VendorApprovalNotificationPayload,
  ): Promise<boolean> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = Number(this.configService.get<string>('SMTP_PORT') || '0');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpFrom =
      this.configService.get<string>('SMTP_FROM') ||
      smtpUser ||
      'no-reply@b2-platform.local';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      this.logger.warn(
        [
          'Skipping approval email. SMTP is not fully configured.',
          `Intended recipient: ${payload.approvalRecipientEmail}`,
          `Vendor: ${payload.vendorName} (${payload.vendorEmail})`,
          `Tenant: ${payload.tenantId}`,
        ].join(' '),
      );
      return false;
    }

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const tenantResolution = payload.tenantLinkedByEmail
        ? 'linked with existing tenant by contact email'
        : payload.tenantCreated
          ? 'auto-provisioned with a new tenant workspace'
          : 'resolved without tenant auto-provisioning';

      await transporter.sendMail({
        from: smtpFrom,
        to: payload.approvalRecipientEmail,
        subject: `Vendor approval requested: ${payload.vendorName}`,
        text: [
          'A new vendor registration has been submitted for approval.',
          `Vendor: ${payload.vendorName}`,
          `Vendor Email: ${payload.vendorEmail}`,
          `Tenant ID: ${payload.tenantId}`,
          `Resolution: ${tenantResolution}`,
        ].join('\n'),
      });

      return true;
    } catch (error) {
      this.logger.error(
        'Failed to send vendor approval notification email.',
        error as Error,
      );
      return false;
    }
  }
}
