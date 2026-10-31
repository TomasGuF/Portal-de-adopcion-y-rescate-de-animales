import React, {useEffect,useState} from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import { detalleAnimal } from '../../services/ep2Service';
import type { Animal } from '../../services/animalesService';

const PostulacionEnviada: React.FC = () => {
  const {id}=useParams<{id:string}>();
  const [animal,setAnimal]=useState<Animal|null>(null);
  useEffect(()=>{let mounted=true;detalleAnimal(Number(id)).then(a=>{if(mounted)setAnimal(a);}).catch(()=>{});return()=>{mounted=false;};},[id]);
  return <UsuarioLayout titulo="Postulación enviada">
    <section className="usuario-tarjeta usuario-vacio">
      <IonIcon icon={checkmarkCircleOutline} color="success" style={{fontSize:80}} />
      <h1>¡Postulación enviada!</h1>
      <IonText color="medium"><p>Tu postulación por <strong>{animal?.name ?? 'el animal'}</strong> quedó en estado <strong>Pendiente</strong>. {animal && `El refugio ${animal.shelter} la revisará.`}</p></IonText>
      <IonButton expand="block" color="success" routerLink="/usuario/postulaciones">Ver mis postulaciones</IonButton>
      <IonButton expand="block" fill="outline" color="dark" routerLink="/catalogo">Seguir explorando</IonButton>
    </section>
  </UsuarioLayout>;
};
export default PostulacionEnviada;
