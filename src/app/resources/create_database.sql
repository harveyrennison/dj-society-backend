# MySQL scripts for dropping existing tables and recreating the database table structure

-- =========================
-- Drop (order matters for FKs)
-- =========================
DROP TABLE IF EXISTS `DjGenres`;
DROP TABLE IF EXISTS `DjProfiles`;
DROP TABLE IF EXISTS `Genres`;
DROP TABLE IF EXISTS `Users`;

-- =========================
-- Create tables
-- =========================

CREATE TABLE `Users` (
    `userId`       CHAR(36) NOT NULL,
    `email`        VARCHAR(255) NOT NULL UNIQUE,
    `password`     VARCHAR(255) NOT NULL,
    `firebaseUid`  VARCHAR(128) UNIQUE,
    `firstName`    VARCHAR(64) NULL,
    `lastName`     VARCHAR(64) NULL,
    PRIMARY KEY (`userId`),
    KEY `idx_users_firebase_uid` (`firebaseUid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DjProfiles` (
    `djId`          CHAR(36) NOT NULL,
    `userId`        CHAR(36) NOT NULL,
    `djName`        VARCHAR(100) NOT NULL,
    `bio`           VARCHAR(500) NULL,
    `location`      VARCHAR(100) NOT NULL,
    `equipment`     VARCHAR(255) NULL,
    `soundcloudUrl` VARCHAR(255) NULL,
    `instagramUrl`  VARCHAR(255) NULL,
    `avatarUrl`     VARCHAR(255) NULL,
    `bannerUrl`     VARCHAR(255) NULL,
    PRIMARY KEY (`djId`),
    UNIQUE KEY `uniq_dj_profiles_user` (`userId`),
    KEY `idx_dj_profiles_name` (`djName`),
    CONSTRAINT `fk_djprofiles_to_users`
        FOREIGN KEY (`userId`)
        REFERENCES `Users` (`userId`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Genres` (
    `genreId`  CHAR(36) NOT NULL,
    `name`     VARCHAR(100) NOT NULL UNIQUE,
    `parentId` CHAR(36) DEFAULT NULL,
    PRIMARY KEY (`genreId`),
    KEY `idx_genres_parent` (`parentId`),
    CONSTRAINT `fk_genres_parent`
        FOREIGN KEY (`parentId`)
        REFERENCES `Genres` (`genreId`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DjGenres` (
    `djId`    CHAR(36) NOT NULL,
    `genreId` CHAR(36) NOT NULL,
    PRIMARY KEY (`djId`, `genreId`),
    KEY `idx_dj_genres_genre_dj` (`genreId`, `djId`),
    CONSTRAINT `fk_djgenres_to_djprofiles`
        FOREIGN KEY (`djId`)
        REFERENCES `DjProfiles` (`djId`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_djgenres_to_genres`
        FOREIGN KEY (`genreId`)
        REFERENCES `Genres` (`genreId`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;