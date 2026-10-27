if (process.argv.includes("--dev")) {
	process.env.DEV_MODE = "true";
}

import { fileURLToPath } from "url";
import path from "path";
import QRCode from "qrcode";
import makeWASocket, {
	DisconnectReason,
	fetchLatestBaileysVersion,
	useMultiFileAuthState,
	decryptPollVote,
} from "baileys";
import {
	allowedGroupId,
	showbotPrefix,
	pollMaxVotes,
	bannedWords,
	setBannedWords,
} from "./src/config";
import { saveUserName, getUserName } from "./src/storage/aura";
import { handleCommand } from "./src/commands";
import { handlePollUpdates, activePolls } from "./src/polls/auraPoll";
import { scheduleMidnightMessage } from "./src/scheduled/midnight";
import { registerCanetaMessage } from "./src/reactions/caneta";
import { registerTomatoMessage } from "./src/reactions/tomato";
import { handleReaction } from "./src/reactions/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startBot = async () => {
	const { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

	const { state, saveCreds } = await useMultiFileAuthState(
		path.join(__dirname, "auth_info"),
	);

	const sock = makeWASocket({
		auth: state,
		version,
	});

	sock.ev.on("connection.update", async (update) => {
		const { connection, qr, lastDisconnect } = update;
		if (qr) {
			console.log(await QRCode.toString(qr, { type: "terminal" }));
		}

		if (connection === "open") {
			console.log("Bot is connected to WhatsApp!");
			scheduleMidnightMessage(sock);
		}

		if (
			connection === "close" &&
			lastDisconnect?.error?.output?.statusCode !==
				DisconnectReason.loggedOut
		) {
			console.log("Bot is disconnected from WhatsApp!");
			startBot();
		}
	});

	sock.ev.on("messages.reaction", async (reactions) => {
		for (const { key, reaction } of reactions) {
			const msgKey = key.id!;
			const chatJid = key.remoteJid!;
			const senderJid = key.participant || chatJid;

			if (chatJid !== allowedGroupId) continue;

			await handleReaction(
				sock,
				reaction.text,
				msgKey,
				chatJid,
				senderJid,
			);
		}
	});

	sock.ev.on("messages.update", async (updates) => {
		await handlePollUpdates(sock, updates);
	});

	sock.ev.on("messages.upsert", async ({ type, messages }) => {
		if (type !== "notify") return;

		for (const message of messages) {
			if (message.message?.pollUpdateMessage) {
				const creationKey =
					message.message.pollUpdateMessage.pollCreationMessageKey;
				if (creationKey?.id && activePolls.has(creationKey.id)) {
					const poll = activePolls.get(creationKey.id)!;
					const voterJid =
						message.key.participant || message.key.remoteJid!;
					const voteEnc = message.message.pollUpdateMessage.vote;

					if (voteEnc) {
						try {
							const decrypted = decryptPollVote(voteEnc, {
								pollCreatorJid: poll.creatorJid,
								pollMsgId: poll.msgId,
								pollEncKey: poll.messageSecret,
								voterJid,
							});
							const {
								updateMessageWithPollUpdate,
								getAggregateVotesInPollMessage,
							} = await import("baileys");
							updateMessageWithPollUpdate(poll.message, {
								pollUpdateMessageKey: message.key,
								vote: decrypted,
								senderTimestampMs: Number(
									message.message.pollUpdateMessage
										.senderTimestampMs || Date.now(),
								),
							});

							const results = getAggregateVotesInPollMessage(
								poll.message,
							);
							const totalVotes = results.reduce(
								(sum, r) => sum + r.voters.length,
								0,
							);

							if (totalVotes >= pollMaxVotes) {
								const { finalizePoll } =
									await import("./src/polls/auraPoll");
								await finalizePoll(sock, poll);
							}
						} catch (err) {
							console.error("Failed to decrypt vote:", err);
						}
					}
				}
				continue;
			}

			const messageText =
				message.message?.conversation ||
				message.message?.extendedTextMessage?.text;
			const remoteJid = message.key.remoteJid;

			if (
				!remoteJid ||
				!remoteJid.endsWith("@g.us") ||
				remoteJid !== allowedGroupId
			) {
				continue;
			}

			if (message.pushName) {
				const senderJid = message.key.participant || remoteJid;
				saveUserName(senderJid, message.pushName);
			}

			if (messageText) {
				const senderJid = message.key.participant || remoteJid;
				const senderName = message.pushName || getUserName(senderJid);
				registerTomatoMessage(message.key.id!, senderJid);
				registerCanetaMessage(
					message.key.id!,
					senderJid,
					messageText,
					senderName,
				);

				const foundWord = bannedWords.find((w) =>
					messageText.toLowerCase().includes(w.toLowerCase()),
				);
				if (foundWord) {
					try {
						await sock.sendMessage(remoteJid, {
							text: `${showbotPrefix}${senderName} foi banido por usar a palavra "${foundWord}".`,
						});
						// await sock.groupParticipantsUpdate(
						// 	remoteJid,
						// 	[senderJid],
						// 	"remove",
						// );
						setBannedWords(bannedWords.filter((w) => w !== foundWord));
					} catch (err) {
						console.error("Failed to ban user:", err);
					}
					continue;
				}
			}

			if (messageText?.startsWith("!")) {
				const senderJid = message.key.participant || remoteJid;
				const mentionedJid =
					message.message?.extendedTextMessage?.contextInfo
						?.mentionedJid;
				await handleCommand(
					sock,
					remoteJid,
					messageText,
					mentionedJid,
					senderJid,
				);
			}
		}
	});

	sock.ev.on("creds.update", saveCreds);
};

startBot();
