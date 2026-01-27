-- Add is_pinned column for featuring safe, relevant posts
ALTER TABLE public.community_posts 
ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Add pinned_at timestamp to track when post was pinned
ALTER TABLE public.community_posts 
ADD COLUMN pinned_at timestamp with time zone;

-- Add pinned_by to track who pinned the post (moderator/admin)
ALTER TABLE public.community_posts 
ADD COLUMN pinned_by uuid;

-- Create index for efficient pinned posts query
CREATE INDEX idx_community_posts_pinned ON public.community_posts (is_pinned, pinned_at DESC) WHERE is_pinned = true;

-- Only moderators and admins can pin posts
CREATE POLICY "Moderators can pin posts" 
ON public.community_posts 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin')
);