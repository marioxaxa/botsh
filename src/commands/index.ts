import makeWASocket from "baileys";
import { handlePing } from "./ping";
import { handleHelp } from "./help";
import { handleGaleria } from "./galeria";
import { handleBibito } from "./bibito";
import { handleAura } from "./aura";
import { handleMidnightTrigger } from "./midnight";
import { handleIsac } from "./isac";
import { handleBatalha } from "./batalha";

export const handleCommand = async (
	sock: ReturnType<typeof makeWASocket>,
	remoteJid: string,
	messageText: string,
	mentionedJid: string[] | undefined,
	senderJid: string,
) => {
	switch (messageText) {
		case "!ping":
			await handlePing(sock, remoteJid);
			break;
		case "!help":
			await handleHelp(sock, remoteJid);
			break;
		case "!galeria":
			await handleGaleria(sock, remoteJid);
			break;
		case "!piordia":
			await handleMidnightTrigger(sock, remoteJid, senderJid);
			break;
		case "!isac":
			await handleIsac(sock, remoteJid, messageText);
			break;
		default:
			if (messageText.startsWith("!bibito")) {
				await handleBibito(sock, remoteJid, messageText);
			} else if (messageText.startsWith("!aura")) {
				await handleAura(sock, remoteJid, messageText, mentionedJid);
			} else if (messageText.startsWith("!isac")) {
				await handleIsac(sock, remoteJid, messageText);
			} else if (messageText.startsWith("!batalha")) {
				await handleBatalha(sock, remoteJid, messageText, mentionedJid);
			}
			break;
	}
};
