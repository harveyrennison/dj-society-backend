import Logger from "../../config/logger";
import { deleteImage, uploadImage } from "../services/firebase-storage.service";
import { PROFILE_PICTURE_FOLDER } from "../types/constants";

const addProfilePictureImage = async (
    image: any,
    fileExt: string,
): Promise<string> => {
    try {
        const filename = await uploadImage(
            image,
            fileExt,
            PROFILE_PICTURE_FOLDER,
        );
        return filename;
    } catch (err) {
        Logger.error(err);
        throw err;
    }
};

const removeProfilePictureImage = async (filename: string): Promise<void> => {
    try {
        await deleteImage(filename, PROFILE_PICTURE_FOLDER);
    } catch (err) {
        Logger.error(err);
        throw err;
    }
};

export { addProfilePictureImage, removeProfilePictureImage };
