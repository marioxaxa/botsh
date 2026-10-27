import fs from "fs";
import makeWASocket from "baileys";

export const handleBibito = async (sock: ReturnType<typeof makeWASocket>, remoteJid: string, messageText: string) => {
	if (messageText.includes("nao")) {
		await sock.sendMessage(remoteJid, {
			audio: fs.readFileSync("./audios/bibito-nao.ogg"),
			mimetype: "audio/mp4",
			ptt: false,
		});
	} else if (messageText.includes("sim")) {
		await sock.sendMessage(remoteJid, {
			audio: fs.readFileSync("./audios/bibito-sim.ogg"),
			mimetype: "audio/mp4",
			ptt: false,
		});
	}
};
