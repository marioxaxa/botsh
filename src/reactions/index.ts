import makeWASocket from "baileys";
import { handleTomatoReaction } from "./tomato";
import { handleCanetaReaction } from "./caneta";

export const handleReaction = async (
	sock: ReturnType<typeof makeWASocket>,
	reactionText: string | null | undefined,
	msgKey: string,
	chatJid: string,
	senderJid: string,
) => {
	if (reactionText === "🍅") {
		await handleTomatoReaction(sock, msgKey, chatJid, senderJid);
	} else if (reactionText === "✍️") {
		await handleCanetaReaction(sock, msgKey, chatJid, senderJid);
	}
};
