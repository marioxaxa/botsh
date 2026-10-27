import makeWASocket from "baileys";
import { allowedAdminLids, showbotPrefix } from "../config";
import { sendMidnightMessage } from "../scheduled/midnight";

export const handleMidnightTrigger = async (
	sock: ReturnType<typeof makeWASocket>,
	remoteJid: string,
	senderJid: string,
) => {
	const normalizedLid = senderJid.replace(/:\d+@/, "@");
	if (!allowedAdminLids.includes(normalizedLid)) {
		await sock.sendMessage(remoteJid, { text: showbotPrefix +"🚫 Você não tem permissão para usar este comando." });
		return;
	}

	await sendMidnightMessage(sock);
};
