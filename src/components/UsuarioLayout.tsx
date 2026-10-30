import React from 'react';
import { IonButton, IonContent, IonPage } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { BarraInferiorUsuario, MenuLateralUsuario } from './MenuUsuario';
import './UsuarioLayout.css';

interface UsuarioLayoutProps {
  titulo: string;
  volverA?: string;
  children: React.ReactNode;
}

/** Utiliza la misma navegación que Explorar en todas las pantallas de usuario. */
const UsuarioLayout: React.FC<UsuarioLayoutProps> = ({ titulo, volverA, children }) => {
  const { pathname } = useLocation();
  const activo = pathname.startsWith('/usuario/postulaciones') ? '/usuario/postulaciones'
    : pathname.startsWith('/usuario/alertas') ? '/usuario/alertas'
    : pathname.startsWith('/usuario/perfil') || pathname.startsWith('/usuario/favoritos') ? '/usuario/perfil'
    : '/catalogo';

  return (
    <IonPage className="usuario-pagina">
      <IonContent className="usuario-cuerpo">
        <div className="usuario-estructura">
          <aside className="usuario-lateral sidebar" aria-label="Navegación de usuario">
            <MenuLateralUsuario activo={activo} />
          </aside>
          <main className="usuario-principal">
            <div className="usuario-interior">
              {volverA && <IonButton fill="clear" color="dark" routerLink={volverA} className="usuario-volver">← Volver</IonButton>}
              <div className="usuario-titulo-accesible">{titulo}</div>
              {children}
            </div>
          </main>
        </div>
      </IonContent>
      <BarraInferiorUsuario activo={activo} />
    </IonPage>
  );
};

export default UsuarioLayout;
