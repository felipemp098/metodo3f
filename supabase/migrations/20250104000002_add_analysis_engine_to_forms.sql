-- Add analysis_engine_id to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS analysis_engine_id UUID REFERENCES public.analysis_engines(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_forms_analysis_engine_id ON public.forms(analysis_engine_id);

-- Add RLS policy to allow users to view forms with their analysis engines
-- (This should already be covered by existing policies, but we ensure it works)

