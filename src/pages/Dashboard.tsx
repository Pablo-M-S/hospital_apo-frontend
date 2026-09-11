import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, Building2, CalendarClock, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { statusLabels, statusCores } from '../types/consulta';
import type { Consulta } from '../types/consulta';

interface Contagens {
  pacientes: number;
  medicos: number;
  unidades: number;
}

function limitesDeHoje() {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
  const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

export default function Dashboard() {
  const { user } = useAuth();
  const podeVerConsultas =
    user?.role === 'ADMIN' || user?.role === 'RECEPCAO' || user?.role === 'MEDICO';

  const [contagens, setContagens] = useState<Contagens | null>(null);
  const [consultasHoje, setConsultasHoje] = useState<Consulta[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [pacientesRes, medicosRes, unidadesRes] = await Promise.all([
          api.get('/api/pacientes'),
          api.get('/api/medicos'),
          api.get('/api/unidades'),
        ]);
        setContagens({
          pacientes: pacientesRes.data.length,
          medicos: medicosRes.data.filter((m: { ativo: boolean }) => m.ativo).length,
          unidades: unidadesRes.data.length,
        });
      } catch {
        setErro('Não foi possível carregar os números gerais.');
      }

      if (podeVerConsultas) {
        try {
          const { inicio, fim } = limitesDeHoje();
          const { data } = await api.get<Consulta[]>('/api/consultas', {
            params: { dataInicio: inicio, dataFim: fim },
          });
          setConsultasHoje(
            [...data].sort((a, b) => a.dataHora.localeCompare(b.dataHora))
          );
        } catch {
          setConsultasHoje([]);
        }
      }
    }
    carregar();
  }, [podeVerConsultas]);

  function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        Olá, {user?.email?.split('@')[0]}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral do sistema hoje.</p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          icone={<Users className="h-5 w-5" />}
          label="Pacientes"
          valor={contagens?.pacientes}
        />
        <Card
          icone={<Stethoscope className="h-5 w-5" />}
          label="Médicos ativos"
          valor={contagens?.medicos}
        />
        <Card
          icone={<Building2 className="h-5 w-5" />}
          label="Unidades"
          valor={contagens?.unidades}
        />
        <Card
          icone={<CalendarClock className="h-5 w-5" />}
          label="Consultas hoje"
          valor={consultasHoje?.length}
        />
      </div>

      {(user?.role === 'ADMIN' || user?.role === 'RECEPCAO') && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/dashboard/pacientes/novo"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Novo paciente
          </Link>
          <Link
            to="/dashboard/consultas/nova"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Marcar consulta
          </Link>
        </div>
      )}

      {podeVerConsultas && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Consultas de hoje</h2>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {consultasHoje === null && (
              <p className="p-4 text-sm text-gray-500">Carregando...</p>
            )}

            {consultasHoje?.length === 0 && (
              <p className="p-4 text-sm text-gray-500">Nenhuma consulta marcada para hoje.</p>
            )}

            {consultasHoje && consultasHoje.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Médico</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consultasHoje.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatarHora(c.dataHora)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.paciente.nomeCompleto}</td>
                      <td className="px-4 py-3 text-gray-600">{c.medico.nomeCompleto}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusCores[c.status]}`}
                        >
                          {statusLabels[c.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  icone,
  label,
  valor,
}: {
  icone: ReactNode;
  label: string;
  valor: number | undefined;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-gray-400">{icone}</div>
      <p className="text-2xl font-semibold text-gray-900">
        {valor === undefined ? '—' : valor}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
