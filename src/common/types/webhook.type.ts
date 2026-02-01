export interface Webhook {
  id: string;
  source: string;
  event: string;
  payload: unknown;
  receivedAt: Date;
}

export interface WebhookInput {
  eventId: string;
  source: string;
  event: string;
  payload: unknown;
  timestamp: number;
}
