import React,{useCallback,useState} from 'react';
import {IonButton,IonIcon,IonSpinner,useIonViewWillEnter} from '@ionic/react';
import {notificationsOutline,documentTextOutline,checkmarkCircleOutline,alertCircleOutline,arrowForwardOutline} from 'ionicons/icons';
import {Link} from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import {listarNotificaciones} from '../../services/ep2Service';
import type {NotificacionAPI} from '../../services/ep2Service';
import {obtenerEmail} from '../../services/authService';
import './UserDashboard.css';
const titulos:Record<string,string>={PENDIENTE:'Postulación recibida',EN_REVISION:'Tu postulación está en revisión',APROBADA:'¡Postulación aprobada!',RECHAZADA:'Actualización de tu postulación'};
const fechaBonita=(date:string)=>{const d=new Date(date);return Number.isNaN(d.getTime())?date:d.toLocaleString('es-CL',{dateStyle:'medium',timeStyle:'short'});};
const claveCuenta=()=>`patitasgo.notificaciones.leidas.${obtenerEmail().toLowerCase()}`;
const obtenerLeidas=():number[]=>{try{return JSON.parse(localStorage.getItem(claveCuenta())??'[]');}catch{return [];}};
const Alertas:React.FC=()=>{
 const [alertas,setAlertas]=useState<NotificacionAPI[]>([]);
 const [leidas,setLeidas]=useState<number[]>(obtenerLeidas);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const cargar=useCallback(async()=>{setCargando(true);setError('');setLeidas(obtenerLeidas());try{setAlertas(await listarNotificaciones());}catch(e){setError(e instanceof Error?e.message:'No se pudieron cargar las notificaciones');}finally{setCargando(false);}},[]);
 useIonViewWillEnter(()=>{void cargar();});
 const marcarLeida=(id:number)=>setLeidas(anterior=>{const actual=anterior.includes(id)?anterior:[...anterior,id];localStorage.setItem(claveCuenta(),JSON.stringify(actual));return actual;});
 const marcarTodas=()=>{const ids=Array.from(new Set([...leidas,...alertas.map(a=>a.id)]));localStorage.setItem(claveCuenta(),JSON.stringify(ids));setLeidas(ids);};
 const nuevas=alertas.filter(a=>!leidas.includes(a.id)).length;
 return <UsuarioLayout titulo="Alertas"><header className="panel-heading"><div><h1 className="ui-section-title"><IonIcon icon={notificationsOutline}/>Notificaciones</h1><p>Cambios reales en las postulaciones de tu cuenta.</p></div>{nuevas>0&&<IonButton fill="clear" color="success" onClick={marcarTodas}><IonIcon icon={checkmarkCircleOutline} slot="start"/>Marcar todas como leídas</IonButton>}</header>
 {cargando?<div className="usuario-cargando"><IonSpinner name="crescent"/> Cargando alertas...</div>:error?<div className="panel-empty"><IonIcon icon={alertCircleOutline}/><h2>No pudimos cargar tus alertas</h2><p role="alert">{error}</p><IonButton onClick={()=>void cargar()}>Reintentar</IonButton></div>:alertas.length===0?<div className="panel-empty"><IonIcon icon={notificationsOutline}/><h2>Sin notificaciones por ahora</h2><p>Cuando envíes una postulación o el refugio cambie su estado, aparecerá aquí.</p><IonButton color="success" routerLink="/catalogo">Explorar animales</IonButton></div>:
 <div className="panel-list">{alertas.map(a=>{const esNueva=!leidas.includes(a.id);return <Link key={a.id} className={`panel-row alerta-row ${esNueva?'is-new':''}`} to={`/usuario/postulaciones/${a.applicationId}`} onClick={()=>marcarLeida(a.id)}><span className="panel-icon"><IonIcon icon={documentTextOutline}/></span><span className="panel-row-content"><span className="panel-row-title">{titulos[a.estado]??'Estado de tu postulación'}{esNueva&&<span className="panel-unread" aria-label="Sin leer"/>}</span><span className="panel-row-description">{a.animal} · {a.refugio}</span>{a.motivo&&<span className="panel-row-description">{a.motivo}</span>}<span className="panel-row-date">{fechaBonita(a.fecha)}</span></span><IonIcon className="panel-chevron" icon={arrowForwardOutline}/></Link>})}</div>}</UsuarioLayout>;
};
export default Alertas;