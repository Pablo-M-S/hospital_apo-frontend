export type StatusConsulta =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'FALTOU';

export const statusLabels: Record<StatusConsulta, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  FALTOU: 'Faltou',
};

export const statusCores: Record<StatusConsulta, string> = {
  AGENDADA: 'bg-blue-50 text-blue-700',
  CONFIRMADA: 'bg-emerald-50 text-emerald-700',
  EM_ANDAMENTO: 'bg-amber-50 text-amber-700',
  CONCLUIDA: 'bg-gray-100 text-gray-600',
  CANCELADA: 'bg-red-50 text-red-700',
  FALTOU: 'bg-red-50 text-red-700',
};

export interface Consulta {
  id: string;
  dataHora: string;
  status: StatusConsulta;
  motivoConsulta?: string | null;
  observacoes?: string | null;
  paciente: { id: string; nomeCompleto: string };
  medico: { id: string; nomeCompleto: string; crm?: string };
  unidade: { id: string; nome: string };
}

export interface HorarioDisponivel {
  unidadeId: string;
  horario: string;
}
