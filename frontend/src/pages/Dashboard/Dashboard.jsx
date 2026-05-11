import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import {
  BuildingOfficeIcon, AcademicCapIcon, UserGroupIcon,
  ClipboardDocumentListIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card hover:shadow-md transition-shadow flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iavante-600" /></div>;

  const { totales, fichasPorEstado = [], ultimasFichas = [] } = stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen de la plataforma HUB IAVANTE</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={ClipboardDocumentListIcon} label="Fichas Técnicas" value={totales?.fichas || 0} color="bg-iavante-600" to="/fichas" />
        <StatCard icon={BuildingOfficeIcon} label="Clientes" value={totales?.clientes || 0} color="bg-emerald-500" to="/bbdd/clientes" />
        <StatCard icon={AcademicCapIcon} label="Alumnos" value={totales?.alumnos || 0} color="bg-amber-500" to="/bbdd/alumnos" />
        <StatCard icon={UserGroupIcon} label="Docentes" value={totales?.docentes || 0} color="bg-purple-500" to="/bbdd/docentes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Últimas Fichas Técnicas</h2>
            <Link to="/fichas" className="text-sm text-iavante-600 hover:text-iavante-700 flex items-center gap-1">
              Ver todas <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          {ultimasFichas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay fichas registradas</p>
          ) : (
            <div className="space-y-3">
              {ultimasFichas.map(f => (
                <Link key={f.id} to={`/fichas/${f.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.titulo}</p>
                    <p className="text-xs text-gray-500">{f.codigo} · {f.cliente?.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge estado={f.estado} />
                    <span className="text-xs text-gray-400">
                      {format(new Date(f.creadoEn), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Estado de Fichas</h2>
          <div className="space-y-3">
            {fichasPorEstado.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
            ) : fichasPorEstado.map(f => (
              <div key={f.estado} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge estado={f.estado} />
                </div>
                <span className="font-semibold text-gray-900">{f._count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Accesos rápidos</h3>
            <div className="space-y-2">
              <Link to="/fichas/nueva" className="block text-sm text-iavante-600 hover:text-iavante-700">+ Nueva Ficha Técnica</Link>
              <Link to="/presupuestos/nuevo" className="block text-sm text-iavante-600 hover:text-iavante-700">+ Nuevo Presupuesto</Link>
              <Link to="/propuestas/nueva" className="block text-sm text-iavante-600 hover:text-iavante-700">+ Nueva Propuesta Comercial</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
