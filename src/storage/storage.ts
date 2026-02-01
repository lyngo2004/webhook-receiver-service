import { Webhook } from "src/common/types/webhook.type";


let webhooks: Webhook[] = [];

const processedEventIds = new Set<string>;

export const storage = {

    existsEvent(eventId: string): boolean{
        return processedEventIds.has(eventId);
    },

    markEventProcessed(eventId: string): void {
        processedEventIds.add(eventId);
    },

    save(webhook: Webhook): void {
        webhooks.push(webhook);
    },

    getAll(): Webhook[] {
        return webhooks;
    },

    getById(id: string): Webhook | undefined {
        return webhooks.find(w => w.id === id);
    },

    count(): number {
        return webhooks.length;
    },

    clear(): void {
        webhooks = [];
    }
};