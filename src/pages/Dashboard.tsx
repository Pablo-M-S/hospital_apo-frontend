import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        Olá, {user?.email?.split('@')[0]}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Este é o painel inicial. Os módulos de Pacientes, Médicos, Consultas e Unidades
        entram aqui conforme forem implementados.
      </p>
    </div>
  );
}
