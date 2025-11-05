-- Insert the user (new columns included)
INSERT INTO users
  (first_name, last_name, username, email, password, city, country_code, is_hidden, image_filename, auth_token)
VALUES
  ('John', 'Smith', 'johnsmith', 'johnsmith@example.com',
   'johnHashedPassword', 'Wellington', 'NZ', 0, NULL, NULL);

-- (Optional) seed social networks if you haven’t already
INSERT INTO social_network (slug, label, url_mask) VALUES
  ('instagram','Instagram','https://instagram.com/{handle}'),
  ('soundcloud','SoundCloud','https://soundcloud.com/{handle}')
ON DUPLICATE KEY UPDATE id = id;

-- Add John’s social links
INSERT INTO social_links (user_id, network_id, url, handle, is_public)
SELECT u.id, sn.id, 'https://instagram.com/johnsmith', '@johnsmith', 1
FROM users u
JOIN social_network sn ON sn.slug = 'instagram'
WHERE u.username = 'johnsmith'
ON DUPLICATE KEY UPDATE url = VALUES(url), handle = VALUES(handle), is_public = VALUES(is_public);

INSERT INTO social_links (user_id, network_id, url, handle, is_public)
SELECT u.id, sn.id, 'https://soundcloud.com/johnsmith', 'johnsmith', 1
FROM users u
JOIN social_network sn ON sn.slug = 'soundcloud'
WHERE u.username = 'johnsmith'
ON DUPLICATE KEY UPDATE url = VALUES(url), handle = VALUES(handle), is_public = VALUES(is_public);

-- (Optional) genres for John
INSERT INTO genres (name) VALUES ('House'), ('Techno')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO user_genres (user_id, genre_id)
SELECT u.id, g.id
FROM users u
JOIN genres g ON g.name IN ('House','Techno')
WHERE u.username = 'johnsmith'
ON DUPLICATE KEY UPDATE user_id = user_id;
