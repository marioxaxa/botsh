import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GALLERY_FILE = path.join(__dirname, "..", "..", "galeria.json");

export interface GalleryEntry {
	message: string;
	senderJid: string;
	senderName: string;
	date: string;
	msgId: string;
}

export const loadGallery = (): GalleryEntry[] => {
	if (fs.existsSync(GALLERY_FILE)) {
		return JSON.parse(fs.readFileSync(GALLERY_FILE, "utf-8"));
	}
	return [];
};

export const saveGallery = (data: GalleryEntry[]) => {
	fs.writeFileSync(GALLERY_FILE, JSON.stringify(data, null, 2));
};

export const addToGallery = (entry: GalleryEntry) => {
	const gallery = loadGallery();
	gallery.push(entry);
	saveGallery(gallery);
};

export const getLastGalleryEntries = (count: number) => {
	const gallery = loadGallery();
	return gallery.slice(-count).reverse();
};
