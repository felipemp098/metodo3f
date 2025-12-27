-- Create analysis_engines table
CREATE TABLE IF NOT EXISTS public.analysis_engines (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_analysis_engines_user_id ON public.analysis_engines(user_id);

-- Enable RLS
ALTER TABLE public.analysis_engines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analysis engines"
ON public.analysis_engines
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis engines"
ON public.analysis_engines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis engines"
ON public.analysis_engines
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis engines"
ON public.analysis_engines
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_analysis_engines_updated_at
  BEFORE UPDATE ON public.analysis_engines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

