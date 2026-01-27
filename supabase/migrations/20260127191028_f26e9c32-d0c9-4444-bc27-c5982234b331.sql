-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🎯',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  goal_description TEXT,
  reward_coins INTEGER DEFAULT 50,
  reward_xp INTEGER DEFAULT 100,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create challenge chat messages table
CREATE TABLE public.challenge_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_messages ENABLE ROW LEVEL SECURITY;

-- Challenges policies (public read)
CREATE POLICY "Anyone can view active challenges"
ON public.challenges FOR SELECT
USING (is_active = true);

-- Participants policies
CREATE POLICY "Anyone can view participants"
ON public.challenge_participants FOR SELECT
USING (true);

CREATE POLICY "Users can join challenges"
ON public.challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
ON public.challenge_participants FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their progress"
ON public.challenge_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Messages policies (only participants can read/write)
CREATE POLICY "Participants can view messages"
ON public.challenge_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_id = challenge_messages.challenge_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Participants can send messages"
ON public.challenge_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_id = challenge_messages.challenge_id
    AND user_id = auth.uid()
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_messages;

-- Insert sample challenges
INSERT INTO public.challenges (title, description, emoji, end_date, goal_description, reward_coins, reward_xp) VALUES
('Неделя без авто', 'Откажитесь от личного автомобиля на неделю и используйте общественный транспорт, велосипед или ходите пешком', '🚴', now() + interval '4 days', 'Не использовать авто 7 дней', 100, 200),
('Посади 5 деревьев', 'Посадите 5 деревьев в своём районе и помогите улучшить качество воздуха', '🌳', now() + interval '12 days', 'Посадить 5 деревьев', 150, 300),
('Эко-марафон', 'Выполните 10 эко-заданий за месяц: сортировка мусора, экономия воды и электричества', '♻️', now() + interval '25 days', 'Выполнить 10 эко-заданий', 200, 400),
('Чистый двор', 'Организуйте уборку территории в своём дворе вместе с соседями', '🧹', now() + interval '7 days', 'Провести субботник', 75, 150);