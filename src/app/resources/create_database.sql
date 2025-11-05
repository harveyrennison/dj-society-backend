# MySQL scripts for dropping existing tables and recreating the database table structure

-- =========================
-- Drop (order matters for FKs)
-- =========================
DROP TABLE IF EXISTS `social_links`;
DROP TABLE IF EXISTS `user_genres`;
DROP TABLE IF EXISTS `genres`;
DROP TABLE IF EXISTS `social_network`;
DROP TABLE IF EXISTS `users`;

-- =========================
-- Create tables
-- =========================

CREATE TABLE `users` (
    -- Typical user what not
    `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name`      VARCHAR(64)  NOT NULL,
    `last_name`       VARCHAR(64)  NOT NULL,
    `username`        VARCHAR(64)  NOT NULL,
    `email`           VARCHAR(256) NOT NULL,
    `image_filename`  VARCHAR(128) DEFAULT NULL,
    `password`        VARCHAR(255) NOT NULL,
    `auth_token`      CHAR(64)     DEFAULT NULL,

    -- Location
    `city`            VARCHAR(128) DEFAULT NULL,
    `country_code`    CHAR(2)      DEFAULT NULL,  -- ISO 3166-1 alpha-2

    -- Visibility
    `is_hidden`       TINYINT(1)   NOT NULL DEFAULT 0,

    -- Timestamps
    `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_users_username` (`username`),
    UNIQUE KEY `uniq_users_email`    (`email`),
    KEY `idx_users_visibility` (`is_hidden`),
    KEY `idx_users_city_country` (`city`, `country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `genres` (
    `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`      VARCHAR(64)  NOT NULL,
    `parent_id` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_genres_name` (`name`),
    KEY `idx_genres_parent` (`parent_id`),
    CONSTRAINT `fk_genres_parent`
    FOREIGN KEY (`parent_id`) REFERENCES `genres`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `user_genres` (
    `user_id`  INT UNSIGNED NOT NULL,
    `genre_id` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`user_id`, `genre_id`),
    KEY `idx_user_genres_genre_user` (`genre_id`, `user_id`),
    CONSTRAINT `fk_user_genres_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_genres_genre`
    FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- Social network lookup (flexible + clean analytics)
CREATE TABLE `social_network` (
  `id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `slug`      VARCHAR(32)   NOT NULL,   -- machine name: 'instagram', 'soundcloud'
  `label`     VARCHAR(64)   NOT NULL,   -- display name: 'Instagram'
  `url_mask`  VARCHAR(256)  DEFAULT NULL, -- e.g., 'https://instagram.com/{handle}'
  `handle_re` VARCHAR(256)  DEFAULT NULL, -- optional regex for validating handles
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_social_network_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `social_links` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NOT NULL,
  `network_id`  INT UNSIGNED  NOT NULL,
  `url`         VARCHAR(512)  NOT NULL,
  `handle`      VARCHAR(128)  DEFAULT NULL,
  `is_public`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_social_user_network` (`user_id`, `network_id`),
  KEY `idx_social_links_user_public` (`user_id`, `is_public`),
  CONSTRAINT `fk_social_links_user`
    FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_social_links_network`
    FOREIGN KEY (`network_id`) REFERENCES `social_network`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


