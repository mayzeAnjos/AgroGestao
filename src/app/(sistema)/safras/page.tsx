// Filtros por status:
//      Cada card mostra os botões das ações permitidas no status atual.
//      CANCELAR e REABRIR só aparecem para o Administrador.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AcaoSafra, changeHarvestStatus, listHarvests } from "@/lib/harvests-api";
import { listPlots } from "@/lib/plots-api";
import { listProperties } from "@/lib/properties-api";
import { PERFIL_ATUAL } from "@/components/menus";
import { CULTURAS, Harvest, HarvestStatus, NOME_STATUS } from "@/modules/harvests/harvest.entity";
import { Plot } from "@/modules/plots/plot.entity";
import { Property } from "@/modules/properties/property.entity";

// Cor do "selo" de cada status
const COR_STATUS: Record<HarvestStatus, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-primary",
  COMPLETED: "bg-neutral-100 text-neutral-700",
  CANCELED: "bg-red-100 text-red-800",
};

const ROTULO_ACAO: Record<AcaoSafra, string> = {
  iniciar: "Iniciar",
  encerrar: "Encerrar",
  cancelar: "Cancelar",
  reabrir: "Reabrir",
};

// "2026-03-01" -> "01/03/2026" (RI-010)
function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Safras() {
  const [safras, setSafras] = useState<Harvest[]>([]);
  const [talhoes, setTalhoes] = useState<Plot[]>([]);
  const [propriedades, setPropriedades] = useState<Property[]>([]);
  const [filtro, setFiltro] = useState<HarvestStatus | "TODAS">("TODAS");

  const ehAdmin = PERFIL_ATUAL === "administrador";

  function carregar() {
    listHarvests().then(setSafras);
  }

  useEffect(() => {
    carregar();
    listPlots().then(setTalhoes);
    listProperties().then(setPropriedades);
  }, []);

  // Quais botões aparecem em cada status (diagrama de estados)
  function acoesPermitidas(status: HarvestStatus): AcaoSafra[] {
    if (status === "PLANNING") return ehAdmin ? ["iniciar", "cancelar"] : ["iniciar"];
    if (status === "IN_PROGRESS") return ehAdmin ? ["encerrar", "cancelar"] : ["encerrar"];
    if (status === "COMPLETED") return ehAdmin ? ["reabrir"] : [];
    return []; // CANCELED: nenhuma ação
  }

  async function executar(safra: Harvest, acao: AcaoSafra) {
    if (!window.confirm(`Deseja ${ROTULO_ACAO[acao].toLowerCase()} esta safra?`)) return;
    try {
      await changeHarvestStatus(safra.id, acao);
      carregar(); // recarrega a lista com o novo status
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Erro ao mudar o status.");
    }
  }

  const safrasFiltradas = filtro === "TODAS" ? safras : safras.filter((s) => s.status === filtro);
  const filtros: (HarvestStatus | "TODAS")[] = ["TODAS", "PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELED"];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-primary">Safras</h1>
        <Link
          href="/safras/nova"
          className="rounded-xl bg-primary px-4 py-3 text-center text-white transition hover:bg-darker-primary"
        >
          + Abrir Safra
        </Link>
      </div>

      {/* Filtros por status */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`shrink-0 cursor-pointer rounded-full px-4 py-2 ${
              filtro === f ? "bg-primary text-white" : "border border-neutral-300 bg-white text-neutral-700"
            }`}
          >
            {f === "TODAS" ? "Todas" : NOME_STATUS[f]}
          </button>
        ))}
      </div>

      {safrasFiltradas.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-lg font-medium">Nenhuma safra encontrada</p>
          <p className="mt-1 text-neutral-500">Abra uma safra em um talhão cadastrado.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {safrasFiltradas.map((s) => {
          const talhao = talhoes.find((t) => t.id === s.plot_id);
          const fazenda = propriedades.find((p) => p.id === talhao?.property_id);
          const unidade = CULTURAS.find((c) => c.nome === s.crop)?.unidade ?? "";

          return (
            <div key={s.id} className="flex flex-col rounded-2xl border border-neutral-200 border-t-4 border-t-primary bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    {s.crop} · {talhao?.code ?? "Talhão"}
                  </h2>
                  <p className="text-neutral-500">{fazenda?.name}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${COR_STATUS[s.status]}`}>
                  {NOME_STATUS[s.status]}
                </span>
              </div>

              <p className="mt-4 text-neutral-700">
                {formatarData(s.start_date)} a {formatarData(s.end_date)}
              </p>
              <p className="mt-1 text-neutral-700">
                Estimativa: <strong>{s.estimated_yield.toLocaleString("pt-BR")} {unidade}</strong>
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {acoesPermitidas(s.status).map((acao) => (
                  <button
                    key={acao}
                    onClick={() => executar(s, acao)}
                    className={`cursor-pointer rounded-xl px-4 py-2 ${
                      acao === "cancelar"
                        ? "text-red-700 hover:bg-red-50"
                        : "bg-primary text-white hover:bg-darker-primary"
                    }`}
                  >
                    {ROTULO_ACAO[acao]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
