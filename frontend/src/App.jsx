import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import FichasTecnicas from './pages/FichaTecnica/FichasList';
import FichaDetalle from './pages/FichaTecnica/FichaDetalle';
import FichaForm from './pages/FichaTecnica/FichaForm';
import Presupuestos from './pages/Presupuestos/PresupuestosList';
import PresupuestoDetalle from './pages/Presupuestos/PresupuestoDetalle';
import PresupuestoForm from './pages/Presupuestos/PresupuestoForm';
import Propuestas from './pages/PropuestaComercial/PropuestasList';
import PropuestaForm from './pages/PropuestaComercial/PropuestaForm';
import PropuestaDetalle from './pages/PropuestaComercial/PropuestaDetalle';
import GuiaAlumnoPage from './pages/GuiaAlumno/GuiaAlumnoPage';
import GuiaDocentePage from './pages/GuiaDocente/GuiaDocentePage';
import SeguimientoPage from './pages/Seguimiento/SeguimientoPage';
import InformeFinalPage from './pages/InformeFinal/InformeFinalPage';
import Clientes from './pages/BBDD/Clientes/ClientesList';
import Tarifas from './pages/BBDD/Tarifas/TarifasList';
import Alumnos from './pages/BBDD/Alumnos/AlumnosList';
import Docentes from './pages/BBDD/Docentes/DocentesList';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iavante-600"></div></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="fichas" element={<FichasTecnicas />} />
      <Route path="fichas/nueva" element={<FichaForm />} />
      <Route path="fichas/:id" element={<FichaDetalle />} />
      <Route path="fichas/:id/editar" element={<FichaForm />} />
      <Route path="fichas/:id/guia-alumno" element={<GuiaAlumnoPage />} />
      <Route path="fichas/:id/guia-docente" element={<GuiaDocentePage />} />
      <Route path="fichas/:id/seguimiento" element={<SeguimientoPage />} />
      <Route path="fichas/:id/informe" element={<InformeFinalPage />} />
      <Route path="presupuestos" element={<Presupuestos />} />
      <Route path="presupuestos/nuevo" element={<PresupuestoForm />} />
      <Route path="presupuestos/:id" element={<PresupuestoDetalle />} />
      <Route path="presupuestos/:id/editar" element={<PresupuestoForm />} />
      <Route path="propuestas" element={<Propuestas />} />
      <Route path="propuestas/nueva" element={<PropuestaForm />} />
      <Route path="propuestas/:id" element={<PropuestaDetalle />} />
      <Route path="propuestas/:id/editar" element={<PropuestaForm />} />
      <Route path="bbdd/clientes" element={<Clientes />} />
      <Route path="bbdd/tarifas" element={<Tarifas />} />
      <Route path="bbdd/alumnos" element={<Alumnos />} />
      <Route path="bbdd/docentes" element={<Docentes />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
