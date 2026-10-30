import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { IonPage, IonContent, IonButton, IonText, IonItem, IonGrid, IonRow, IonCol, IonCheckbox } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario, rutaInicioPorRol } from '../../services/authService';
import './CrearCuenta.css';
import './AuthFields.css'; 

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
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

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

                  <div className="auth-field">
                    <label htmlFor="register-name">Nombre completo</label>
                    
                    <input id="register-name" name="register-name" type={'text'} autoComplete="name" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    
                  </div>
                  <div className="auth-field">
                    <label htmlFor="register-email">Correo electrónico</label>
                    
                    <input id="register-email" name="register-email" type={'email'} autoComplete="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    
                  </div>
                  <div className="auth-field">
                    <label htmlFor="register-password">Contraseña</label>
                    <div className="auth-password-control">
                    <input id="register-password" name="register-password" type={mostrarPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button className="auth-password-toggle" type="button" onClick={() => setMostrarPassword(v => !v)} aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarPassword}><IonIcon icon={mostrarPassword ? eyeOffOutline : eyeOutline} aria-hidden="true" /></button>
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="register-confirm">Confirmar contraseña</label>
                    <div className="auth-password-control">
                    <input id="register-confirm" name="register-confirm" type={mostrarConfirmacion ? 'text' : 'password'} autoComplete="new-password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button className="auth-password-toggle" type="button" onClick={() => setMostrarConfirmacion(v => !v)} aria-label={mostrarConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarConfirmacion}><IonIcon icon={mostrarConfirmacion ? eyeOffOutline : eyeOutline} aria-hidden="true" /></button>
                    </div>
                  </div>
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