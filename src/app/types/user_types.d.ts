type User = {
    readonly user_id: number;
    email: string;
    password: string;
    firebase_uid: string;
    token: string;
}

type DjProfileData = {
    user_id: number;
    dj_name: string;
    bio: string;
    location: string;
    genres: string; // Stored as a JSON string
    equipment: string;
    soundcloud_url: string;
    instagram_url: string;
    avatar_url: string;
    banner_url: string;
};

type DjProfile = DjProfileData & {
    dj_id: number;
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
