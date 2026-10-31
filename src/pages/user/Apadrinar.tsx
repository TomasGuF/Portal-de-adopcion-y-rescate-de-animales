import React, { useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonInput, IonButton, IonText, IonAlert } from '@ionic/react';
import { useParams, useNavigate } from 'react-router-dom';
import UsuarioLayout from '../../components/UsuarioLayout';
import { detalleAnimal } from '../../services/ep2Service';
import type { Animal } from '../../services/animalesService';
import { useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { giftOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import './Apadrinar.css';

const MONTO_MINIMO = 3000;

const Apadrinar: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [cargando, setCargando] = useState(true);
  useEffect(() => { let active=true; detalleAnimal(Number(id)).then(a=>{if(active)setAnimal(a);}).catch(()=>{}).finally(()=>{if(active)setCargando(false);});return ()=>{active=false;}; },[id]);
  const [frecuencia, setFrecuencia] = useState<'UNICO' | 'MENSUAL'>('MENSUAL');
  const [monto, setMonto] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  const montoNumero = Number(monto);
  const montoValido = Number.isInteger(montoNumero) && montoNumero >= MONTO_MINIMO;

  return (
    <UsuarioLayout titulo={`Apadrinar a ${animal?.name ?? ''}`} volverA={`/animales/${id}`}>
      {cargando ? <IonSpinner /> : !animal ? <p>El animal no está disponible.</p> : <section className="apadrinar-panel">
      <div className="apadrinar-heading"><span className="apadrinar-icon"><IonIcon icon={giftOutline}/></span><div><span className="apadrinar-overline">APOYA A UN ANIMAL</span><h1>Apadrinar a {animal.name}</h1></div></div>
      <IonText color="medium">
        <p>Tu aporte ayuda a cubrir alimento y atención veterinaria. Apadrinar no crea una postulación ni da prioridad de adopción.</p>
      </IonText>

      <IonSegment className="apadrinar-frecuencia" value={frecuencia} onIonChange={(e) => setFrecuencia(e.detail.value as 'UNICO' | 'MENSUAL')}>
        <IonSegmentButton value="UNICO"><IonLabel>Único</IonLabel></IonSegmentButton>
        <IonSegmentButton value="MENSUAL"><IonLabel>Mensual</IonLabel></IonSegmentButton>
      </IonSegment>

      <IonInput
        className={`ion-margin-top ${monto !== '' && !montoValido ? 'ion-invalid ion-touched' : ''}`}
        type="number"
        label="Monto (CLP)"
        labelPlacement="stacked"
        fill="outline"
        placeholder={`Mínimo $${MONTO_MINIMO.toLocaleString('es-CL')}`}
        value={monto}
        onIonInput={(e) => setMonto(e.detail.value ?? '')}
        helperText={`Monto mínimo $${MONTO_MINIMO.toLocaleString('es-CL')}`}
        errorText={`Ingresa un monto entero igual o mayor a $${MONTO_MINIMO.toLocaleString('es-CL')}`}
      />

      <p className="apadrinar-nota"><IonIcon icon={shieldCheckmarkOutline}/> El pago es demostrativo. No se realizarán cargos reales.</p>
      <IonButton className="ion-margin-top apadrinar-cta" expand="block" color="success" disabled={!montoValido} onClick={() => setConfirmar(true)}>
        Revisar aporte
      </IonButton>

      </section>}
      <IonAlert
        isOpen={confirmar}
        header="Confirmar aporte"
        message={`Aporte ${frecuencia === 'MENSUAL' ? 'mensual' : 'único'} de $${montoNumero.toLocaleString('es-CL')} para ${animal?.name}. Este es un flujo demostrativo sin cobros reales.`}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Entendido', handler: () => navigate(`/animales/${id}`) }
        ]}
        onDidDismiss={() => setConfirmar(false)}
      />
    </UsuarioLayout>
  );
};

export default Apadrinar;
