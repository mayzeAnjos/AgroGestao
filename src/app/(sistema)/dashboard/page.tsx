// Essa tela mostra:
//    - Quatro card de indicadores (área total, área em talhões, talhões cadastrados e safras em andamento)
//    - Hectares por talhão
//    - Um espaço reservado para colocar os indicadores financeiros

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProperties } from "@/lib/properties-api";
import { listPlots } from "@/lib/plots-api";
import { listHarvests } from "@/lib/harvests-api";
import { Property } from "@/modules/properties/property.entity";
import { Plot } from "@/modules/plots/plot.entity";
import { Harvest } from "@/modules/harvests/harvest.entity";

// Um card de indicador (número grande + descrição)
function Indicador({ titulo, valor, detalhe, href }: { titulo: string; valor: string; detalhe?: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-primary">
      <p className="text-sm text-neutral-500">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold">{valor}</p>
      {detalhe && <p className="mt-1 text-sm text-neutral-500">{detalhe}</p>}
    </Link>
  );
}

function hectares(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ha";
}

export default function Dashboard() {
  const [propriedades, setPropriedades] = useState<Property[]>([]);
  const [talhoes, setTalhoes] = useState<Plot[]>([]);
  const [safras, setSafras] = useState<Harvest[]>([]);

  useEffect(() => {
    listProperties().then(setPropriedades);
    listPlots().then(setTalhoes);
    listHarvests().then(setSafras);
  }, []);

  // Cálculos dos indicadores
  const areaTotal = propriedades.reduce((soma, p) => soma + p.total_area_hectares, 0);
  const areaEmTalhoes = talhoes.reduce((soma, t) => soma + t.area_hectares, 0);
  const ocupacao = areaTotal > 0 ? Math.round((areaEmTalhoes / areaTotal) * 100) : 0;
  const emAndamento = safras.filter((s) => s.status === "IN_PROGRESS").length;
  const emPlanejamento = safras.filter((s) => s.status === "PLANNING").length;

  return (
    <div>
      <p className="text-sm uppercase text-neutral-500">Painel do Administrador</p>
      <h1 className="mb-6 text-2xl font-bold text-primary">Dashboard</h1>

      {/* Indicadores de terra e safras */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Área total"
          valor={hectares(areaTotal)}
          detalhe={`${propriedades.length} propriedade(s)`}
          href="/propriedades"
        />
        <Indicador
          titulo="Área em talhões"
          valor={hectares(areaEmTalhoes)}
          detalhe={`${ocupacao}% da área ocupada`}
          href="/talhoes"
        />
        <Indicador titulo="Talhões cadastrados" valor={String(talhoes.length)} href="/talhoes" />
        <Indicador
          titulo="Safras em andamento"
          valor={String(emAndamento)}
          detalhe={`${emPlanejamento} em planejamento`}
          href="/safras"
        />
      </div>

      {/* Ocupação de hectares por talhão */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-4 font-semibold">Hectares por talhão</h2>
        {talhoes.length === 0 && <p className="text-neutral-500">Nenhum talhão cadastrado.</p>}
        <div className="flex flex-col gap-3">
          {talhoes.map((t) => {
            const fazenda = propriedades.find((p) => p.id === t.property_id);
            const percentual = fazenda ? (t.area_hectares / fazenda.total_area_hectares) * 100 : 0;
            return (
              <div key={t.id}>
                <div className="flex justify-between text-sm">
                  <span>
                    <strong>{t.code}</strong> · {fazenda?.name}
                  </span>
                  <span className="text-neutral-500">{hectares(t.area_hectares)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(percentual, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-4">
        <h2 className="font-semibold text-neutral-700">Indicadores financeiros e DRE</h2>
        <p className="mt-1 text-neutral-500">
          Seção reservada para o financeiro: Receitas − Despesas (RF-046), R$/ha (RF-045) e atalho para o DRE.
        </p>
      </div>
    </div>
  );
}
