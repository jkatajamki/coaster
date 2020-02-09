SET client_encoding = 'UTF8';

create table if not exists coaster_users (
  user_id bigserial not null primary key,
  username varchar(255) not null unique,
  created_at timestamp not null,
  email varchar(255) not null unique,
  user_password varchar(1023) not null,
  salt varchar(1023) not null,
  updated_at timestamp not null
);
