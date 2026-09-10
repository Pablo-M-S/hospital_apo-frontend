export interface Unidade {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone?: string | null;
  ativo: boolean;
}

export interface UnidadeFormData {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}
