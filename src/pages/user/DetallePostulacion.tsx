import React, { useCallback, useState } from 'react';
import { IonBadge, IonButton, IonItem, IonLabel, IonList, IonSpinner, IonText, useIonViewWillEnter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import { detallePostulacion } from '../../services/ep2Service';
import { ETIQUETA_ESTADO } from '../../services/postulacionesService';
import type { Postulacion } from '../../services/postulacionesService';

const fechaLegible = (fecha: string) => {
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? fecha : d.toLocaleString('es-CL', {dateStyle:'medium',timeStyle:'short'});
};

const DetallePostulacion: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const cargar = useCallback(async () => {
    setCargando(true); setError(''); setPostulacion(null);
    try { setPostulacion(await detallePostulacion(Number(id))); }
    catch(e){setError(e instanceof Error ? e.message : 'No se pudo consultar la postulación');}
    finally {setCargando(false);}
  },[id]);
  useIonViewWillEnter(() => { void cargar(); });
  return <UsuarioLayout titulo="Detalle de postulación" volverA="/usuario/postulaciones">
    {cargando ? <div className="usuario-cargando"><IonSpinner name="crescent" /> Cargando solicitud...</div>
    : error || !postulacion ? <section className="usuario-tarjeta"><p role="alert" className="usuario-error">{error || 'Solicitud no encontrada'}</p><IonButton onClick={() => void cargar()}>Reintentar</IonButton></section>
    : <><h1>Postulación por {postulacion.animal}</h1>
        <IonBadge color={(ETIQUETA_ESTADO[postulacion.estado] ?? {color:'medium'}).color}>
          {(ETIQUETA_ESTADO[postulacion.estado] ?? {texto:postulacion.estado}).texto}
        </IonBadge>
        <IonText color="medium"><p>{postulacion.refugio} · Enviada el {fechaLegible(postulacion.fecha)}</p></IonText>
        <section className="usuario-tarjeta"><h2>Tu motivación</h2><p style={{whiteSpace:'pre-wrap'}}>{postulacion.motivacion}</p></section>
        <h2>Seguimiento</h2>
        <IonList inset>{postulacion.historial.map((evento,index)=>
          <IonItem key={index}><IonLabel><h3>{evento.detalle}</h3><p>{fechaLegible(evento.fecha)}</p></IonLabel></IonItem>
        )}</IonList>
        <IonButton expand="block" fill="outline" color="dark" routerLink={`/animales/${postulacion.animalId}`}>Ver ficha de {postulacion.animal}</IonButton>
      </>}
    </UsuarioLayout>;
};
export default DetallePostulacion;
