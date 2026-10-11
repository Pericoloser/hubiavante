import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fichasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADOS = ['borrador', 'activa', 'finalizada', 'cancelada'];

export default function FichasList() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (estado) params.estado = estado;
    fichasAPI.getAll(params).then(r => setFichas(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, estado]);

  return (
    <div>
      <PageHeader
        title="Fichas Técnicas"
        subtitle="Gestión de actividades formativas"
        actions={<Link to="/fichas/nueva" className="btn-primary">+ Nueva Ficha</Link>}
      />

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o código..."
              className="input-field pl-9" />
          </div>
          <select value={estado} onChange={e => setEstado(e.target.value)} className="input-field w-auto">
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>
        ) : fichas.length === 0 ? (
          <EmptyState
            icon={ClipboardDocumentListIcon}
            title="No hay fichas técnicas"
            description="Crea la primera ficha técnica para comenzar"
            action={<Link to="/fichas/nueva" className="btn-primary">+ Nueva Ficha</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha inicio</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {fichas.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-iavante-600 font-medium">{f.codigo}</td>
                    <td className="py-3 px-3 font-medium text-gray-900 max-w-xs truncate">{f.titulo}</td>
                    <td className="py-3 px-3 text-gray-600">{f.cliente?.nombre}</td>
                    <td className="py-3 px-3 text-gray-600 capitalize">{f.tipoFormacion?.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {f.fechaInicio ? format(new Date(f.fechaInicio), 'dd/MM/yyyy', { locale: es }) : '—'}
                    </td>
                    <td className="py-3 px-3"><Badge estado={f.estado} /></td>
                    <td className="py-3 px-3">
                      <Link to={`/fichas/${f.id}`} className="text-iavante-600 hover:text-iavante-700 font-medium text-xs">Ver</Link>
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
