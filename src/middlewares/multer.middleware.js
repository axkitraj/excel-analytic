import multer from "multer";
import path from "path";
import fs from "fs";

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const userDir = path.join("uploads", userId);
        fs.mkdirSync(userDir, { recursive: true });
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `file_${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
    ];
    allowed.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Invalid file type"), false);
};

const upload = multer({
    storage, fileFilter, limits: {
        fileSize: MAX_FILE_SIZE, // 10 MB
    }
});

export default upload;
