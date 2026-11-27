// Filtra os talhões por fazenda

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPlots } from "@/lib/plots-api";
import { listProperties } from "@/lib/properties-api";
import { Plot } from "@/modules/plots/plot.entity";
import { Property } from "@/modules/properties/property.entity";

export default function Talhoes() {
  const [talhoes, setTalhoes] = useState<Plot[]>([]);
  const [propriedades, setPropriedades] = useState<Property[]>([]);
  const [filtro, setFiltro] = useState(""); // "" = todas as propriedades

  useEffect(() => {
    listPlots().then(setTalhoes);
    listProperties().then(setPropriedades);
  }, []);

  // Descobre o nome da fazenda a partir do id
  function nomeDaPropriedade(id: string) {
    return propriedades.find((p) => p.id === id)?.name ?? "—";
  }

  const talhoesFiltrados = filtro ? talhoes.filter((t) => t.property_id === filtro) : talhoes;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-primary">Talhões</h1>
        <Link
          href="/talhoes/novo"
          className="rounded-xl bg-primary px-4 py-3 text-center text-white transition hover:bg-darker-primary"
        >
          + Novo Talhão
        </Link>
      </div>

      <select
        className="mb-6 w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-base md:w-80"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      >
        <option value="">Todas as propriedades</option>
        {propriedades.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {talhoesFiltrados.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-lg font-medium">Nenhum talhão encontrado</p>
          <p className="mt-1 text-neutral-500">Cadastre talhões para poder abrir safras.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {talhoesFiltrados.map((t) => (
          <div key={t.id} className="rounded-2xl border border-neutral-200 border-t-4 border-t-primary bg-white p-4">
            <h2 className="text-xl font-semibold">{t.code}</h2>
            <p className="text-neutral-500">{nomeDaPropriedade(t.property_id)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-neutral-500">Área</p>
                <p className="font-semibold">
                  {t.area_hectares.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ha
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Solo</p>
                <p className="font-semibold">{t.soil_type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
