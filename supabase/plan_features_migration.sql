ALTER TABLE services ADD COLUMN IF NOT EXISTS last_relist_at timestamptz;
ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_promoted boolean DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS promoted_until timestamptz;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id),
  user_id uuid REFERENCES auth.users(id),
  stripe_session_id text,
  amount integer, type text, plan text,
  status text DEFAULT 'paid',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_promoted ON listings(is_promoted, created_at DESC);

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_plan_check;
ALTER TABLE services ADD CONSTRAINT services_plan_check 
CHECK (plan IN ('free','basic','pro','elite','starter','business','business_pro','business_elite'));
