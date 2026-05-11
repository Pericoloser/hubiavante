import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { propuestasAPI, clientesAPI, fichasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function PropuestaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { estado: 'borrador', validezDias: 30 } });

  useEffect(() => {
    clientesAPI.getAll({ activo: true }).then(r => setClientes(r.data));
    fichasAPI.getAll().then(r => setFichas(r.data));
    if (isEdit) propuestasAPI.getById(id).then(r => reset(r.data));
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await propuestasAPI.update(id, data);
        toast.success('Propuesta actualizada');
        navigate(`/propuestas/${id}`);
      } else {
        const r = await propuestasAPI.create(data);
        toast.success('Propuesta creada');
        navigate(`/propuestas/${r.data.id}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const campos = [
    { field: 'introduccion', label: 'Introducción / Presentación' },
    { field: 'necesidadDetectada', label: 'Necesidad detectada' },
    { field: 'solucionPropuesta', label: 'Solución propuesta' },
    { field: 'metodologia', label: 'Metodología formativa' },
    { field: 'cronograma', label: 'Cronograma / Temporalización' },
    { field: 'equipo', label: 'Equipo docente y técnico' },
    { field: 'condicionesEconomicas', label: 'Condiciones económicas' },
    { field: 'observaciones', label: 'Observaciones' }
  ];

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Propuesta Comercial' : 'Nueva Propuesta Comercial'} back="/propuestas" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-900 pb-2 border-b">Datos generales</h2>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input {...register('titulo', { required: true })} className="input-field" placeholder="Propuesta formativa en simulación clínica..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select {...register('clienteId', { required: true })} className="input-field">
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ficha técnica vinculada</label>
            <select {...register('fichaId')} className="input-field">
              <option value="">Sin ficha vinculada</option>
              {fichas.map(f => <option key={f.id} value={f.id}>{f.codigo} · {f.titulo}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select {...register('estado')} className="input-field">
              {['borrador', 'enviada', 'aceptada', 'rechazada'].map(e => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Validez (días)</label>
            <input type="number" {...register('validezDias')} className="input-field" />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Contenido de la propuesta</h2>
          {campos.map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={3} {...register(field)} className="input-field resize-none" />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(isEdit ? `/propuestas/${id}` : '/propuestas')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Propuesta'}
          </button>
        </div>
      </form>
    </div>
  );
}
