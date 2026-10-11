import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { seguimientoAPI, fichasAPI, docentesAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SeguimientoPage() {
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    fichasAPI.getById(id).then(r => setFicha(r.data));
    seguimientoAPI.getSesiones(id).then(r => setSesiones(r.data));
    docentesAPI.getAll({ activo: true }).then(r => setDocentes(r.data));
  };
  useEffect(() => { load(); }, [id]);

  const crearSesion = async (data) => {
    setLoading(true);
    try {
      const alumnoIds = ficha?.alumnos?.map(a => a.alumno.id) || [];
      await seguimientoAPI.createSesion(id, { ...data, alumnoIds });
      toast.success('Sesión creada');
      setModalNueva(false);
      reset();
      load();
    } catch { toast.error('Error al crear sesión'); }
    finally { setLoading(false); }
  };

  const toggleAsistencia = async (sesion, alumnoId, asistio) => {
    try {
      await seguimientoAPI.updateSesion(id, sesion.id, {
        asistencias: [{ alumnoId, asistio, justificada: false }]
      });
      load();
    } catch { toast.error('Error al actualizar asistencia'); }
  };

  const guardarObservaciones = async (sesionId, data) => {
    try {
      await seguimientoAPI.updateSesion(id, sesionId, data);
      toast.success('Observaciones guardadas');
      load();
    } catch { toast.error('Error al guardar'); }
  };

  const totalAlumnos = ficha?.alumnos?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seguimiento de Sesiones"
        subtitle={ficha ? `${ficha.codigo} · ${ficha.titulo}` : '...'}
        back={`/fichas/${id}`}
        actions={
          <button onClick={() => setModalNueva(true)} className="btn-primary flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Nueva Sesión
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-iavante-600">{sesiones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Sesiones registradas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800">{totalAlumnos}</p>
          <p className="text-xs text-gray-500 mt-1">Alumnos matriculados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">
            {sesiones.length > 0 && totalAlumnos > 0
              ? Math.round(sesiones.reduce((acc, s) => acc + (s.asistencias?.filter(a => a.asistio).length || 0), 0) / (sesiones.length * totalAlumnos) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Asistencia media</p>
        </div>
      </div>

      {sesiones.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm">No hay sesiones registradas. Crea la primera sesión.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map(sesion => (
            <SesionCard
              key={sesion.id}
              sesion={sesion}
              docentes={docentes}
              isOpen={sesionAbierta === sesion.id}
              onToggle={() => setSesionAbierta(sesionAbierta === sesion.id ? null : sesion.id)}
              onToggleAsistencia={(alumnoId, asistio) => toggleAsistencia(sesion, alumnoId, asistio)}
              onGuardar={(data) => guardarObservaciones(sesion.id, data)}
            />
          ))}
        </div>
      )}

      <Modal open={modalNueva} onClose={() => setModalNueva(false)} title="Nueva Sesión">
        <form onSubmit={handleSubmit(crearSesion)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input type="date" {...register('fecha', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Docente responsable</label>
            <select {...register('docenteId')} className="input-field">
              <option value="">Sin asignar</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.apellidos}, {d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
            <input type="number" step="0.5" {...register('duracionHoras')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input {...register('lugar')} className="input-field" placeholder="Sala de simulación..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido a impartir</label>
            <textarea rows={2} {...register('contenidoImpartido')} className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalNueva(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">Crear sesión</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SesionCard({ sesion, docentes, isOpen, onToggle, onToggleAsistencia, onGuardar }) {
  const [obs, setObs] = useState(sesion.observaciones || '');
  const [inc, setInc] = useState(sesion.incidencias || '');
  const presentes = sesion.asistencias?.filter(a => a.asistio).length || 0;
  const total = sesion.asistencias?.length || 0;

  return (
    <div className="card p-0 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-iavante-100 text-iavante-700 rounded-lg flex items-center justify-center font-bold text-sm">{sesion.numero}</div>
          <div>
            <p className="font-medium text-gray-900">
              Sesión {sesion.numero} · {format(new Date(sesion.fecha), 'EEEE dd MMM yyyy', { locale: es })}
            </p>
            <p className="text-xs text-gray-500">
              {sesion.docente ? `${sesion.docente.apellidos}, ${sesion.docente.nombre}` : 'Sin docente'} ·
              {sesion.duracionHoras ? ` ${sesion.duracionHoras}h` : ''} · Asistencia: {presentes}/{total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-iavante-600">{total > 0 ? Math.round(presentes / total * 100) : 0}%</div>
          {isOpen ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Control de asistencia</h4>
              <div className="space-y-2">
                {sesion.asistencias?.map(a => (
                  <div key={a.alumnoId} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-700">{a.alumno?.apellidos}, {a.alumno?.nombre}</span>
                    <button
                      onClick={() => onToggleAsistencia(a.alumnoId, !a.asistio)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        a.asistio ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {a.asistio ? '✓ Presente' : 'Ausente'}
                    </button>
                  </div>
                ))}
                {sesion.asistencias?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin alumnos en esta sesión</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
                  className="input-field resize-none text-sm" placeholder="Desarrollo de la sesión, aspectos destacados..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incidencias</label>
                <textarea rows={2} value={inc} onChange={e => setInc(e.target.value)}
                  className="input-field resize-none text-sm" placeholder="Problemas técnicos, cancelaciones, otras incidencias..." />
              </div>
              <button onClick={() => onGuardar({ observaciones: obs, incidencias: inc })}
                className="btn-primary text-xs">Guardar observaciones</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
