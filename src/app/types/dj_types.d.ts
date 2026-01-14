export type DjProfileData = {
    userId: string;
    djName: string;
    bio: string;
    location: string;
    genres: string;
    equipment: string;
    soundcloudUrl: string;
    instagramUrl: string;
    avatarUrl: string;
    bannerUrl: string;
};

export type DjProfile = DjProfileData & {
    djId: string;
};