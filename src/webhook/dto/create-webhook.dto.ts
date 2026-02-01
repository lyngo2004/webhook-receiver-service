import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  source: string;

  @IsString()
  event: string;

  payload: any;

  @Type(() => Number)
  @IsNumber({}, { message: 'timestamp must be a number' })
  timestamp: number;
}
