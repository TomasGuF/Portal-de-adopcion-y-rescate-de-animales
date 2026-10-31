/** Smoke tests reales de navegación de Ionic; sin depender de un backend externo. */
const iniciarSesionMock = (win: Window) => {
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: 'user'
  })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  win.sessionStorage.setItem('patitasgo.jwt', `test.${payload}.signature`);
  win.sessionStorage.setItem('patitasgo.user', JSON.stringify({
    id: 42, name: 'Usuario de pruebas', email: 'usuario@ejemplo.cl', role: 'user'
  }));
};

const luna = {
  id: 7,
  animalId: 2,
  animal: 'Luna',
  refugio: 'Refugio Patitas',
  postulante: 'Usuario de pruebas',
  fecha: '2026-10-30T15:30:00.000Z',
  estado: 'PENDIENTE',
  motivacion: 'Quiero adoptar a Luna',
  historial: [{fecha:'2026-10-30T15:30:00.000Z', detalle:'Estado: PENDIENTE'}]
};

describe('EP2 - Mis postulaciones', () => {
  it('redirige a login cuando no existe sesión', () => {
    cy.visit('/usuario/postulaciones');
    cy.location('pathname').should('eq', '/login');
    cy.contains('Bienvenido de vuelta').should('be.visible');
  });

  it('abre la ruta protegida, muestra datos reales de la API y navega al detalle', () => {
    cy.intercept('GET', '**/api/applications', {statusCode: 200, body: {data: [luna]}}).as('solicitudes');
    cy.intercept('GET', '**/api/applications/7', {statusCode: 200, body: {data: luna}}).as('detalle');

    cy.visit('/usuario/postulaciones', {onBeforeLoad: iniciarSesionMock});
    cy.wait('@solicitudes');
    cy.contains('h1', 'Mis postulaciones').should('be.visible');
    cy.contains('.panel-row-button', 'Luna').should('be.visible').click();
    cy.location('pathname').should('eq', '/usuario/postulaciones/7');
    cy.wait('@detalle');
    cy.contains('Postulación por Luna').should('be.visible');
  });

  it('muestra error recuperable cuando la API falla, no una pantalla vacía', () => {
    cy.intercept('GET', '**/api/applications', {
      statusCode: 503, body: {error:{code:'SERVICE_UNAVAILABLE',message:'Servicio temporalmente no disponible'}}
    }).as('fallo');
    cy.visit('/usuario/postulaciones', {onBeforeLoad: iniciarSesionMock});
    cy.wait('@fallo');
    cy.contains('No pudimos cargar tus solicitudes').should('be.visible');
    cy.contains('Reintentar').should('be.visible');
  });
});
