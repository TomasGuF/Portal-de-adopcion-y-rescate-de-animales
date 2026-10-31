import React, {useEffect,useState} from 'react';
import {IonPage,IonContent,IonGrid,IonRow,IonCol,IonButton,IonIcon,IonCheckbox,IonText,useIonRouter} from '@ionic/react';
import {arrowBackOutline} from 'ionicons/icons';
import {useParams} from 'react-router-dom';
import {MenuLateralUsuario,BarraInferiorUsuario} from '../../components/MenuUsuario';
import {detalleAnimal,enviarPostulacion} from '../../services/ep2Service';
import type {Animal} from '../../services/animalesService';
import './Postular.css';

const Postular:React.FC=()=>{
  const router=useIonRouter();const {id}=useParams<{id:string}>();
  const [animal,setAnimal]=useState<Animal|null>(null);
  const [motivation,setMotivation]=useState('');
  const [home,setHome]=useState('');
  const [agreed,setAgreed]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  useEffect(()=>{let alive=true;detalleAnimal(Number(id)).then(a=>{if(alive)setAnimal(a);}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[id]);
  const enviar=async()=>{
    if(!animal||motivation.trim().length<10||home.trim().length<10||!agreed){setError('Completa la motivación y el tipo de hogar (mín. 10 caracteres) y acepta la declaración.');return;}
    setSending(true);setError('');
    try{await enviarPostulacion(animal.id,`${motivation.trim()}\nHogar: ${home.trim()}`);router.push(`/animales/${id}/postulacion-enviada`,'root','replace');}
    catch(e){setError(e instanceof Error?e.message:'No fue posible enviar la solicitud');}
    finally{setSending(false);}
  };
  return <IonPage><IonContent fullscreen className="explore-content"><IonGrid className="explore-grid"><IonRow className="explore-row">
    <IonCol size="12" sizeMd="3" sizeLg="2.5" className="sidebar"><MenuLateralUsuario activo="/catalogo"/></IonCol>
    <IonCol size="12" sizeMd="9" sizeLg="9.5" className="main-content"><div className="postula-container">
      <IonButton fill="clear" color="dark" onClick={()=>router.goBack()}><IonIcon icon={arrowBackOutline} slot="start"/> Volver</IonButton>
      <div className="postula-header"><span className="overline">POSTULACIÓN DE ADOPCIÓN</span><h1 className="postula-title">Postular por {animal?.name||'un animal'}</h1><p className="postula-subtitle">Tus datos de usuario se obtienen de tu cuenta; tu solicitud se registrará en PostgreSQL.</p></div>
      {loading?<p>Cargando ficha...</p>:!animal?<p>El animal no está disponible.</p>:
      <div className="form-card"><div className="form-step"><div className="form-grid">
        <div className="input-group full-width"><label htmlFor="motivacion">¿Por qué quieres adoptar a {animal.name}?</label><textarea id="motivacion" rows={5} value={motivation} onChange={e=>setMotivation(e.target.value)} placeholder="Cuéntale al refugio tu motivación" required/></div>
        <div className="input-group full-width"><label htmlFor="hogar">¿Cómo es tu hogar y la convivencia con mascotas?</label><textarea id="hogar" rows={4} value={home} onChange={e=>setHome(e.target.value)} placeholder="Describe espacio, disponibilidad y experiencia" required/></div>
        <div className="checkbox-container"><IonCheckbox checked={agreed} onIonChange={e=>setAgreed(e.detail.checked)}/><label>Declaro que esta información es verídica y cumpliré con la tenencia responsable.</label></div>
      </div>{error&&<IonText color="danger"><p role="alert">{error}</p></IonText>}
      <IonButton color="success" expand="block" disabled={sending} onClick={enviar}>{sending?'Enviando...':'Enviar postulación'}</IonButton></div></div>}
    </div></IonCol></IonRow></IonGrid></IonContent><BarraInferiorUsuario activo="/catalogo"/></IonPage>;
};
export default Postular;
