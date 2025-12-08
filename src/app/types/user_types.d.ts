type User = {
    readonly userId: number;
    email: string;
    password: string;
    firebaseUid: string;
    token: string;
};

type DjProfileData = {
    userId: number;
    djName: string;
    bio: string;
    location: string;
    genres: string; // Stored as a JSON string
    equipment: string;
    soundcloudUrl: string;
    instagramUrl: string;
    avatarUrl: string;
    bannerUrl: string;
};

type DjProfile = DjProfileData & {
    djId: number;
};

type Genre = {
    genreId: number;
    genreName: string;
    subgenres: Subgenre[] | null;
};

type Subgenre = {
    subgenreId: number;
    subgenreName: string;
};

type DbGenreRow = {
    genreId: number;
    genreName: string;
    parentId: number | null;
};

type UserGenre = {
    userId: number;
    genreId: number;
}

type SimpleGenre = {
    genreId: number;
    genreName: string;
};
// type Genres = {

// }

// type DJ = {
//     readonly id: number;
//     alias: string;
//     bio: string;
//     genres: Genres[];
//     image_url: string | null;
//     location: string;
//     socials: {
//         instagram?: string;
//         soundcloud?: string;
//         mixcloud?: string;
//         spotify?: string;
//         youtube?: string;
//     };
//     mixes: {
//         title: string;
//         url: string;  // SoundCloud/Mixcloud/YouTube link
//     }[];
//     gigs: {
//         date: string;
//         venue: string;
//         city: string;
//         description?: string;
//     }[];
// };
