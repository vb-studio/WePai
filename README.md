# WePai 💪

**Tu entrenamiento, inteligente.**

WePai es una Progressive Web App (PWA) de fitness que te permite registrar entrenamientos, crear rutinas y visualizar tu progreso. Funciona offline y se puede instalar en cualquier dispositivo.

---

## ✨ Características

- 📊 **Dashboard** — Visualiza tu progreso con estadísticas de volumen y rachas
- 📝 **Registro Diario** — Registra ejercicios, series, reps y peso por día
- 🗂️ **Gestión de Rutinas** — Crea y ejecuta plantillas de entrenamiento
- 👤 **Perfil & Récords** — Guarda tus datos personales y PRs automáticos
- 🌙 **Modo Oscuro** — Interfaz adaptativa
- ⚙️ **Configuración** — Unidades, temporizador, sonido, vibración, recordatorios
- 📱 **PWA Instalable** — Funciona como app nativa en Android, iOS y escritorio
- 🔌 **Funciona Offline** — Gracias al Service Worker

---

## 🚀 Desarrollo

```bash
# Abrir index.html directamente en navegador
# O usar un servidor local
npx serve .
```

---

## 🌐 Deployment en Vercel

1. Push a `main` en GitHub
2. Vercel detecta automáticamente el proyecto
3. Listo!

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| Primary | `#a04100` |
| Primary Container | `#ff6b00` |
| Surface | `#fcf9f8` |
| On Surface | `#1c1b1b` |
| Font Headline | Manrope |
| Font Body | Inter |

---

## 🛠️ Estructura del Proyecto

```
WePai/
├── index.html              # App principal (todo-en-uno)
├── manifest.json          # PWA Web App Manifest
├── sw.js                # Service Worker
├── icons/               # Íconos PWA
├── .gitignore
└── README.md
```

> **Nota:** La carpeta `src/` contiene una refactorización modular en progreso (no necesaria para el funcionamiento actual).

---

## 📱 Instalación como App

1. Abre la app en Chrome (Android) o Safari (iOS)
2. Usa "Añadir a pantalla de inicio"
3. ¡Listo!

---

## 🔧 Tecnologías

- HTML5 · CSS3 (Tailwind CSS CDN)
- JavaScript ES6+
- Web APIs: Service Worker, localStorage, Web App Manifest
