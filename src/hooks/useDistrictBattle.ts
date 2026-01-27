import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface District {
  id: string;
  name: string;
  city: string;
  total_score: number;
  trees_planted: number;
  reports_sent: number;
  participants_count: number;
  current_rank: number;
}

interface UserParticipation {
  id: string;
  district_id: string;
  joined_at: string;
  total_contribution: number;
  district?: District;
}

interface ChallengeActivity {
  id: string;
  user_id: string;
  district_id: string;
  activity_type: string;
  description: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  points_awarded: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

export function useDistrictBattle() {
  const { user } = useAuthContext();
  const [districts, setDistricts] = useState<District[]>([]);
  const [userParticipation, setUserParticipation] = useState<UserParticipation | null>(null);
  const [userActivities, setUserActivities] = useState<ChallengeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDistricts = useCallback(async () => {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .order('total_score', { ascending: false });

    if (error) {
      console.error('Error fetching districts:', error);
      return;
    }

    // Update ranks based on current order
    const rankedDistricts = (data || []).map((d, index) => ({
      ...d,
      current_rank: index + 1
    }));

    setDistricts(rankedDistricts);
  }, []);

  const fetchUserParticipation = useCallback(async () => {
    if (!user) {
      setUserParticipation(null);
      return;
    }

    const { data, error } = await supabase
      .from('user_district_participation')
      .select('*, district:districts(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participation:', error);
      return;
    }

    if (data) {
      setUserParticipation({
        id: data.id,
        district_id: data.district_id,
        joined_at: data.joined_at,
        total_contribution: data.total_contribution,
        district: data.district as District
      });
    } else {
      setUserParticipation(null);
    }
  }, [user]);

  const fetchUserActivities = useCallback(async () => {
    if (!user) {
      setUserActivities([]);
      return;
    }

    const { data, error } = await supabase
      .from('challenge_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching activities:', error);
      return;
    }

    setUserActivities((data || []) as ChallengeActivity[]);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDistricts(),
        fetchUserParticipation(),
        fetchUserActivities()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchDistricts, fetchUserParticipation, fetchUserActivities]);

  const joinDistrict = async (districtId: string) => {
    if (!user) {
      toast.error('Войдите в аккаунт для участия');
      return false;
    }

    if (userParticipation) {
      toast.error('Вы уже участвуете в битве районов');
      return false;
    }

    setIsJoining(true);
    try {
      const { error } = await supabase
        .from('user_district_participation')
        .insert({
          user_id: user.id,
          district_id: districtId
        });

      if (error) throw error;

      toast.success('Вы успешно присоединились к битве! 🎉');
      await Promise.all([fetchDistricts(), fetchUserParticipation()]);
      return true;
    } catch (error: any) {
      console.error('Error joining district:', error);
      toast.error('Не удалось присоединиться');
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const leaveDistrict = async () => {
    if (!user || !userParticipation) return false;

    try {
      const { error } = await supabase
        .from('user_district_participation')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Вы покинули битву районов');
      await Promise.all([fetchDistricts(), fetchUserParticipation()]);
      return true;
    } catch (error: any) {
      console.error('Error leaving district:', error);
      toast.error('Не удалось выйти');
      return false;
    }
  };

  const submitActivity = async (activity: {
    activity_type: string;
    description?: string;
    photo_url?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!user || !userParticipation) {
      toast.error('Сначала присоединитесь к битве районов');
      return false;
    }

    // Calculate points based on activity type
    const pointsMap: Record<string, number> = {
      tree_planted: 100,
      report_sent: 50,
      car_free_day: 25,
      eco_lesson: 20,
      cleanup: 75,
      recycling: 30
    };

    const points = pointsMap[activity.activity_type] || 10;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('challenge_activities')
        .insert({
          user_id: user.id,
          district_id: userParticipation.district_id,
          activity_type: activity.activity_type,
          description: activity.description || null,
          photo_url: activity.photo_url || null,
          latitude: activity.latitude || null,
          longitude: activity.longitude || null,
          points_awarded: points,
          verification_status: 'pending'
        });

      if (error) throw error;

      toast.success('Активность отправлена на проверку! 📋', {
        description: `Потенциальные очки: +${points}`
      });
      
      await fetchUserActivities();
      return true;
    } catch (error: any) {
      console.error('Error submitting activity:', error);
      toast.error('Не удалось отправить активность');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-verify activities with photo and geolocation
  const autoVerifyActivity = async (activityId: string) => {
    const activity = userActivities.find(a => a.id === activityId);
    if (!activity) return false;

    // Simple auto-verification: if has photo AND location, auto-verify
    const hasProof = activity.photo_url && activity.latitude && activity.longitude;
    
    if (hasProof) {
      try {
        const { error } = await supabase
          .from('challenge_activities')
          .update({
            verification_status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('id', activityId);

        if (error) throw error;

        toast.success('Активность подтверждена! ✅');
        await Promise.all([fetchDistricts(), fetchUserActivities()]);
        return true;
      } catch (error) {
        console.error('Error verifying activity:', error);
        return false;
      }
    }

    return false;
  };

  return {
    districts,
    userParticipation,
    userActivities,
    isLoading,
    isJoining,
    isSubmitting,
    joinDistrict,
    leaveDistrict,
    submitActivity,
    autoVerifyActivity,
    refreshData: () => Promise.all([fetchDistricts(), fetchUserParticipation(), fetchUserActivities()])
  };
}
