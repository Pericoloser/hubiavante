import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { informesAPI, fichasAPI, seguimientoAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const CAMPOS = [
  { field: 'resumenEjecutivo', label: 'Resumen ejecutivo' },
  { field: 'cumplimientoObjetivos', label: 'Cumplimiento de objetivos' },
  { field: 'resultadosAprendizaje', label: 'Resultados de aprendizaje obtenidos' },
  { field: 'evaluacionDocentes', label: 'Evaluación de docentes' },
  { field: 'evaluacionAlumnos', label: 'Evaluación de alumnos' },
  { field: 'datosAsistencia', label: 'Datos de asistencia y participación' },
  { field: 'incidenciasRegistradas', label: 'Incidencias registradas' },
  { field: 'conclusiones', label: 'Conclusiones' },
  { field: 'recomendaciones', label: 'Recomendaciones para futuras ediciones' }
];

export default function InformeFinalPage() {
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { estado: 'borrador' } });
  const estado = watch('estado');

  useEffect(() => {
    fichasAPI.getById(id).then(r => setFicha(r.data));
    seguimientoAPI.getSesiones(id).then(r => setSesiones(r.data));
    informesAPI.getByFicha(id).then(r => reset(r.data)).catch(() => {});
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await informesAPI.upsert(id, data);
      toast.success(data.estado === 'finalizado' ? 'Informe finalizado' : 'Informe guardado');
    } catch { toast.error('Error al guardar'); }
    finally { setLoading(false); }
  };

  const totalPresentes = sesiones.reduce((acc, s) => acc + (s.asistencias?.filter(a => a.asistio).length || 0), 0);
  const totalPosibles = sesiones.reduce((acc, s) => acc + (s.asistencias?.length || 0), 0);
  const pctAsistencia = totalPosibles > 0 ? Math.round(totalPresentes / totalPosibles * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Informe Final"
        subtitle={ficha ? `${ficha.codigo} · ${ficha.titulo}` : '...'}
        back={`/fichas/${id}`}
      />

      {/* Datos estadísticos automáticos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sesiones realizadas', value: sesiones.length, color: 'text-iavante-600' },
          { label: 'Alumnos matriculados', value: ficha?.alumnos?.length || 0, color: 'text-gray-800' },
          { label: 'Docentes asignados', value: ficha?.docentes?.length || 0, color: 'text-purple-600' },
          { label: 'Asistencia media', value: `${pctAsistencia}%`, color: 'text-amber-600' }
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="font-semibold text-gray-900">Contenido del informe</h2>
            <div className="flex items-center gap-3">
              <Badge estado={estado} />
              <select {...register('estado')} className="input-field w-auto text-xs">
                <option value="borrador">Borrador</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          {CAMPOS.map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={4} {...register(field)} className="input-field resize-none"
                placeholder={`Redactar ${label.toLowerCase()}...`} />
            </div>
          ))}
        </div>

        {/* Resumen de sesiones */}
        {sesiones.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Resumen de sesiones (datos automáticos)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left py-2">Sesión</th>
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Docente</th>
                    <th className="text-right py-2">Asistencia</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiones.map(s => {
                    const pres = s.asistencias?.filter(a => a.asistio).length || 0;
                    const tot = s.asistencias?.length || 0;
                    return (
                      <tr key={s.id} className="border-b border-gray-50">
                        <td className="py-2 font-medium">Sesión {s.numero}</td>
                        <td className="py-2 text-gray-500">{new Date(s.fecha).toLocaleDateString('es-ES')}</td>
                        <td className="py-2 text-gray-600">{s.docente ? `${s.docente.apellidos}, ${s.docente.nombre}` : '—'}</td>
                        <td className="py-2 text-right">{pres}/{tot}</td>
                        <td className="py-2 text-right font-medium">{tot > 0 ? Math.round(pres / tot * 100) : 0}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="submit" name="estado" value="borrador" disabled={loading} className="btn-secondary">
            Guardar borrador
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : estado === 'finalizado' ? '✓ Informe finalizado' : 'Guardar informe'}
          </button>
        </div>
      </form>
    </div>
  );
}
