import makeWASocket, {
	getAggregateVotesInPollMessage,
	updateMessageWithPollUpdate,
	WAMessage,
} from "baileys";
import { showbotPrefix, pollMaxVotes } from "../config";
import { loadAuraData, saveAuraData, getUserName } from "../storage/aura";

export interface ActivePoll {
	targetJid: string;
	secondTargetJid?: string;
	value: number;
	remoteJid: string;
	msgId: string;
	messageSecret: Uint8Array;
	creatorJid: string;
	message: WAMessage;
}

export const activePolls: Map<string, ActivePoll> = new Map();

export const finalizePoll = async (
	sock: ReturnType<typeof makeWASocket>,
	poll: ActivePoll,
) => {
	const { targetJid, secondTargetJid, value, remoteJid, msgId, message } =
		poll;
	activePolls.delete(msgId);

	const results = getAggregateVotesInPollMessage(message);

	if (secondTargetJid) {
		const targetName = getUserName(targetJid);

		const secondTargetName = getUserName(secondTargetJid);

		const firstVotes =
			results.find((r) => r.name === targetName)?.voters.length ?? 0;
		const secondVotes =
			results.find((r) => r.name === secondTargetName)?.voters.length ??
			0;
		const totalVotes = firstVotes + secondVotes;

		const absValue = Math.abs(value);

		if (firstVotes > secondVotes) {
			const auraData = loadAuraData();
			if (!auraData[targetJid]) {
				auraData[targetJid] = { name: targetName, aura: 0 };
			}
			auraData[targetJid].aura += value;
			auraData[secondTargetJid].aura -= value;

			saveAuraData(auraData);

			const newTotal = auraData[targetJid].aura;
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! ✅ ${targetName} venceu com ${firstVotes} votos.\n${targetName} acaba de ganhar ${absValue} de aura, ficando com ${newTotal} de aura enquanto ${secondTargetName} perdeu ${absValue} de aura ficando fudido com ${auraData[secondTargetJid].aura} de aura.`,
				mentions: [targetJid, secondTargetJid],
			});
		} else if (secondVotes > firstVotes) {
			const auraData = loadAuraData();
			if (!auraData[secondTargetJid]) {
				auraData[secondTargetJid] = { name: secondTargetName, aura: 0 };
			}
			auraData[secondTargetJid].aura += value;
			auraData[targetJid].aura -= value;

			saveAuraData(auraData);

			const newTotal = auraData[secondTargetJid].aura;
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! ✅ ${secondTargetName} venceu com ${secondVotes} votos.\n${secondTargetName} acaba de ganhar ${absValue} de aura, ficando com ${newTotal} de aura enquanto ${targetName} perdeu ${absValue} de aura ficando fudido com ${auraData[targetJid].aura} de aura.`,
				mentions: [secondTargetJid, targetJid],
			});
		} else {
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! Empate com ${totalVotes} votos. Nenhuma mudança de aura.`,
			});
		}
	} else {
		const simVotes =
			results.find((r) => r.name === "Sim")?.voters.length ?? 0;
		const naoVotes =
			results.find((r) => r.name === "Não")?.voters.length ?? 0;
		const totalVotes = simVotes + naoVotes;

		const action = value >= 0 ? "ganhar" : "perder";
		const actionPast = value >= 0 ? "ganhou" : "perdeu";
		const absValue = Math.abs(value);
		const targetName = getUserName(targetJid);

		if (simVotes > naoVotes) {
			const auraData = loadAuraData();
			if (!auraData[targetJid]) {
				auraData[targetJid] = { name: targetName, aura: 0 };
			}
			auraData[targetJid].aura += value;
			saveAuraData(auraData);

			const newTotal = auraData[targetJid].aura;
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! ✅ Sim venceu com ${simVotes} votos.\n${targetName} acaba de ${action} ${absValue} de aura, ficando com ${newTotal} de aura.`,
				mentions: [targetJid],
			});
		} else if (naoVotes > simVotes) {
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! ❌ Não venceu com ${naoVotes} votos.\n${targetName} não ${actionPast} ${absValue} de aura.`,
				mentions: [targetJid],
			});
		} else {
			await sock.sendMessage(remoteJid, {
				text: `${showbotPrefix}Enquete encerrada! Empate com ${totalVotes} votos. Nenhuma mudança de aura.`,
			});
		}
	}
};

export const handlePollUpdates = async (
	sock: ReturnType<typeof makeWASocket>,
	updates: Array<{
		key: { id?: string };
		update: { pollUpdates?: unknown[] };
	}>,
) => {
	for (const { key, update } of updates) {
		if (update.pollUpdates && activePolls.has(key.id!)) {
			const poll = activePolls.get(key.id!)!;
			for (const pollUpdate of update.pollUpdates) {
				updateMessageWithPollUpdate(poll.message, pollUpdate);
			}

			const results = getAggregateVotesInPollMessage(poll.message);
			const totalVotes = results.reduce(
				(sum, r) => sum + r.voters.length,
				0,
			);

			if (totalVotes >= pollMaxVotes) {
				await finalizePoll(sock, poll);
			}
		}
	}
};
