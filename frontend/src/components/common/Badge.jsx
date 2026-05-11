const estadoClases = {
  borrador: 'bg-gray-100 text-gray-700',
  activa: 'bg-blue-100 text-blue-700',
  finalizada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  enviado: 'bg-yellow-100 text-yellow-700',
  enviada: 'bg-yellow-100 text-yellow-700',
  aceptado: 'bg-green-100 text-green-700',
  aceptada: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
  rechazada: 'bg-red-100 text-red-700',
  facturado: 'bg-purple-100 text-purple-700',
  inscrito: 'bg-blue-100 text-blue-700',
  preinscrito: 'bg-gray-100 text-gray-700',
  completado: 'bg-green-100 text-green-700',
  baja: 'bg-red-100 text-red-700',
  finalizado: 'bg-green-100 text-green-700'
};

export default function Badge({ estado }) {
  const cls = estadoClases[estado?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`${cls} text-xs px-2 py-0.5 rounded-full font-medium capitalize`}>
      {estado}
    </span>
  );
}
