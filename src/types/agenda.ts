export const diasSemana = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export interface AgendaEntry {
  id: string;
  medicoId: string;
  unidadeId: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  duracaoConsulta: number;
  ativo: boolean;
  unidade?: { id: string; nome: string };
}

export interface AgendaFormData {
  unidadeId: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  duracaoConsulta: number;
}
