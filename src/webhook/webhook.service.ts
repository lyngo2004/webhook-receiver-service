import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { Webhook } from 'src/common/types/webhook.type';
import { storage } from 'src/storage/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  constructor(private readonly configService: ConfigService) { }

  handleWebhook(rawBody: string, signature: string | undefined, dto: CreateWebhookDto) {
    const secret = this.configService.get<string>('WEBHOOK_SECRET');

    console.log(signature)
    console.log(secret)
    if (!signature || !secret) {
      throw new UnauthorizedException('Missing signature');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    console.log('RAW BODY:', rawBody);
    console.log('SIGNATURE HEADER:', signature);
    console.log('EXPECTED:', expectedSignature);

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // timestamp check
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (Math.abs(now - dto.timestamp) > FIVE_MINUTES) {
      throw new BadRequestException('Request timestamp is too old');
    }

    // idempotency
    if (storage.existsEvent(dto.eventId)) {
      return { message: 'Duplicate event ignored' };
    }

    const webhook: Webhook = {
      id: randomUUID(),
      source: dto.source,
      event: dto.event,
      payload: dto.payload,
      receivedAt: new Date(),
    };

    storage.save(webhook);
    storage.markEventProcessed(dto.eventId);

    return {
      id: webhook.id,
      message: 'Webhook received',
    };
  }

  getAll() {
    const webhooks = storage.getAll();
    return {
      webhooks,
      count: webhooks.length,
    };
  }

  getById(id: string) {
    const webhook = storage.getById(id);
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }
}
