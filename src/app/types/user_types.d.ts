export type User = {
    userId: string;
    firebaseUid: string;
    email: string;
    password?: string;
    firstName?: string | null;
    lastName?: string | null;
    dateOfBirth?: string | null;
};
