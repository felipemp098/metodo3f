-- Create pillars table
CREATE TABLE IF NOT EXISTS public.pillars (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_engine_id UUID NOT NULL REFERENCES public.analysis_engines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  feedback TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_pillars_analysis_engine_id ON public.pillars(analysis_engine_id);
CREATE INDEX idx_pillars_order_index ON public.pillars(analysis_engine_id, order_index);

-- Enable RLS
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view pillars of their analysis engines"
ON public.pillars
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_engines 
    WHERE analysis_engines.id = pillars.analysis_engine_id 
    AND analysis_engines.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert pillars to their analysis engines"
ON public.pillars
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analysis_engines 
    WHERE analysis_engines.id = pillars.analysis_engine_id 
    AND analysis_engines.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update pillars of their analysis engines"
ON public.pillars
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_engines 
    WHERE analysis_engines.id = pillars.analysis_engine_id 
    AND analysis_engines.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete pillars of their analysis engines"
ON public.pillars
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.analysis_engines 
    WHERE analysis_engines.id = pillars.analysis_engine_id 
    AND analysis_engines.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_pillars_updated_at
  BEFORE UPDATE ON public.pillars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

