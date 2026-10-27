import makeWASocket from "baileys";
import {
	showbotPrefix,
	maxAuraChange,
	tomatoThreshold,
	canetaThreshold,
} from "../config";

export const handleHelp = async (
	sock: ReturnType<typeof makeWASocket>,
	remoteJid: string,
) => {
	await sock.sendMessage(remoteJid, {
		text:
			`${showbotPrefix}📋 *Comandos disponíveis:*\n\n` +
			`*!help* — Mostra esta lista de comandos\n\n` +
			`*!ping* — Verifica se o bot está online\n\n` +
			`*!aura* — Mostra o ranking de aura do grupo\n` +
			`*!aura @membro <valor>* — Abre uma enquete para dar/tirar aura de um membro (máx: ±${maxAuraChange})\n\n` +
			`*!aura @membro @membro <valor>* — Abre uma batalha de aura entre dois membros (máx: ${maxAuraChange})\n\n` +
			`*!galeria* — Mostra as 5 últimas frases salvas na galeria\n\n` +
			`*!bibito sim* — Toca o áudio do Bibito dizendo "sim"\n` +
			`*!bibito nao* — Toca o áudio do Bibito dizendo "não"\n\n` +
			`*!isac* — Bane o Isac do grupo\n\n` +
			`🍅 *${tomatoThreshold} tomates* — Apaga a mensagem do grupo\n` +
			`✍️ *${canetaThreshold} caneta* — Salva a mensagem na galeria`,
	});
};
