import sql from '../configs/db.js'

/**
 * Creates the schema if it is not there yet.
 *
 * Every statement is idempotent, so this runs on every boot and is a no-op
 * once the database is set up. Keeps first-run setup to `npm start`.
 */
export const ensureSchema = async () => {
  await sql`
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
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS creations_user_id_created_at_idx
      ON creations (user_id, created_at DESC)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS creations_publish_created_at_idx
      ON creations (publish, created_at DESC)
  `
}
