import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed!"));
            return;
        }
        cb(null, true);
    },
});

export { upload };
