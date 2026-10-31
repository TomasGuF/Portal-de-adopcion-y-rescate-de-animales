import React, { useState } from 'react';
import { IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonText, IonToast } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { crearAnimal } from '../../services/ep2Service';

interface FichaForm {
  nombre: string;
  especie: string;
  sexo: string;
  edad: string;
  tamano: string;
  comuna: string;
  descripcion: string;
}

const FORM_INICIAL: FichaForm = { nombre: '', especie: '', sexo: '', edad: '', tamano: '', comuna: '', descripcion: '' };

const NuevaFichaAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FichaForm>(FORM_INICIAL);
  const [intentado, setIntentado] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error,setError] = useState('');

  const actualizar = (campo: keyof FichaForm, valor: string) => setForm({ ...form, [campo]: valor });
  const invalido = (campo: keyof FichaForm) => intentado && form[campo].trim() === '';
  const claseCampo = (campo: keyof FichaForm) => `ion-margin-bottom ${invalido(campo) ? 'ion-invalid ion-touched' : ''}`;

  const handleGuardar = async () => {
    setIntentado(true);
    const obligatorios: (keyof FichaForm)[] = ['nombre', 'especie', 'sexo', 'edad', 'tamano', 'comuna'];
    if (obligatorios.some((c) => form[c].trim() === '')) return;
    try { await crearAnimal({name:form.nombre,species:form.especie,gender:form.sexo,age:form.edad,size:form.tamano,location:form.comuna,description:form.descripcion,status:'BORRADOR'});setGuardado(true); }
    catch(e){setError(e instanceof Error ? e.message : 'No se pudo crear el animal');}
  };

  return (
    <AdminLayout titulo="Nueva ficha" volverA="/admin/animales">
      <h1>Nueva ficha de animal</h1>
      <IonText color="medium"><p>La ficha se guarda como borrador. Los campos con * son obligatorios.</p></IonText>

      <IonInput className={claseCampo('nombre')} label="Nombre *" labelPlacement="stacked" fill="outline" value={form.nombre}
        onIonInput={(e) => actualizar('nombre', e.detail.value ?? '')} errorText="Ingresa el nombre del animal" />
      <IonSelect className={claseCampo('especie')} label="Especie *" labelPlacement="stacked" fill="outline" value={form.especie}
        onIonChange={(e) => actualizar('especie', e.detail.value)} placeholder="Selecciona">
        <IonSelectOption value="PERRO">Perro</IonSelectOption>
        <IonSelectOption value="GATO">Gato</IonSelectOption>
      </IonSelect>
      <IonSelect className={claseCampo('sexo')} label="Sexo *" labelPlacement="stacked" fill="outline" value={form.sexo}
        onIonChange={(e) => actualizar('sexo', e.detail.value)} placeholder="Selecciona">
        <IonSelectOption value="MACHO">Macho</IonSelectOption>
        <IonSelectOption value="HEMBRA">Hembra</IonSelectOption>
      </IonSelect>
      <IonInput className={claseCampo('edad')} label="Edad aproximada *" labelPlacement="stacked" fill="outline" placeholder="Ej: 2 años" value={form.edad}
        onIonInput={(e) => actualizar('edad', e.detail.value ?? '')} errorText="Ingresa la edad aproximada" />
      <IonSelect className={claseCampo('tamano')} label="Tamaño *" labelPlacement="stacked" fill="outline" value={form.tamano}
        onIonChange={(e) => actualizar('tamano', e.detail.value)} placeholder="Selecciona">
        <IonSelectOption value="PEQUEÑO">Pequeño</IonSelectOption>
        <IonSelectOption value="MEDIANO">Mediano</IonSelectOption>
        <IonSelectOption value="GRANDE">Grande</IonSelectOption>
      </IonSelect>
      <IonInput className={claseCampo('comuna')} label="Comuna *" labelPlacement="stacked" fill="outline" value={form.comuna}
        onIonInput={(e) => actualizar('comuna', e.detail.value ?? '')} errorText="Ingresa la comuna" />
      <IonTextarea className="ion-margin-bottom" label="Comportamiento y compatibilidad" labelPlacement="stacked" fill="outline" autoGrow
        value={form.descripcion} onIonInput={(e) => actualizar('descripcion', e.detail.value ?? '')} />

      {intentado && Object.values(form).slice(0, 6).some((v) => v.trim() === '') && (
        <IonText color="danger"><p>Completa los campos obligatorios marcados con *.</p></IonText>
      )}

      {error && <IonText color="danger"><p>{error}</p></IonText>}
      <IonButton expand="block" color="success" onClick={handleGuardar}>Guardar borrador</IonButton>
      <IonButton expand="block" fill="outline" color="dark" routerLink="/admin/animales">Cancelar</IonButton>

      <IonToast isOpen={guardado} message={`Ficha de ${form.nombre} guardada como BORRADOR`} duration={1500}
        onDidDismiss={() => navigate('/admin/animales')} />
    </AdminLayout>
  );
};

export default NuevaFichaAdmin;
