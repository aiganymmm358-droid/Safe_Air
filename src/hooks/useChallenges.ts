import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  start_date: string;
  end_date: string;
  goal_description: string | null;
  reward_coins: number;
  reward_xp: number;
  max_participants: number | null;
  is_active: boolean;
  participants_count?: number;
  is_joined?: boolean;
}

interface ChallengeMessage {
  id: string;
  challenge_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export const useChallenges = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch all active challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });

      if (error) throw error;

      // Get participants count for each challenge
      const challengesWithCount = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          let isJoined = false;
          if (user) {
            const { data: participation } = await supabase
              .from('challenge_participants')
              .select('id')
              .eq('challenge_id', challenge.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isJoined = !!participation;
          }

          return {
            ...challenge,
            participants_count: count || 0,
            is_joined: isJoined
          };
        })
      );

      return challengesWithCount as Challenge[];
    }
  });

  // Join challenge mutation
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Вы присоединились к челленджу!');
    },
    onError: () => {
      toast.error('Не удалось присоединиться');
    }
  });

  // Leave challenge mutation
  const leaveChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Вы покинули челлендж');
    },
    onError: () => {
      toast.error('Не удалось покинуть челлендж');
    }
  });

  return {
    challenges,
    isLoading,
    joinChallenge: joinChallenge.mutate,
    leaveChallenge: leaveChallenge.mutate,
    isJoining: joinChallenge.isPending,
    isLeaving: leaveChallenge.isPending
  };
};

export const useChallengeChat = (challengeId: string) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChallengeMessage[]>([]);

  // Fetch messages
  const { isLoading } = useQuery({
    queryKey: ['challenge-messages', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_messages')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for messages
      const userIds = [...new Set((data || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const messagesWithUsers = (data || []).map(msg => ({
        ...msg,
        user_name: profileMap.get(msg.user_id)?.full_name || 'Пользователь',
        user_avatar: profileMap.get(msg.user_id)?.avatar_url
      }));

      setMessages(messagesWithUsers);
      return messagesWithUsers;
    },
    enabled: !!challengeId
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!challengeId) return;

    const channel = supabase
      .channel(`challenge-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenge_messages',
          filter: `challenge_id=eq.${challengeId}`
        },
        async (payload) => {
          const newMessage = payload.new as ChallengeMessage;
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', newMessage.user_id)
            .maybeSingle();

          setMessages(prev => [...prev, {
            ...newMessage,
            user_name: profile?.full_name || 'Пользователь',
            user_avatar: profile?.avatar_url
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_messages')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          content
        });

      if (error) throw error;
    },
    onError: () => {
      toast.error('Не удалось отправить сообщение');
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending
  };
};
