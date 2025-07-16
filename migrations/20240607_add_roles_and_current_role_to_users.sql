-- Add roles and current_role to users who own properties (seller)
UPDATE users
SET roles = '["buyer", "seller"]'::jsonb,
    "current_role" = 'seller'
WHERE id IN (SELECT owner_id FROM properties GROUP BY owner_id);

-- Add roles and current_role to all other users (buyer)
UPDATE users
SET roles = '["buyer", "seller"]'::jsonb,
    "current_role" = 'buyer'
WHERE (roles IS NULL OR "current_role" IS NULL)
  AND id NOT IN (SELECT owner_id FROM properties GROUP BY owner_id); 