import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, CircleOff } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Medico } from '../../types/medico';

export default function MedicosList() {
  const { user } = useAuth();
  const ehAdmin = user?.role === 'ADMIN';

  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Medico[]>('/api/medicos')
      .then(({ data }) => setMedicos(data))
      .catch(() => setErro('Não foi possível carregar os médicos.'))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Médicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {medicos.length} médico{medicos.length !== 1 ? 's' : ''} cadastrado
            {medicos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {ehAdmin && (
          <Link
            to="/dashboard/medicos/novo"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Novo médico
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {erro && <p className="p-4 text-sm text-red-600">{erro}</p>}
        {!erro && carregando && <p className="p-4 text-sm text-gray-500">Carregando...</p>}
        {!erro && !carregando && medicos.length === 0 && (
          <p className="p-4 text-sm text-gray-500">Nenhum médico cadastrado.</p>
        )}

        {!erro && !carregando && medicos.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CRM</th>
                <th className="px-4 py-3">Especialidades</th>
                <th className="px-4 py-3">Unidades</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {medicos.map((medico) => (
                <tr
                  key={medico.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {medico.nomeCompleto}
                    {!medico.ativo && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        <CircleOff className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {medico.crm}/{medico.ufCrm}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {medico.especialidades.map((e) => e.especialidade.nome).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {medico.unidades.map((u) => u.unidade.nome).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ehAdmin && (
                      <Link
                        to={`/dashboard/medicos/${medico.id}/editar`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Editar
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
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
