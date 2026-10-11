import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { guiasDocenteAPI, fichasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

const CAMPOS = [
  { field: 'introduccion', label: 'Introducción para el docente' },
  { field: 'objetivos', label: 'Objetivos de aprendizaje (detallados)' },
  { field: 'contenidos', label: 'Contenidos y estructura del programa' },
  { field: 'metodologiaDetallada', label: 'Metodología detallada (fases, roles, escenarios)' },
  { field: 'temporalizacion', label: 'Temporalización y distribución de sesiones' },
  { field: 'recursosNecesarios', label: 'Recursos necesarios (equipos, materiales, espacios)' },
  { field: 'criteriosEvaluacion', label: 'Criterios e instrumentos de evaluación' },
  { field: 'protocolosSimulacion', label: 'Protocolos de simulación clínica (casos, escenarios)' },
  { field: 'debriefingGuia', label: 'Guía de debriefing y retroalimentación' },
  { field: 'observaciones', label: 'Observaciones e instrucciones especiales' }
];

export default function GuiaDocentePage() {
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fichasAPI.getById(id).then(r => setFicha(r.data));
    guiasDocenteAPI.getByFicha(id).then(r => reset(r.data)).catch(() => {});
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await guiasDocenteAPI.upsert(id, data);
      toast.success('Guía del docente guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Guía del Docente"
        subtitle={ficha ? `${ficha.codigo} · ${ficha.titulo}` : '...'}
        back={`/fichas/${id}`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="font-semibold text-gray-900">Contenido de la guía docente</h2>
            <p className="text-xs text-gray-400">Documento interno · Estándar IAVANTE · Simulación Clínica</p>
          </div>
          {CAMPOS.map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={4} {...register(field)} className="input-field resize-none"
                placeholder={`Redactar ${label.toLowerCase()}...`} />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar Guía del Docente'}
          </button>
        </div>
      </form>
    </div>
  );
}
