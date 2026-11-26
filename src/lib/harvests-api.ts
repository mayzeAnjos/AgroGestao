// Lista, cadastra e muda o status da safra, aplicando as regras de negócio:
//      - a data de fim precisa ser depois da data de início
//      - não pode haver duas safras com datas sobrepostas no mesmo talhão 
//      - um talhão só pode ter uma safra em andamento por vez
//      - cada mudança de status só é permitida a partir de certos estados

import { CreateHarvestDTO, Harvest, HarvestStatus } from "@/modules/harvests/harvest.entity";

// TEMPORÁRIO: enquanto a API não existe, os dados ficam no navegador.
const CHAVE = "agrogestao_safras";

function lerTodas(): Harvest[] {
  const salvo = localStorage.getItem(CHAVE);
  return salvo ? JSON.parse(salvo) : [];
}

function gravar(safras: Harvest[]) {
  localStorage.setItem(CHAVE, JSON.stringify(safras));
}

export async function listHarvests(): Promise<Harvest[]> {
  return lerTodas();
}

export async function createHarvest(dados: CreateHarvestDTO): Promise<Harvest> {
  const safras = lerTodas();

  if (dados.end_date <= dados.start_date) {
    throw new Error("A data de fim deve ser depois da data de início.");
  }
  if (!(dados.estimated_yield > 0)) {
    throw new Error("A estimativa de rendimento deve ser maior que zero.");
  }

  // FE01: não pode haver safras com datas sobrepostas no mesmo talhão
  const sobreposta = safras.some(
    (s) =>
      s.plot_id === dados.plot_id &&
      (s.status === "PLANNING" || s.status === "IN_PROGRESS") &&
      dados.start_date <= s.end_date &&
      s.start_date <= dados.end_date
  );
  if (sobreposta) {
    throw new Error("Já existe uma safra com datas sobrepostas neste talhão.");
  }

  // Toda safra nova começa "Em Planejamento"
  const nova: Harvest = { id: crypto.randomUUID(), ...dados, status: "PLANNING" };
  gravar([...safras, nova]);
  return nova;
}

// Ações do diagrama de estados: de quais status cada uma pode sair e para qual vai
const TRANSICOES = {
  iniciar: { de: ["PLANNING"], para: "IN_PROGRESS" },
  encerrar: { de: ["IN_PROGRESS"], para: "COMPLETED" },
  cancelar: { de: ["PLANNING", "IN_PROGRESS"], para: "CANCELED" },
  reabrir: { de: ["COMPLETED"], para: "IN_PROGRESS" },
} as const;

export type AcaoSafra = keyof typeof TRANSICOES;

export async function changeHarvestStatus(id: string, acao: AcaoSafra): Promise<void> {
  const safras = lerTodas();
  const safra = safras.find((s) => s.id === id);
  if (!safra) throw new Error("Safra não encontrada.");

  const regra = TRANSICOES[acao];
  if (!(regra.de as readonly HarvestStatus[]).includes(safra.status)) {
    throw new Error("Esta ação não é permitida no status atual da safra.");
  }

  // Um talhão só pode ter uma safra em andamento por vez
  if (regra.para === "IN_PROGRESS") {
    const outraEmAndamento = safras.some(
      (s) => s.plot_id === safra.plot_id && s.id !== id && s.status === "IN_PROGRESS"
    );
    if (outraEmAndamento) throw new Error("O talhão já tem outra safra em andamento.");
  }

  safra.status = regra.para;
  gravar(safras);
}
