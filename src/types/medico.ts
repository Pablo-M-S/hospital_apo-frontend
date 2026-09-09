export interface Especialidade {
  id: string;
  nome: string;
  codigoCFM?: string | null;
}

export interface Unidade {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface Medico {
  id: string;
  nomeCompleto: string;
  crm: string;
  ufCrm: string;
  cpf: string;
  telefone?: string | null;
  dataNascimento?: string | null;
  ativo: boolean;
  especialidades: { especialidade: Especialidade }[];
  unidades: { unidade: Unidade }[];
}
