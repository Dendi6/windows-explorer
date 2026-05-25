import path from "path";
import fs   from "fs";

// Resolves to: <project-root>/storage/uploads/
export const UPLOAD_DIR = path.resolve(process.cwd(), "storage", "uploads");

// Create the directory if it doesn't exist on startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}