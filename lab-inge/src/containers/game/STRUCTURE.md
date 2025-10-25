# Estructura de Archivos - Game Component

```
src/containers/game/
│
├── Game.jsx                          # Componente principal (270 líneas) ✨
│   └── Importa y usa todos los hooks
│
├── Game.test.jsx                     # Tests de integración (~300 líneas)
│   └── Tests end-to-end del componente
│
├── hooks/                            # 📁 Directorio de custom hooks
│   ├── index.js                      # Exporta todos los hooks
│   │
│   ├── __tests__/                    # 🧪 Tests de hooks
│   │   ├── README.md                 # Documentación de tests
│   │   ├── testUtils.js              # Utilidades y mocks compartidos
│   │   ├── useGameData.test.js       # ✅ Tests de datos del juego
│   │   ├── useSecretActions.test.js  # ✅ Tests de acciones de secretos
│   │   ├── useTurnMessages.test.js   # ✅ Tests de mensajes
│   │   ├── useCardActions.test.js    # 🔜 Por migrar
│   │   ├── useWebSocket.test.js      # 🔜 Por migrar
│   │   ├── useSelectionEffects.test.js # 🔜 Por migrar
│   │   ├── useGameDialogs.test.js    # 🔜 Por migrar
│   │   └── useStealSecretLogic.test.js # 🔜 Por migrar
│   │
│   ├── useGameData.js                # 🎮 Estado y datos del juego
│   │   ├── turnData
│   │   ├── playerData
│   │   ├── orderedPlayers
│   │   ├── isLoading
│   │   └── fetchGameData()
│   │
│   ├── useWebSocket.js               # 🔌 Conexión WebSocket
│   │   ├── Eventos del servidor
│   │   ├── Reconexión automática
│   │   └── Manejo de errores
│   │
│   ├── useSecretActions.js           # 🔐 Acciones de secretos
│   │   ├── revealMySecret()
│   │   ├── hideMySecret()
│   │   ├── forcePlayerRevealSecret()
│   │   └── handleStealSecret()
│   │
│   ├── useSelectionEffects.js        # 👆 Efectos de selección
│   │   ├── select-my-not-revealed-secret
│   │   ├── select-other-not-revealed-secret
│   │   ├── select-other-player
│   │   └── select-revealed-secret
│   │
│   ├── useCardActions.js             # 🃏 Acciones de cartas
│   │   ├── handleDragEnd()
│   │   ├── handlePlaySetAction()
│   │   └── handleCardClick()
│   │
│   ├── useTurnMessages.js            # 💬 Mensajes del turno
│   │   ├── message
│   │   └── getPlayerNameById()
│   │
│   ├── useStealSecretLogic.js        # 🎯 Lógica de robo
│   │   └── Detecta y ejecuta robos
│   │
│   └── useGameDialogs.js             # 🪟 Diálogos y modales
│       ├── showEndDialog
│       ├── showDiscardDialog
│       └── playedActionCard
│
├── components/                        # Componentes visuales
│   ├── GameBoard/
│   ├── EndGameDialog/
│   ├── DiscardTop5Dialog/
│   └── ... (otros componentes)
│
└── MODULARIZATION.md                 # 📖 Documentación
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                      Game.jsx                           │
│  (Componente principal - Orquestador)                   │
└───────┬─────────────────────────────────────────────────┘
        │
        ├─► useGameData ─────────────► HTTPService
        │                               (fetch data)
        │
        ├─► useWebSocket ────────────► WSService
        │                               (real-time updates)
        │
        ├─► useSecretActions ────────► HTTPService
        │                               (reveal/hide/steal)
        │
        ├─► useCardActions ──────────► HTTPService
        │                               (play/discard)
        │
        ├─► useSelectionEffects ─────► Coordina acciones
        │                               según selectionMode
        │
        ├─► useTurnMessages ─────────► Genera mensajes UI
        │
        ├─► useStealSecretLogic ─────► Lógica compleja
        │                               de robo
        │
        └─► useGameDialogs ──────────► Controla modales
                                        y diálogos
```

## Ciclo de Vida

```
1. 🚀 Inicialización
   ├─► useGameData: Carga datos iniciales
   └─► useWebSocket: Conecta WebSocket

2. 🔄 Actualizaciones en tiempo real
   └─► WebSocket events → Actualiza estado

3. 🎮 Interacciones del usuario
   ├─► Drag & Drop → useCardActions
   ├─► Seleccionar jugador/secreto → useSecretActions
   └─► Jugar set → useCardActions

4. 🎯 Efectos automáticos
   ├─► useSelectionEffects: Ejecuta según modo
   └─► useStealSecretLogic: Detecta y roba

5. 💬 UI Feedback
   └─► useTurnMessages: Muestra mensajes

6. 🪟 Modales
   └─► useGameDialogs: Fin de partida, descarte
```

## 🔧 Cómo Agregar Nuevas Funcionalidades

### Paso 1: Identificar la Responsabilidad
Determina a qué categoría pertenece tu nueva función:
- **Datos del juego** → `useGameData.js`
- **Comunicación en tiempo real** → `useWebSocket.js`
- **Acciones de secretos** → `useSecretActions.js`
- **Acciones de cartas** → `useCardActions.js`
- **Efectos de selección** → `useSelectionEffects.js`
- **Mensajes UI** → `useTurnMessages.js`
- **Diálogos/Modales** → `useGameDialogs.js`
- **Lógica compleja** → Crear nuevo hook

### Paso 2: Agregar la Función al Hook Apropiado

**Ejemplo:** Agregar función para intercambiar cartas entre jugadores

```javascript
// En useCardActions.js
export const useCardActions = (...params) => {
  // ... código existente ...
  
  // ✨ Nueva función
  const handleSwapCards = async (card1, card2, playerId) => {
    try {
      await httpService.swapCards(gameId, myPlayerId, {
        card1,
        card2,
        targetPlayerId: playerId
      });
      await fetchGameData();
    } catch (error) {
      console.error("Error al intercambiar cartas:", error);
    }
  };

  return {
    handleCardClick,
    handlePlaySetAction,
    handleDragEnd,
    handleSwapCards, // ← Exportar la nueva función
  };
};
```

### Paso 3: Usar la Nueva Función en Game.jsx

```javascript
// En Game.jsx
const { 
  handleCardClick, 
  handlePlaySetAction, 
  handleDragEnd,
  handleSwapCards // ← Desestructurar la nueva función
} = useCardActions(...);

// Usar donde sea necesario
<GameBoard
  onSwapCards={handleSwapCards}
  // ... otros props
/>
```

### Paso 4: Si Necesitas un Nuevo Hook

```javascript
// Crear hooks/useNewFeature.js
import { useState } from "react";

export const useNewFeature = (httpService, gameId, myPlayerId) => {
  const [newState, setNewState] = useState(null);

  const newFunction = async () => {
    // Implementación
  };

  return {
    newState,
    setNewState,
    newFunction,
  };
};
```

```javascript
// Agregar al hooks/index.js
export { useNewFeature } from './useNewFeature';
```

```javascript
// Usar en Game.jsx
import { useNewFeature, /* otros hooks */ } from "./hooks";

const { newState, newFunction } = useNewFeature(httpService, gameId, myPlayerId);
```

### ⚠️ Buenas Prácticas

- ✅ Mantén cada hook con una **responsabilidad única**
- ✅ **Reutiliza** funciones existentes cuando sea posible
- ✅ Usa **nombres descriptivos** para funciones y estados
- ✅ **Exporta siempre** las nuevas funciones en el return del hook
- ✅ Actualiza `index.js` si creas un nuevo hook
- ❌ No mezcles responsabilidades no relacionadas en un mismo hook
- ❌ No dupliques lógica que ya existe en otros hooks
