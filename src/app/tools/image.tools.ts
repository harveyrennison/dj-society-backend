const getImageMimetype = (filename: string): string => {
    if (filename.endsWith(".jpeg") || filename.endsWith(".jpg")) {
        return "image/jpeg";
    }
    if (filename.endsWith(".png")) {
        return "image/png";
    }
    return "application/octet-stream";
};

const getImageExtension = (mimeType: string): string => {
    switch (mimeType) {
        case "image/jpeg":
            return ".jpeg";
        case "image/png":
            return ".png";
        default:
            return null;
    }
};

export { getImageExtension, getImageMimetype };
