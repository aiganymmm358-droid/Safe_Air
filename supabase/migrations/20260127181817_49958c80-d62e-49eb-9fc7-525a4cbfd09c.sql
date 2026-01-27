-- Create districts table
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Алматы',
  total_score INTEGER NOT NULL DEFAULT 0,
  trees_planted INTEGER NOT NULL DEFAULT 0,
  reports_sent INTEGER NOT NULL DEFAULT 0,
  participants_count INTEGER NOT NULL DEFAULT 0,
  current_rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user district participation table
CREATE TABLE public.user_district_participation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_contribution INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, district_id)
);

-- Create challenge activities table for verification
CREATE TABLE public.challenge_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'tree_planted', 'report_sent', 'car_free_day', 'eco_lesson'
  description TEXT,
  photo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_district_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_activities ENABLE ROW LEVEL SECURITY;

-- Districts policies (public read)
CREATE POLICY "Anyone can view districts" ON public.districts
  FOR SELECT USING (true);

-- User district participation policies
CREATE POLICY "Users can view all participations" ON public.user_district_participation
  FOR SELECT USING (true);

CREATE POLICY "Users can join districts" ON public.user_district_participation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave districts" ON public.user_district_participation
  FOR DELETE USING (auth.uid() = user_id);

-- Challenge activities policies
CREATE POLICY "Users can view all activities" ON public.challenge_activities
  FOR SELECT USING (true);

CREATE POLICY "Users can submit activities" ON public.challenge_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending activities" ON public.challenge_activities
  FOR UPDATE USING (auth.uid() = user_id AND verification_status = 'pending');

-- Insert default Almaty districts
INSERT INTO public.districts (name, city, total_score, trees_planted, reports_sent, participants_count, current_rank) VALUES
  ('Бостандыкский', 'Алматы', 12450, 234, 89, 156, 1),
  ('Медеуский', 'Алматы', 11230, 198, 76, 142, 2),
  ('Алмалинский', 'Алматы', 10890, 167, 92, 128, 3),
  ('Наурызбайский', 'Алматы', 9870, 145, 54, 98, 4),
  ('Ауэзовский', 'Алматы', 9540, 189, 67, 187, 5),
  ('Алатауский', 'Алматы', 8920, 134, 45, 76, 6),
  ('Жетысуский', 'Алматы', 8450, 112, 38, 89, 7),
  ('Турксибский', 'Алматы', 7890, 98, 42, 67, 8);

-- Function to update district stats when activity is verified
CREATE OR REPLACE FUNCTION public.update_district_stats_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'verified' AND OLD.verification_status = 'pending' THEN
    -- Update district totals
    UPDATE public.districts
    SET 
      total_score = total_score + NEW.points_awarded,
      trees_planted = trees_planted + CASE WHEN NEW.activity_type = 'tree_planted' THEN 1 ELSE 0 END,
      reports_sent = reports_sent + CASE WHEN NEW.activity_type = 'report_sent' THEN 1 ELSE 0 END,
      updated_at = now()
    WHERE id = NEW.district_id;
    
    -- Update user contribution
    UPDATE public.user_district_participation
    SET total_contribution = total_contribution + NEW.points_awarded
    WHERE user_id = NEW.user_id AND district_id = NEW.district_id;
    
    -- Award XP and coins to user
    PERFORM public.add_user_xp(
      NEW.user_id, 
      NEW.points_awarded, 
      GREATEST(5, NEW.points_awarded / 2),
      'challenge_activity',
      'Активность в битве районов: ' || NEW.activity_type
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for activity verification
CREATE TRIGGER on_activity_verified
  AFTER UPDATE ON public.challenge_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_district_stats_on_activity();

-- Function to update participants count
CREATE OR REPLACE FUNCTION public.update_district_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.districts SET participants_count = participants_count + 1 WHERE id = NEW.district_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.districts SET participants_count = GREATEST(0, participants_count - 1) WHERE id = OLD.district_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for participation
CREATE TRIGGER on_participation_change
  AFTER INSERT OR DELETE ON public.user_district_participation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_district_participants();