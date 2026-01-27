import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'tree' | 'transport' | 'recycle' | 'report' | 'general';
  impact_description: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_verified: boolean;
  created_at: string;
  // Joined profile data
  user_name: string | null;
  user_avatar: string | null;
  user_level: number;
  is_liked: boolean;
}

export function useCommunityPosts() {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(postsData.map(p => p.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Fetch progress for levels
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, level')
        .in('user_id', userIds);

      // Fetch user's likes if authenticated
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        userLikes = likesData?.map(l => l.post_id) || [];
      }

      // Combine data
      const enrichedPosts: CommunityPost[] = postsData.map(post => {
        const profile = profiles?.find(p => p.user_id === post.user_id);
        const progress = progressData?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          post_type: post.post_type as CommunityPost['post_type'],
          user_name: profile?.full_name || 'Аноним',
          user_avatar: profile?.avatar_url || null,
          user_level: progress?.level || 1,
          is_liked: userLikes.includes(post.id),
        };
      });

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const likePost = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));

    try {
      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, is_liked: post.is_liked, likes_count: post.likes_count }
          : p
      ));
    }
  };

  return {
    posts,
    isLoading,
    refreshPosts: fetchPosts,
    likePost,
  };
}
