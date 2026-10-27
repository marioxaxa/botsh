import makeWASocket from "baileys";
import { showbotPrefix, canetaThreshold } from "../config";
import { addToGallery } from "../storage/gallery";

const canetaCounts: Map<
	string,
	{ count: number; senderJid: string; message: string; senderName: string }
> = new Map();

export const handleCanetaReaction = async (
	sock: ReturnType<typeof makeWASocket>,
	msgKey: string,
	chatJid: string,
	senderJid: string,
) => {
	const entry = canetaCounts.get(msgKey);

	console.log("Handling caneta reaction for message key:", msgKey);
	console.log("Current caneta entry:", entry);

	if (!entry) return;

	entry.count += 1;
	canetaCounts.set(msgKey, entry);
	console.log("Caneta count:" + entry.count);
	console.log("Caneta entry:", entry);
	console.log("Caneta threshold:", canetaThreshold);

	if (entry.count >= canetaThreshold) {
		try {
			addToGallery({
				message: entry.message,
				senderJid: entry.senderJid,
				senderName: entry.senderName,
				date: new Date().toLocaleString("pt-BR", {
					timeZone: "America/Sao_Paulo",
				}),
				msgId: msgKey,
			});
			canetaCounts.delete(msgKey);
			await sock.sendMessage(chatJid, {
				text: `${showbotPrefix} A canetada de @${senderJid.split("@")[0]} foi salva na galeria!`,
				mentions: [senderJid],
			});
		} catch (err) {
			console.error("Failed to save caneta message:", err);
		}
	}
};

export const registerCanetaMessage = (
	msgKey: string,
	senderJid: string,
	message: string,
	senderName: string,
) => {
	canetaCounts.set(msgKey, { count: 0, senderJid, message, senderName });
};
