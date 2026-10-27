import makeWASocket from "baileys";
import { showbotPrefix, tomatoThreshold } from "../config";

const tomatoCounts: Map<string, { count: number; senderJid: string }> = new Map();

export const handleTomatoReaction = async (
	sock: ReturnType<typeof makeWASocket>,
	msgKey: string,
	chatJid: string,
	senderJid: string,
) => {
	const entry = tomatoCounts.get(msgKey) || { count: 0, senderJid };
	entry.count += 1;
	tomatoCounts.set(msgKey, entry);
	console.log("Tomato count:" + entry.count);

	if (entry.count >= tomatoThreshold) {
		try {
			await sock.sendMessage(chatJid, {
				delete: { id: msgKey, remoteJid: chatJid, fromMe: false },
				
			});
			console.log("Deleted message with key:", msgKey);
			tomatoCounts.delete(msgKey);

			await sock.sendMessage(chatJid, {
				text: `${showbotPrefix}@${senderJid.split("@")[0]} tomou 🍅 por falar bosta demais e foi silenciado!`,
				mentions: [senderJid],
			});
		} catch (err) {
			console.error("Failed to delete tomato'd message:", err);
		}
	}
};

export const registerTomatoMessage = (
	msgKey: string,
	senderJid: string,
) => {
	tomatoCounts.set(msgKey, { count: 0, senderJid });
};
