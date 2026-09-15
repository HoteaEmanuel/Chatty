import { supabase } from './supabase';

export async function createConversation(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}
