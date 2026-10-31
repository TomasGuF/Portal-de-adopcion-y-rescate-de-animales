import React,{useCallback,useState} from 'react';
import {IonBadge,IonList,IonItem,IonLabel,IonText,IonButton,IonAlert,IonToast,IonSpinner,useIonViewWillEnter} from '@ionic/react';
import {useParams} from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {detallePostulacion,cambiarEstadoPostulacion} from '../../services/ep2Service';
import {ETIQUETA_ESTADO} from '../../services/postulacionesService';
import type {EstadoPostulacion,Postulacion} from '../../services/postulacionesService';

const TRANSICIONES:Record<EstadoPostulacion,EstadoPostulacion[]>={
 PENDIENTE:['EN_REVISION','RECHAZADA'],EN_REVISION:['APROBADA','RECHAZADA'],APROBADA:[],RECHAZADA:[]
};
const DetalleSolicitudAdmin:React.FC=()=>{
 const {id}=useParams<{id:string}>();
 const [postulacion,setPostulacion]=useState<Postulacion|null>(null);
 const [destino,setDestino]=useState<EstadoPostulacion|null>(null);
 const [mensaje,setMensaje]=useState('');
 const [error,setError]=useState('');
 const [cargando,setCargando]=useState(true);
 const cargar=useCallback(async()=>{setCargando(true);setError('');try{setPostulacion(await detallePostulacion(Number(id)));}
 catch(e){setError(e instanceof Error?e.message:'No se pudo consultar la solicitud');}finally{setCargando(false);}},[id]);
 useIonViewWillEnter(()=>{void cargar();});
 const aplicarTransicion=async(motivo?:string)=>{
  if(!destino)return false;
  if(destino==='RECHAZADA'&&!motivo?.trim()){setMensaje('Ingresa un motivo para rechazar');return false;}
  try{await cambiarEstadoPostulacion(Number(id),destino,motivo??'');setDestino(null);setMensaje('Estado actualizado en PostgreSQL');await cargar();return true;}
  catch(e){setMensaje(e instanceof Error?e.message:'No se pudo actualizar');return false;}
 };
 return <AdminLayout titulo="Solicitud" volverA="/admin/solicitudes">
  {cargando?<p><IonSpinner/> Cargando solicitud...</p>:error||!postulacion?<p role="alert">{error||'Solicitud no encontrada'} <IonButton onClick={()=>void cargar()}>Reintentar</IonButton></p>:
  <><h1>{postulacion.postulante}</h1><IonBadge color={ETIQUETA_ESTADO[postulacion.estado]?.color??'medium'}>{ETIQUETA_ESTADO[postulacion.estado]?.texto??postulacion.estado}</IonBadge>
  <IonList inset>
    <IonItem><IonLabel><p>Animal</p><h3>{postulacion.animal}</h3></IonLabel></IonItem>
    <IonItem><IonLabel><p>Fecha de envío</p><h3>{new Date(postulacion.fecha).toLocaleDateString('es-CL')}</h3></IonLabel></IonItem>
    <IonItem><IonLabel className="ion-text-wrap"><p>Motivación</p><h3 style={{whiteSpace:'pre-wrap'}}>{postulacion.motivacion}</h3></IonLabel></IonItem>
  </IonList>
  {TRANSICIONES[postulacion.estado].length===0?<IonText color="medium"><p>Esta solicitud está cerrada.</p></IonText>:
    TRANSICIONES[postulacion.estado].map(s=><IonButton key={s} expand="block" color={s==='RECHAZADA'?'danger':'success'}
    fill={s==='RECHAZADA'?'outline':'solid'} onClick={()=>setDestino(s)}>{s==='RECHAZADA'?'Rechazar':`Pasar a "${ETIQUETA_ESTADO[s].texto}"`}</IonButton>)}
  <h2>Historial</h2><IonList inset>{postulacion.historial.map((h,i)=><IonItem key={i}><IonLabel><h3>{h.detalle}</h3><p>{new Date(h.fecha).toLocaleString('es-CL')}</p></IonLabel></IonItem>)}</IonList>
  <IonAlert isOpen={destino!==null} header="Confirmar cambio de estado"
    message={destino?`La solicitud pasará a "${ETIQUETA_ESTADO[destino].texto}".`:''}
    inputs={destino==='RECHAZADA'?[{name:'motivo',type:'textarea',placeholder:'Motivo de rechazo (obligatorio)'}]:[]}
    buttons={[{text:'Cancelar',role:'cancel'},{text:'Confirmar',handler:(data)=>{void aplicarTransicion(data?.motivo);}}]}
    onDidDismiss={()=>setDestino(null)} /></>}
  <IonToast isOpen={mensaje!==''} message={mensaje} duration={3000} onDidDismiss={()=>setMensaje('')}/>
 </AdminLayout>;
};
export default DetalleSolicitudAdmin;
