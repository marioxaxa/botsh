import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRASE_FILE = path.join(__dirname, "..", "..", "conexo.json");

const loadPhrases = (): string[] => {
    if (fs.existsSync(FRASE_FILE)) {
        return JSON.parse(fs.readFileSync(FRASE_FILE, "utf-8"));
    }
    return [];
};

export const getConexo = (): { conexo: string | null;} => {
    const phrases = loadPhrases();
    if (phrases.length === 0) return { conexo: null};

    const phrase = phrases.shift();

    fs.writeFileSync(FRASE_FILE, JSON.stringify(phrases, null, 2));

    return { conexo: "Conexo de hoje: " + phrase };
};
