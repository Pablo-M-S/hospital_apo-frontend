import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, CircleOff } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Unidade } from '../../types/unidade';

export default function UnidadesList() {
  const { user } = useAuth();
  const ehAdmin = user?.role === 'ADMIN';

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Unidade[]>('/api/unidades')
      .then(({ data }) => setUnidades(data))
      .catch(() => setErro('Não foi possível carregar as unidades.'))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Unidades</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unidades.length} unidade{unidades.length !== 1 ? 's' : ''} cadastrada
            {unidades.length !== 1 ? 's' : ''}
          </p>
        </div>

        {ehAdmin && (
          <Link
            to="/dashboard/unidades/novo"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Nova unidade
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {erro && <p className="p-4 text-sm text-red-600">{erro}</p>}
        {!erro && carregando && <p className="p-4 text-sm text-gray-500">Carregando...</p>}
        {!erro && !carregando && unidades.length === 0 && (
          <p className="p-4 text-sm text-gray-500">Nenhuma unidade cadastrada.</p>
        )}

        {!erro && !carregando && unidades.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Cidade/UF</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {unidades.map((unidade) => (
                <tr
                  key={unidade.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {unidade.nome}
                    {!unidade.ativo && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        <CircleOff className="h-3 w-3" />
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {unidade.cidade}/{unidade.estado}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{unidade.cnpj}</td>
                  <td className="px-4 py-3 text-gray-600">{unidade.telefone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {ehAdmin && (
                      <Link
                        to={`/dashboard/unidades/${unidade.id}/editar`}
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
