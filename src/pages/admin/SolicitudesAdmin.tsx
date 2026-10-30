import React,{useCallback,useMemo,useState} from 'react';
import {IonBadge,IonButton,IonItem,IonLabel,IonList,IonSpinner,IonText,useIonViewWillEnter} from '@ionic/react';
import AdminLayout from '../../components/AdminLayout';
import {listarPostulaciones} from '../../services/ep2Service';
import {ETIQUETA_ESTADO} from '../../services/postulacionesService';
import type {EstadoPostulacion,Postulacion} from '../../services/postulacionesService';

const SolicitudesAdmin:React.FC=()=>{
 const [solicitudes,setSolicitudes]=useState<Postulacion[]>([]);
 const [busqueda,setBusqueda]=useState('');
 const [estado,setEstado]=useState<'TODOS'|EstadoPostulacion>('TODOS');
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const cargar=useCallback(async()=>{setCargando(true);setError('');
  try{setSolicitudes(await listarPostulaciones());}
  catch(e){setError(e instanceof Error?e.message:'Error al consultar postulaciones');}
  finally{setCargando(false);}
 },[]);
 useIonViewWillEnter(()=>{void cargar();});
 const filtradas=useMemo(()=>solicitudes.filter(s=>
   (estado==='TODOS'||s.estado===estado)&&
   (busqueda.trim()===''||`${s.postulante} ${s.animal}`.toLowerCase().includes(busqueda.trim().toLowerCase()))
 ),[solicitudes,estado,busqueda]);
 const estados:('TODOS'|EstadoPostulacion)[]=['TODOS','PENDIENTE','EN_REVISION','APROBADA','RECHAZADA'];
 return <AdminLayout titulo="Solicitudes">
  <h1>Gestión de solicitudes</h1><IonText color="medium"><p>Revisa las postulaciones registradas en PostgreSQL y sus estados reales.</p></IonText>
  <section className="usuario-tarjeta" aria-label="Filtros de solicitudes">
   <label htmlFor="filtrar-solicitud">Buscar persona o animal</label>
   <input id="filtrar-solicitud" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
    placeholder="Nombre o animal" style={{display:'block',width:'100%',padding:12,margin:'10px 0',border:'1px solid #ddd',borderRadius:8}}/>
   <label htmlFor="estado-solicitud">Estado </label>
   <select id="estado-solicitud" value={estado} onChange={e=>setEstado(e.target.value as 'TODOS'|EstadoPostulacion)}
     style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}>
     {estados.map(e=><option key={e} value={e}>{e==='TODOS'?'Todos':ETIQUETA_ESTADO[e].texto}</option>)}
   </select>
   <IonButton fill="clear" onClick={()=>void cargar()}>Actualizar</IonButton>
  </section>
  {cargando?<p><IonSpinner/> Cargando solicitudes...</p>
   :error?<section className="usuario-tarjeta"><p role="alert">{error}</p><IonButton onClick={()=>void cargar()}>Reintentar</IonButton></section>
   :filtradas.length===0?<section className="usuario-tarjeta usuario-vacio"><h2>No hay solicitudes</h2><p>Aparecerán aquí cuando los usuarios envíen postulaciones.</p></section>
   :<IonList inset>{filtradas.map(p=><IonItem key={p.id} button detail routerLink={`/admin/solicitudes/${p.id}`}>
    <IonLabel><h2>{p.postulante}</h2><p>{p.animal} · {new Date(p.fecha).toLocaleDateString('es-CL')}</p></IonLabel>
    <IonBadge color={ETIQUETA_ESTADO[p.estado]?.color??'medium'} slot="end">{ETIQUETA_ESTADO[p.estado]?.texto??p.estado}</IonBadge>
   </IonItem>)}</IonList>}
 </AdminLayout>;
};
export default SolicitudesAdmin;
