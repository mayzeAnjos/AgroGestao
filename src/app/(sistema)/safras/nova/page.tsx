// Tela de cadastro de uma safra nova
// (mostra o formulário, guarda o que o usuário digita, confere os dados, salva a safra e volta para a listagem)

"use client";

// Traz o que será usado (imports)
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgButton from "@/components/AgButton";
import { createHarvest } from "@/lib/harvests-api";
import { listPlots } from "@/lib/plots-api";
import { listProperties } from "@/lib/properties-api";
import { CULTURAS } from "@/modules/harvests/harvest.entity";
import { Plot } from "@/modules/plots/plot.entity";
import { Property } from "@/modules/properties/property.entity";

const classeCampo =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-3 text-base outline-none transition focus:border-primary";


// Memória da tela (estados)
export default function NovaSafra() {
  const router = useRouter();
  const [talhoes, setTalhoes] = useState<Plot[]>([]);
  const [propriedades, setPropriedades] = useState<Property[]>([]);

  const [talhaoId, setTalhaoId] = useState("");
  const [cultura, setCultura] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [estimativa, setEstimativa] = useState("");
  const [erro, setErro] = useState("");

  // Carrega os talhões ao abrir a tela
  useEffect(() => {
    listPlots().then(setTalhoes);
    listProperties().then(setPropriedades);
  }, []);

  const unidade = CULTURAS.find((c) => c.nome === cultura)?.unidade ?? "";

  // Função "salvar" (acontece ao clicar no botão)
  async function salvar(e: React.SubmitEvent) {
    e.preventDefault();
    setErro("");

    if (!talhaoId || !cultura || !inicio || !fim || !estimativa) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await createHarvest({
        plot_id: talhaoId,
        crop: cultura,
        start_date: inicio,
        end_date: fim,
        estimated_yield: Number(estimativa.replace(",", ".")),
      });
      router.push("/safras");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar a safra.");
    }
  }

  // O que aparece na tela (descreve o visual)
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-primary">Abrir Safra</h1>

      <form onSubmit={salvar} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-2 block text-neutral-700">
            Talhão <span className="text-secondary">*</span>
          </label>
          <select className={classeCampo} value={talhaoId} onChange={(e) => setTalhaoId(e.target.value)}>
            <option value="">Selecione...</option>
            {talhoes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} — {propriedades.find((p) => p.id === t.property_id)?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Cultura <span className="text-secondary">*</span>
          </label>
          <select className={classeCampo} value={cultura} onChange={(e) => setCultura(e.target.value)}>
            <option value="">Selecione...</option>
            {CULTURAS.map((c) => (
              <option key={c.nome} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-neutral-700">
              Data de início <span className="text-secondary">*</span>
            </label>
            <input type="date" className={classeCampo} value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-neutral-700">
              Data de fim (prevista) <span className="text-secondary">*</span>
            </label>
            <input type="date" className={classeCampo} value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Estimativa de rendimento {unidade && `(${unidade})`} <span className="text-secondary">*</span>
          </label>
          <input
            className={classeCampo}
            inputMode="decimal"
            value={estimativa}
            onChange={(e) => setEstimativa(e.target.value)}
            placeholder="Ex.: 62"
          />
        </div>

        <p className="text-sm text-neutral-500">A safra será criada com o status "Em Planejamento".</p>

        {erro && <p className="rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        <AgButton>Abrir safra</AgButton>
        <Link href="/safras" className="text-center text-neutral-600 hover:text-neutral-900">
          Cancelar
        </Link>
      </form>
    </div>
  );
}
