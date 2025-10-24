# MySQL scripts for dropping existing tables and recreating the database table structure

# Drop tables


DROP TABLE IF EXISTS `users`;

# Create tables

CREATE TABLE "users" (
  "id"              int(11)         NOT NULL AUTO_INCREMENT,
  "first_name"      varchar(64)     NOT NULL,
  "last_name"       varchar(64)     NOT NULL,
  "username"        varchar(64)     NOT NULL,
  "email"           varchar(256)    NOT NULL,
  "image_filename"  varchar(64)     DEFAULT NULL,
  "password_hash"   varchar(255)    NOT NULL,
  "auth_token"      char(64)        DEFAULT NULL,
  "created_at"      timestamp       NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY                   ("id"),
  UNIQUE KEY "unique_username"  ("username"),
  UNIQUE KEY "unique_email"     ("email")
);
