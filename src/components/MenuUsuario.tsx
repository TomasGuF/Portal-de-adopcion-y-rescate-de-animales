import React, { useState } from 'react';
import { IonButton, IonIcon, IonFooter, IonAlert, useIonRouter } from '@ionic/react';
import { searchOutline, documentTextOutline, notificationsOutline, personOutline } from 'ionicons/icons';
import './MenuUsuario.css';

const ITEMS = [
  { ruta: '/catalogo', etiqueta: 'Explorar', icono: searchOutline },
  { ruta: '/usuario/postulaciones', etiqueta: 'Postulaciones', icono: documentTextOutline },
  { ruta: '/usuario/alertas', etiqueta: 'Alertas', icono: notificationsOutline },
  { ruta: '/usuario/perfil', etiqueta: 'Perfil', icono: personOutline }
];

interface MenuUsuarioProps {
  activo: string;
}

export const MenuLateralUsuario: React.FC<MenuUsuarioProps> = ({ activo }) => {
  const router = useIonRouter();
  const [ayuda, setAyuda] = useState(false);

  return (
    <>
      <div className="sidebar-header">
        <button type="button" className="logo usuario-logo-boton" onClick={() => router.push('/catalogo')} aria-label="PatitasGo: ir a explorar animales">
          <span className="dot"></span> PatitasGo
        </button>
        <span className="logo-subtitle">ADOPCIÓN Y RESCATE</span>
      </div>

      <div className="nav-menu">
        {ITEMS.map((item) => (
          <div key={item.ruta} className={`nav-item ${activo === item.ruta ? 'active' : ''}`} onClick={() => router.push(item.ruta)}>
            <IonIcon icon={item.icono} />
            <span>{item.etiqueta}</span>
          </div>
        ))}
      </div>

      <div className="help-box">
        <h4>¿Necesitas ayuda?</h4>
        <p>Revisa preguntas frecuentes o contacta al refugio.</p>
        <IonButton expand="block" color="light" className="btn-help" onClick={() => setAyuda(true)}>
          Centro de ayuda
        </IonButton>
      </div>

      <IonAlert
        isOpen={ayuda}
        header="Centro de ayuda"
        message="¿Cómo postulo? Entra a la ficha del animal y presiona “Postular para adoptar”. ¿Apadrinar me da prioridad? No, es un aporte independiente de la adopción. ¿Cómo sigo mi postulación? En “Postulaciones” verás su estado y en “Alertas” cada cambio. Para otras dudas escribe a contacto@patitasgo.cl."
        buttons={['Entendido']}
        onDidDismiss={() => setAyuda(false)}
      />
    </>
  );
};

export const BarraInferiorUsuario: React.FC<MenuUsuarioProps> = ({ activo }) => {
  const router = useIonRouter();

  return (
    <IonFooter className="barra-inferior-footer">
      <div className="mobile-bottom-nav">
        {ITEMS.map((item) => (
          <div key={item.ruta} className={`nav-item-mobile ${activo === item.ruta ? 'active' : ''}`} onClick={() => router.push(item.ruta)}>
            <IonIcon icon={item.icono} />
            <span>{item.etiqueta}</span>
          </div>
        ))}
      </div>
    </IonFooter>
  );
};
