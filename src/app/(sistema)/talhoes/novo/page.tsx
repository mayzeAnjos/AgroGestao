// Mostra quanta area ainda esta disponivel na fazenda escolhida

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgButton from "@/components/AgButton";
import { createPlot, listPlots } from "@/lib/plots-api";
import { listProperties } from "@/lib/properties-api";
import { Plot } from "@/modules/plots/plot.entity";
import { Property } from "@/modules/properties/property.entity";

const classeCampo =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-base outline-none transition focus:border-primary";

export default function NovoTalhao() {
  const router = useRouter();
  const [propriedades, setPropriedades] = useState<Property[]>([]);
  const [talhoes, setTalhoes] = useState<Plot[]>([]);

  const [propriedadeId, setPropriedadeId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [area, setArea] = useState("");
  const [solo, setSolo] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    listProperties().then(setPropriedades);
    listPlots().then(setTalhoes);
  }, []);

  // Área ainda livre na fazenda escolhida (RN03)
  const propriedade = propriedades.find((p) => p.id === propriedadeId);
  const ocupada = talhoes
    .filter((t) => t.property_id === propriedadeId)
    .reduce((soma, t) => soma + t.area_hectares, 0);
  const disponivel = propriedade ? propriedade.total_area_hectares - ocupada : 0;

  async function salvar(e: React.SubmitEvent) {
    e.preventDefault();
    setErro("");

    if (!propriedadeId || !codigo.trim() || !area || !solo.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await createPlot({
        property_id: propriedadeId,
        code: codigo.trim().toUpperCase(),
        area_hectares: Number(area.replace(",", ".")),
        soil_type: solo.trim(),
      });
      router.push("/talhoes");
    } catch (e) {
      // Mostra a mensagem de erro que veio do plots-api.ts
      setErro(e instanceof Error ? e.message : "Erro ao salvar o talhão.");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-primary">Novo Talhão</h1>

      <form onSubmit={salvar} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-2 block text-neutral-700">
            Propriedade <span className="text-secondary">*</span>
          </label>
          <select className={classeCampo} value={propriedadeId} onChange={(e) => setPropriedadeId(e.target.value)}>
            <option value="">Selecione...</option>
            {propriedades.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {propriedade && (
          <p className="rounded-lg bg-green-50 p-3 text-primary">
            Área disponível nesta propriedade: <strong>{disponivel.toLocaleString("pt-BR")} ha</strong> de{" "}
            {propriedade.total_area_hectares.toLocaleString("pt-BR")} ha
          </p>
        )}

        <div>
          <label className="mb-2 block text-neutral-700">
            Código do talhão <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: TAL-001" />
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Área (ha) <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="0,00" />
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Tipo de solo <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} value={solo} onChange={(e) => setSolo(e.target.value)} placeholder="Ex.: Argiloso" />
        </div>

        {erro && <p className="rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        <AgButton>Salvar talhão</AgButton>
        <Link href="/talhoes" className="text-center text-neutral-600 hover:text-neutral-900">
          Cancelar
        </Link>
      </form>
    </div>
  );
}
