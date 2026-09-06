import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from './domain-event.interface';

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void> | void;

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private readonly handlers = new Map<string, Set<DomainEventHandler<any>>>();

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: DomainEventHandler<T>,
  ): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    const handlerSet = this.handlers.get(eventName)!;
    handlerSet.add(handler as DomainEventHandler<any>);

    this.logger.debug(`Subscribed handler to event "${eventName}".`);

    return () => {
      handlerSet.delete(handler as DomainEventHandler<any>);
      if (handlerSet.size === 0) {
        this.handlers.delete(eventName);
      }
    };
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlerSet = this.handlers.get(event.eventName);
    if (!handlerSet || handlerSet.size === 0) {
      this.logger.debug(
        `No handlers registered for event "${event.eventName}" (${event.eventId}).`,
      );
      return;
    }

    this.logger.log(
      `Publishing event "${event.eventName}" [${event.eventId}] to ${handlerSet.size} handler(s).`,
    );

    const executions = Array.from(handlerSet).map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(
          `Error in handler for event "${event.eventName}" [${event.eventId}]: ${
            error instanceof Error ? error.message : String(error)
          }`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    });

    await Promise.all(executions);
  }
}
