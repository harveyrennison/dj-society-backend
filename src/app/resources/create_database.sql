# MySQL scripts for dropping existing tables and recreating the database table structure

-- =========================
-- Drop (order matters for FKs)
-- =========================
DROP TABLE IF EXISTS `dj_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `DjGenres`;
DROP TABLE IF EXISTS `DjProfiles`;
DROP TABLE IF EXISTS `Genres`;
DROP TABLE IF EXISTS `Users`;

-- =========================
-- Create tables
-- =========================

CREATE TABLE `Users` (
    -- Typical user what not
    `userId`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email`           VARCHAR(255) NOT NULL UNIQUE,
    `password`        VARCHAR(255) NOT NULL,
    `firebaseUid`    VARCHAR(128) UNIQUE, 
    `token`           VARCHAR(64)  DEFAULT NULL,
    `firstName`      VARCHAR(64)  NULL,
    `lastName`       VARCHAR(64)  NULL,
    PRIMARY KEY (`userId`),
    KEY `idx_users_firebase_uid` (`firebaseUid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DjProfiles` (
    `djId`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId`            INT UNSIGNED NOT NULL,
    `djName`            VARCHAR(100) NOT NULL,
    `bio`               VARCHAR(500) NULL,
    `location`          VARCHAR(100) NOT NULL,
    `equipment`         VARCHAR(255) NULL,
    `soundcloudUrl`     VARCHAR(255) NULL,
    `instagramUrl`      VARCHAR(255) NULL,
    `avatarUrl`         VARCHAR(255) NULL,
    `bannerUrl`         VARCHAR(255) NULL,
    PRIMARY KEY (`djId`),
    -- Ensure a user can only have ONE DJ profile
    UNIQUE KEY `uniq_dj_profiles_user` (`userId`),
    KEY `idx_dj_profiles_name` (`djName`),
    CONSTRAINT `fk_djprofiles_to_users`
        FOREIGN KEY (`userId`)
        REFERENCES `Users` (`userId`)
        ON DELETE CASCADE -- If the user is deleted, delete the profile
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Genres` (
    `genreId`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`         VARCHAR(100)  NOT NULL UNIQUE,
    `parentId`     INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`genreId`),
    KEY `idx_genres_parent` (`parentId`),
    CONSTRAINT `fk_genres_parent`
        FOREIGN KEY (`parentId`)
        REFERENCES `Genres`(`genreId`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DjGenres` (
    `djId`         INT UNSIGNED NOT NULL,
    `genreId`      INT UNSIGNED NOT NULL,

    -- Composite key ensures a DJ can only pick a genre once
    PRIMARY KEY (`djId`, `genreId`), 
    
    KEY `idx_dj_genres_genre_dj` (`genreId`, `djId`),

    -- Constraint to DJ Profile
    CONSTRAINT `fk_djgenres_to_djprofiles`
        FOREIGN KEY (`djId`)
        REFERENCES `DjProfiles` (`djId`)
        ON DELETE CASCADE -- If the profile is deleted, remove genre associations
        ON UPDATE CASCADE,

    -- Constraint to Genres
    CONSTRAINT `fk_djgenres_to_genres`
        FOREIGN KEY (`genreId`)
        REFERENCES `Genres` (`genreId`)
        ON DELETE RESTRICT -- Do not allow deleting a genre that is currently in use
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;