import React from 'react';
import PersistentUserNav from './components/PersistentUserNav';
import './theme/green-deck.css';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Navigate } from 'react-router-dom';

/* Estilos de Ionic (Obligatorios) */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/padding.css';

/* Importación de tus pantallas de Auth y User */
import Home from './pages/home/home';
import Refugios from './pages/home/Refugios';
import Login from './pages/auth/Login';
import CrearCuenta from './pages/auth/CrearCuenta';
import RecuperarContrasena from './pages/auth/RecuperarContrasena';
import Explorar from './pages/user/Explorar';
import Postular from './pages/user/Postular';
import DetalleAnimal from './pages/user/DetalleAnimal';
import PostulacionEnviada from './pages/user/PostulacionEnviada';
import MisPostulaciones from './pages/user/MisPostulaciones';
import DetallePostulacion from './pages/user/DetallePostulacion';
import Alertas from './pages/user/Alertas';
import Perfil from './pages/user/Perfil';
import Favoritos from './pages/user/Favoritos';
import Apadrinar from './pages/user/Apadrinar';

/* Importación de tus pantallas de Admin */
import SolicitudesAdmin from './pages/admin/SolicitudesAdmin';
import AnimalesAdmin from './pages/admin/AnimalesAdmin';
import AgendaAdmin from './pages/admin/AgendaAdmin';
import ResumenAdmin from './pages/admin/ResumenAdmin';
import DetalleSolicitudAdmin from './pages/admin/DetalleSolicitudAdmin';
import NuevaFichaAdmin from './pages/admin/NuevaFichaAdmin';
import PerfilAdmin from './pages/admin/PerfilAdmin';

/* Importación del componente de rutas protegidas */
import { ProtectedRoute } from './routes/ProtectedRoute';

setupIonicReact();

const App: React.FC = () => (
  <IonApp className="green-deck">
    <IonReactRouter>
      <PersistentUserNav />
      <IonRouterOutlet>
        
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<CrearCuenta />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/refugios" element={<Refugios />} />
        <Route path="/catalogo" element={<Explorar />} />
        <Route path="/animales/:id" element={<DetalleAnimal />} />

        {/* Rutas protegidas, usuario */}
        <Route
          path="/animales/:id/postular"
          element={
            <ProtectedRoute allowedRole="user">
              <Postular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animales/:id/postulacion-enviada"
          element={
            <ProtectedRoute allowedRole="user">
              <PostulacionEnviada />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animales/:id/apadrinar"
          element={
            <ProtectedRoute allowedRole="user">
              <Apadrinar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario/postulaciones"
          element={
            <ProtectedRoute allowedRole="user">
              <MisPostulaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario/postulaciones/:id"
          element={
            <ProtectedRoute allowedRole="user">
              <DetallePostulacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario/alertas"
          element={
            <ProtectedRoute allowedRole="user">
              <Alertas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario/perfil"
          element={
            <ProtectedRoute allowedRole="user">
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario/favoritos"
          element={
            <ProtectedRoute allowedRole="user">
              <Favoritos />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas, admin */}
        <Route
          path="/admin/resumen"
          element={
            <ProtectedRoute allowedRole="admin">
              <ResumenAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/solicitudes"
          element={
            <ProtectedRoute allowedRole="admin">
              <SolicitudesAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/solicitudes/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <DetalleSolicitudAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/animales"
          element={
            <ProtectedRoute allowedRole="admin">
              <AnimalesAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/animales/nuevo"
          element={
            <ProtectedRoute allowedRole="admin">
              <NuevaFichaAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agenda"
          element={
            <ProtectedRoute allowedRole="admin">
              <AgendaAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/perfil"
          element={
            <ProtectedRoute allowedRole="admin">
              <PerfilAdmin />
            </ProtectedRoute>
          }
        />

        {/* Redirección por defecto si la ruta no coincide */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;