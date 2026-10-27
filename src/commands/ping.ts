import makeWASocket from "baileys";

export const handlePing = async (sock: ReturnType<typeof makeWASocket>, remoteJid: string) => {
	await sock.sendMessage(remoteJid, {
		text: ">*Showbot*🤡: pong",
	});
};
