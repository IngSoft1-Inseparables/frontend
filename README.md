# Agatha Christie: Dead on the Cards – Frontend & Backend

Proyecto creado con [Vite](https://vitejs.dev/) y Node.js.

---

## Requisitos

- Node.js >= 18 (recomendado 20)
- npm >= 8
- nvm (Node Version Manager) para manejar versiones de Node
---

## Instalación de NVM y Node 20

1. **Instalar NVM:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

```

2. **Recargar la terminal y verificar si se instalo:**

```
nvm --version

```

3. **Instalar Node 20 y usarlo por defecto:**

```
nvm install 20
```

### Instalación del proyecto

```
nvm use
npm install
```

**Opcional: Si aparece algún error al instalar dependencias:**

```
npm install react react-dom
```

### Ejecución
```
npm run dev
```
