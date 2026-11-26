// Define o formato de um talhao (quais informacoes cada talhao precisa ter e de que tipo cada uma eh)

export type Plot = {
  id: string;
  property_id: string; // a qual propriedade o talhão pertence
  code: string; // código do talhão, ex.: TAL-001
  area_hectares: number; // área do talhão
  soil_type: string; // tipo de solo
};

export type CreatePlotDTO = Omit<Plot, "id">;
