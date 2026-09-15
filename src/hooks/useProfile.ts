import { useQuery } from '@tanstack/react-query';
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
