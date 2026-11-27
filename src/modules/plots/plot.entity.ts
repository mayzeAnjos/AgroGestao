// Define o formato de um talhão (quais informações cada talhão precisa ter e de que tipo cada uma é)

export type Plot = {
  id: string;
  property_id: string; // a qual propriedade o talhão pertence
  code: string; // código do talhão, ex.: TAL-001
  area_hectares: number; // área do talhão
  soil_type: string; // tipo de solo
};

export type CreatePlotDTO = Omit<Plot, "id">;
