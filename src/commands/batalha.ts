import crypto from "crypto";
import makeWASocket, { WAMessage } from "baileys";
import { showbotPrefix, maxAuraChange } from "../config";
import { getUserName, loadAuraData } from "../storage/aura";
import { activePolls, type ActivePoll } from "../polls/auraPoll";

export const handleBatalha = async (
	sock: ReturnType<typeof makeWASocket>,
	remoteJid: string,
	messageText: string,
	mentionedJid: string[] | undefined,
) => {
	const parts = messageText.trim().split(/\s+/);

	if (parts.length === 1) {
		const entries = Object.entries(loadAuraData())
			.filter(([jid]) => jid !== "bot")
			.sort(([, a], [, b]) => b.aura - a.aura);

		if (entries.length === 0) {
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Ninguém tem aura ainda. Use !aura @membro <valor> para começar!`,
			});
			return;
		}

		let ranking = `${showbotPrefix}🏆 Ranking de Aura:\n\n`;
		entries.forEach(([jid, data], i) => {
			const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
			ranking += `${medal} ${data.name} — ${data.aura}\n`;
		});

		await sock.sendMessage(remoteJid, { text: ranking });
		return;
	}

	if (!mentionedJid || mentionedJid.length === 0) {
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}Marque um membro com @ para dar aura. Ex: !aura @Xaxa 10`,
		});
		return;
	}

	const valueStr = parts[parts.length - 1];
	let value = parseInt(valueStr, 10);

	if (isNaN(value) || value === 0) {
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}Valor inválido. Use: !aura @membro <valor>`,
		});
		return;
	}

	if (value > maxAuraChange || value < -maxAuraChange) {
		await sock.sendMessage(remoteJid, {
			text: `${showbotPrefix}Valor muito grande. O máximo permitido é ${maxAuraChange} e o mínimo é -${maxAuraChange}.`,
		});
		return;
	}

	const targetJid = mentionedJid[0];
	const targetName = getUserName(targetJid);
	const action = value >= 0 ? "ganhar" : "perder";
	const absValue = Math.abs(value);

	const messageSecret = crypto.randomBytes(32);
	const pollMsg = await sock.sendMessage(remoteJid, {
		poll: {
			name: `${showbotPrefix}${targetName} deveria ${action} ${absValue} de aura?`,
			values: ["Sim", "Não"],
			selectableCount: 1,
			messageSecret,
		},
	});

	if (pollMsg?.key?.id) {
		const me = sock.authState.creds.me;
		const rawLid = me?.lid || me?.id || "";
		const creatorJid = rawLid.replace(/:\d+@/, "@");
		const poll: ActivePoll = {
			targetJid,
			value,
			remoteJid,
			msgId: pollMsg.key.id,
			messageSecret,
			creatorJid,
			message: pollMsg as WAMessage,
		};
		activePolls.set(pollMsg.key.id, poll);
	}
};
