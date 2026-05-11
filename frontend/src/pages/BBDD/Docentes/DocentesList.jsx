import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { docentesAPI, tarifasAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'experto', label: 'Experto' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'colaborador', label: 'Colaborador' },
];

const CATEGORIA_COLORS = {
  experto: 'bg-blue-50 text-blue-700',
  tutor: 'bg-green-50 text-green-700',
  coordinador: 'bg-purple-50 text-purple-700',
  colaborador: 'bg-orange-50 text-orange-700',
};

export default function DocentesList() {
  const [docentes, setDocentes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchDocentes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await docentesAPI.getAll();
      setDocentes(res.data);
    } catch {
      toast.error('Error al cargar los docentes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTarifas = useCallback(async () => {
    try {
      const res = await tarifasAPI.getAll();
      setTarifas(res.data);
    } catch {
      // Tarifas are auxiliary; a failed fetch should not block the page
    }
  }, []);

  useEffect(() => {
    fetchDocentes();
    fetchTarifas();
  }, [fetchDocentes, fetchTarifas]);

  const openAdd = () => {
    setEditingDocente(null);
    reset({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      dni: '',
      especialidad: '',
      titulacion: '',
      categoria: '',
      tarifaId: '',
      cv: '',
      observaciones: '',
    });
    setModalOpen(true);
  };

  const openEdit = (docente) => {
    setEditingDocente(docente);
    reset({
      nombre: docente.nombre || '',
      apellidos: docente.apellidos || '',
      email: docente.email || '',
      telefono: docente.telefono || '',
      dni: docente.dni || '',
      especialidad: docente.especialidad || '',
      titulacion: docente.titulacion || '',
      categoria: docente.categoria || '',
      tarifaId: docente.tarifaId || docente.tarifa?._id || docente.tarifa?.id || '',
      cv: docente.cv || '',
      observaciones: docente.observaciones || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDocente(null);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = { ...data, tarifaId: data.tarifaId || null };
    try {
      setSubmitting(true);
      if (editingDocente) {
        await docentesAPI.update(editingDocente._id || editingDocente.id, payload);
        toast.success('Docente actualizado correctamente');
      } else {
        await docentesAPI.create(payload);
        toast.success('Docente creado correctamente');
      }
      closeModal();
      fetchDocentes();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar el docente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docente) => {
    const fullName = [docente.apellidos, docente.nombre].filter(Boolean).join(', ');
    if (
      !window.confirm(
        `¿Eliminar el docente "${fullName}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      setDeletingId(docente._id || docente.id);
      await docentesAPI.remove(docente._id || docente.id);
      toast.success('Docente eliminado correctamente');
      fetchDocentes();
    } catch {
      toast.error('Error al eliminar el docente');
    } finally {
      setDeletingId(null);
    }
  };

  const getTarifaLabel = (docente) => {
    // Support both populated object and raw id reference
    if (docente.tarifa?.nombre) return docente.tarifa.nombre;
    const id = docente.tarifaId || docente.tarifa;
    if (!id) return '—';
    const found = tarifas.find((t) => (t._id || t.id) === id);
    return found ? found.nombre : '—';
  };

  const filtered = docentes.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      d.nombre?.toLowerCase().includes(q) ||
      d.apellidos?.toLowerCase().includes(q) ||
      d.especialidad?.toLowerCase().includes(q);
    const matchCategoria = !filterCategoria || d.categoria === filterCategoria;
    return matchSearch && matchCategoria;
  });

  return (
    <div>
      <PageHeader
        title="Docentes"
        subtitle="Gestión del equipo docente"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            Nuevo docente
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
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
            Cargando docentes...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No hay docentes"
            description={
              search || filterCategoria
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Crea el primer docente pulsando el botón "Nuevo docente".'
            }
            action={
              !search && !filterCategoria ? (
                <button className="btn-primary" onClick={openAdd}>
                  Nuevo docente
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Especialidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Tarifa asignada
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((docente) => {
                  const fullName = [docente.apellidos, docente.nombre]
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <tr
                      key={docente._id || docente.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{fullName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {docente.email ? (
                          <a
                            href={`mailto:${docente.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {docente.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {docente.especialidad || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {docente.categoria ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              CATEGORIA_COLORS[docente.categoria] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {docente.categoria}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{getTarifaLabel(docente)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(docente)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(docente)}
                            disabled={deletingId === (docente._id || docente.id)}
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
        title={editingDocente ? 'Editar docente' : 'Nuevo docente'}
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

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <input
                type="text"
                className="input-field"
                placeholder="Área de especialización"
                {...register('especialidad')}
              />
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

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select className="input-field" {...register('categoria')}>
                <option value="">Seleccionar categoría...</option>
                <option value="experto">Experto</option>
                <option value="tutor">Tutor</option>
                <option value="coordinador">Coordinador</option>
                <option value="colaborador">Colaborador</option>
              </select>
            </div>

            {/* Tarifa */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarifa asignada
              </label>
              <select className="input-field" {...register('tarifaId')}>
                <option value="">Sin tarifa asignada</option>
                {tarifas.map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.nombre}
                    {t.precio != null
                      ? ` — ${parseFloat(t.precio).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })}${t.tipo ? ' / ' + t.tipo : ''}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* CV */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">CV / Enlace</label>
              <input
                type="text"
                className="input-field"
                placeholder="URL del curriculum o referencia"
                {...register('cv')}
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
                : editingDocente
                ? 'Guardar cambios'
                : 'Crear docente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
