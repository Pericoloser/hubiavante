import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fichasAPI, clientesAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

const TIPOS = ['simulacion_clinica', 'taller', 'curso', 'seminario', 'webinar'];
const MODALIDADES = ['presencial', 'online', 'semipresencial'];

export default function FichaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const isEdit = Boolean(id);

  useEffect(() => {
    clientesAPI.getAll({ activo: true }).then(r => setClientes(r.data));
    if (isEdit) {
      fichasAPI.getById(id).then(r => {
        const f = r.data;
        reset({
          ...f,
          fechaInicio: f.fechaInicio ? f.fechaInicio.slice(0, 10) : '',
          fechaFin: f.fechaFin ? f.fechaFin.slice(0, 10) : ''
        });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await fichasAPI.update(id, data);
        toast.success('Ficha técnica actualizada');
      } else {
        const r = await fichasAPI.create(data);
        toast.success('Ficha técnica creada');
        navigate(`/fichas/${r.data.id}`);
        return;
      }
      navigate(`/fichas/${id}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar Ficha Técnica' : 'Nueva Ficha Técnica'}
        back={isEdit ? `/fichas/${id}` : '/fichas'}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Datos generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input {...register('titulo', { required: true })} className="input-field" placeholder="Curso de Simulación en Urgencias Pediátricas" />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select {...register('clienteId', { required: true })} className="input-field">
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.clienteId && <p className="text-red-500 text-xs mt-1">Campo obligatorio</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de formación *</label>
              <select {...register('tipoFormacion', { required: true })} className="input-field">
                <option value="">Seleccionar...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
              <select {...register('modalidad')} className="input-field">
                {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select {...register('estado')} className="input-field">
                <option value="borrador">Borrador</option>
                <option value="activa">Activa</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
              <input type="number" step="0.5" {...register('duracionHoras')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº alumnos mín.</label>
              <input type="number" {...register('numAlumnosMin')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº alumnos máx.</label>
              <input type="number" {...register('numAlumnosMax')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input type="date" {...register('fechaInicio')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input type="date" {...register('fechaFin')} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
              <input {...register('lugar')} className="input-field" placeholder="Hospital / Centro de simulación..." />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Contenido formativo</h2>
          {[
            { field: 'descripcion', label: 'Descripción general' },
            { field: 'objetivosGenerales', label: 'Objetivos generales' },
            { field: 'objetivosEspecificos', label: 'Objetivos específicos' },
            { field: 'contenidos', label: 'Contenidos' },
            { field: 'metodologia', label: 'Metodología' },
            { field: 'criteriosEvaluacion', label: 'Criterios de evaluación' }
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={3} {...register(field)} className="input-field resize-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea rows={2} {...register('observaciones')} className="input-field resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(isEdit ? `/fichas/${id}` : '/fichas')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
}
