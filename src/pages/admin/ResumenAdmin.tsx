import React,{useCallback,useState} from 'react';
import {IonGrid,IonRow,IonCol,IonCard,IonCardHeader,IonCardTitle,IonCardSubtitle,IonList,IonItem,IonLabel,IonBadge,IonText,IonSpinner,IonButton,useIonViewWillEnter} from '@ionic/react';
import AdminLayout from '../../components/AdminLayout';
import {ETIQUETA_ESTADO} from '../../services/postulacionesService';
import type {Postulacion} from '../../services/postulacionesService';
import type {Animal} from '../../services/animalesService';
import {listarPostulaciones,listarAnimalesAdmin} from '../../services/ep2Service';

const ResumenAdmin:React.FC=()=>{
 const [postulaciones,setPostulaciones]=useState<Postulacion[]>([]);
 const [animales,setAnimales]=useState<Animal[]>([]);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const cargar=useCallback(async()=>{setCargando(true);setError('');
   try {const [solicitudes,fichas]=await Promise.all([listarPostulaciones(),listarAnimalesAdmin()]);setPostulaciones(solicitudes);setAnimales(fichas);}
   catch(e){setError(e instanceof Error?e.message:'Error al consultar la API');}
   finally{setCargando(false);}
 },[]);
 useIonViewWillEnter(()=>{void cargar();});
 const pendientes=postulaciones.filter(p=>p.estado==='PENDIENTE'||p.estado==='EN_REVISION');
 const indicadores=[
  {valor:postulaciones.filter(p=>p.estado==='PENDIENTE').length,texto:'Pendientes',ruta:'/admin/solicitudes'},
  {valor:postulaciones.filter(p=>p.estado==='EN_REVISION').length,texto:'En revisión',ruta:'/admin/solicitudes'},
  {valor:postulaciones.filter(p=>p.estado==='APROBADA').length,texto:'Aprobadas',ruta:'/admin/solicitudes'},
  {valor:animales.filter(a=>a.status==='DISPONIBLE').length,texto:'Animales publicados',ruta:'/admin/animales'}
 ];
 return <AdminLayout titulo="Resumen">
  <h1>Resumen del refugio</h1><IonText color="medium"><p>Datos actualizados desde PostgreSQL.</p></IonText>
  {cargando?<p><IonSpinner/> Cargando resumen...</p>:error?<p role="alert">{error} <IonButton onClick={()=>void cargar()}>Reintentar</IonButton></p>:
  <><IonGrid><IonRow>{indicadores.map(i=><IonCol size="6" sizeMd="3" key={i.texto}>
    <IonCard button routerLink={i.ruta}><IonCardHeader><IonCardTitle>{i.valor}</IonCardTitle><IonCardSubtitle>{i.texto}</IonCardSubtitle></IonCardHeader></IonCard>
  </IonCol>)}</IonRow></IonGrid><h2>Solicitudes por revisar</h2>
  {pendientes.length===0?<p>No hay solicitudes pendientes.</p>:<IonList inset>{pendientes.map(p=><IonItem key={p.id} button detail routerLink={`/admin/solicitudes/${p.id}`}>
  <IonLabel><h2>{p.postulante}</h2><p>{p.animal} · {new Date(p.fecha).toLocaleDateString('es-CL')}</p></IonLabel>
  <IonBadge color={ETIQUETA_ESTADO[p.estado]?.color??'medium'} slot="end">{ETIQUETA_ESTADO[p.estado]?.texto??p.estado}</IonBadge>
  </IonItem>)}</IonList>}</>}
 </AdminLayout>;
};
export default ResumenAdmin;
