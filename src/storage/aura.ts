import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AURA_FILE = path.join(__dirname, "..", "..", "aura_data.json");

export interface AuraEntry {
	name: string;
	aura: number;
}

export const loadAuraData = (): Record<string, AuraEntry> => {
	if (fs.existsSync(AURA_FILE)) {
		return JSON.parse(fs.readFileSync(AURA_FILE, "utf-8"));
	}
	return {};
};

export const saveAuraData = (data: Record<string, AuraEntry>) => {
	fs.writeFileSync(AURA_FILE, JSON.stringify(data, null, 2));
};

export const saveUserName = (jid: string, name: string) => {
	if (!jid || !name) return;
	const auraData = loadAuraData();
	if (!auraData[jid]) {
		auraData[jid] = { name, aura: 0 };
	} else {
		auraData[jid].name = name;
	}
	saveAuraData(auraData);
};

export const getUserName = (jid: string): string => {
	const auraData = loadAuraData();
	return auraData[jid]?.name || "Esse cara";
};

export const getAuraRanking = () => {
	const auraData = loadAuraData();
	return Object.entries(auraData)
		.filter(([jid]) => jid !== "bot")
		.sort(([, a], [, b]) => b.aura - a.aura);
};
