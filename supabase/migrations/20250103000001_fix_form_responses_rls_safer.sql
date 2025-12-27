-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert form responses" ON form_responses;

-- Keep the authenticated user policy (already exists from previous migration)
-- Keep the anonymous user policy (already exists from previous migration)
-- The combination of these two policies allows:
-- 1. Authenticated users to insert with their user_id or null
-- 2. Anonymous users to insert with null user_id

-- For diagnostics, ensure the policy allows inserts for any valid form_response_id
-- This is safe because the form_response must exist first

