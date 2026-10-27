import makeWASocket from "baileys";
import { showbotPrefix, allowedGroupId, teffasJid } from "../config";
import { getRandomPhrase } from "./fraseDoDia";
import { getConexo } from "./conexo";

let midnightTimer: ReturnType<typeof setTimeout> | null = null;

const sendMessage = async (sock: ReturnType<typeof makeWASocket>, jid: string, text: string, mentions?: string[]) => {
	await sock.sendMessage(jid, { text, mentions });
};

export const sendMidnightMessage = async (sock: ReturnType<typeof makeWASocket>) => {
	try {
		const { text, mentions } = getRandomPhrase();
		const phraseText = `${showbotPrefix}🌙 Kermany mandou dizer que hoje será o pior dia das nossas vidas.`;

		await sendMessage(sock, allowedGroupId, phraseText);
		await sendMessage(sock, teffasJid, phraseText);

		await sendMessage(sock, allowedGroupId, text, mentions);
		await sendMessage(sock, teffasJid, text, mentions);

		const {conexo} = getConexo();
		if(conexo) {
			await sendMessage(sock, allowedGroupId, conexo);
			await sendMessage(sock, teffasJid, conexo);
		} else {
			const fallback = `${showbotPrefix}⚠️ Sem conexo de hoje. Mandem Kermany trabalhar.`;
			await sendMessage(sock, allowedGroupId, fallback);
			await sendMessage(sock, teffasJid, fallback);
		}
	} catch (err) {
		console.error("Failed to send midnight message:", err);
	}
};

export const scheduleMidnightMessage = (sock: ReturnType<typeof makeWASocket>) => {
	if (midnightTimer) clearTimeout(midnightTimer);

	const now = new Date();
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);

	const msUntilMidnight = tomorrow.getTime() - now.getTime();
	console.log(
		`Midnight message scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`,
	);

	midnightTimer = setTimeout(async () => {
		await sendMidnightMessage(sock);
		scheduleMidnightMessage(sock);
	}, msUntilMidnight);
};
