import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CircleOff } from 'lucide-react';
import { api } from '../../lib/api';
import { estadosBrasileiros } from '../../lib/estadosBrasileiros';
import type { Unidade, UnidadeFormData } from '../../types/unidade';

const formVazio: UnidadeFormData = {
  nome: '',
  cnpj: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
};

function extrairMensagemErro(err: unknown): string {
  const resposta = (err as { response?: { data?: { erro?: string; detalhes?: Record<string, string[]> } } })
    ?.response?.data;

  if (resposta?.detalhes) {
    const mensagens = Object.values(resposta.detalhes).flat();
    if (mensagens.length > 0) return mensagens.join(' ');
  }

  return resposta?.erro || 'Não foi possível salvar. Tente novamente.';
}

export default function UnidadeForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<UnidadeFormData>(formVazio);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [desativando, setDesativando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!editando) return;

    api
      .get<Unidade>(`/api/unidades/${id}`)
      .then(({ data }) => {
        setForm({
          nome: data.nome,
          cnpj: data.cnpj,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          telefone: data.telefone || '',
        });
      })
      .catch(() => setErro('Não foi possível carregar esta unidade.'))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  function atualizarCampo<K extends keyof UnidadeFormData>(campo: K, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const payload = {
      ...form,
      telefone: form.telefone || undefined,
    };

    try {
      if (editando) {
        await api.put(`/api/unidades/${id}`, payload);
      } else {
        await api.post('/api/unidades', payload);
      }
      navigate('/dashboard/unidades');
    } catch (err) {
      setErro(extrairMensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function handleDesativar() {
    if (!confirm('Tem certeza que deseja desativar esta unidade?')) return;

    setDesativando(true);
    try {
      await api.delete(`/api/unidades/${id}`);
      navigate('/dashboard/unidades');
    } catch (err) {
      setErro(extrairMensagemErro(err));
      setDesativando(false);
    }
  }

  if (carregando) {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/unidades"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {editando ? 'Editar unidade' : 'Nova unidade'}
      </h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Nome"
            required
            className="sm:col-span-2"
            value={form.nome}
            onChange={(v) => atualizarCampo('nome', v)}
          />
          <Campo
            label="CNPJ"
            required
            value={form.cnpj}
            onChange={(v) => atualizarCampo('cnpj', v)}
          />
          <Campo
            label="Telefone"
            value={form.telefone}
            onChange={(v) => atualizarCampo('telefone', v)}
          />
          <Campo
            label="Endereço"
            required
            className="sm:col-span-2"
            value={form.endereco}
            onChange={(v) => atualizarCampo('endereco', v)}
          />
          <Campo
            label="Cidade"
            required
            value={form.cidade}
            onChange={(v) => atualizarCampo('cidade', v)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select
              required
              value={form.estado}
              onChange={(e) => atualizarCampo('estado', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecione</option>
              {estadosBrasileiros.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <Campo
            label="CEP"
            required
            value={form.cep}
            onChange={(v) => atualizarCampo('cep', v)}
          />
        </div>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>

          {editando && (
            <button
              type="button"
              onClick={handleDesativar}
              disabled={desativando}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <CircleOff className="h-4 w-4" />
              {desativando ? 'Desativando...' : 'Desativar unidade'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  required = false,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
