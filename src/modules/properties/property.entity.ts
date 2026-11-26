// O formato de uma propriedade 

export type Property = {
  id: string;
  name: string; // nome da fazenda
  location: string; // cidade - UF
  total_area_hectares: number; // área total em hectares
};

// Dados para cadastrar (o id é criado automaticamente)
export type CreatePropertyDTO = Omit<Property, "id">;
