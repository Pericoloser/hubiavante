import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propuestasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PropuestasList() {
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');

  useEffect(() => {
    propuestasAPI.getAll(estado ? { estado } : {}).then(r => setPropuestas(r.data)).finally(() => setLoading(false));
  }, [estado]);

  return (
    <div>
      <PageHeader
        title="Propuestas Comerciales"
        subtitle="Propuestas formativas para clientes"
        actions={<Link to="/propuestas/nueva" className="btn-primary">+ Nueva Propuesta</Link>}
      />
      <div className="card">
        <div className="mb-5">
          <select value={estado} onChange={e => setEstado(e.target.value)} className="input-field w-auto">
            <option value="">Todos los estados</option>
            {['borrador', 'enviada', 'aceptada', 'rechazada'].map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>
        ) : propuestas.length === 0 ? (
          <EmptyState icon={DocumentTextIcon} title="No hay propuestas" description="Crea la primera propuesta comercial"
            action={<Link to="/propuestas/nueva" className="btn-primary">+ Nueva Propuesta</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Número', 'Título', 'Cliente', 'Fecha', 'Validez', 'Estado', ''].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propuestas.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-xs text-iavante-600 font-medium">{p.numero}</td>
                    <td className="py-3 px-3 font-medium text-gray-900 max-w-xs truncate">{p.titulo}</td>
                    <td className="py-3 px-3 text-gray-600">{p.cliente?.nombre}</td>
                    <td className="py-3 px-3 text-gray-500">{format(new Date(p.fecha), 'dd/MM/yyyy', { locale: es })}</td>
                    <td className="py-3 px-3 text-gray-500">{p.validezDias} días</td>
                    <td className="py-3 px-3"><Badge estado={p.estado} /></td>
                    <td className="py-3 px-3">
                      <Link to={`/propuestas/${p.id}`} className="text-iavante-600 hover:text-iavante-700 text-xs font-medium">Ver</Link>
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
