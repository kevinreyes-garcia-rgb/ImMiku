# ImMiku 💙

Página estática para **GitHub Pages** con temática de **Miku Nakano** (Gotoubun no Hanayome) que convierte fotos, videos y más en una **URL ImMiku** (Base64 / `data:` URL) al instante, 100% dentro del navegador.

**Creado por Chizu**

## ✨ Características
- 📤 Arrastrar y soltar + selector de archivos
- 🔗 **URL ImMiku** copiable con un clic (enlace `data:` Base64)
- 🖼️/🎬/🎵 Vista previa embebida (imágenes, videos y audio)
- ⚡ Conversión instantánea con FileReader — sin servidores, sin subidas externas
- 🕘 Historial local (guardado en tu navegador con `localStorage`)
- 📱 Totalmente responsive
- 💙 Temática Miku Nakano (banner e icono incluidos)

## 🔧 Cómo funciona
1. Eliges o arrastras un archivo.
2. `FileReader.readAsDataURL()` lo convierte a Base64 → `data:<tipo>;base64,...`
3. Esa cadena **es tu URL ImMiku**: pégala en cualquier navegador o en una etiqueta `<img src="...">` y funcionará.

Todo ocurre localmente: nada se sube a ningún servidor.

## 📁 Estructura
```
ImMiku/
├── index.html      → Página principal
├── css/
│   └── style.css   → Estilos (tema Miku)
├── js/
│   └── main.js     → Lógica Base64 / URL ImMiku
├── assets/
│   ├── banner.jpg  → Banner de Miku (respaldo local)
│   └── icon.jpg    → Icono de Miku (respaldo local)
└── README.md
```

## 🚀 Despliegue en GitHub Pages
1. Crea un repositorio llamado `tu-usuario.github.io` (o cualquier repo y activa Pages).
2. Sube el contenido de la carpeta `ImMiku` a la raíz del repo (o a `/ImMiku` como subruta).
3. En **Settings → Pages** selecciona la rama `main` y la carpeta raíz.
4. ¡Listo! Tu sitio estará en `https://tu-usuario.github.io/` (o `/ImMiku/`).

## 📜 Notas
- Las URLs Base64 son ~37% más grandes que el archivo original y muy largas: ideales para imágenes y archivos pequeños/medianos.
- El historial guarda lo que quepa en la cuota del navegador (~4 MB) y recorta lo más antiguo automáticamente.
- Al ser 100% local, funciona incluso sin internet tras cargar la página una vez.
