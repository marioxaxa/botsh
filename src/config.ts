export const devMode = false // process.env.DEV_MODE === "true";

export const showbarGroupId = "120363417918033484@g.us";
export const testGroupId = "120363424640714277@g.us";

export const allowedGroupId = devMode ? testGroupId : showbarGroupId;

export const showbotPrefix = "> *Showbot*🤡: ";

export const tomatoThreshold = 2;
export const canetaThreshold = 2;

export const pollMaxVotes = 7;
export const maxAuraChange = 30;

export const allowedAdminLids = devMode
	? ["150332797628638@lid"]
	: ["150332797628638@lid"];

export let bannedWords = ["lgbt", "tuberculose"]; 

export function setBannedWords(bw: string[]) {
	bannedWords = bw;
}

export const teffasJid = "5584987435329@s.whatsapp.net";

export const isacJid = "68410289426623@lid";
