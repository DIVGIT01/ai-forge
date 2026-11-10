-- AI Forge database schema (Postgres / Neon).
-- Applied automatically at server boot by server/db/migrate.js.
-- Safe to run by hand against a fresh database as well.

CREATE TABLE IF NOT EXISTS creations (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT        NOT NULL,
    prompt      TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    type        TEXT        NOT NULL,
    publish     BOOLEAN     NOT NULL DEFAULT FALSE,
    likes       TEXT[]      NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dashboard: a user's own creations, newest first.
CREATE INDEX IF NOT EXISTS creations_user_id_created_at_idx
    ON creations (user_id, created_at DESC);

-- Community feed: published creations, newest first.
CREATE INDEX IF NOT EXISTS creations_publish_created_at_idx
    ON creations (publish, created_at DESC);
