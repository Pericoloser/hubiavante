import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { presupuestosAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmt = (n) => n?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export default function PresupuestosList() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');

  useEffect(() => {
    presupuestosAPI.getAll(estado ? { estado } : {}).then(r => setPresupuestos(r.data)).finally(() => setLoading(false));
  }, [estado]);

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        subtitle="Gestión económica de actividades formativas"
        actions={<Link to="/presupuestos/nuevo" className="btn-primary">+ Nuevo Presupuesto</Link>}
      />
      <div className="card">
        <div className="flex gap-3 mb-5">
          <select value={estado} onChange={e => setEstado(e.target.value)} className="input-field w-auto">
            <option value="">Todos los estados</option>
            {['borrador', 'enviado', 'aceptado', 'rechazado', 'facturado'].map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>
        ) : presupuestos.length === 0 ? (
          <EmptyState icon={CurrencyEuroIcon} title="No hay presupuestos" description="Crea el primer presupuesto"
            action={<Link to="/presupuestos/nuevo" className="btn-primary">+ Nuevo Presupuesto</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Número', 'Cliente', 'Concepto', 'Fecha', 'Total', 'Estado', ''].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {presupuestos.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-xs text-iavante-600 font-medium">{p.numero}</td>
                    <td className="py-3 px-3 text-gray-700">{p.cliente?.nombre}</td>
                    <td className="py-3 px-3 text-gray-800 max-w-xs truncate">{p.concepto}</td>
                    <td className="py-3 px-3 text-gray-500">{format(new Date(p.fecha), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{fmt(p.total)}</td>
                    <td className="py-3 px-3"><Badge estado={p.estado} /></td>
                    <td className="py-3 px-3">
                      <Link to={`/presupuestos/${p.id}`} className="text-iavante-600 hover:text-iavante-700 text-xs font-medium">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
