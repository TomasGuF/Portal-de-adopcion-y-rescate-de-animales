import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { IonPage, IonContent, IonButton, IonText, IonGrid, IonRow, IonCol, IonRouterLink, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { iniciarSesion, rutaInicioPorRol } from '../../services/authService';
import './Login.css';
import './AuthFields.css'; 

const Login: React.FC = () => {
  const router = useIonRouter();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña para continuar.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido, por ejemplo nombre@correo.cl.');
      return;
    }

    setError('');

    // Definimos qué correo activa el rol de administrador
    // Guardamos la sesión y el rol detectado automáticamente en el navegador
    let roleType;
    try { roleType = await iniciarSesion(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión'); return; }

    // Redirección inteligente según el correo ingresado
    router.push(destino && roleType === 'user' ? destino : rutaInicioPorRol(roleType), 'root', 'replace');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <IonGrid className="login-grid">
          <IonRow className="login-row">
            
            <IonCol size="12" sizeMd="6" className="left-column">
              <div className="left-content">
                <div className="logo">
                  <span className="dot"></span> PatitasGo
                </div>
                
                <IonText className="hero-text">
                  <h1 className="main-title">Una historia nueva<br/>comienza con un<br/>encuentro.</h1>
                  <p className="subtitle">Adopta de forma informada y acompaña a refugios que transforman vidas.</p>
                </IonText>

                <div className="hero-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Gato adoptado" 
                    className="dog-image"
                  />
                </div>

                <div className="stats-container">
                  <div className="stat-box">
                    <h3>26</h3>
                    <p>Animales disponibles</p>
                  </div>
                  <div className="stat-box">
                    <h3>18</h3>
                    <p>Historias felices</p>
                  </div>
                  <div className="stat-box">
                    <h3>4</h3>
                    <p>Refugios activos</p>
                  </div>
                </div>
              </div>
            </IonCol>

            <IonCol size="12" sizeMd="6" className="right-column">
              <div className="form-wrapper">
                <form className="login-form" onSubmit={handleLogin}>
                  <IonText color="dark">
                    <h2 className="form-title">Bienvenido de vuelta</h2>
                    <p className="form-subtitle">Ingresa para continuar en PatitasGo.</p>
                  </IonText>

                  <div className="auth-field">
                    <label htmlFor="login-email">Correo electrónico</label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="nombre@correo.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="login-password">Contraseña</label>
                    <div className="auth-password-control">
                      <input
                        id="login-password"
                        name="password"
                        type={mostrarPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setMostrarPassword((anterior) => !anterior)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={mostrarPassword}
                      >
                        <IonIcon icon={mostrarPassword ? eyeOffOutline : eyeOutline} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="forgot-password">
                    <IonRouterLink routerLink="/recuperar">¿Olvidaste tu contraseña?</IonRouterLink>
                  </div>

                  {error && (
                    <IonText color="danger">
                      <p style={{ fontSize: '0.85rem' }}>{error}</p>
                    </IonText>
                  )}

                  {/* Único botón de ingresar limpio */}
                  <IonButton type="submit" expand="block" color="success" className="btn-ingresar">
                    Ingresar
                  </IonButton>

                  <IonButton expand="block" fill="outline" color="dark" className="btn-google" style={{ marginTop: '10px' }} disabled>
                    Continuar con Google (próximamente)
                  </IonButton>

                  <div className="ion-text-center register-link">
                    <IonButton routerLink="/registro" fill="clear" color="medium" size="small">
                      ¿Aún no tienes cuenta? Crear cuenta
                    </IonButton>
                  </div>

                  <div className="privacy-box">
                    <strong>Privacidad por diseño</strong>
                    <p>Tus datos personales solo se comparten con el refugio al enviar una postulación.</p>
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

export default Login;