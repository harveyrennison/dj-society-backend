# MySQL scripts for dropping existing tables and recreating the database table structure

# Drop tables


DROP TABLE IF EXISTS `users`;

# Create tables

CREATE TABLE `users` (
    `id`              int(11)         NOT NULL AUTO_INCREMENT,
    `first_name`      varchar(64)     NOT NULL,
    `last_name`       varchar(64)     NOT NULL,
    `username`        varchar(64)     NOT NULL,
    `email`           varchar(256)    NOT NULL,
    `image_filename`  varchar(64)     DEFAULT NULL,
    `password`        varchar(255)    NOT NULL,
    `auth_token`      char(64)        DEFAULT NULL,
    `created_at`      timestamp       NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY                   (`id`),
    UNIQUE KEY `unique_username`  (`username`),
    UNIQUE KEY `unique_email`     (`email`)
);

CREATE TABLE `genres` (
    `id`          int(11)       NOT NULL AUTO_INCREMENT,
    `name`        varchar(64)   NOT NULL,
    `parent_id`   int(11)       DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_genre_name` (`name`),
    FOREIGN KEY (`parent_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE
);

CREATE TABLE `user_genres` (
    `user_id`   int(11) NOT NULL,
    `genre_id`  int(11) NOT NULL,
    PRIMARY KEY (`user_id`, `genre_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE
);