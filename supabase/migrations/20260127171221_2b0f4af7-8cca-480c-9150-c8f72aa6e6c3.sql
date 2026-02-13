-- Create table for user progress/gamification
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  eco_coins INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  total_coins_earned INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user achievements/badges
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

-- Create table for daily tasks
CREATE TABLE public.user_daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  coin_reward INTEGER NOT NULL DEFAULT 5,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, task_id, task_date)
);

-- Create table for user actions/activity log
CREATE TABLE public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_daily_tasks
CREATE POLICY "Users can view their own tasks"
ON public.user_daily_tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.user_daily_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.user_daily_tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_actions
CREATE POLICY "Users can view their own actions"
ON public.user_actions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
ON public.user_actions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger for user_progress updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to also create initial progress
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create initial progress (starts from zero)
  INSERT INTO public.user_progress (user_id, level, xp, xp_to_next_level, eco_coins)
  VALUES (NEW.id, 1, 0, 100, 0);
  
  -- Award welcome achievement
  INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon)
  VALUES (NEW.id, 'welcome', 'Добро пожаловать!', 'Первый вход в SafeAir Pro', '🎉');
  
  RETURN NEW;
END;
$$;

-- Function to add XP and handle level ups
CREATE OR REPLACE FUNCTION public.add_user_xp(_user_id UUID, _xp INTEGER, _coins INTEGER DEFAULT 0, _action_type TEXT DEFAULT 'generic', _description TEXT DEFAULT NULL)
RETURNS TABLE(new_level INTEGER, new_xp INTEGER, new_coins INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_xp_to_next INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get current progress
  SELECT * INTO v_progress FROM public.user_progress WHERE user_id = _user_id;
  
  IF v_progress IS NULL THEN
    RAISE EXCEPTION 'User progress not found';
  END IF;
  
  v_new_xp := v_progress.xp + _xp;
  v_new_level := v_progress.level;
  v_xp_to_next := v_progress.xp_to_next_level;
  
  -- Check for level up
  WHILE v_new_xp >= v_xp_to_next LOOP
    v_new_xp := v_new_xp - v_xp_to_next;
    v_new_level := v_new_level + 1;
    v_xp_to_next := v_xp_to_next + 50; -- Each level requires 50 more XP
    v_leveled_up := true;
  END LOOP;
  
  -- Update progress
  UPDATE public.user_progress
  SET 
    xp = v_new_xp,
    level = v_new_level,
    xp_to_next_level = v_xp_to_next,
    eco_coins = eco_coins + _coins,
    total_xp_earned = total_xp_earned + _xp,
    total_coins_earned = total_coins_earned + _coins,
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Log the action
  INSERT INTO public.user_actions (user_id, action_type, action_description, xp_earned, coins_earned)
  VALUES (_user_id, _action_type, _description, _xp, _coins);
  
  RETURN QUERY SELECT v_new_level, v_new_xp, (v_progress.eco_coins + _coins)::INTEGER, v_leveled_up;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_activity_date, streak_days INTO v_last_date, v_current_streak
  FROM public.user_progress WHERE user_id = _user_id;
  
  IF v_last_date IS NULL OR v_last_date < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken or first activity
    v_new_streak := 1;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Same day, no change
    v_new_streak := v_current_streak;
  END IF;
  
  UPDATE public.user_progress
  SET streak_days = v_new_streak, last_activity_date = CURRENT_DATE
  WHERE user_id = _user_id;
  
  RETURN v_new_streak;
END;
$$;