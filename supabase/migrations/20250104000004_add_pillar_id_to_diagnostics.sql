-- Add pillar_id to diagnostics table
ALTER TABLE public.diagnostics 
ADD COLUMN IF NOT EXISTS pillar_id UUID REFERENCES public.pillars(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_diagnostics_pillar_id ON public.diagnostics(pillar_id);

-- Note: We keep the existing 'bottleneck' column (TEXT) for backward compatibility
-- It can store either the enum value or the pillar_id UUID

