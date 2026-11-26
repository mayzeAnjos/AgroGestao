// Define o formato de uma safra

// Os 4 estados do diagrama de estados da Safra
export type HarvestStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export type Harvest = {
  id: string;
  plot_id: string; // talhão onde a safra é plantada
  crop: string; // cultura: Soja, Milho...
  start_date: string; // data de início, no formato aaaa-mm-dd
  end_date: string; // data de fim prevista
  estimated_yield: number; // rendimento esperado
  status: HarvestStatus;
};

export type CreateHarvestDTO = Omit<Harvest, "id" | "status">;

// Nomes em português de cada status, para mostrar na tela
export const NOME_STATUS: Record<HarvestStatus, string> = {
  PLANNING: "Em Planejamento",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

// Culturas disponíveis e a unidade do rendimento de cada uma
export const CULTURAS = [
  { nome: "Soja", unidade: "sc/ha" },
  { nome: "Milho", unidade: "sc/ha" },
  { nome: "Algodão", unidade: "t/ha" },
];
