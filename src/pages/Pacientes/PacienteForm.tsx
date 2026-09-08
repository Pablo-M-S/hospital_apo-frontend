import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { estadosBrasileiros } from '../../lib/estadosBrasileiros';
import type { Paciente, PacienteFormData } from '../../types/paciente';

const formVazio: PacienteFormData = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  convenio: '',
  numeroCarteirinha: '',
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

export default function PacienteForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const podeEditar = user?.role === 'ADMIN' || user?.role === 'RECEPCAO';

  const [form, setForm] = useState<PacienteFormData>(formVazio);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!editando) return;

    api
      .get<Paciente>(`/api/pacientes/${id}`)
      .then(({ data }) => {
        setForm({
          nomeCompleto: data.nomeCompleto,
          cpf: data.cpf,
          dataNascimento: data.dataNascimento.slice(0, 10),
          telefone: data.telefone,
          email: data.email || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          convenio: data.convenio || '',
          numeroCarteirinha: data.numeroCarteirinha || '',
        });
      })
      .catch(() => setErro('Não foi possível carregar este paciente.'))
      .finally(() => setCarregando(false));
  }, [id, editando]);

  function atualizarCampo<K extends keyof PacienteFormData>(campo: K, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const payload = {
      ...form,
      dataNascimento: new Date(form.dataNascimento).toISOString(),
      email: form.email || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
      cep: form.cep || undefined,
      convenio: form.convenio || undefined,
      numeroCarteirinha: form.numeroCarteirinha || undefined,
    };

    try {
      if (editando) {
        await api.put(`/api/pacientes/${id}`, payload);
      } else {
        await api.post('/api/pacientes', payload);
      }
      navigate('/dashboard/pacientes');
    } catch (err) {
      setErro(extrairMensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/pacientes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {editando ? (podeEditar ? 'Editar paciente' : 'Detalhes do paciente') : 'Novo paciente'}
      </h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <fieldset disabled={!podeEditar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Nome completo"
            required
            className="sm:col-span-2"
            value={form.nomeCompleto}
            onChange={(v) => atualizarCampo('nomeCompleto', v)}
          />
          <Campo
            label="CPF"
            required
            value={form.cpf}
            onChange={(v) => atualizarCampo('cpf', v)}
          />
          <Campo
            label="Data de nascimento"
            required
            type="date"
            value={form.dataNascimento}
            onChange={(v) => atualizarCampo('dataNascimento', v)}
          />
          <Campo
            label="Telefone"
            required
            value={form.telefone}
            onChange={(v) => atualizarCampo('telefone', v)}
          />
          <Campo
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => atualizarCampo('email', v)}
          />
          <Campo
            label="Convênio"
            value={form.convenio}
            onChange={(v) => atualizarCampo('convenio', v)}
          />
          <Campo
            label="Número da carteirinha"
            value={form.numeroCarteirinha}
            onChange={(v) => atualizarCampo('numeroCarteirinha', v)}
          />
          <Campo
            label="Endereço"
            className="sm:col-span-2"
            value={form.endereco}
            onChange={(v) => atualizarCampo('endereco', v)}
          />
          <Campo
            label="Cidade"
            value={form.cidade}
            onChange={(v) => atualizarCampo('cidade', v)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => atualizarCampo('estado', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Selecione</option>
              {estadosBrasileiros.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <Campo label="CEP" value={form.cep} onChange={(v) => atualizarCampo('cep', v)} />
        </fieldset>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        {podeEditar && (
          <button
            type="submit"
            disabled={salvando}
            className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        )}
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}
