CREATE TABLE IF NOT EXISTS coaster_user (
  user_id BIGSERIAL NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_secret TEXT NOT NULL,
  salt TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL
);