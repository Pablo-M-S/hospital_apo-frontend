import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { diasSemana } from '../types/agenda';
import type { AgendaEntry, AgendaFormData } from '../types/agenda';

interface UnidadeResumo {
  id: string;
  nome: string;
}

const novoFormVazio: AgendaFormData = {
  unidadeId: '',
  diaSemana: 1,
  horaInicio: '08:00',
  horaFim: '17:00',
  duracaoConsulta: 30,
};

export function AgendaMedico({
  medicoId,
  unidades,
}: {
  medicoId: string;
  unidades: UnidadeResumo[];
}) {
  const [agendas, setAgendas] = useState<AgendaEntry[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novo, setNovo] = useState<AgendaFormData>(novoFormVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    api
      .get<AgendaEntry[]>('/api/agendas', { params: { medicoId } })
      .then(({ data }) => setAgendas(data))
      .catch(() => setErro('Não foi possível carregar a agenda.'))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [medicoId]);

  async function handleAdicionar() {
    if (!novo.unidadeId) {
      setErro('Selecione uma unidade para o horário.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.post('/api/agendas', { ...novo, medicoId });
      setNovo(novoFormVazio);
      carregar();
    } catch (err) {
      const resposta = (err as { response?: { data?: { erro?: string } } })?.response?.data;
      setErro(resposta?.erro || 'Não foi possível adicionar este horário.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(id: string) {
    if (!confirm('Remover este horário da agenda?')) return;
    await api.delete(`/api/agendas/${id}`);
    carregar();
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Agenda semanal</h2>
      <p className="mb-4 text-sm text-gray-500">
        Dias e horários em que este médico atende. As consultas só podem ser marcadas dentro
        desses horários.
      </p>

      {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

      {!carregando && (
        <div className="mb-4 flex flex-col gap-2">
          {agendas.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum horário cadastrado ainda.</p>
          )}
          {agendas.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <span>
                <strong>{diasSemana[a.diaSemana]}</strong> — {a.horaInicio} às {a.horaFim} (
                {a.duracaoConsulta}min) · {a.unidade?.nome}
              </span>
              <button
                type="button"
                onClick={() => handleRemover(a.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-dashed border-gray-300 p-4 sm:grid-cols-5 sm:items-end">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-700">Dia</label>
          <select
            value={novo.diaSemana}
            onChange={(e) => setNovo((n) => ({ ...n, diaSemana: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            {diasSemana.map((dia, i) => (
              <option key={dia} value={i}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Início</label>
          <input
            type="time"
            value={novo.horaInicio}
            onChange={(e) => setNovo((n) => ({ ...n, horaInicio: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Fim</label>
          <input
            type="time"
            value={novo.horaFim}
            onChange={(e) => setNovo((n) => ({ ...n, horaFim: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Duração (min)</label>
          <input
            type="number"
            min={5}
            max={240}
            value={novo.duracaoConsulta}
            onChange={(e) => setNovo((n) => ({ ...n, duracaoConsulta: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div className="col-span-2 sm:col-span-5">
          <label className="mb-1 block text-xs font-medium text-gray-700">Unidade</label>
          <select
            value={novo.unidadeId}
            onChange={(e) => setNovo((n) => ({ ...n, unidadeId: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">Selecione a unidade</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAdicionar}
          disabled={salvando}
          className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60 sm:col-span-5"
        >
          <Plus className="h-4 w-4" />
          Adicionar horário
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
