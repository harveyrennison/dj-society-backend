// The base for any genre returned from the DB
export type SimpleGenre = {
    genreId: string;
    name: string;
};

// Used for the nested "Tree" view (e.g., in a dropdown)
export type Subgenre = {
    genreId: string;
    name: string;
};

export type Genre = SimpleGenre & {
    subgenres: Subgenre[] | null;
};

// Represents the raw row coming back from a MySQL JOIN/SELECT
export type DbGenreRow = {
    genreId: string;
    name: string;
    parentId: string | null;
};

// Represents the link in the DjGenres junction table
export type DjGenreLink = {
    djId: string;
    genreId: string;
};
