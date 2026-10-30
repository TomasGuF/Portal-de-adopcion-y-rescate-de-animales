import React from 'react';
import { IonButton, IonContent, IonPage } from '@ionic/react';
import './UsuarioLayout.css';

interface UsuarioLayoutProps {
  titulo: string;
  volverA?: string;
  children: React.ReactNode;
}

/** Utiliza la misma navegación que Explorar en todas las pantallas de usuario. */
const UsuarioLayout: React.FC<UsuarioLayoutProps> = ({ titulo, volverA, children }) => {
  return (
    <IonPage className="usuario-pagina">
      <IonContent className="usuario-cuerpo">
        <main className="usuario-principal">
            <div className="usuario-interior">
              {volverA && <IonButton fill="clear" color="dark" routerLink={volverA} className="usuario-volver">← Volver</IonButton>}
              <div className="usuario-titulo-accesible">{titulo}</div>
              {children}
            </div>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default UsuarioLayout;
