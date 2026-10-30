import React, {useCallback,useState} from 'react';
import {IonButton,IonIcon,IonSpinner,useIonViewWillEnter} from '@ionic/react';
import {heartOutline,pawOutline} from 'ionicons/icons';
import UsuarioLayout from '../../components/UsuarioLayout';
import AnimalCard from '../../components/AnimalCard';
import {obtenerFavoritos} from '../../services/animalesService';
import type {Animal} from '../../services/animalesService';
import {listarAnimales} from '../../services/ep2Service';

const Favoritos: React.FC = () => {
 const [animales,setAnimales]=useState<Animal[]>([]);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const cargar=useCallback(async()=>{setCargando(true);setError('');
   try{const favoritos=obtenerFavoritos();const datos=await listarAnimales();setAnimales(datos.filter(a=>favoritos.includes(a.id)));}
   catch(e){setError(e instanceof Error?e.message:'No pudimos cargar tus favoritos');}
   finally{setCargando(false);}
 },[]);
 useIonViewWillEnter(()=>{void cargar();});
 return <UsuarioLayout titulo="Mis favoritos" volverA="/usuario/perfil">
  <h1 className="ui-section-title"><IonIcon icon={heartOutline}/>Mis favoritos</h1>
  {cargando?<p><IonSpinner/> Cargando favoritos...</p>:error?<section className="usuario-tarjeta"><p role="alert">{error}</p><IonButton onClick={()=>void cargar()}>Reintentar</IonButton></section>:
  animales.length===0?<section className="usuario-tarjeta usuario-vacio"><IonIcon icon={pawOutline} color="success" style={{fontSize:36}}/><h2>Aún no guardas animales</h2><p>Agrega animales a favoritos mientras exploras para encontrarlos aquí.</p><IonButton routerLink="/catalogo" color="success">Explorar animales</IonButton></section>:
  <div className="favoritos-lista">{animales.map(a=><AnimalCard key={a.id} animal={a}/>)}</div>}
 </UsuarioLayout>;
};
export default Favoritos;