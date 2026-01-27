-- Create table for content reports
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user warnings and bans
CREATE TABLE public.user_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'warning', 'ban'
  reason TEXT NOT NULL,
  related_post_id UUID REFERENCES public.community_posts(id) ON DELETE SET NULL,
  ban_until TIMESTAMP WITH TIME ZONE, -- null for warnings, set for bans
  issued_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add moderation columns to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
ADD COLUMN moderation_reason TEXT;

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;

-- Content reports policies
CREATE POLICY "Users can report posts" ON public.content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- User moderation policies
CREATE POLICY "Users can view their own moderation history" ON public.user_moderation
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_moderation
    WHERE user_id = _user_id
      AND action_type = 'ban'
      AND ban_until > now()
  )
$$;

-- Function to get user warning count in last 30 days
CREATE OR REPLACE FUNCTION public.get_user_warning_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_moderation
  WHERE user_id = _user_id
    AND action_type = 'warning'
    AND created_at > now() - INTERVAL '30 days'
$$;

-- Function to issue warning or ban
CREATE OR REPLACE FUNCTION public.moderate_user(
  _user_id UUID,
  _reason TEXT,
  _post_id UUID DEFAULT NULL
)
RETURNS TABLE(action_taken TEXT, ban_until TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_warning_count INTEGER;
  v_action TEXT;
  v_ban_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current warning count
  v_warning_count := public.get_user_warning_count(_user_id);
  
  IF v_warning_count >= 1 THEN
    -- Second offense: ban for 1 week
    v_action := 'ban';
    v_ban_until := now() + INTERVAL '7 days';
  ELSE
    -- First offense: warning only
    v_action := 'warning';
    v_ban_until := NULL;
  END IF;
  
  -- Insert moderation record
  INSERT INTO public.user_moderation (user_id, action_type, reason, related_post_id, ban_until)
  VALUES (_user_id, v_action, _reason, _post_id, v_ban_until);
  
  -- Hide the post if provided
  IF _post_id IS NOT NULL THEN
    UPDATE public.community_posts
    SET is_hidden = true, moderation_status = 'rejected', moderation_reason = _reason
    WHERE id = _post_id;
  END IF;
  
  RETURN QUERY SELECT v_action, v_ban_until;
END;
$$;