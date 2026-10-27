import makeWASocket from "baileys";
import { showbotPrefix } from "../config";
import { getLastGalleryEntries } from "../storage/gallery";

export const handleGaleria = async (sock: ReturnType<typeof makeWASocket>, remoteJid: string) => {
	const entries = getLastGalleryEntries(5);
	if (entries.length === 0) {
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}A galeria está vazia. Reaja com ✍️ em uma mensagem para adicioná-la!`,
		});
		return;
	}

	let galleryText = `${showbotPrefix}🖼️ Galeria:\n\n`;
	entries.forEach((entry) => {
		galleryText += `*${entry.senderName}* — ${entry.date}\n${entry.message}\n\n`;
	});

	await sock.sendMessage(remoteJid, { text: galleryText });
};
