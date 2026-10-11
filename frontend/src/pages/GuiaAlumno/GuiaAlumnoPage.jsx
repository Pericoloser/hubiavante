import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { guiasAlumnoAPI, fichasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

const CAMPOS = [
  { field: 'bienvenida', label: 'Bienvenida y presentación' },
  { field: 'presentacionCurso', label: 'Presentación del curso/actividad' },
  { field: 'objetivos', label: 'Objetivos de aprendizaje' },
  { field: 'contenidos', label: 'Contenidos del programa' },
  { field: 'horario', label: 'Horario y cronograma' },
  { field: 'metodologia', label: 'Metodología (incluye simulación clínica)' },
  { field: 'criteriosEvaluacion', label: 'Criterios de evaluación' },
  { field: 'recursosDidacticos', label: 'Recursos didácticos y materiales' },
  { field: 'normasConvivencia', label: 'Normas de convivencia y seguridad' },
  { field: 'contacto', label: 'Contacto y soporte' }
];

export default function GuiaAlumnoPage() {
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fichasAPI.getById(id).then(r => setFicha(r.data));
    guiasAlumnoAPI.getByFicha(id)
      .then(r => reset(r.data))
      .catch(() => {});
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await guiasAlumnoAPI.upsert(id, data);
      toast.success('Guía del alumno guardada');
      setSaved(true);
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Guía del Alumno"
        subtitle={ficha ? `${ficha.codigo} · ${ficha.titulo}` : '...'}
        back={`/fichas/${id}`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="font-semibold text-gray-900">Contenido de la guía</h2>
            <p className="text-xs text-gray-400">Documento orientado al alumno · Estándar IAVANTE</p>
          </div>
          {CAMPOS.map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={4} {...register(field)} className="input-field resize-none"
                placeholder={`Redactar ${label.toLowerCase()}...`} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar Guía del Alumno'}
          </button>
        </div>
      </form>
    </div>
  );
}
