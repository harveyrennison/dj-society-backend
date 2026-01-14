export type User = {
    userId: string;
    firebaseUid: string;
    email: string;
    password?: string; // Optional because Google users might not have one locally
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: string | null;
};
