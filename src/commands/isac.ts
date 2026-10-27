import makeWASocket from "baileys";
import { isacJid, showbotPrefix } from "../config";

export const handleIsac = async (
	sock: ReturnType<typeof makeWASocket>,
	remoteJid: string,
	messageText: string,
) => {
	const lid = isacJid;

	try {
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}Todo odio pra isac é pouco.`,
		});
		await sock.groupParticipantsUpdate(remoteJid, [lid], "remove");
	} catch (err) {
		console.error("Failed to ban user with isac:", err);
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}Erro ao banir o membro. Verifique se o lid está correto.`,
		});
	}
};
