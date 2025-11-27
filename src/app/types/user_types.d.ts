type User = {
    readonly id: number;
    email: string;
    password: string;
    first_name: string | null;
    last_name: string | null;
    auth_token: string;
    created_at: Date;
}

type Genres = {

}

type DJ = {
    readonly id: number;
    alias: string;
    bio: string;
    genres: Genres[];
    image_url: string | null;
    location: string;
    socials: {
        instagram?: string;
        soundcloud?: string;
        mixcloud?: string;
        spotify?: string;
        youtube?: string;
    };
    mixes: {
        title: string;
        url: string;  // SoundCloud/Mixcloud/YouTube link
    }[];
    gigs: {
        date: string;
        venue: string;
        city: string;
        description?: string;
    }[];
};
