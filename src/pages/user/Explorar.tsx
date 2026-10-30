import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton, IonIcon,
  IonToast, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonList, IonItem, IonSelect, IonSelectOption, IonSpinner, useIonRouter
} from '@ionic/react';
import {
  heart, heartOutline, searchOutline, optionsOutline, pawOutline,
  locationOutline, arrowForwardOutline, giftOutline,
  timeOutline, resizeOutline, maleOutline, femaleOutline,
  medkitOutline, informationCircleOutline, refreshOutline
} from 'ionicons/icons';
import { alternarFavorito, esFavorito } from '../../services/animalesService';
import type { Animal } from '../../services/animalesService';
import { listarAnimales } from '../../services/ep2Service';
import { estaAutenticado } from '../../services/authService';
import './Explorar.css';

const Explorar: React.FC = () => {
  const router = useIonRouter();
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescar, setRefrescar] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favoritoActual, setFavoritoActual] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [especie, setEspecie] = useState('TODAS');
  const [tamano, setTamano] = useState('TODOS');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    listarAnimales()
      .then((datos) => { if (activo) setAnimales(datos); })
      .catch((err) => { if (activo) setError(err instanceof Error ? err.message : 'No pudimos cargar los animales'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [refrescar]);

  const texto = busqueda.trim().toLowerCase();
  const animalesFiltrados = animales.filter((a) =>
    (texto === '' || `${a.name} ${a.species} ${a.shelter}`.toLowerCase().includes(texto)) &&
    (especie === 'TODAS' || a.species.toUpperCase().startsWith(especie)) &&
    (tamano === 'TODOS' || a.size.toUpperCase() === tamano)
  );
  const indice = animalesFiltrados.length > 0 ? currentIndex % animalesFiltrados.length : 0;
  const animalActual = animalesFiltrados[indice];
  const siguienteAnimal = animalesFiltrados.length > 1
    ? animalesFiltrados[(indice + 1) % animalesFiltrados.length]
    : null;
  // Mantener el estado del corazón alineado con el animal que se está mostrando.
  useEffect(() => {
    setFavoritoActual(animalActual ? esFavorito(animalActual.id) : false);
  }, [animalActual?.id]);

  const siguiente = () => {
    if (animalesFiltrados.length > 1) setCurrentIndex(i => (i + 1) % animalesFiltrados.length);
  };
  const limpiarFiltros = () => {
    setEspecie('TODAS');
    setTamano('TODOS');
    setBusqueda('');
    setCurrentIndex(0);
  };
  const handleFavorito = () => {
    if (!animalActual) return;
    if (!estaAutenticado()) { router.push('/login'); return; }
    const agregado = alternarFavorito(animalActual.id);
    setFavoritoActual(agregado);
    setMensaje(agregado ? `${animalActual.name} se agregó a tus favoritos` : `${animalActual.name} se quitó de tus favoritos`);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="explore-content">
        <main className="main-content explore-main">
              <header className="top-section">
                <div className="header-info">
                  <div>
                    <h1 className="page-title ui-section-title"><IonIcon icon={pawOutline} aria-hidden="true" />Explorar animales</h1>
                    <p className="page-subtitle">Conoce a los animales disponibles para adoptar.</p>
                  </div>
                  <div className="location-badge"><IonIcon icon={pawOutline} aria-hidden="true" /> {animalesFiltrados.length} animales</div>
                </div>
                <div className="search-filter-container">
                  <div className="search-bar">
                    <IonIcon icon={searchOutline} className="ui-leading-icon" aria-hidden="true" />
                    <IonInput
                      aria-label="Buscar animales"
                      placeholder="Buscar por nombre, especie o refugio"
                      value={busqueda}
                      onIonInput={e => { setBusqueda(e.detail.value ?? ''); setCurrentIndex(0); }}
                      clearInput
                    />
                  </div>
                  <IonButton fill="outline" color="dark" className="btn-filter" onClick={() => setFiltrosAbiertos(true)}>
                    <IonIcon icon={optionsOutline} slot="start" />Filtros
                  </IonButton>
                </div>
              </header>

              {cargando ? (
                <div className="explore-feedback" role="status"><IonSpinner name="crescent" /><p>Cargando animales...</p></div>
              ) : error ? (
                <div className="explore-feedback" role="alert">
                  <IonIcon icon={informationCircleOutline} />
                  <h2>No pudimos mostrar los animales</h2><p>{error}</p>
                  <IonButton color="success" onClick={() => setRefrescar(v => v + 1)}>
                    <IonIcon icon={refreshOutline} slot="start" />Reintentar
                  </IonButton>
                </div>
              ) : animalesFiltrados.length === 0 ? (
                <div className="explore-feedback">
                  <IonIcon icon={searchOutline} />
                  <h2>No encontramos animales con esos criterios</h2>
                  <p>Prueba otra búsqueda o ajusta los filtros.</p>
                  <IonButton color="success" onClick={limpiarFiltros}>Limpiar filtros</IonButton>
                </div>
              ) : (
                <section className="cards-layout" aria-label="Animales disponibles">
                  {/* La key anima una ficha completa al avanzar, evitando contenido visual obsoleto. */}
                  <article key={animalActual.id} className="main-animal-card animal-card-enter">
                    <img
                      src={animalActual.image}
                      alt={`Fotografía de ${animalActual.name}`}
                      className="main-animal-img"
                    />
                    <div className="main-animal-details">
                      <span className="status-badge"><span className="animal-status-dot" />{animalActual.status === 'DISPONIBLE' ? 'Disponible' : animalActual.status}</span>
                      <h2 className="animal-name">{animalActual.name}</h2>
                      <ul className="animal-meta-row" aria-label={`Características de ${animalActual.name}`}>
                        <li className="animal-meta-pill"><IonIcon icon={pawOutline} aria-hidden="true" />{animalActual.species}</li>
                        <li className="animal-meta-pill"><IonIcon icon={animalActual.gender.toLowerCase() === 'hembra' ? femaleOutline : maleOutline} aria-hidden="true" />{animalActual.gender}</li>
                        <li className="animal-meta-pill"><IonIcon icon={timeOutline} aria-hidden="true" />{animalActual.age}</li>
                        <li className="animal-meta-pill"><IonIcon icon={resizeOutline} aria-hidden="true" />{animalActual.size}</li>
                      </ul>
                      {!!animalActual.tags?.length && (
                        <div className="tags-container" aria-label="Características destacadas">
                          {animalActual.tags.map((tag, i) => <span key={`${tag}-${i}`} className="tag">{tag}</span>)}
                        </div>
                      )}
                      <div className="animal-section">
                        <h3 className="animal-section-title"><IonIcon icon={informationCircleOutline} aria-hidden="true" />Sobre {animalActual.name}</h3>
                        <p className="animal-section-text">{animalActual.description || 'Aún no hay una descripción disponible.'}</p>
                      </div>
                      <div className="animal-section">
                        <h3 className="animal-section-title"><IonIcon icon={locationOutline} aria-hidden="true" />Refugio y ubicación</h3>
                        <p className="animal-section-text"><strong>{animalActual.shelter}</strong> · {animalActual.location}</p>
                        {animalActual.distance && <p className="animal-section-note">{animalActual.distance}</p>}
                      </div>
                      <div className="animal-section">
                        <h3 className="animal-section-title"><IonIcon icon={medkitOutline} aria-hidden="true" />Información de salud</h3>
                        <p className="animal-section-text">{animalActual.health || 'Sin información médica por el momento.'}</p>
                      </div>

                      <div className="animal-actions">
                        <IonButton expand="block" color="success" className="btn-postular" routerLink={`/animales/${animalActual.id}/postular`}>
                          <IonIcon icon={pawOutline} slot="start" />Postular para adoptar
                        </IonButton>
                        <div className="action-buttons">
                          <IonButton fill="outline" color="dark" className="btn-secondary" onClick={handleFavorito}>
                            <IonIcon icon={favoritoActual ? heart : heartOutline} slot="start" />
                            {favoritoActual ? 'Quitar favorito' : 'Añadir a favoritos'}
                          </IonButton>
                          <IonButton fill="outline" color="dark" className="btn-secondary" routerLink={`/animales/${animalActual.id}/apadrinar`}>
                            <IonIcon icon={giftOutline} slot="start" />Apadrinar
                          </IonButton>
                        </div>
                      </div>
                    </div>
                  </article>

                  {siguienteAnimal && (
                    <div
                      key={`siguiente-${siguienteAnimal.id}`}
                      className="next-animal-card animal-card-enter"
                      role="button"
                      tabIndex={0}
                      aria-label={`Mostrar a ${siguienteAnimal.name} como animal principal`}
                      onClick={siguiente}
                      onKeyDown={e => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); siguiente(); }
                      }}
                    >
                      <div className="next-header">
                        <span className="next-label">SIGUIENTE ANIMAL</span>
                        <span className="next-hint">Pulsa para explorar <IonIcon icon={arrowForwardOutline} /></span>
                      </div>
                      <img src={siguienteAnimal.image} alt={`Fotografía de ${siguienteAnimal.name}`} className="next-animal-img" />
                      <div className="next-animal-details">
                        <h3 className="animal-name-small">{siguienteAnimal.name}</h3>
                        <p className="animal-stats-small">{siguienteAnimal.species} · {siguienteAnimal.gender} · {siguienteAnimal.age}</p>
                        <p className="text-muted-small"><IonIcon icon={locationOutline} aria-hidden="true" />{siguienteAnimal.shelter} · {siguienteAnimal.location}</p>
                        <IonButton
                          expand="block"
                          fill="outline"
                          color="dark"
                          className="btn-ver-ficha"
                          onClick={e => { e.stopPropagation(); router.push(`/animales/${siguienteAnimal.id}`); }}
                        >
                          <span>{`Ver ficha de ${siguienteAnimal.name}`}</span><IonIcon icon={arrowForwardOutline} slot="end" />
                        </IonButton>
                      </div>
                    </div>
                  )}
                </section>
              )}
        </main>

        <IonModal className="filtros-dialog" isOpen={filtrosAbiertos} onDidDismiss={() => setFiltrosAbiertos(false)} aria-label="Filtros de búsqueda">
          <IonHeader><IonToolbar>
            <IonTitle>Filtrar animales</IonTitle>
            <IonButtons slot="end"><IonButton fill="clear" color="dark" onClick={() => setFiltrosAbiertos(false)} aria-label="Cerrar filtros">Cerrar</IonButton></IonButtons>
          </IonToolbar></IonHeader>
          <IonContent className="ion-padding filtros-contenido">
            <p className="filtros-descripcion">Encuentra un compañero según sus características.</p>
            <IonList>
              <IonItem>
                <IonSelect label="Especie" value={especie} onIonChange={e => { setEspecie(e.detail.value); setCurrentIndex(0); }}>
                  <IonSelectOption value="TODAS">Todas</IonSelectOption>
                  <IonSelectOption value="PERRO">Perro</IonSelectOption>
                  <IonSelectOption value="GATO">Gato</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonSelect label="Tamaño" value={tamano} onIonChange={e => { setTamano(e.detail.value); setCurrentIndex(0); }}>
                  <IonSelectOption value="TODOS">Todos</IonSelectOption>
                  <IonSelectOption value="PEQUEÑO">Pequeño</IonSelectOption>
                  <IonSelectOption value="MEDIANO">Mediano</IonSelectOption>
                  <IonSelectOption value="GRANDE">Grande</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonList>
            <div className="filtros-acciones"><IonButton fill="outline" color="dark" onClick={limpiarFiltros}>Limpiar filtros</IonButton><IonButton color="success" onClick={() => setFiltrosAbiertos(false)}>Ver {animalesFiltrados.length} animales</IonButton></div>
          </IonContent>
        </IonModal>
        <IonToast isOpen={mensaje !== ''} message={mensaje} duration={2400} onDidDismiss={() => setMensaje('')} />
      </IonContent>
    </IonPage>
  );
};

export default Explorar;
