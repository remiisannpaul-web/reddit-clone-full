-- Better Auth 1.7: add account.issuer and backfill existing rows
ALTER TABLE account ADD COLUMN IF NOT EXISTS issuer text;

UPDATE account
SET issuer = 'local:credential'
WHERE "providerId" = 'credential' AND issuer IS NULL;

UPDATE account
SET issuer = 'local:oauth:github'
WHERE "providerId" = 'github' AND issuer IS NULL;

UPDATE account
SET issuer = 'local:oauth:google'
WHERE "providerId" = 'google' AND issuer IS NULL;

ALTER TABLE account ALTER COLUMN issuer SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS account_issuer_accountId_uidx ON account (issuer, "accountId");
