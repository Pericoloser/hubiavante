import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import { tarifasAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

const TIPO_OPTIONS = [
  { value: 'hora', label: 'Hora' },
  { value: 'sesión', label: 'Sesión' },
  { value: 'día', label: 'Día' },
  { value: 'módulo', label: 'Módulo' },
  { value: 'curso', label: 'Curso' },
];

const CATEGORIA_OPTIONS = [
  { value: 'docencia', label: 'Docencia' },
  { value: 'coordinación', label: 'Coordinación' },
  { value: 'simulación', label: 'Simulación' },
  { value: 'material', label: 'Material' },
  { value: 'instalaciones', label: 'Instalaciones' },
];

const TIPO_COLORS = {
  hora: 'bg-purple-50 text-purple-700',
  'sesión': 'bg-blue-50 text-blue-700',
  'día': 'bg-indigo-50 text-indigo-700',
  'módulo': 'bg-teal-50 text-teal-700',
  curso: 'bg-green-50 text-green-700',
};

const CATEGORIA_COLORS = {
  docencia: 'bg-orange-50 text-orange-700',
  'coordinación': 'bg-yellow-50 text-yellow-700',
  'simulación': 'bg-pink-50 text-pink-700',
  material: 'bg-gray-100 text-gray-700',
  instalaciones: 'bg-cyan-50 text-cyan-700',
};

function formatPrice(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export default function TarifasList() {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarifa, setEditingTarifa] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchTarifas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tarifasAPI.getAll();
      setTarifas(res.data);
    } catch {
      toast.error('Error al cargar las tarifas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTarifas();
  }, [fetchTarifas]);

  const openAdd = () => {
    setEditingTarifa(null);
    reset({
      nombre: '',
      descripcion: '',
      precio: '',
      tipo: '',
      categoria: '',
    });
    setModalOpen(true);
  };

  const openEdit = (tarifa) => {
    setEditingTarifa(tarifa);
    reset({
      nombre: tarifa.nombre || '',
      descripcion: tarifa.descripcion || '',
      precio: tarifa.precio ?? '',
      tipo: tarifa.tipo || '',
      categoria: tarifa.categoria || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTarifa(null);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = { ...data, precio: parseFloat(data.precio) };
    try {
      setSubmitting(true);
      if (editingTarifa) {
        await tarifasAPI.update(editingTarifa._id || editingTarifa.id, payload);
        toast.success('Tarifa actualizada correctamente');
      } else {
        await tarifasAPI.create(payload);
        toast.success('Tarifa creada correctamente');
      }
      closeModal();
      fetchTarifas();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar la tarifa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tarifa) => {
    if (
      !window.confirm(
        `¿Eliminar la tarifa "${tarifa.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      setDeletingId(tarifa._id || tarifa.id);
      await tarifasAPI.remove(tarifa._id || tarifa.id);
      toast.success('Tarifa eliminada correctamente');
      fetchTarifas();
    } catch {
      toast.error('Error al eliminar la tarifa');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tarifas"
        subtitle="Catálogo de tarifas y precios"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            Nueva tarifa
          </button>
        }
      />

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Cargando tarifas...
          </div>
        ) : tarifas.length === 0 ? (
          <EmptyState
            icon={CurrencyEuroIcon}
            title="No hay tarifas"
            description='Crea la primera tarifa pulsando el botón "Nueva tarifa".'
            action={
              <button className="btn-primary" onClick={openAdd}>
                Nueva tarifa
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio (€)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tarifas.map((tarifa) => (
                  <tr
                    key={tarifa._id || tarifa.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{tarifa.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {tarifa.descripcion || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatPrice(tarifa.precio)}
                    </td>
                    <td className="px-4 py-3">
                      {tarifa.tipo ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            TIPO_COLORS[tarifa.tipo] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tarifa.tipo}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tarifa.categoria ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            CATEGORIA_COLORS[tarifa.categoria] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tarifa.categoria}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(tarifa)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tarifa)}
                          disabled={deletingId === (tarifa._id || tarifa.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTarifa ? 'Editar tarifa' : 'Nueva tarifa'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
                placeholder="Nombre de la tarifa"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                className="input-field resize-none"
                placeholder="Descripción breve..."
                {...register('descripcion')}
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`input-field ${errors.precio ? 'border-red-400' : ''}`}
                placeholder="0.00"
                {...register('precio', {
                  required: 'El precio es obligatorio',
                  min: { value: 0, message: 'El precio no puede ser negativo' },
                })}
              />
              {errors.precio && (
                <p className="text-xs text-red-500 mt-1">{errors.precio.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.tipo ? 'border-red-400' : ''}`}
                {...register('tipo', { required: 'El tipo es obligatorio' })}
              >
                <option value="">Seleccionar tipo...</option>
                {TIPO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="text-xs text-red-500 mt-1">{errors.tipo.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select className="input-field" {...register('categoria')}>
                <option value="">Seleccionar categoría...</option>
                {CATEGORIA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? 'Guardando...'
                : editingTarifa
                ? 'Guardar cambios'
                : 'Crear tarifa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
