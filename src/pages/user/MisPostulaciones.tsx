import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { documentTextOutline, pawOutline, arrowForwardOutline, calendarOutline, alertCircleOutline } from 'ionicons/icons';
import UsuarioLayout from '../../components/UsuarioLayout';
import { listarPostulaciones } from '../../services/ep2Service';
import { ETIQUETA_ESTADO } from '../../services/postulacionesService';
import type { Postulacion } from '../../services/postulacionesService';
import './UserDashboard.css';

const fechaLegible = (fecha?: string) => {
  if (!fecha) return 'Fecha no disponible';
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? 'Fecha no disponible'
    : valor.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MisPostulaciones: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const ultimaSolicitud = useRef(0);

  const cargar = useCallback(async () => {
    // Ignoramos respuestas antiguas cuando Ionic navega rápidamente entre pantallas.
    const solicitud = ++ultimaSolicitud.current;
    setCargando(true);
    setError('');
    try {
      const resultado = await listarPostulaciones();
      if (solicitud !== ultimaSolicitud.current) return;
      if (!Array.isArray(resultado)) throw new Error('Formato inesperado en la respuesta del servidor.');
      setPostulaciones(resultado);
    } catch (err) {
      if (solicitud !== ultimaSolicitud.current) return;
      setPostulaciones([]);
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las postulaciones.');
    } finally {
      if (solicitud === ultimaSolicitud.current) setCargando(false);
    }
  }, []);

  // Una sola estrategia de carga: al ingresar o regresar a la ruta.
  // Evitamos combinar useEffect con el evento ionViewWillEnter (solicitudes duplicadas).
  useEffect(() => {
    if (location.pathname === '/usuario/postulaciones') void cargar();
    return () => { ultimaSolicitud.current += 1; };
  }, [location.pathname, location.key, cargar]);

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
        <div className="panel-list" aria-label="Mis postulaciones">
          {postulaciones.map((p) => {
            const etiqueta = ETIQUETA_ESTADO[p.estado] ?? { texto: p.estado || 'Sin estado', color: 'medium' };
            return (
              <button
                type="button"
                key={p.id}
                className="panel-row panel-row-button"
                onClick={() => navigate(`/usuario/postulaciones/${p.id}`)}
                aria-label={`Ver postulación por ${p.animal || 'animal'}: ${etiqueta.texto}`}
              >
                <span className="panel-icon"><IonIcon icon={pawOutline} /></span>
                <span className="panel-row-content">
                  <span className="panel-row-title">{p.animal || 'Animal sin nombre'}</span>
                  <span className="panel-row-description">{p.refugio || 'Refugio no disponible'}</span>
                  <span className="panel-row-date"><IonIcon icon={calendarOutline} />{fechaLegible(p.fecha)}</span>
                </span>
                <span className={`panel-status status-${(p.estado || 'PENDIENTE').toLowerCase()}`}>{etiqueta.texto}</span>
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
