import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fichasAPI, alumnosAPI, docentesAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  PencilIcon, BookOpenIcon, AcademicCapIcon,
  ChartBarIcon, DocumentCheckIcon, PlusIcon, TrashIcon, UserGroupIcon
} from '@heroicons/react/24/outline';

export default function FichaDetalle() {
  const { id } = useParams();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAlumno, setModalAlumno] = useState(false);
  const [modalDocente, setModalDocente] = useState(false);
  const [alumnosDisp, setAlumnosDisp] = useState([]);
  const [docentesDisp, setDocentesDisp] = useState([]);
  const [selAlumno, setSelAlumno] = useState('');
  const [selDocente, setSelDocente] = useState('');
  const [rolDocente, setRolDocente] = useState('docente');

  const load = () => fichasAPI.getById(id).then(r => setFicha(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const openModalAlumno = () => {
    alumnosAPI.getAll({ activo: true }).then(r => setAlumnosDisp(r.data));
    setModalAlumno(true);
  };
  const openModalDocente = () => {
    docentesAPI.getAll({ activo: true }).then(r => setDocentesDisp(r.data));
    setModalDocente(true);
  };

  const addAlumno = async () => {
    if (!selAlumno) return;
    await fichasAPI.addAlumno(id, { alumnoId: Number(selAlumno), estado: 'inscrito' });
    toast.success('Alumno añadido'); setModalAlumno(false); load();
  };
  const addDocente = async () => {
    if (!selDocente) return;
    await fichasAPI.addDocente(id, { docenteId: Number(selDocente), rol: rolDocente });
    toast.success('Docente añadido'); setModalDocente(false); load();
  };
  const removeAlumno = async (alumnoId) => {
    if (!confirm('¿Eliminar alumno de la ficha?')) return;
    await fichasAPI.removeAlumno(id, alumnoId);
    toast.success('Alumno eliminado'); load();
  };
  const removeDocente = async (docenteId) => {
    if (!confirm('¿Eliminar docente de la ficha?')) return;
    await fichasAPI.removeDocente(id, docenteId);
    toast.success('Docente eliminado'); load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-iavante-600" /></div>;
  if (!ficha) return <p className="text-center text-gray-500">Ficha no encontrada</p>;

  const fmt = (d) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: es }) : '—';

  return (
    <div className="space-y-6">
      <PageHeader
        title={ficha.titulo}
        subtitle={`${ficha.codigo} · ${ficha.cliente?.nombre}`}
        back="/fichas"
        actions={
          <div className="flex gap-2">
            <Link to={`/fichas/${id}/editar`} className="btn-secondary flex items-center gap-1.5">
              <PencilIcon className="h-4 w-4" /> Editar
            </Link>
          </div>
        }
      />

      {/* Módulos vinculados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: `/fichas/${id}/guia-alumno`, icon: AcademicCapIcon, label: 'Guía Alumno', color: 'text-blue-600 bg-blue-50' },
          { to: `/fichas/${id}/guia-docente`, icon: BookOpenIcon, label: 'Guía Docente', color: 'text-purple-600 bg-purple-50' },
          { to: `/fichas/${id}/seguimiento`, icon: ChartBarIcon, label: 'Seguimiento', color: 'text-amber-600 bg-amber-50' },
          { to: `/fichas/${id}/informe`, icon: DocumentCheckIcon, label: 'Informe Final', color: 'text-green-600 bg-green-50' }
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-shadow text-center">
            <div className={`p-3 rounded-xl ${color}`}><Icon className="h-6 w-6" /></div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info general */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Información general</h2>
          {[
            ['Estado', <Badge key="est" estado={ficha.estado} />],
            ['Tipo', ficha.tipoFormacion?.replace('_', ' ')],
            ['Modalidad', ficha.modalidad],
            ['Duración', ficha.duracionHoras ? `${ficha.duracionHoras}h` : '—'],
            ['Alumnos', `${ficha.numAlumnosMin || '—'} – ${ficha.numAlumnosMax || '—'}`],
            ['Lugar', ficha.lugar || '—'],
            ['Fecha inicio', fmt(ficha.fechaInicio)],
            ['Fecha fin', fmt(ficha.fechaFin)]
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900 text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Alumnos */}
        <div className="card">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <h2 className="font-semibold text-gray-900">Alumnos ({ficha.alumnos?.length || 0})</h2>
            <button onClick={openModalAlumno} className="text-iavante-600 hover:text-iavante-700">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ficha.alumnos?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin alumnos asignados</p>}
            {ficha.alumnos?.map(({ alumno, estado }) => (
              <div key={alumno.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{alumno.apellidos}, {alumno.nombre}</p>
                  <Badge estado={estado} />
                </div>
                <button onClick={() => removeAlumno(alumno.id)} className="text-red-400 hover:text-red-600">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Docentes */}
        <div className="card">
          <div className="flex items-center justify-between pb-2 border-b mb-3">
            <h2 className="font-semibold text-gray-900">Docentes ({ficha.docentes?.length || 0})</h2>
            <button onClick={openModalDocente} className="text-iavante-600 hover:text-iavante-700">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ficha.docentes?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin docentes asignados</p>}
            {ficha.docentes?.map(({ docente, rol }) => (
              <div key={docente.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{docente.apellidos}, {docente.nombre}</p>
                  <span className="text-xs text-gray-500">{rol} · {docente.tarifa?.nombre || 'sin tarifa'}</span>
                </div>
                <button onClick={() => removeDocente(docente.id)} className="text-red-400 hover:text-red-600">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido formativo */}
      {[
        ['Descripción', ficha.descripcion],
        ['Objetivos generales', ficha.objetivosGenerales],
        ['Objetivos específicos', ficha.objetivosEspecificos],
        ['Contenidos', ficha.contenidos],
        ['Metodología', ficha.metodologia],
        ['Criterios de evaluación', ficha.criteriosEvaluacion]
      ].filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="card">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">{k}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{v}</p>
        </div>
      ))}

      {/* Modales */}
      <Modal open={modalAlumno} onClose={() => setModalAlumno(false)} title="Añadir alumno a la ficha">
        <div className="space-y-4">
          <select value={selAlumno} onChange={e => setSelAlumno(e.target.value)} className="input-field">
            <option value="">Seleccionar alumno...</option>
            {alumnosDisp.filter(a => !ficha.alumnos?.some(fa => fa.alumno.id === a.id)).map(a => (
              <option key={a.id} value={a.id}>{a.apellidos}, {a.nombre}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalAlumno(false)} className="btn-secondary">Cancelar</button>
            <button onClick={addAlumno} className="btn-primary">Añadir</button>
          </div>
        </div>
      </Modal>

      <Modal open={modalDocente} onClose={() => setModalDocente(false)} title="Añadir docente a la ficha">
        <div className="space-y-4">
          <select value={selDocente} onChange={e => setSelDocente(e.target.value)} className="input-field">
            <option value="">Seleccionar docente...</option>
            {docentesDisp.filter(d => !ficha.docentes?.some(fd => fd.docente.id === d.id)).map(d => (
              <option key={d.id} value={d.id}>{d.apellidos}, {d.nombre} — {d.especialidad || 'sin especialidad'}</option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={rolDocente} onChange={e => setRolDocente(e.target.value)} className="input-field">
              <option value="coordinador">Coordinador</option>
              <option value="docente">Docente</option>
              <option value="colaborador">Colaborador</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalDocente(false)} className="btn-secondary">Cancelar</button>
            <button onClick={addDocente} className="btn-primary">Añadir</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
