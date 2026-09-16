import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export function useProfile() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', session!.user.id)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
      } as Profile;
    },
    enabled: !!session,
  });

  // Falls back to the email's local part while the profiles row hasn't
  // loaded yet, so the UI never shows a blank name.
  const displayName =
    query.data?.fullName?.trim() ||
    session?.user.email?.split('@')[0] ||
    'there';

  return {
    profile: query.data ?? null,
    displayName,
    loading: query.isLoading,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{ full_name: string; avatar_url: string }>;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    },
  });
}
