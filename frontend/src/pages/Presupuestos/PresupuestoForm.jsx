import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { presupuestosAPI, clientesAPI, fichasAPI, tarifasAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const fmtEUR = (n) => Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export default function PresupuestoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  const { register, handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: { clienteId: '', fichaId: '', concepto: '', iva: 21, descuento: 0, notas: '', estado: 'borrador', lineas: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lineas' });
  const lineas = watch('lineas');
  const iva = watch('iva');
  const descuento = watch('descuento');

  const subtotal = lineas.reduce((s, l) => s + (Number(l.cantidad || 0) * Number(l.precioUnitario || 0) * (1 - Number(l.descuento || 0) / 100)), 0);
  const base = subtotal * (1 - Number(descuento || 0) / 100);
  const total = base * (1 + Number(iva || 0) / 100);

  useEffect(() => {
    clientesAPI.getAll({ activo: true }).then(r => setClientes(r.data));
    fichasAPI.getAll().then(r => setFichas(r.data));
    tarifasAPI.getAll().then(r => setTarifas(r.data));
    if (isEdit) {
      presupuestosAPI.getById(id).then(r => {
        const p = r.data;
        reset({ ...p, lineas: p.lineas || [] });
      });
    }
  }, [id]);

  const onTarifaSelect = (idx, tarifaId) => {
    const t = tarifas.find(t => t.id === Number(tarifaId));
    if (t) {
      setValue(`lineas.${idx}.descripcion`, t.nombre);
      setValue(`lineas.${idx}.precioUnitario`, t.precio);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, lineas: lineas.map(l => ({ ...l, total: Number(l.cantidad) * Number(l.precioUnitario) * (1 - Number(l.descuento || 0) / 100) })) };
      if (isEdit) {
        await presupuestosAPI.update(id, payload);
        toast.success('Presupuesto actualizado');
        navigate(`/presupuestos/${id}`);
      } else {
        const r = await presupuestosAPI.create(payload);
        toast.success('Presupuesto creado');
        navigate(`/presupuestos/${r.data.id}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} back="/presupuestos" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-gray-900 pb-2 border-b">Datos del presupuesto</h2>
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
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
            <input {...register('concepto', { required: true })} className="input-field" placeholder="Descripción general del presupuesto..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select {...register('estado')} className="input-field">
              {['borrador', 'enviado', 'aceptado', 'rechazado', 'facturado'].map(e => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Validez (días)</label>
            <input type="number" {...register('validezDias')} className="input-field" defaultValue={30} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
            <input type="number" step="0.1" {...register('iva')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descuento general (%)</label>
            <input type="number" step="0.1" {...register('descuento')} className="input-field" />
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea rows={2} {...register('notas')} className="input-field resize-none" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Líneas del presupuesto</h2>
            <button type="button" onClick={() => append({ descripcion: '', cantidad: 1, precioUnitario: 0, descuento: 0, tarifaId: '' })}
              className="btn-secondary flex items-center gap-1.5 text-xs">
              <PlusIcon className="h-3.5 w-3.5" /> Añadir línea
            </button>
          </div>

          {fields.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Sin líneas. Añade conceptos al presupuesto.</p>}

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Tarifa</label>
                  <select className="input-field text-xs" onChange={e => onTarifaSelect(idx, e.target.value)}>
                    <option value="">Libre</option>
                    {tarifas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="col-span-4">
                  <label className="text-xs text-gray-500 mb-1 block">Descripción *</label>
                  <input {...register(`lineas.${idx}.descripcion`)} className="input-field text-xs" placeholder="Concepto..." />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Cantidad</label>
                  <input type="number" step="0.5" {...register(`lineas.${idx}.cantidad`)} className="input-field text-xs" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Precio unit. (€)</label>
                  <input type="number" step="0.01" {...register(`lineas.${idx}.precioUnitario`)} className="input-field text-xs" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs text-gray-500 mb-1 block">Dto. %</label>
                  <input type="number" step="0.1" {...register(`lineas.${idx}.descuento`)} className="input-field text-xs" />
                </div>
                <div className="col-span-1 flex items-end justify-end pb-0.5">
                  <button type="button" onClick={() => remove(idx)} className="p-2 text-red-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {fields.length > 0 && (
            <div className="mt-4 pt-4 border-t flex justify-end">
              <div className="text-sm space-y-1 text-right">
                <div className="flex gap-8 text-gray-600"><span>Subtotal</span><span className="font-medium">{fmtEUR(subtotal)}</span></div>
                <div className="flex gap-8 text-gray-600"><span>Dto. general ({descuento}%)</span><span className="font-medium text-red-600">-{fmtEUR(subtotal * Number(descuento || 0) / 100)}</span></div>
                <div className="flex gap-8 text-gray-600"><span>IVA ({iva}%)</span><span className="font-medium">{fmtEUR(base * Number(iva || 0) / 100)}</span></div>
                <div className="flex gap-8 text-gray-900 font-bold text-base border-t pt-1"><span>TOTAL</span><span>{fmtEUR(total)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(isEdit ? `/presupuestos/${id}` : '/presupuestos')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Presupuesto'}
          </button>
        </div>
      </form>
    </div>
  );
}
