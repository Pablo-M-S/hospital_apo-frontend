export interface Paciente {
  id: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  convenio?: string | null;
  numeroCarteirinha?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PacienteFormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  convenio: string;
  numeroCarteirinha: string;
}
