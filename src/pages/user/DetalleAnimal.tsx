import React,{useEffect,useState} from 'react';
import {IonButton,IonChip,IonIcon,IonLabel,IonSpinner,IonText,IonToast} from '@ionic/react';
import {heart,heartOutline} from 'ionicons/icons';
import {useParams,useNavigate} from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import {esFavorito,alternarFavorito} from '../../services/animalesService';
import type {Animal} from '../../services/animalesService';
import {detalleAnimal} from '../../services/ep2Service';
import {estaAutenticado} from '../../services/authService';

const DetalleAnimal:React.FC=()=>{
 const {id}=useParams<{id:string}>();const navigate=useNavigate();
 const [animal,setAnimal]=useState<Animal|null>(null);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const [favorito,setFavorito]=useState(()=>esFavorito(Number(id)));
 const [mensaje,setMensaje]=useState('');
 useEffect(()=>{let alive=true;setCargando(true);setError('');
  detalleAnimal(Number(id)).then(a=>{if(alive)setAnimal(a);}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Ficha no encontrada');}).finally(()=>{if(alive)setCargando(false);});
  return()=>{alive=false;};},[id]);
 const handleFavorito=()=>{
  if(!animal)return;
  if(!estaAutenticado()){navigate('/login',{state:{from:`/animales/${animal.id}`}});return;}
  const agregado=alternarFavorito(animal.id);setFavorito(agregado);
  setMensaje(agregado?`${animal.name} se agregó a tus favoritos`:`${animal.name} se quitó de tus favoritos`);
 };
 return <UsuarioLayout titulo="Ficha animal" volverA="/catalogo">
  {cargando?<div className="usuario-cargando"><IonSpinner/> Cargando ficha...</div>
  :!animal?<section className="usuario-tarjeta"><p role="alert">{error||'El animal no está disponible.'}</p><IonButton routerLink="/catalogo">Volver a explorar</IonButton></section>
  :<section className="usuario-tarjeta">
    {animal.image&&<img src={animal.image} alt={`Fotografía de ${animal.name}`} style={{width:'100%',maxHeight:360,objectFit:'cover',borderRadius:16}}/>}
    <h1>{animal.name}</h1><IonText color="medium"><p>{animal.species} · {animal.gender} · {animal.age} · {animal.size}</p></IonText>
    {animal.tags.map(tag=><IonChip key={tag} color="success"><IonLabel>{tag}</IonLabel></IonChip>)}
    <p>{animal.description}</p><h2>Refugio y ubicación</h2><p>{animal.shelter} · {animal.location} · {animal.distance}</p>
    <h2>Salud</h2><p>{animal.health}</p>
    <IonButton expand="block" color="success" routerLink={`/animales/${animal.id}/postular`}>Postular para adoptar</IonButton>
    <IonButton expand="block" fill="outline" color="dark" onClick={handleFavorito}>
      <IonIcon icon={favorito?heart:heartOutline} color="danger" slot="start"/>
      {favorito?'Quitar de favoritos':'Añadir a favoritos'}
    </IonButton>
    <IonButton expand="block" fill="outline" color="dark" routerLink={`/animales/${animal.id}/apadrinar`}>Apadrinar</IonButton>
  </section>}
  <IonToast isOpen={mensaje!==''} message={mensaje} duration={2500} onDidDismiss={()=>setMensaje('')}/>
 </UsuarioLayout>;
};
export default DetalleAnimal;
