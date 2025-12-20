export type User = {
    userId: string;
    firebaseUid: string;
    email: string;
    password?: string; // Optional because Google users might not have one locally
    firstName?: string | null;
    lastName?: string | null;
}

type DjProfileData = {
    userId: string;
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
    djId: string;
};

type Genre = {
    genreId: string;
    genreName: string;
    subgenres: Subgenre[] | null;
};

type Subgenre = {
    subgenreId: string;
    subgenreName: string;
};

type DbGenreRow = {
    genreId: string;
    genreName: string;
    parentId: string | null;
};

type UserGenre = {
    userId: string;
    genreId: string;
};

type SimpleGenre = {
    genreId: string;
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
