import React from 'react';
import { IonIcon, IonFooter, useIonRouter } from '@ionic/react';
import { gridOutline, documentTextOutline, pawOutline, calendarOutline, personOutline, heartOutline } from 'ionicons/icons';
import { cerrarSesion } from '../services/authService';
import './MenuAdmin.css';

const ITEMS = [
  { ruta: '/admin/resumen', etiqueta: 'Resumen', icono: gridOutline },
  { ruta: '/admin/solicitudes', etiqueta: 'Solicitudes', icono: documentTextOutline },
  { ruta: '/admin/animales', etiqueta: 'Animales', icono: pawOutline },
  { ruta: '/admin/agenda', etiqueta: 'Agenda', icono: calendarOutline },
  { ruta: '/admin/perfil', etiqueta: 'Perfil', icono: personOutline }
];

interface MenuAdminProps {
  activo: string;
}

export const MenuLateralAdmin: React.FC<MenuAdminProps> = ({ activo }) => {
  const router = useIonRouter();

  const handleLogout = () => {
    cerrarSesion();
    router.push('/login', 'root', 'replace');
  };

  return (
    <>
      <div className="admin-sidebar-top">
        <div className="admin-logo">
          <IonIcon icon={heartOutline} style={{color:"var(--gd-primary)",fontSize:24}} /> PatitasGo
        </div>
        <span className="admin-logo-subtitle">PANEL DEL REFUGIO</span>

        <div className="admin-nav-menu">
          {ITEMS.map((item) => (
            <div key={item.ruta} className={`admin-nav-item ${activo === item.ruta ? 'active' : ''}`} onClick={() => router.push(item.ruta)} style={{ cursor: 'pointer' }}>
              <IonIcon icon={item.icono} />
              <span>{item.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-sidebar-bottom">
        <div className="refugio-info">
          <h4>Huellas Felices</h4>
          <p>Administrador</p>
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </>
  );
};

export const BarraInferiorAdmin: React.FC<MenuAdminProps> = ({ activo }) => {
  const router = useIonRouter();

  return (
    <IonFooter className="barra-inferior-admin-footer">
      <div className="admin-mobile-nav">
        {ITEMS.map((item) => (
          <div key={item.ruta} className={`admin-nav-item-mobile ${activo === item.ruta ? 'active' : ''}`} onClick={() => router.push(item.ruta)} style={{ cursor: 'pointer' }}>
            <IonIcon icon={item.icono} />
            <span>{item.etiqueta}</span>
          </div>
        ))}
      </div>
    </IonFooter>
  );
};
