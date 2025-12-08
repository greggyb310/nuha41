import { supabase } from './supabase';
import type {
  UserProfile,
  Excursion,
  Conversation,
  FavoriteExcursion,
  AssistantType
} from '../types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface DatabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export const databaseService = {
  async getUserProfile(userId: string): Promise<DatabaseResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return { data: data as UserProfile | null, error };
  },

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();
    return { data: data as UserProfile | null, error };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<DatabaseResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .maybeSingle();
    return { data: data as UserProfile | null, error };
  },

  async getUserExcursions(userId: string, completed?: boolean): Promise<DatabaseResponse<Excursion[]>> {
    let query = supabase
      .from('excursions')
      .select('*')
      .eq('user_id', userId);

    if (completed !== undefined) {
      if (completed) {
        query = query.not('completed_at', 'is', null);
      } else {
        query = query.is('completed_at', null);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as Excursion[] | null, error };
  },

  async getExcursionById(excursionId: string): Promise<DatabaseResponse<Excursion>> {
    const { data, error } = await supabase
      .from('excursions')
      .select('*')
      .eq('id', excursionId)
      .maybeSingle();
    return { data: data as Excursion | null, error };
  },

  async createExcursion(excursion: Omit<Excursion, 'id' | 'created_at'>): Promise<DatabaseResponse<Excursion>> {
    const { data, error } = await supabase
      .from('excursions')
      .insert(excursion)
      .select()
      .single();
    return { data: data as Excursion | null, error };
  },

  async updateExcursion(excursionId: string, updates: Partial<Excursion>): Promise<DatabaseResponse<Excursion>> {
    const { data, error } = await supabase
      .from('excursions')
      .update(updates)
      .eq('id', excursionId)
      .select()
      .single();
    return { data: data as Excursion | null, error };
  },

  async completeExcursion(excursionId: string): Promise<DatabaseResponse<Excursion>> {
    const { data, error } = await supabase
      .from('excursions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', excursionId)
      .select()
      .single();
    return { data: data as Excursion | null, error };
  },

  async deleteExcursion(excursionId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from('excursions')
      .delete()
      .eq('id', excursionId);
    return { error };
  },

  async getUserConversations(userId: string, assistantType?: AssistantType): Promise<DatabaseResponse<Conversation[]>> {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId);

    if (assistantType) {
      query = query.eq('assistant_type', assistantType);
    }

    const { data, error } = await query.order('last_message_at', { ascending: false });
    return { data: data as Conversation[] | null, error };
  },

  async getConversationByThreadId(threadId: string): Promise<DatabaseResponse<Conversation>> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('thread_id', threadId)
      .maybeSingle();
    return { data: data as Conversation | null, error };
  },

  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at'>): Promise<DatabaseResponse<Conversation>> {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();
    return { data: data as Conversation | null, error };
  },

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<DatabaseResponse<Conversation>> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();
    return { data: data as Conversation | null, error };
  },

  async incrementMessageCount(conversationId: string): Promise<DatabaseResponse<Conversation>> {
    const { data: currentConv, error: fetchError } = await supabase
      .from('conversations')
      .select('message_count')
      .eq('id', conversationId)
      .maybeSingle();

    if (fetchError || !currentConv) {
      return { data: null, error: fetchError };
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({
        message_count: currentConv.message_count + 1,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    return { data: data as Conversation | null, error };
  },

  async getFavoriteExcursions(userId: string): Promise<DatabaseResponse<any[]>> {
    const { data, error } = await supabase
      .from('favorite_excursions')
      .select('*, excursions(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async isFavorite(userId: string, excursionId: string): Promise<DatabaseResponse<FavoriteExcursion>> {
    const { data, error } = await supabase
      .from('favorite_excursions')
      .select('*')
      .eq('user_id', userId)
      .eq('excursion_id', excursionId)
      .maybeSingle();
    return { data: data as FavoriteExcursion | null, error };
  },

  async addFavoriteExcursion(userId: string, excursionId: string): Promise<DatabaseResponse<FavoriteExcursion>> {
    const { data, error } = await supabase
      .from('favorite_excursions')
      .insert({ user_id: userId, excursion_id: excursionId })
      .select()
      .single();
    return { data: data as FavoriteExcursion | null, error };
  },

  async removeFavoriteExcursion(userId: string, excursionId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from('favorite_excursions')
      .delete()
      .eq('user_id', userId)
      .eq('excursion_id', excursionId);
    return { error };
  },
};
