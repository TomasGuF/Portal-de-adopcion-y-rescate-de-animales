import React,{useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {MenuLateralUsuario,BarraInferiorUsuario} from './MenuUsuario';
import './PersistentUserNav.css';

/* El shell se monta UNA vez, fuera de las rutas de contenido. */
const PersistentUserNav:React.FC=()=>{
 const {pathname}=useLocation();
 const visible=pathname==='/catalogo'||pathname.startsWith('/usuario/')||pathname.startsWith('/animales/');
 const activo=pathname.startsWith('/usuario/postulaciones')?'/usuario/postulaciones':
 pathname.startsWith('/usuario/alertas')?'/usuario/alertas':
 pathname.startsWith('/usuario/perfil')||pathname.startsWith('/usuario/favoritos')?'/usuario/perfil':'/catalogo';
 useEffect(()=>{
  document.body.classList.toggle('patitas-user-shell',visible);
  return()=>document.body.classList.remove('patitas-user-shell');
 },[visible]);
 if(!visible)return null;
 return <><aside className="patitas-stable-sidebar" aria-label="Navegación principal de usuario">
   <MenuLateralUsuario activo={activo}/>
 </aside><div className="patitas-stable-mobile-nav"><BarraInferiorUsuario activo={activo}/></div></>;
};
export default PersistentUserNav;