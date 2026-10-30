import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonText, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonCheckbox, IonInputPasswordToggle } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario, rutaInicioPorRol } from '../../services/authService';
import './CrearCuenta.css'; 

const REQUISITOS_PASSWORD = [
  { texto: '8 caracteres', cumple: (p: string) => p.length >= 8 },
  { texto: 'una mayúscula', cumple: (p: string) => /[A-ZÁÉÍÓÚÑ]/.test(p) },
  { texto: 'un número', cumple: (p: string) => /\d/.test(p) },
  { texto: 'un carácter especial', cumple: (p: string) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(p) }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CrearCuenta: React.FC = () => {
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState('');

  const passwordValida = REQUISITOS_PASSWORD.every((r) => r.cumple(password));
  const coinciden = confirmPassword !== '' && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !email || !password || !confirmPassword || !aceptaTerminos) {
      setError('Completa todos los campos y acepta los términos para continuar.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Ingresa un correo válido, por ejemplo nombre@correo.cl.');
      return;
    }

    if (!passwordValida) {
      setError('La contraseña no cumple todos los requisitos indicados.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');

    // Definimos el correo exclusivo de administración (puedes cambiarlo o adaptarlo)
    // El rol se decide automáticamente según el correo escrito
    // Guardamos la sesión y el rol detectado en el navegador
    let roleType;
    try { roleType = await registrarUsuario(nombre, email, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo registrar'); return; }

    // Redirección automática según el rol detectado
    navigate(rutaInicioPorRol(roleType));
  };

  return (
    <IonPage>
      <IonContent fullscreen className="register-content">
        <IonGrid className="register-grid">
          <IonRow className="register-row">
            
            <IonCol size="12" sizeMd="6" className="register-left-column">
              <div className="register-left-content">
                <div className="register-logo">
                  <span className="dot-light"></span> PatitasGo
                </div>
                
                <IonText className="register-hero-text">
                  <h1 className="register-main-title">Crea un perfil,<br/>encuentra tu match<br/>y postula con claridad.</h1>
                  <p className="register-subtitle">Un flujo simple, responsable y transparente.</p>
                </IonText>

                <div className="register-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Gatito buscando hogar" 
                    className="register-cat-image"
                  />
                </div>

                <div className="badge-adopcion">
                  ADOPCIÓN RESPONSABLE
                </div>
              </div>
            </IonCol>

            <IonCol size="12" sizeMd="6" className="register-right-column">
              <div className="register-form-wrapper">
                <form className="register-form" onSubmit={handleRegister}>
                  <IonText color="dark">
                    <h2 className="register-form-title">Crear cuenta</h2>
                    <p className="register-form-subtitle">Completa tus datos para comenzar.</p>
                  </IonText>

                  <IonItem lines="none" className="register-input-item">
                    <IonLabel position="stacked">Nombre completo</IonLabel>
                    <IonInput 
                      type="text" 
                      placeholder="Tomás Guerra" 
                      value={nombre}
                      onIonInput={(e) => setNombre(e.detail.value!)}
                    />
                  </IonItem>

                  <IonItem lines="none" className="register-input-item">
                    <IonLabel position="stacked">Correo electrónico</IonLabel>
                    <IonInput 
                      type="email" 
                      placeholder="tomas@ejemplo.cl" 
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                    />
                  </IonItem>

                  <IonItem lines="none" className="register-input-item">
                    <IonLabel position="stacked">Contraseña</IonLabel>
                    <IonInput 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                    >
                      <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                    </IonInput>
                  </IonItem>

                  <IonItem lines="none" className="register-input-item">
                    <IonLabel position="stacked">Confirmar contraseña</IonLabel>
                    <IonInput 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    >
                      <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                    </IonInput>
                  </IonItem>

                  <div className="password-hints">
                    {REQUISITOS_PASSWORD.map((r) => {
                      const cumple = r.cumple(password);
                      return (
                        <span key={r.texto} className={cumple ? 'hint-ok' : 'hint-pendiente'}>
                          {cumple ? '✓' : '✗'} {r.texto}
                        </span>
                      );
                    })}
                    {confirmPassword !== '' && (
                      <span className={coinciden ? 'hint-ok' : 'hint-pendiente'}>
                        {coinciden ? '✓ las contraseñas coinciden' : '✗ las contraseñas no coinciden'}
                      </span>
                    )}
                  </div>

                  {error && (
                    <IonText color="danger">
                      <p className="register-error">{error}</p>
                    </IonText>
                  )}

                  <IonItem lines="none" className="checkbox-item">
                    <IonCheckbox 
                      color="success" 
                      checked={aceptaTerminos}
                      onIonChange={(e) => setAceptaTerminos(e.detail.checked)}
                      justify="start"
                    >
                      Acepto términos de uso y política de privacidad.
                    </IonCheckbox>
                  </IonItem>

                  {/* Único botón de registro que evalúa el correo */}
                  <IonButton type="submit" expand="block" color="success" className="btn-crear-cuenta">
                    Crear cuenta
                  </IonButton>

                  <div className="ion-text-center login-link">
                    <IonButton routerLink="/login" fill="clear" color="medium" size="small">
                      ¿Ya tienes cuenta? Inicia sesión
                    </IonButton>
                  </div>

                  <div className="protected-data-box">
                    <strong>Datos protegidos</strong>
                    <p>Puedes actualizar o eliminar tu perfil cuando lo necesites.</p>
                  </div>
                </form>
              </div>
            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default CrearCuenta;