// Aplica as regras de negócio

import { CreatePlotDTO, Plot } from "@/modules/plots/plot.entity";
import { listProperties } from "@/lib/properties-api";

// TEMPORÁRIO: enquanto a API não existe, os dados ficam no navegador.
const CHAVE = "agrogestao_talhoes";

function lerTodos(): Plot[] {
  const salvo = localStorage.getItem(CHAVE);
  return salvo ? JSON.parse(salvo) : [];
}

export async function listPlots(): Promise<Plot[]> {
  return lerTodos();
}

export async function createPlot(dados: CreatePlotDTO): Promise<Plot> {
  const talhoes = lerTodos();
  const propriedade = (await listProperties()).find((p) => p.id === dados.property_id);

  if (!propriedade) throw new Error("Selecione uma propriedade válida.");
  if (!(dados.area_hectares > 0)) throw new Error("A área do talhão deve ser maior que zero.");

  const doMesmaFazenda = talhoes.filter((t) => t.property_id === dados.property_id);

  if (doMesmaFazenda.some((t) => t.code === dados.code)) {
    throw new Error(`Já existe um talhão ${dados.code} nesta propriedade.`);
  }

  // RN03: a soma dos talhões não pode passar da área total da propriedade
  const areaOcupada = doMesmaFazenda.reduce((soma, t) => soma + t.area_hectares, 0);
  if (areaOcupada + dados.area_hectares > propriedade.total_area_hectares) {
    throw new Error(
      `A soma dos talhões (${areaOcupada + dados.area_hectares} ha) ultrapassa a área da propriedade (${propriedade.total_area_hectares} ha).`
    );
  }

  const novo: Plot = { id: crypto.randomUUID(), ...dados };
  localStorage.setItem(CHAVE, JSON.stringify([...talhoes, novo]));
  return novo;
}
