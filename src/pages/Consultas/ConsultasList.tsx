import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { statusLabels, statusCores } from '../../types/consulta';
import type { Consulta, StatusConsulta } from '../../types/consulta';

const opcoesStatus: StatusConsulta[] = [
  'AGENDADA',
  'CONFIRMADA',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'CANCELADA',
  'FALTOU',
];

export default function ConsultasList() {
  const { user } = useAuth();
  const podeMarcar = user?.role === 'ADMIN' || user?.role === 'RECEPCAO';

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    api
      .get<Consulta[]>('/api/consultas')
      .then(({ data }) => setConsultas(data))
      .catch(() => setErro('Não foi possível carregar as consultas.'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function handleMudarStatus(id: string, status: StatusConsulta) {
    setAtualizandoId(id);
    try {
      await api.patch(`/api/consultas/${id}/status`, { status });
      setConsultas((atual) => atual.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      setErro('Não foi possível atualizar o status dessa consulta.');
    } finally {
      setAtualizandoId(null);
    }
  }

  function formatarDataHora(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Consultas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {consultas.length} consulta{consultas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {podeMarcar && (
          <Link
            to="/dashboard/consultas/nova"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Marcar consulta
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {erro && <p className="p-4 text-sm text-red-600">{erro}</p>}
        {!erro && carregando && <p className="p-4 text-sm text-gray-500">Carregando...</p>}
        {!erro && !carregando && consultas.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <Calendar className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Nenhuma consulta marcada ainda.</p>
          </div>
        )}

        {!erro && !carregando && consultas.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Data/Hora</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Médico</th>
                <th className="px-4 py-3">Unidade</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((consulta) => (
                <tr
                  key={consulta.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatarDataHora(consulta.dataHora)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{consulta.paciente.nomeCompleto}</td>
                  <td className="px-4 py-3 text-gray-600">{consulta.medico.nomeCompleto}</td>
                  <td className="px-4 py-3 text-gray-600">{consulta.unidade.nome}</td>
                  <td className="px-4 py-3">
                    <select
                      value={consulta.status}
                      disabled={atualizandoId === consulta.id}
                      onChange={(e) =>
                        handleMudarStatus(consulta.id, e.target.value as StatusConsulta)
                      }
                      className={`rounded-full border-0 px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 ${statusCores[consulta.status]}`}
                    >
                      {opcoesStatus.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
