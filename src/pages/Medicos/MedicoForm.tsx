import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { estadosBrasileiros } from '../../lib/estadosBrasileiros';
import type { Medico, Especialidade, Unidade } from '../../types/medico';

interface FormData {
  email: string;
  senha: string;
  nomeCompleto: string;
  crm: string;
  ufCrm: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  especialidadeIds: string[];
  unidadeIds: string[];
}

const formVazio: FormData = {
  email: '',
  senha: '',
  nomeCompleto: '',
  crm: '',
  ufCrm: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  especialidadeIds: [],
  unidadeIds: [],
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

export default function MedicoForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(formVazio);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [especialidadesRes, unidadesRes] = await Promise.all([
          api.get<Especialidade[]>('/api/especialidades'),
          api.get<Unidade[]>('/api/unidades'),
        ]);
        setEspecialidades(especialidadesRes.data);
        setUnidades(unidadesRes.data);

        if (editando) {
          const { data } = await api.get<Medico>(`/api/medicos/${id}`);
          setForm({
            email: '',
            senha: '',
            nomeCompleto: data.nomeCompleto,
            crm: data.crm,
            ufCrm: data.ufCrm,
            cpf: data.cpf,
            telefone: data.telefone || '',
            dataNascimento: data.dataNascimento ? data.dataNascimento.slice(0, 10) : '',
            especialidadeIds: data.especialidades.map((e) => e.especialidade.id),
            unidadeIds: data.unidades.map((u) => u.unidade.id),
          });
        }
      } catch {
        setErro('Não foi possível carregar os dados necessários.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, editando]);

  function atualizarCampo<K extends keyof FormData>(campo: K, valor: FormData[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarSelecao(campo: 'especialidadeIds' | 'unidadeIds', valorId: string) {
    setForm((atual) => {
      const jaSelecionado = atual[campo].includes(valorId);
      return {
        ...atual,
        [campo]: jaSelecionado
          ? atual[campo].filter((v) => v !== valorId)
          : [...atual[campo], valorId],
      };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      const dadosMedico = {
        nomeCompleto: form.nomeCompleto,
        crm: form.crm,
        ufCrm: form.ufCrm,
        cpf: form.cpf,
        telefone: form.telefone || undefined,
        dataNascimento: form.dataNascimento
          ? new Date(form.dataNascimento).toISOString()
          : undefined,
        especialidadeIds: form.especialidadeIds,
        unidadeIds: form.unidadeIds,
      };

      if (editando) {
        await api.put(`/api/medicos/${id}`, dadosMedico);
      } else {
        const { data: novoUsuario } = await api.post('/api/auth/registrar', {
          email: form.email,
          senha: form.senha,
          role: 'MEDICO',
        });

        await api.post('/api/medicos', {
          ...dadosMedico,
          userId: novoUsuario.user.id,
        });
      }

      navigate('/dashboard/medicos');
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
        to="/dashboard/medicos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {editando ? 'Editar médico' : 'Novo médico'}
      </h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        {!editando && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Esses dados criam o acesso de login do médico ao sistema.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo
                label="Email de acesso"
                type="email"
                required
                value={form.email}
                onChange={(v) => atualizarCampo('email', v)}
              />
              <Campo
                label="Senha inicial"
                type="password"
                required
                value={form.senha}
                onChange={(v) => atualizarCampo('senha', v)}
              />
            </div>
            <hr className="mb-4 border-gray-200" />
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            label="Nome completo"
            required
            className="sm:col-span-2"
            value={form.nomeCompleto}
            onChange={(v) => atualizarCampo('nomeCompleto', v)}
          />
          <Campo
            label="CRM"
            required
            value={form.crm}
            onChange={(v) => atualizarCampo('crm', v)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">UF do CRM</label>
            <select
              required
              value={form.ufCrm}
              onChange={(e) => atualizarCampo('ufCrm', e.target.value)}
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
            label="CPF"
            required
            value={form.cpf}
            onChange={(v) => atualizarCampo('cpf', v)}
          />
          <Campo
            label="Telefone"
            value={form.telefone}
            onChange={(v) => atualizarCampo('telefone', v)}
          />
          <Campo
            label="Data de nascimento"
            type="date"
            value={form.dataNascimento}
            onChange={(v) => atualizarCampo('dataNascimento', v)}
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Especialidades</label>
          <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2">
            {especialidades.map((esp) => (
              <label key={esp.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.especialidadeIds.includes(esp.id)}
                  onChange={() => alternarSelecao('especialidadeIds', esp.id)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                {esp.nome}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Unidades</label>
          <div className="grid gap-1 rounded-lg border border-gray-200 p-3">
            {unidades.map((uni) => (
              <label key={uni.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.unidadeIds.includes(uni.id)}
                  onChange={() => alternarSelecao('unidadeIds', uni.id)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                {uni.nome} — {uni.cidade}/{uni.estado}
              </label>
            ))}
          </div>
        </div>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
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
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
