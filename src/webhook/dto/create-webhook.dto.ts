import { IsString, IsNumber, IsNotEmpty, MaxLength, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty({ message: 'eventId is required' })
  @MaxLength(255, { message: 'eventId must not exceed 255 characters' })
  eventId: string;

  @IsString()
  @IsNotEmpty({ message: 'source is required' })
  @MaxLength(100, { message: 'source must not exceed 100 characters' })
  source: string;

  @IsString()
  @IsNotEmpty({ message: 'event is required' })
  @MaxLength(100, { message: 'event must not exceed 100 characters' })
  event: string;

  @IsObject()
  @IsNotEmpty({ message: 'payload is required and must not be empty' })
  payload: Record<string, any>;

  @Type(() => Number)
  @IsNumber({}, { message: 'timestamp must be a number' })
  @IsNotEmpty({ message: 'timestamp is required' })
  timestamp: number;
}
