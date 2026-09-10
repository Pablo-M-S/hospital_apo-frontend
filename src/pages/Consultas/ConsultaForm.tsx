import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import type { Paciente } from '../../types/paciente';
import type { Medico } from '../../types/medico';
import type { HorarioDisponivel } from '../../types/consulta';

function extrairMensagemErro(err: unknown): string {
  const resposta = (err as { response?: { data?: { erro?: string } } })?.response?.data;
  return resposta?.erro || 'Não foi possível marcar a consulta.';
}

export default function ConsultaForm() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [data, setData] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [horarioEscolhido, setHorarioEscolhido] = useState<HorarioDisponivel | null>(null);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);

  const [carregandoBase, setCarregandoBase] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get<Paciente[]>('/api/pacientes'), api.get<Medico[]>('/api/medicos')])
      .then(([pacientesRes, medicosRes]) => {
        setPacientes(pacientesRes.data);
        setMedicos(medicosRes.data.filter((m) => m.ativo));
      })
      .catch(() => setErro('Não foi possível carregar pacientes e médicos.'))
      .finally(() => setCarregandoBase(false));
  }, []);

  useEffect(() => {
    setHorarioEscolhido(null);
    setHorarios([]);

    if (!medicoId || !data) return;

    setBuscandoHorarios(true);
    api
      .get<HorarioDisponivel[]>('/api/agendas/disponibilidade', { params: { medicoId, data } })
      .then(({ data: res }) => setHorarios(res))
      .catch(() => setErro('Não foi possível buscar os horários disponíveis.'))
      .finally(() => setBuscandoHorarios(false));
  }, [medicoId, data]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!horarioEscolhido) {
      setErro('Selecione um horário disponível.');
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await api.post('/api/consultas', {
        pacienteId,
        medicoId,
        unidadeId: horarioEscolhido.unidadeId,
        dataHora: horarioEscolhido.horario,
        motivoConsulta: motivoConsulta || undefined,
        observacoes: observacoes || undefined,
      });
      navigate('/dashboard/consultas');
    } catch (err) {
      setErro(extrairMensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  function formatarHorario(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (carregandoBase) {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/consultas"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">Marcar consulta</h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Paciente</label>
            <select
              required
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecione</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nomeCompleto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Médico</label>
            <select
              required
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecione</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nomeCompleto} — {m.crm}/{m.ufCrm}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-60"
            />
          </div>
        </div>

        {medicoId && data && (
          <div className="mt-5">
            <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Horários disponíveis
            </label>

            {buscandoHorarios && <p className="text-sm text-gray-500">Buscando...</p>}

            {!buscandoHorarios && horarios.length === 0 && (
              <p className="text-sm text-gray-500">
                Nenhum horário livre nesse dia — o médico pode não atender nesse dia da semana,
                ou todos os horários já estão ocupados.
              </p>
            )}

            {!buscandoHorarios && horarios.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {horarios.map((h) => (
                  <button
                    key={h.horario}
                    type="button"
                    onClick={() => setHorarioEscolhido(h)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      horarioEscolhido?.horario === h.horario
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {formatarHorario(h.horario)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Motivo da consulta
            </label>
            <input
              type="text"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={salvando || !horarioEscolhido}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {salvando ? 'Marcando...' : 'Marcar consulta'}
        </button>
      </form>
    </div>
  );
}
