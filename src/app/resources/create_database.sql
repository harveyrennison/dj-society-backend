# MySQL scripts for dropping existing tables and recreating the database table structure

-- =========================
-- Drop (order matters for FKs)
-- =========================
DROP TABLE IF EXISTS `dj_profiles`;
DROP TABLE IF EXISTS `users`;

-- =========================
-- Create tables
-- =========================

CREATE TABLE `users` (
    -- Typical user what not
    `user_id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email`           VARCHAR(255) NOT NULL UNIQUE,
    `password`        VARCHAR(255) NOT NULL,
    `firebase_uid`    VARCHAR(128) UNIQUE, 
    `token`           VARCHAR(64)  DEFAULT NULL,
    `first_name`      VARCHAR(64)  NULL,
    `last_name`       VARCHAR(64)  NULL,
    PRIMARY KEY (`user_id`),
    KEY `idx_users_firebase_uid` (`firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dj_profiles` (
    `dj_id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`            INT UNSIGNED NOT NULL,
    `dj_name`            VARCHAR(100) NOT NULL,
    `bio`                VARCHAR(500) NULL,
    `location`           VARCHAR(100) NOT NULL,
    `genres`             JSON         NOT NULL, 
    `equipment`          VARCHAR(255) NULL,
    `soundcloud_url`     VARCHAR(255) NULL,
    `instagram_url`      VARCHAR(255) NULL,
    `avatar_url`         VARCHAR(255) NULL,
    `banner_url`         VARCHAR(255) NULL,
    PRIMARY KEY (`dj_id`),
    -- Ensure a user can only have ONE DJ profile
    UNIQUE KEY `uniq_dj_profiles_user` (`user_id`),
    KEY `idx_dj_profiles_name` (`dj_name`),
    CONSTRAINT `fk_dj_profiles_user_id`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE -- If the user is deleted, delete the profile
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- CREATE TABLE `genres` (
--     `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
--     `name`      VARCHAR(64)  NOT NULL,
--     `parent_id` INT UNSIGNED DEFAULT NULL,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `uniq_genres_name` (`name`),
--     KEY `idx_genres_parent` (`parent_id`),
--     CONSTRAINT `fk_genres_parent`
--     FOREIGN KEY (`parent_id`) REFERENCES `genres`(`id`)
--     ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- CREATE TABLE `user_genres` (
--     `user_id`  INT UNSIGNED NOT NULL,
--     `genre_id` INT UNSIGNED NOT NULL,
--     PRIMARY KEY (`user_id`, `genre_id`),
--     KEY `idx_user_genres_genre_user` (`genre_id`, `user_id`),
--     CONSTRAINT `fk_user_genres_user`
--     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
--     ON DELETE CASCADE ON UPDATE CASCADE,
--     CONSTRAINT `fk_user_genres_genre`
--     FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`)
--     ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- -- Social network lookup (flexible + clean analytics)
-- CREATE TABLE `social_network` (
--   `id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
--   `slug`      VARCHAR(32)   NOT NULL,   -- machine name: 'instagram', 'soundcloud'
--   `label`     VARCHAR(64)   NOT NULL,   -- display name: 'Instagram'
--   `url_mask`  VARCHAR(256)  DEFAULT NULL, -- e.g., 'https://instagram.com/{handle}'
--   `handle_re` VARCHAR(256)  DEFAULT NULL, -- optional regex for validating handles
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `uniq_social_network_slug` (`slug`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- CREATE TABLE `social_links` (
--   `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
--   `user_id`     INT UNSIGNED  NOT NULL,
--   `network_id`  INT UNSIGNED  NOT NULL,
--   `url`         VARCHAR(512)  NOT NULL,
--   `handle`      VARCHAR(128)  DEFAULT NULL,
--   `is_public`   TINYINT(1)    NOT NULL DEFAULT 1,
--   `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `uniq_social_user_network` (`user_id`, `network_id`),
--   KEY `idx_social_links_user_public` (`user_id`, `is_public`),
--   CONSTRAINT `fk_social_links_user`
--     FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)
--     ON DELETE CASCADE ON UPDATE CASCADE,
--   CONSTRAINT `fk_social_links_network`
--     FOREIGN KEY (`network_id`) REFERENCES `social_network`(`id`)
--     ON DELETE RESTRICT ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


