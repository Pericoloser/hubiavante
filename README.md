# SIM4UE — Sitio web oficial

**Modelo Integrado de Formación por Simulación Clínica en Urgencias y Emergencias en Entornos Transfronterizos**

Proyecto cofinanciado por el programa **Interreg VI-A España-Portugal (POCTEP) 2021-2027**.

---

## 🚀 Estructura del proyecto

```
sim4ue/
├── index.html              # Página principal (SPA)
├── css/style.css           # Estilos (paleta EU blue + teal + gold)
├── js/main.js              # Motor i18n, Gantt, formulario
├── locales/
│   ├── es.json / pt.json / gl.json / en.json
├── images/
│   ├── hero-illustration.svg
│   ├── news-1.svg / news-2.svg / news-3.svg
│   └── logos/
│       ├── fps.svg     ← reemplazar con PNG real
│       ├── usc.svg     ← reemplazar con PNG real
│       ├── chtmad.svg  ← reemplazar con PNG real
│       ├── hvr.svg     ← pendiente logo real
│       ├── chuc.svg    ← reemplazar con PNG real
│       └── fisevi.svg  ← reemplazar con PNG real
├── netlify.toml            # Config despliegue Netlify
└── _redirects              # Reglas redirección
```

---

## 🖼️ Reemplazar logos con archivos reales

Coloca los logos oficiales en `images/logos/` con estos nombres exactos:

| Archivo | Socio |
|---------|-------|
| `fps.png` / `fps.svg` | FPS / IAVANTE · Junta de Andalucía |
| `usc.png` / `usc.svg` | Universidade de Santiago de Compostela |
| `chtmad.png` / `chtmad.svg` | Centro Hospitalar Trás-os-Montes e Alto Douro |
| `hvr.png` / `hvr.svg` | Hospital Virgen del Rocío |
| `chuc.png` / `chuc.svg` | Centro Hospitalar e Universitário de Coimbra |
| `fisevi.png` / `fisevi.svg` | FISEVI |

Si usas PNG, actualiza las rutas en `js/main.js` → objeto `PARTNER_LOGOS`.

---

## 📬 Activar formulario real (Formspree)

1. Cuenta gratuita en [formspree.io](https://formspree.io)
2. **New Form** → copia el Form ID (p.ej. `xpwzlkno`)
3. En `js/main.js` línea ~7: `const FORMSPREE_ID = 'xpwzlkno';`
4. En Formspree: añadir email de notificación + activar reCAPTCHA

---

## 🌐 Despliegue en www.sim4ue.eu

### Netlify (recomendado ✅)

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → importar este repositorio
2. Build: vacío · Publish directory: `.` → **Deploy**
3. **Domain settings** → `www.sim4ue.eu`
4. DNS en tu proveedor:
   ```
   CNAME  www  →  tu-sitio.netlify.app
   A      @    →  75.2.60.5
   ```
5. HTTPS activado automáticamente (Let's Encrypt)

### GitHub Pages

1. **Settings → Pages** → Source: `main` / `/`
2. Crea `CNAME` con contenido `www.sim4ue.eu`
3. DNS: `CNAME www → tuusuario.github.io`

### Servidor propio

Copia los archivos al directorio web. No hay build step.

---

## ✅ Checklist pre-lanzamiento

- [ ] Logos PNG reales en `images/logos/`
- [ ] Formspree ID configurado en `js/main.js`
- [ ] Email correcto en `locales/*.json` → `contacto.coord_email`
- [ ] Logos UE/POCTEP/FEDER oficiales (ec.europa.eu/regional_policy)
- [ ] Revisar textos con todos los socios en 4 idiomas
- [ ] Probar en iOS Safari + Chrome Android
- [ ] Dominio `www.sim4ue.eu` activado en Netlify
- [ ] Google Analytics / Matomo (opcional)

---

© 2026 SIM4UE · Fundación Pública Andaluza Progreso y Salud (FPS/IAVANTE)
Cofinanciado por la UE · Interreg VI-A España-Portugal POCTEP 2021-2027
