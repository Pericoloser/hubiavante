import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propuestasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Section = ({ title, content }) => content ? (
  <div className="card">
    <h3 className="font-semibold text-gray-900 mb-2 text-sm pb-2 border-b">{title}</h3>
    <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
  </div>
) : null;

export default function PropuestaDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => { propuestasAPI.getById(id).then(r => setP(r.data)); }, [id]);
  if (!p) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.titulo}
        subtitle={`${p.numero} · ${p.cliente?.nombre} · ${format(new Date(p.fecha), 'dd MMM yyyy', { locale: es })}`}
        back="/propuestas"
        actions={<Link to={`/propuestas/${id}/editar`} className="btn-secondary flex items-center gap-1.5"><PencilIcon className="h-4 w-4" /> Editar</Link>}
      />

      <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[['Estado', <Badge key="st" estado={p.estado} />], ['Cliente', p.cliente?.nombre], ['Validez', `${p.validezDias} días`],
          ['Ficha vinculada', p.ficha ? p.ficha.codigo : '—']].map(([k, v]) => (
          <div key={k}><p className="text-xs text-gray-500 mb-1">{k}</p><p className="font-medium">{v}</p></div>
        ))}
      </div>

      <Section title="Introducción / Presentación" content={p.introduccion} />
      <Section title="Necesidad detectada" content={p.necesidadDetectada} />
      <Section title="Solución propuesta" content={p.solucionPropuesta} />
      <Section title="Metodología formativa" content={p.metodologia} />
      <Section title="Cronograma / Temporalización" content={p.cronograma} />
      <Section title="Equipo docente y técnico" content={p.equipo} />
      <Section title="Condiciones económicas" content={p.condicionesEconomicas} />
      {p.observaciones && <Section title="Observaciones" content={p.observaciones} />}
    </div>
  );
}
