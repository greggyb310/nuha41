import { databaseService } from './database';
import type { Conversation, AssistantType } from '../types/database';

export class ThreadManager {
  private conversationCache: Map<string, Conversation> = new Map();

  async getOrCreateThread(userId: string, assistantType: AssistantType, threadId?: string): Promise<Conversation | null> {
    if (threadId) {
      const cached = this.conversationCache.get(threadId);
      if (cached) {
        return cached;
      }

      const { data, error } = await databaseService.getConversationByThreadId(threadId);
      if (!error && data) {
        this.conversationCache.set(threadId, data);
        return data;
      }
    }

    const { data: conversations, error } = await databaseService.getUserConversations(userId, assistantType);
    if (!error && conversations && conversations.length > 0) {
      const latest = conversations[0];
      this.conversationCache.set(latest.thread_id, latest);
      return latest;
    }

    return null;
  }

  async createConversation(userId: string, assistantType: AssistantType, threadId: string): Promise<Conversation | null> {
    const { data, error } = await databaseService.createConversation({
      user_id: userId,
      assistant_type: assistantType,
      thread_id: threadId,
      message_count: 0,
      last_message_at: new Date().toISOString(),
    });

    if (!error && data) {
      this.conversationCache.set(threadId, data);
      return data;
    }

    return null;
  }

  async updateConversationMessage(conversationId: string): Promise<void> {
    await databaseService.incrementMessageCount(conversationId);
    this.conversationCache.clear();
  }

  clearCache(): void {
    this.conversationCache.clear();
  }

  getCachedConversation(threadId: string): Conversation | undefined {
    return this.conversationCache.get(threadId);
  }
}

export const threadManager = new ThreadManager();
