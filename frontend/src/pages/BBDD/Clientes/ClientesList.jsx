import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { clientesAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

const TIPO_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clínica', label: 'Clínica' },
  { value: 'universidad', label: 'Universidad' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'administración', label: 'Administración' },
];

const TIPO_LABELS = {
  hospital: 'Hospital',
  'clínica': 'Clínica',
  universidad: 'Universidad',
  empresa: 'Empresa',
  'administración': 'Administración',
};

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clientesAPI.getAll();
      setClientes(res.data);
    } catch {
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const openAdd = () => {
    setEditingCliente(null);
    reset({
      nombre: '',
      cif: '',
      tipo: '',
      contacto: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      observaciones: '',
    });
    setModalOpen(true);
  };

  const openEdit = (cliente) => {
    setEditingCliente(cliente);
    reset({
      nombre: cliente.nombre || '',
      cif: cliente.cif || '',
      tipo: cliente.tipo || '',
      contacto: cliente.contacto || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      provincia: cliente.provincia || '',
      codigoPostal: cliente.codigoPostal || '',
      observaciones: cliente.observaciones || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCliente(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingCliente) {
        await clientesAPI.update(editingCliente._id || editingCliente.id, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientesAPI.create(data);
        toast.success('Cliente creado correctamente');
      }
      closeModal();
      fetchClientes();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Error al guardar el cliente'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cliente) => {
    if (
      !window.confirm(
        `¿Eliminar el cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      setDeletingId(cliente._id || cliente.id);
      await clientesAPI.remove(cliente._id || cliente.id);
      toast.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch {
      toast.error('Error al eliminar el cliente');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.nombre?.toLowerCase().includes(q) ||
      c.cif?.toLowerCase().includes(q);
    const matchTipo = !filterTipo || c.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gestión de clientes del centro"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            Nuevo cliente
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o CIF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="input-field sm:w-52"
        >
          {TIPO_OPTIONS.map((o) => (
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
            Cargando clientes...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BuildingOffice2Icon}
            title="No hay clientes"
            description={
              search || filterTipo
                ? 'No se encontraron resultados con los filtros aplicados.'
                : 'Crea el primer cliente pulsando el botón "Nuevo cliente".'
            }
            action={
              !search && !filterTipo ? (
                <button className="btn-primary" onClick={openAdd}>
                  Nuevo cliente
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CIF</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cliente) => (
                  <tr
                    key={cliente._id || cliente.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cliente.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cliente.cif || '—'}</td>
                    <td className="px-4 py-3">
                      {cliente.tipo ? (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium capitalize">
                          {TIPO_LABELS[cliente.tipo] || cliente.tipo}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cliente.contacto || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {cliente.email ? (
                        <a
                          href={`mailto:${cliente.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {cliente.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cliente.telefono || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.ciudad || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cliente)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente)}
                          disabled={deletingId === (cliente._id || cliente.id)}
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
        title={editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
                placeholder="Nombre del cliente"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* CIF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CIF</label>
              <input
                type="text"
                className="input-field"
                placeholder="B12345678"
                {...register('cif')}
              />
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
                <option value="hospital">Hospital</option>
                <option value="clínica">Clínica</option>
                <option value="universidad">Universidad</option>
                <option value="empresa">Empresa</option>
                <option value="administración">Administración</option>
              </select>
              {errors.tipo && (
                <p className="text-xs text-red-500 mt-1">{errors.tipo.message}</p>
              )}
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona de contacto
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Nombre del contacto"
                {...register('contacto')}
              />
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

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                className="input-field"
                placeholder="Calle, número..."
                {...register('direccion')}
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ciudad"
                {...register('ciudad')}
              />
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input
                type="text"
                className="input-field"
                placeholder="Provincia"
                {...register('provincia')}
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código postal
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="28001"
                {...register('codigoPostal')}
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
                : editingCliente
                ? 'Guardar cambios'
                : 'Crear cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
