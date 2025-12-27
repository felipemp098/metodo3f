-- Add pillar_id to questions table (nullable for migration)
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS pillar_id UUID REFERENCES public.pillars(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_questions_pillar_id ON public.questions(pillar_id);

-- Note: We keep the existing 'pillar' column (enum) for backward compatibility
-- During migration, questions can use either pillar (enum) or pillar_id (UUID)

