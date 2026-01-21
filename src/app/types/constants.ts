import { OAuth2Client } from "google-auth-library/build/src/auth/oauth2client";

export const GOOGLE_CLIENT_ID =
    "408497169636-svk7c00dqvtp30k03dtj2s1h5f50330m.apps.googleusercontent.com";

export const GOOGLE_USER_PASSWORD_PLACEHOLDER =
    "google_external_auth_placeholder_aB3cZ9yX2wV7uT4sR5qP1oN6mK8jI0hGfEeDdCcBbAa";

export const CLIENT = new OAuth2Client(GOOGLE_CLIENT_ID);

export const PROFILE_PICTURE_FOLDER = "profile-picture";
