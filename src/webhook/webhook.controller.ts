import { Controller, Post, Get, Param, Req, Headers, Body, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) { }

  @Post()
  receiveWebhook(
    @Req() req: Request & { rawBody?: string },
    @Headers('x-signature') signature: string,
    @Body() dto: CreateWebhookDto,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    return this.webhookService.handleWebhook(
      req.rawBody!,
      signature,
      dto,
    );
  }

  @Get()
  getAll() {
    return this.webhookService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.webhookService.getById(id);
  }
}
