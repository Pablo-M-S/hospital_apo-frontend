import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Building2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
  { to: '/dashboard/medicos', label: 'Médicos', icon: Stethoscope },
  { to: '/dashboard/consultas', label: 'Consultas', icon: Calendar },
  { to: '/dashboard/unidades', label: 'Unidades', icon: Building2 },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
          <Stethoscope className="h-5 w-5 text-brand-600" />
          <span className="text-sm font-semibold text-gray-900">Sistema Hospitalar</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 px-2 text-xs text-gray-500">
            <p className="truncate font-medium text-gray-700">{user?.email}</p>
            <p>{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
