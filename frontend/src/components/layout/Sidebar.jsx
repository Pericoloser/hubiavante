import { NavLink } from 'react-router-dom';
import {
  HomeIcon, ClipboardDocumentListIcon, CurrencyEuroIcon,
  DocumentTextIcon, AcademicCapIcon, UserGroupIcon,
  ChartBarIcon, DocumentCheckIcon, UsersIcon,
  BuildingOfficeIcon, TagIcon, BookOpenIcon
} from '@heroicons/react/24/outline';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' }
    ]
  },
  {
    label: 'Gestión Formativa',
    items: [
      { to: '/fichas', icon: ClipboardDocumentListIcon, label: 'Fichas Técnicas' },
      { to: '/presupuestos', icon: CurrencyEuroIcon, label: 'Presupuestos' },
      { to: '/propuestas', icon: DocumentTextIcon, label: 'Propuestas Comerciales' }
    ]
  },
  {
    label: 'Bases de Datos',
    items: [
      { to: '/bbdd/clientes', icon: BuildingOfficeIcon, label: 'Clientes' },
      { to: '/bbdd/alumnos', icon: AcademicCapIcon, label: 'Alumnos' },
      { to: '/bbdd/docentes', icon: UserGroupIcon, label: 'Docentes' },
      { to: '/bbdd/tarifas', icon: TagIcon, label: 'Tarifas' }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-iavante-900 text-white flex flex-col">
      <div className="p-5 border-b border-iavante-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-iavante-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">HI</div>
          <div>
            <div className="font-semibold text-sm">HUB IAVANTE</div>
            <div className="text-iavante-300 text-xs">Gestión Formativa</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map(group => (
          <div key={group.label} className="mb-6">
            <p className="text-iavante-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">{group.label}</p>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-iavante-600 text-white font-medium'
                      : 'text-iavante-200 hover:bg-iavante-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-iavante-800">
        <p className="text-iavante-400 text-xs text-center">v1.0.0 · IAVANTE 2024</p>
      </div>
    </aside>
  );
}
