import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { alumnosAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'médico', label: 'Médico' },
  { value: 'enfermero', label: 'Enfermero' },
  { value: 'técnico', label: 'Técnico' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'otro', label: 'Otro' },
];

const CATEGORIA_COLORS = {
  'médico': 'bg-blue-50 text-blue-700',
  enfermero: 'bg-green-50 text-green-700',
  'técnico': 'bg-orange-50 text-orange-700',
  gestor: 'bg-purple-50 text-purple-700',
  otro: 'bg-gray-100 text-gray-700',
};

export default function AlumnosList() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchAlumnos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await alumnosAPI.getAll();
      setAlumnos(res.data);
    } catch {
      toast.error('Error al cargar los alumnos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumnos();
  }, [fetchAlumnos]);

  const openAdd = () => {
    setEditingAlumno(null);
    reset({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      empresa: '',
      categoriaProfesional: '',
      titulacion: '',
      especialidad: '',
      observaciones: '',
    });
    setModalOpen(true);
  };

  const openEdit = (alumno) => {
    setEditingAlumno(alumno);
    reset({
      nombre: alumno.nombre || '',
      apellidos: alumno.apellidos || '',
      email: alumno.email || '',
      telefono: alumno.telefono || '',
      dni: alumno.dni || '',
      empresa: alumno.empresa || '',
      categoriaProfesional: alumno.categoriaProfesional || '',
      titulacion: alumno.titulacion || '',
      especialidad: alumno.especialidad || '',
      observaciones: alumno.observaciones || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAlumno(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingAlumno) {
        await alumnosAPI.update(editingAlumno._id || editingAlumno.id, data);
        toast.success('Alumno actualizado correctamente');
      } else {
        await alumnosAPI.create(data);
        toast.success('Alumno creado correctamente');
      }
      closeModal();
      fetchAlumnos();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar el alumno');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (alumno) => {
    const fullName = [alumno.apellidos, alumno.nombre].filter(Boolean).join(', ');
    if (
      !window.confirm(
        `¿Eliminar el alumno "${fullName}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      setDeletingId(alumno._id || alumno.id);
      await alumnosAPI.remove(alumno._id || alumno.id);
      toast.success('Alumno eliminado correctamente');
      fetchAlumnos();
    } catch {
      toast.error('Error al eliminar el alumno');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = alumnos.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.nombre?.toLowerCase().includes(q) ||
      a.apellidos?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q);
    const matchCategoria =
      !filterCategoria || a.categoriaProfesional === filterCategoria;
    return matchSearch && matchCategoria;
  });

  return (
    <div>
      <PageHeader
        title="Alumnos"
        subtitle="Gestión del alumnado del centro"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            Nuevo alumno
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="input-field sm:w-56"
        >
          {CATEGORIA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Cargando alumnos...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={AcademicCapIcon}
            title="No hay alumnos"
            description={
              search || filterCategoria
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Crea el primer alumno pulsando el botón "Nuevo alumno".'
            }
            action={
              !search && !filterCategoria ? (
                <button className="btn-primary" onClick={openAdd}>
                  Nuevo alumno
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Nombre completo
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Categoría profesional
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((alumno) => {
                  const fullName = [alumno.apellidos, alumno.nombre]
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <tr
                      key={alumno._id || alumno.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{fullName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {alumno.email ? (
                          <a
                            href={`mailto:${alumno.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {alumno.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{alumno.empresa || '—'}</td>
                      <td className="px-4 py-3">
                        {alumno.categoriaProfesional ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              CATEGORIA_COLORS[alumno.categoriaProfesional] ||
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {alumno.categoriaProfesional}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(alumno)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(alumno)}
                            disabled={deletingId === (alumno._id || alumno.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingAlumno ? 'Editar alumno' : 'Nuevo alumno'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
                placeholder="Nombre"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.apellidos ? 'border-red-400' : ''}`}
                placeholder="Apellidos"
                {...register('apellidos', { required: 'Los apellidos son obligatorios' })}
              />
              {errors.apellidos && (
                <p className="text-xs text-red-500 mt-1">{errors.apellidos.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="correo@ejemplo.com"
                {...register('email')}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                className="input-field"
                placeholder="600 000 000"
                {...register('telefono')}
              />
            </div>

            {/* DNI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input
                type="text"
                className="input-field"
                placeholder="12345678A"
                {...register('dni')}
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                className="input-field"
                placeholder="Centro u organización"
                {...register('empresa')}
              />
            </div>

            {/* Categoría profesional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría profesional
              </label>
              <select className="input-field" {...register('categoriaProfesional')}>
                <option value="">Seleccionar categoría...</option>
                <option value="médico">Médico</option>
                <option value="enfermero">Enfermero</option>
                <option value="técnico">Técnico</option>
                <option value="gestor">Gestor</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Titulación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulación</label>
              <input
                type="text"
                className="input-field"
                placeholder="Titulación académica"
                {...register('titulacion')}
              />
            </div>

            {/* Especialidad */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <input
                type="text"
                className="input-field"
                placeholder="Especialidad clínica o profesional"
                {...register('especialidad')}
              />
            </div>

            {/* Observaciones */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder="Notas adicionales..."
                {...register('observaciones')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? 'Guardando...'
                : editingAlumno
                ? 'Guardar cambios'
                : 'Crear alumno'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
