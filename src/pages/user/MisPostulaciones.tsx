import React, { useCallback, useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSpinner, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { documentTextOutline, pawOutline, arrowForwardOutline, calendarOutline, alertCircleOutline } from 'ionicons/icons';
import UsuarioLayout from '../../components/UsuarioLayout';
import { listarPostulaciones } from '../../services/ep2Service';
import { ETIQUETA_ESTADO } from '../../services/postulacionesService';
import type { Postulacion } from '../../services/postulacionesService';
import './UserDashboard.css';

const fechaLegible = (fecha?: string) => {
  if (!fecha) return 'Fecha no disponible';
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? 'Fecha no disponible' : d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MisPostulaciones: React.FC = () => {
  const router = useIonRouter();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await listarPostulaciones();
      if (!Array.isArray(datos)) {
        throw new Error('La API devolvió un formato de postulaciones inesperado.');
      }
      setPostulaciones(datos);
    } catch (e) {
      setPostulaciones([]);
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las postulaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar al montar, incluso si Ionic no emite ionViewWillEnter en esta ruta.
  useEffect(() => { void cargar(); }, [cargar]);
  // Actualizar cuando se regresa desde el detalle o se vuelve a esta pestaña.
  useIonViewWillEnter(() => { void cargar(); });

  return (
    <UsuarioLayout titulo="Mis postulaciones">
      <header className="panel-heading">
        <div>
          <h1 className="ui-section-title"><IonIcon icon={documentTextOutline} />Mis postulaciones</h1>
          <p>Consulta el estado y seguimiento de las solicitudes que enviaste.</p>
        </div>
        <IonButton fill="outline" color="dark" routerLink="/catalogo">
          <IonIcon slot="start" icon={pawOutline} />Explorar animales
        </IonButton>
      </header>
      {cargando ? (
        <div className="usuario-cargando" role="status">
          <IonSpinner name="crescent" /> Cargando tus postulaciones...
        </div>
      ) : error ? (
        <div className="panel-empty">
          <IonIcon icon={alertCircleOutline} />
          <h2>No pudimos cargar tus solicitudes</h2>
          <p role="alert">{error}</p>
          <IonButton color="success" onClick={() => void cargar()}>Reintentar</IonButton>
        </div>
      ) : postulaciones.length === 0 ? (
        <div className="panel-empty">
          <IonIcon icon={pawOutline} />
          <h2>Aún no has enviado postulaciones</h2>
          <p>Cuando solicites adoptar un animal, podrás seguir su estado aquí.</p>
          <IonButton color="success" routerLink="/catalogo">Conocer animales</IonButton>
        </div>
      ) : (
        <div className="panel-list" aria-label="Listado de mis postulaciones">
          {postulaciones.map((p) => {
            const estado = ETIQUETA_ESTADO[p.estado] ?? { texto: p.estado || 'Pendiente', color: 'medium' };
            return (
              <button
                type="button"
                key={p.id}
                className="panel-row panel-row-button"
                onClick={() => router.push(`/usuario/postulaciones/${p.id}`)}
                aria-label={`Ver postulación por ${p.animal || 'animal'}: ${estado.texto}`}
              >
                <span className="panel-icon"><IonIcon icon={pawOutline} /></span>
                <span className="panel-row-content">
                  <span className="panel-row-title">{p.animal || 'Animal sin nombre'}</span>
                  <span className="panel-row-description">{p.refugio || 'Refugio no disponible'}</span>
                  <span className="panel-row-date"><IonIcon icon={calendarOutline} />{fechaLegible(p.fecha)}</span>
                </span>
                <span className={`panel-status status-${(p.estado || 'PENDIENTE').toLowerCase()}`}>{estado.texto}</span>
                <IonIcon icon={arrowForwardOutline} className="panel-chevron" />
              </button>
            );
          })}
        </div>
      )}
    </UsuarioLayout>
  );
};

export default MisPostulaciones;
