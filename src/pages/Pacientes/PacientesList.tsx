import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Paciente } from '../../types/paciente';

export default function PacientesList() {
  const { user } = useAuth();
  const podeCriar = user?.role === 'ADMIN' || user?.role === 'RECEPCAO';

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarPacientes = useCallback(async (termo: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await api.get<Paciente[]>('/api/pacientes', {
        params: termo ? { busca: termo } : undefined,
      });
      setPacientes(data);
    } catch {
      setErro('Não foi possível carregar os pacientes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => buscarPacientes(busca), 350);
    return () => clearTimeout(timeout);
  }, [busca, buscarPacientes]);

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} cadastrado
            {pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {podeCriar && (
          <Link
            to="/dashboard/pacientes/novo"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Novo paciente
          </Link>
        )}
      </div>

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {erro && <p className="p-4 text-sm text-red-600">{erro}</p>}

        {!erro && carregando && (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        )}

        {!erro && !carregando && pacientes.length === 0 && (
          <p className="p-4 text-sm text-gray-500">Nenhum paciente encontrado.</p>
        )}

        {!erro && !carregando && pacientes.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Nascimento</th>
                <th className="px-4 py-3">Convênio</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {paciente.nomeCompleto}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{paciente.cpf}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarData(paciente.dataNascimento)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {paciente.convenio || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dashboard/pacientes/${paciente.id}/editar`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      {podeCriar ? 'Editar' : 'Ver'}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
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
