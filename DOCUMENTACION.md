# WePai - Documentación del Proyecto

## Descripción

WePai es una Progressive Web App (PWA) de fitness que permite:
- Registrar entrenamientos diarios (ejercicios, series, repeticiones, peso)
- Crear y gestionar rutinas de entrenamiento
- Visualizar progreso en Dashboard (volumen, rachas, récords)
- Chat con Coach IA (Gemini) para asistencia personalizada
- Funcionar offline y como app nativa en Android/iOS/escritorio

**URL**: https://wepai-fitness.vercel.app

---

## Herramientas Utilizadas

| Herramienta | Uso |
|------------|-----|
| Vercel | Deployment y Serverless Functions |
| GitHub | Control de versiones y trigger de deploy |
| Google Gemini API | IA del Coach |
| Vercel CLI | Deploy manual y configuración de variables |
| API REST Vercel | Gestión de environment variables |

---

## API Keys

> **IMPORTANTE**: Las API keys se encuentran configuradas en Vercel. No hacer commit de keys sensibles al repositorio.

| Servicio | Estado |
|----------|--------|
| GitHub Personal Access Token | Configurado en el proyecto |
| Vercel Personal Access Token | Configurado en el proyecto |
| Google Gemini API Key | Configurado en Vercel |

---

## Cambios Realizados

### 1. Fix de vercel.json

**Problema**: El rewrite de `/api/` causaba loop y Vercel no detectaba las Serverless Functions.

**Solución**: Eliminado el rewrite problemático. Configuración final:
```json
{
  "framework": null,
  "github": { "enabled": true },
  "build": { "env": { "ENABLE_VC_BUILD": "0" } }
}
```

### 2. Fix de package.json

**Problema**: Script de build causaba error en Vercel.

**Solución**: Removido el script de build.

### 3. Configuración de Environment Variables

**Problema**: `GEMINI_API_KEY` no estaba configurada en Vercel.

**Solución**: 
- Eliminar la key anterior (expirada)
- Agregar nueva key via API de Vercel
- Redeploy automático

### 4. Deployment

**Problema**: El proyecto no estaba linkeado a GitHub, deploy fallaba.

**Solución**: 
- Crear `.vercel/project.json` con projectId y orgId
- Deploy directo con Vercel CLI
- Alias a `wepai-fitness.vercel.app`

---

## Estructura del Proyecto

```
WePai/
├── index.html           # App principal (SPA)
├── api/coach.js         # Serverless Function para Gemini
├── vercel.json          # Config de Vercel
├── package.json         # Sin scripts de build
├── manifest.json        # PWA Manifest
├── sw.js               # Service Worker offline
├── icons/              # Íconos PWA
├── src/                # Código modular (en desarrollo)
├── .vercel/            # Config de linkeo
└── DOCUMENTACION.md    # Este archivo
```

---

## Flujo de Trabajo

1. Usuario hace cambios en local
2. Commit + Push a GitHub (`vb-studio/WePai`)
3. Vercel detecta push → Redeploy automático
4. Coach IA funciona con Gemini API

---

## Notas Importantes

- Las API keys están encriptadas y almacenadas en Vercel (no en el código)
- El proyecto usa `sourceFilesOutsideRootDirectory: true` para soportar API routes en raíz
- Build step deshabilitado (`ENABLE_VC_BUILD: 0`)
- El directorio `Prototipo IA/` fue eliminado (contenía prototypes obsoletos)

---

## Páginas de la App

1. **Registro** - Registro diario de ejercicios
2. **Dashboard** - Estadísticas y progreso
3. **Rutinas** - Gestión de plantillas de entrenamiento
4. **Coach** - Chat con IA (Gemini 2.0 Flash)
5. **Perfil** - Datos personales y récords
6. **Configuración** - Ajustes de la app