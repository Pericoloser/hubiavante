import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { presupuestosAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const fmtEUR = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => { presupuestosAPI.getById(id).then(r => setP(r.data)); }, [id]);

  if (!p) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.numero}
        subtitle={`${p.cliente?.nombre} · ${format(new Date(p.fecha), 'dd MMM yyyy', { locale: es })}`}
        back="/presupuestos"
        actions={<Link to={`/presupuestos/${id}/editar`} className="btn-secondary flex items-center gap-1.5"><PencilIcon className="h-4 w-4" /> Editar</Link>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card space-y-2 text-sm">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Detalles</h2>
          {[['Estado', <Badge key="st" estado={p.estado} />],
            ['Cliente', p.cliente?.nombre],
            ['Ficha vinculada', p.ficha ? `${p.ficha.codigo} · ${p.ficha.titulo}` : '—'],
            ['Validez', `${p.validezDias} días`],
            ['Notas', p.notas || '—']
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-gray-500 shrink-0">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4">Concepto: {p.concepto}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-right py-2">Cant.</th>
                  <th className="text-right py-2">Precio unit.</th>
                  <th className="text-right py-2">Dto.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {p.lineas?.map(l => (
                  <tr key={l.id} className="border-b border-gray-50">
                    <td className="py-2">{l.descripcion}</td>
                    <td className="py-2 text-right text-gray-600">{l.cantidad}</td>
                    <td className="py-2 text-right text-gray-600">{fmtEUR(l.precioUnitario)}</td>
                    <td className="py-2 text-right text-gray-600">{l.descuento}%</td>
                    <td className="py-2 text-right font-medium">{fmtEUR(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t text-sm space-y-1 text-right">
            <div className="flex justify-end gap-8 text-gray-600"><span>Subtotal</span><span>{fmtEUR(p.subtotal)}</span></div>
            <div className="flex justify-end gap-8 text-gray-600"><span>Descuento ({p.descuento}%)</span><span className="text-red-600">-{fmtEUR(p.subtotal * p.descuento / 100)}</span></div>
            <div className="flex justify-end gap-8 text-gray-600"><span>IVA ({p.iva}%)</span><span>{fmtEUR((p.subtotal * (1 - p.descuento / 100)) * p.iva / 100)}</span></div>
            <div className="flex justify-end gap-8 font-bold text-base text-gray-900 border-t pt-2"><span>TOTAL</span><span>{fmtEUR(p.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
