import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonInput, IonButton, IonIcon, IonToast, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonList, IonItem, IonSelect, IonSelectOption, useIonRouter } from '@ionic/react';
import { heart, searchOutline, optionsOutline, pawOutline, locationOutline, heartOutline, arrowForwardOutline } from 'ionicons/icons';
import { alternarFavorito } from '../../services/animalesService';
import type { Animal } from '../../services/animalesService';
import { listarAnimales } from '../../services/ep2Service';
import { estaAutenticado } from '../../services/authService';
import { MenuLateralUsuario, BarraInferiorUsuario } from '../../components/MenuUsuario';
import './Explorar.css';



const Explorar: React.FC = () => {
  const [ANIMALS_DATA,setAnimals]=useState<Animal[]>([]);
  useEffect(()=>{let active=true;listarAnimales().then(data=>{if(active)setAnimals(data);}).catch(err=>{if(active)setMensaje(err.message);});return()=>{active=false;};},[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [especie, setEspecie] = useState('TODAS');
  const [tamano, setTamano] = useState('TODOS');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const router = useIonRouter();

  const texto = busqueda.trim().toLowerCase();
  const animalesFiltrados = ANIMALS_DATA.filter((a) =>
    (texto === '' || `${a.name} ${a.species} ${a.shelter}`.toLowerCase().includes(texto)) &&
    (especie === 'TODAS' || a.species.toUpperCase().startsWith(especie)) &&
    (tamano === 'TODOS' || a.size.toUpperCase() === tamano)
  );
  const indice = animalesFiltrados.length > 0 ? currentIndex % animalesFiltrados.length : 0;

  // Animal actual y siguiente (usando operador módulo para hacer un ciclo infinito)
  const currentAnimal = animalesFiltrados[indice];
  const nextAnimal = animalesFiltrados[(indice + 1) % animalesFiltrados.length];

  const handleNextAnimal = () => {
    if(animalesFiltrados.length)setCurrentIndex((prevIndex) => (prevIndex + 1) % animalesFiltrados.length);
  };

  const limpiarFiltros = () => {
    setEspecie('TODAS');
    setTamano('TODOS');
    setBusqueda('');
  };

  const handleFavorito = () => {
    if (!estaAutenticado()) {
      router.push('/login');
      return;
    }
    const agregado = alternarFavorito(currentAnimal.id);
    setMensaje(agregado ? `${currentAnimal.name} se agregó a tus favoritos` : `${currentAnimal.name} se quitó de tus favoritos`);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="explore-content">
        <IonGrid className="explore-grid">
          <IonRow className="explore-row">
            
            {/* --- BARRA LATERAL (Desktop) --- */}
            <IonCol size="12" sizeMd="3" sizeLg="2.5" className="sidebar">
              <MenuLateralUsuario activo="/catalogo" />
            </IonCol>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <IonCol size="12" sizeMd="9" sizeLg="9.5" className="main-content">
              
              <div className="top-section">
                <div className="header-info">
                  <div>
                    <h1 className="page-title ui-section-title"><IonIcon icon={pawOutline} /> Explorar animales</h1>
                    <p className="page-subtitle">Ficha completa y una siguiente opción, sin gestos de rechazo.</p>
                  </div>
                  <div className="location-badge">
                    <IonIcon icon={pawOutline} /> {animalesFiltrados.length} animales
                  </div>
                </div>

                <div className="search-filter-container">
                  <div className="search-bar">
                    <IonIcon icon={searchOutline} className="ui-leading-icon" aria-hidden="true" /><IonInput placeholder="Buscar por nombre, especie o refugio" value={busqueda} onIonInput={(e) => { setBusqueda(e.detail.value ?? ''); setCurrentIndex(0); }} clearInput></IonInput>
                  </div>
                  <IonButton fill="outline" color="dark" className="btn-filter" onClick={() => setFiltrosAbiertos(true)}>
                    <IonIcon icon={optionsOutline} slot="start" /> Filtros
                  </IonButton>
                </div>
              </div>

              {animalesFiltrados.length === 0 ? (
                <div className="ion-text-center ion-padding">
                  <h2>No hay animales con esos criterios</h2>
                  <p className="text-muted">Prueba con otra búsqueda o limpia los filtros.</p>
                  <IonButton color="success" onClick={limpiarFiltros}>Limpiar filtros</IonButton>
                </div>
              ) : (
              <div className="cards-layout">
                
                {/* --- TARJETA PRINCIPAL DINÁMICA --- */}
                <div className="main-animal-card">
                  <img 
                    src={currentAnimal.image} 
                    alt={currentAnimal.name} 
                    className="main-animal-img"
                  />
                  <div className="main-animal-details">
                    <span className="status-badge">{currentAnimal.status}</span>
                    <h2 className="animal-name">{currentAnimal.name}</h2>
                    <p className="animal-stats">
                      {currentAnimal.species} • {currentAnimal.gender} • {currentAnimal.age} • {currentAnimal.size}
                    </p>
                    
                    <div className="tags-container">
                      {currentAnimal.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>

                    <p className="animal-desc">
                      {currentAnimal.description}
                    </p>

                    <h4 className="section-subtitle"><IonIcon icon={locationOutline} className="ui-leading-icon" /> Refugio y ubicación</h4>
                    <p className="text-muted">{currentAnimal.shelter} • {currentAnimal.location} • {currentAnimal.distance}</p>
                    
                    <p className="text-muted">{currentAnimal.health}</p>

                    <IonButton expand="block" color="success" className="btn-postular" routerLink={`/animales/${currentAnimal.id}/postular`}>
                      <IonIcon icon={pawOutline} slot="start" /> Postular para adoptar
                    </IonButton>

                    <div className="action-buttons">
                      <IonButton fill="outline" color="dark" className="btn-secondary" onClick={handleFavorito}>
                        <IonIcon icon={heartOutline} slot="start" />
                        Añadir a favoritos
                      </IonButton>
                      <IonButton fill="outline" color="dark" className="btn-secondary" routerLink={`/animales/${currentAnimal.id}/apadrinar`}>
                        <IonIcon icon={heart} slot="start" /> Apadrinar
                      </IonButton>
                    </div>
                  </div>
                </div>

                {/* --- TARJETA DE SIGUIENTE ANIMAL (Al hacer clic avanza) --- */}
                <div className="next-animal-card" onClick={handleNextAnimal} style={{ cursor: 'pointer' }}>
                  <span className="next-label">SIGUIENTE ANIMAL</span>
                  <img 
                    src={nextAnimal.image} 
                    alt={nextAnimal.name} 
                    className="next-animal-img"
                  />
                  <div className="next-animal-details">
                    <h3 className="animal-name-small">{nextAnimal.name}</h3>
                    <p className="animal-stats-small">{nextAnimal.species} • {nextAnimal.gender} • {nextAnimal.age}</p>
                    <p className="text-muted-small">{nextAnimal.shelter} • {nextAnimal.location} • {nextAnimal.distance}</p>
                    
                    <IonButton expand="block" fill="outline" color="dark" className="btn-ver-ficha" onClick={(e) => { e.stopPropagation(); router.push(`/animales/${nextAnimal.id}`); }}>
                      Ver ficha de {nextAnimal.name} <IonIcon icon={arrowForwardOutline} slot="end" />
                    </IonButton>
                  </div>
                </div>

              </div>
              )}
            </IonCol>

          </IonRow>
        </IonGrid>


        <IonModal isOpen={filtrosAbiertos} onDidDismiss={() => setFiltrosAbiertos(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Filtros</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setFiltrosAbiertos(false)}>Listo</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonSelect label="Especie" value={especie} onIonChange={(e) => { setEspecie(e.detail.value); setCurrentIndex(0); }}>
                  <IonSelectOption value="TODAS">Todas</IonSelectOption>
                  <IonSelectOption value="PERRO">Perro</IonSelectOption>
                  <IonSelectOption value="GATO">Gato</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonSelect label="Tamaño" value={tamano} onIonChange={(e) => { setTamano(e.detail.value); setCurrentIndex(0); }}>
                  <IonSelectOption value="TODOS">Todos</IonSelectOption>
                  <IonSelectOption value="PEQUEÑO">Pequeño</IonSelectOption>
                  <IonSelectOption value="MEDIANO">Mediano</IonSelectOption>
                  <IonSelectOption value="GRANDE">Grande</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonList>
            <IonButton expand="block" fill="outline" color="dark" onClick={limpiarFiltros}>Limpiar filtros</IonButton>
          </IonContent>
        </IonModal>

        <IonToast isOpen={mensaje !== ''} message={mensaje} duration={2000} onDidDismiss={() => setMensaje('')} />
      </IonContent>
      <BarraInferiorUsuario activo="/catalogo" />
    </IonPage>
  );
};

export default Explorar;