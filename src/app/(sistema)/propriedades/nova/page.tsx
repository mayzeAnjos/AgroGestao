// Formulario de cadastro que tem asteriscos nos campos obrigatorios, aceita virgula ao registrar a area e mostra erro se a area for zero ou vazia

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AgButton from "@/components/AgButton";
import { createProperty } from "@/lib/properties-api";

const classeCampo =
  "w-full rounded-lg border border-neutral-200 px-3 py-3 text-base outline-none transition focus:border-primary";

export default function NovaPropriedade() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [area, setArea] = useState("");
  const [erro, setErro] = useState("");

  async function salvar(e: React.SubmitEvent) {
    e.preventDefault();
    setErro("");

    const areaNumero = Number(area.replace(",", ".")); // aceita "450,5"
    if (!nome.trim() || !localizacao.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!(areaNumero > 0)) {
      setErro("A área total deve ser maior que zero.");
      return;
    }

    await createProperty({
      name: nome.trim(),
      location: localizacao.trim(),
      total_area_hectares: areaNumero,
    });
    router.push("/propriedades"); // volta para a listagem
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-primary">Nova Propriedade</h1>

      <form onSubmit={salvar} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-2 block text-neutral-700">
            Nome da propriedade <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Fazenda Boa Vista" />
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Localização <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex.: Sorriso - MT" />
        </div>

        <div>
          <label className="mb-2 block text-neutral-700">
            Área total (ha) <span className="text-secondary">*</span>
          </label>
          <input className={classeCampo} inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="0,00" />
        </div>

        {erro && <p className="rounded-lg bg-red-50 p-3 text-red-700">{erro}</p>}

        <AgButton>Salvar propriedade</AgButton>
        <Link href="/propriedades" className="text-center text-neutral-600 hover:text-neutral-900">
          Cancelar
        </Link>
      </form>
    </div>
  );
}
