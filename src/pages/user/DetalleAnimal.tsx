import React,{useEffect,useState} from 'react';
import {IonButton,IonIcon,IonSpinner,IonToast} from '@ionic/react';
import {heart,heartOutline,giftOutline,pawOutline,locationOutline,medkitOutline,timeOutline,resizeOutline,maleOutline,femaleOutline,informationCircleOutline} from 'ionicons/icons';
import {useParams,useNavigate} from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import {esFavorito,alternarFavorito} from '../../services/animalesService';
import type {Animal} from '../../services/animalesService';
import {detalleAnimal} from '../../services/ep2Service';
import {estaAutenticado} from '../../services/authService';
import './DetalleAnimal.css';

const DetalleAnimal:React.FC=()=>{
 const {id}=useParams<{id:string}>();const navigate=useNavigate();
 const [animal,setAnimal]=useState<Animal|null>(null);
 const [cargando,setCargando]=useState(true);
 const [error,setError]=useState('');
 const [favorito,setFavorito]=useState(()=>esFavorito(Number(id)));
 const [mensaje,setMensaje]=useState('');
 useEffect(()=>{let alive=true;setCargando(true);setError('');setAnimal(null);setFavorito(esFavorito(Number(id)));
  detalleAnimal(Number(id)).then(a=>{if(alive)setAnimal(a);}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Ficha no encontrada');}).finally(()=>{if(alive)setCargando(false);});
  return()=>{alive=false;};},[id]);
 const handleFavorito=()=>{
  if(!animal)return;
  if(!estaAutenticado()){navigate('/login',{state:{from:`/animales/${animal.id}`}});return;}
  const agregado=alternarFavorito(animal.id);setFavorito(agregado);
  setMensaje(agregado?`${animal.name} se agregó a tus favoritos`:`${animal.name} se quitó de tus favoritos`);
 };
 return <UsuarioLayout titulo="Ficha animal" volverA="/catalogo">
  {cargando?<div className="usuario-cargando" role="status"><IonSpinner/> Cargando ficha...</div>
  :!animal?<section className="usuario-tarjeta"><p role="alert">{error||'El animal no está disponible.'}</p><IonButton routerLink="/catalogo">Volver a explorar</IonButton></section>
  :<article key={animal.id} className="detalle-animal animal-card-enter">
    <div className="detalle-hero">
      {animal.image&&<img src={animal.image} alt={`Fotografía de ${animal.name}`} className="detalle-foto"/>}
      <div className="detalle-cabecera">
        <span className="status-badge"><span className="animal-status-dot"/> {animal.status==='DISPONIBLE'?'Disponible':animal.status}</span>
        <h1>{animal.name}</h1>
        <p className="detalle-intro">Conoce su historia y encuentra a tu nuevo compañero.</p>
        <ul className="animal-meta-row" aria-label="Características del animal">
          <li className="animal-meta-pill"><IonIcon icon={pawOutline}/>{animal.species}</li>
          <li className="animal-meta-pill"><IonIcon icon={animal.gender.toLowerCase()==='hembra'?femaleOutline:maleOutline}/>{animal.gender}</li>
          <li className="animal-meta-pill"><IonIcon icon={timeOutline}/>{animal.age}</li>
          <li className="animal-meta-pill"><IonIcon icon={resizeOutline}/>{animal.size}</li>
        </ul>
        {!!animal.tags?.length&&<div className="tags-container">{animal.tags.map(tag=><span className="tag" key={tag}>{tag}</span>)}</div>}
      </div>
    </div>
    <div className="detalle-informacion">
      <div className="animal-section"><h2 className="animal-section-title"><IonIcon icon={informationCircleOutline}/>Sobre {animal.name}</h2><p className="animal-section-text">{animal.description||'Sin descripción disponible.'}</p></div>
      <div className="animal-section"><h2 className="animal-section-title"><IonIcon icon={locationOutline}/>Refugio y ubicación</h2><p className="animal-section-text"><strong>{animal.shelter}</strong> · {animal.location}</p>{animal.distance&&<p className="animal-section-note">{animal.distance}</p>}</div>
      <div className="animal-section"><h2 className="animal-section-title"><IonIcon icon={medkitOutline}/>Información médica</h2><p className="animal-section-text">{animal.health||'Sin información médica por el momento.'}</p></div>
      <div className="detalle-acciones">
        <IonButton expand="block" color="success" className="btn-postular" routerLink={`/animales/${animal.id}/postular`}><IonIcon icon={pawOutline} slot="start"/>Postular para adoptar</IonButton>
        <div className="action-buttons">
          <IonButton expand="block" fill="outline" color="dark" className="btn-secondary" onClick={handleFavorito}><IonIcon icon={favorito?heart:heartOutline} slot="start"/>{favorito?'Quitar favorito':'Añadir a favoritos'}</IonButton>
          <IonButton expand="block" fill="outline" color="dark" className="btn-secondary" routerLink={`/animales/${animal.id}/apadrinar`}><IonIcon icon={giftOutline} slot="start"/>Apadrinar</IonButton>
        </div>
      </div>
    </div>
  </article>}
  <IonToast isOpen={mensaje!==''} message={mensaje} duration={2500} onDidDismiss={()=>setMensaje('')}/>
 </UsuarioLayout>;
};
export default DetalleAnimal;
