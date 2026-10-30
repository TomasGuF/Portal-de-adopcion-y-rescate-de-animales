import React, { useCallback, useState } from 'react';
import { IonBadge, IonButton, IonIcon, IonItem, IonLabel, IonList, IonSpinner, IonText, useIonViewWillEnter } from '@ionic/react';
import { documentTextOutline, pawOutline } from 'ionicons/icons';
import UsuarioLayout from '../../components/UsuarioLayout';
import { listarPostulaciones } from '../../services/ep2Service';
import { ETIQUETA_ESTADO } from '../../services/postulacionesService';
import type { Postulacion } from '../../services/postulacionesService';

const fechaLegible = (fecha: string) => {
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MisPostulaciones: React.FC = () => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try { setPostulaciones(await listarPostulaciones()); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos cargar tus postulaciones'); }
    finally { setCargando(false); }
  }, []);
  useIonViewWillEnter(() => { void cargar(); });
  return (
    <UsuarioLayout titulo="Mis postulaciones">
      <h1 className="ui-section-title"><IonIcon icon={documentTextOutline} /> Mis postulaciones</h1>
      <IonText color="medium"><p>Consulta únicamente las solicitudes que has enviado desde tu cuenta.</p></IonText>
      {cargando ? <div className="usuario-cargando"><IonSpinner name="crescent" /> Cargando tus postulaciones...</div>
      : error ? <div className="usuario-tarjeta"><p role="alert" className="usuario-error">{error}</p><IonButton onClick={() => void cargar()}>Reintentar</IonButton></div>
      : postulaciones.length === 0 ? <section className="usuario-tarjeta usuario-vacio">
          <IonIcon icon={documentTextOutline} color="success" style={{fontSize: 40}} />
          <h2><IonIcon icon={pawOutline} className="ui-leading-icon" /> Aún no has enviado postulaciones</h2>
          <p>Cuando postules por un animal, aparecerá aquí su estado y seguimiento.</p>
          <IonButton color="success" routerLink="/catalogo">Explorar animales</IonButton>
        </section>
      : <IonList inset>
          {postulaciones.map(p => {
            const etiqueta = ETIQUETA_ESTADO[p.estado] ?? {texto:p.estado,color:'medium'};
            return <IonItem key={p.id} button detail routerLink={`/usuario/postulaciones/${p.id}`}>
              <IonLabel><h2>{p.animal}</h2><p>{p.refugio} · Enviada el {fechaLegible(p.fecha)}</p></IonLabel>
              <IonBadge color={etiqueta.color} slot="end">{etiqueta.texto}</IonBadge>
            </IonItem>;
          })}
        </IonList>}
    </UsuarioLayout>
  );
};
export default MisPostulaciones;
