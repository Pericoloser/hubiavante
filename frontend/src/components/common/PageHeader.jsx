import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PageHeader({ title, subtitle, back, actions }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {back && (
          <button onClick={() => navigate(back)} className="mt-1 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
