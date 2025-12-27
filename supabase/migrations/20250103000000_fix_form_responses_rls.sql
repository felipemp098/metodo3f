-- Fix RLS policies for form_responses and diagnostics
-- Allow public (anonymous) users to insert responses

-- Drop existing restrictive INSERT policy for form_responses
DROP POLICY IF EXISTS "Users can insert their own responses" ON form_responses;

-- Create new policy that allows anonymous users to insert responses
CREATE POLICY "Anyone can insert form responses"
ON form_responses
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to insert responses where user_id matches their auth.uid() OR user_id is null (anonymous)
CREATE POLICY "Users can insert their own responses"
ON form_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous users to insert responses
CREATE POLICY "Anonymous users can insert responses"
ON form_responses
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Create INSERT policy for diagnostics
-- Allow inserting diagnostics for any form_response (since we control this server-side)
CREATE POLICY "Anyone can insert diagnostics"
ON diagnostics
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_responses
    WHERE form_responses.id = diagnostics.form_response_id
  )
);

-- Also allow authenticated users to insert diagnostics for their own responses
CREATE POLICY "Users can insert diagnostics for their responses"
ON diagnostics
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_responses
    WHERE form_responses.id = diagnostics.form_response_id
    AND (form_responses.user_id = auth.uid() OR form_responses.user_id IS NULL)
  )
);

