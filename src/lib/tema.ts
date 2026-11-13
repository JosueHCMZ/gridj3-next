export const CLAVE_TEMA = 'gridj3-tema';

/** Corre en <head> antes de pintar, para que el tema no parpadee. */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('${CLAVE_TEMA}');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'}document.documentElement.dataset.tema=t;if(t==='oscuro'){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#232220')}}catch(e){}})()`;
