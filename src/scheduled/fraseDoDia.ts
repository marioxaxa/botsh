import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadAuraData } from "../storage/aura";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRASE_FILE = path.join(__dirname, "..", "..", "frase_do_dia.json");

const loadPhrases = (): string[] => {
	if (fs.existsSync(FRASE_FILE)) {
		return JSON.parse(fs.readFileSync(FRASE_FILE, "utf-8"));
	}
	return [];
};

const getRandomMembers = (count: number): string[] => {
	const auraData = loadAuraData();
	const members = Object.keys(auraData);
	const shuffled = [...members].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};

export const getRandomPhrase = (): { text: string; mentions: string[] } => {
	const phrases = loadPhrases();
	if (phrases.length === 0) return { text: "", mentions: [] };

	const phrase = phrases[Math.floor(Math.random() * phrases.length)];
	const memberCount = (phrase.match(/<membro>/g) || []).length;
	const members = getRandomMembers(memberCount);

	let result = phrase;
	for (const member of members) {
		result = result.replace("<membro>", `@${member.split("@")[0]}`);
	}

	return { text: "Frase do dia: " + result, mentions: members };
};
