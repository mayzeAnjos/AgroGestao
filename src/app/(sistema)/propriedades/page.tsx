// No computador: os cards ficam lado a lado;
// Ja no celular: ficam um embaixo do outro.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProperties } from "@/lib/properties-api";
import { Property } from "@/modules/properties/property.entity";

export default function Propriedades() {
  const [propriedades, setPropriedades] = useState<Property[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Busca as propriedades quando a tela abre
  useEffect(() => {
    listProperties().then((lista) => {
      setPropriedades(lista);
      setCarregando(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-primary">Propriedades e Talhões</h1>

        {/* Os dois botões, lado a lado no computador */}
        <div className="flex flex-col gap-2 md:flex-row">
          <Link
            href="/talhoes"
            className="rounded-xl border border-primary px-4 py-3 text-center text-primary transition hover:bg-green-50"
          >
            Ver talhões
          </Link>
          <Link
            href="/propriedades/nova"
            className="rounded-xl bg-primary px-4 py-3 text-center text-white transition hover:bg-darker-primary"
          >
            + Nova Propriedade
          </Link>
        </div>
      </div>

      {carregando && <p className="text-neutral-500">Carregando...</p>}

      {!carregando && propriedades.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-lg font-medium">Nenhuma propriedade cadastrada</p>
          <p className="mt-1 text-neutral-500">Clique em "+ Nova Propriedade" para começar.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {propriedades.map((p) => (
          <div key={p.id} className="rounded-2xl border border-neutral-200 border-t-4 border-t-primary bg-white p-4">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-neutral-500">{p.location}</p>
            <p className="mt-4 text-sm text-neutral-500">Área total</p>
            <p className="text-2xl font-semibold">
              {p.total_area_hectares.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ha
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
