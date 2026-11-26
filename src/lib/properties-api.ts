// Funcoes que as telas usam para listar e cadastrar

import { CreatePropertyDTO, Property } from "@/modules/properties/property.entity";

// TEMPORÁRIO: enquanto a API não existe, os dados ficam no navegador.
// Quando a rota /api/properties existir, troque o conteúdo das funções por fetch(...)
const CHAVE = "agrogestao_propriedades";

function lerTodas(): Property[] {
  const salvo = localStorage.getItem(CHAVE);
  return salvo ? JSON.parse(salvo) : [];
}

export async function listProperties(): Promise<Property[]> {
  return lerTodas();
}

export async function createProperty(dados: CreatePropertyDTO): Promise<Property> {
  const nova: Property = { id: crypto.randomUUID(), ...dados };
  localStorage.setItem(CHAVE, JSON.stringify([...lerTodas(), nova]));
  return nova;
}
