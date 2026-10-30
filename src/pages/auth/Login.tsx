import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonText, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonInputPasswordToggle, IonRouterLink, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { iniciarSesion, rutaInicioPorRol } from '../../services/authService';
import './Login.css'; 

const Login: React.FC = () => {
  const router = useIonRouter();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

                  <IonItem lines="none" className="input-item">
                    <IonLabel position="stacked">Correo electrónico</IonLabel>
                    <IonInput 
                      type="email" 
                      placeholder="tomas@ejemplo.cl" 
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                    />
                  </IonItem>

                  <IonItem lines="none" className="input-item">
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