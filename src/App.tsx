import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PacientesList from './pages/Pacientes/PacientesList';
import PacienteForm from './pages/Pacientes/PacienteForm';
import MedicosList from './pages/Medicos/MedicosList';
import MedicoForm from './pages/Medicos/MedicoForm';
import DashboardLayout from './components/Layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/pacientes" element={<PacientesList />} />
          <Route path="/dashboard/pacientes/novo" element={<PacienteForm />} />
          <Route path="/dashboard/pacientes/:id/editar" element={<PacienteForm />} />
          <Route path="/dashboard/medicos" element={<MedicosList />} />
          <Route path="/dashboard/medicos/novo" element={<MedicoForm />} />
          <Route path="/dashboard/medicos/:id/editar" element={<MedicoForm />} />
          {/* Próximas rotas (consultas, unidades) entram aqui */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
