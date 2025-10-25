# Modularización de Game.jsx

## Descripción

Se ha refactorizado el archivo `Game.jsx` para mejorar la mantenibilidad y separación de responsabilidades mediante la creación de **custom hooks**.

## Estructura de Hooks Creados

### 1. **useGameData.js**
**Propósito:** Gestionar el estado del juego y la obtención de datos.

**Responsabilidades:**
- Mantener el estado de `turnData`, `playerData`, `orderedPlayers`
- Cargar datos iniciales del juego
- Reordenar jugadores según el turno
- Estado de carga (`isLoading`)

**Exports:**
- `turnData`, `setTurnData`
- `playerData`, `setPlayerData`
- `orderedPlayers`, `setOrderedPlayers`
- `isLoading`
- `fetchGameData()`
- `reorderPlayers()`

---

### 2. **useWebSocket.js**
**Propósito:** Manejar la conexión WebSocket y sus eventos.

**Responsabilidades:**
- Conectar/desconectar WebSocket
- Escuchar eventos: `game_public_update`, `player_private_update`, `connection_status`
- Manejar reconexiones y errores de conexión
- Detectar fin de partida

**Exports:**
- `showConnectionError`

---

### 3. **useSecretActions.js**
**Propósito:** Gestionar todas las acciones relacionadas con secretos.

**Responsabilidades:**
- Revelar secretos propios y ajenos
- Ocultar secretos
- Forzar revelación de secretos
- Robar secretos
- Manejar selección de jugadores y secretos

**Exports:**
- Estados: `selectedPlayer`, `selectedSecret`, `selectionAction`, `selectionMode`, `stolenPlayer`, `fromPlayer`, `prevData`
- Funciones: `revealMySecret()`, `revealOtherPlayerSecret()`, `forcePlayerRevealSecret()`, `hideMySecret()`, `hideOtherPlayerSecret()`, `handleStealSecret()`, `handleStealSecretEvent()`, `handlePlayerSelection()`, `handleSecretSelection()`

---

### 4. **useSelectionEffects.js**
**Propósito:** Centralizar los efectos de selección según el modo activo.

**Responsabilidades:**
- Ejecutar acciones automáticamente cuando cambia `selectionMode`
- Coordinar revelación/ocultación según el contexto
- Manejar flujo de robo de secretos con cartas especiales

**Modos de selección soportados:**
- `select-my-not-revealed-secret`
- `select-other-not-revealed-secret`
- `select-other-player`
- `select-my-revealed-secret`
- `select-revealed-secret`
- `select-other-revealed-secret`
- `select-player`

---

### 5. **useCardActions.js**
**Propósito:** Gestionar las acciones con cartas (jugar, descartar, drag & drop).

**Responsabilidades:**
- Drag and drop de cartas
- Jugar cartas de evento
- Descartar cartas
- Jugar sets y activar efectos según el tipo

**Exports:**
- `handleCardClick()`
- `handlePlaySetAction()`
- `handleDragEnd()`

**Tipos de sets soportados:**
- `poirot`, `marple`, `ladybrent`, `tommyberestford`, `tuppenceberestford`, `tommytuppence`, `satterthwaite`, `specialsatterthwaite`, `pyne`

---

### 6. **useTurnMessages.js**
**Propósito:** Mostrar mensajes contextuales según el estado del turno.

**Responsabilidades:**
- Generar mensajes según `turn_state`
- Mostrar nombre del jugador actual
- Indicar acciones disponibles

**Estados de turno:**
- `None`, `Playing`, `Waiting`, `Discarding`, `Replenish`, `Complete`

**Exports:**
- `message`
- `getPlayerNameById()`

---

### 7. **useStealSecretLogic.js**
**Propósito:** Implementar la lógica compleja del robo de secretos.

**Responsabilidades:**
- Detectar cambios en secretos revelados
- Ejecutar robo automático cuando se revela un secreto
- Ocultar el secreto robado
- Limpiar estados tras completar el robo

---

### 8. **useGameDialogs.js**
**Propósito:** Gestionar diálogos y modales del juego.

**Responsabilidades:**
- Manejar estado de diálogos: fin de partida, descarte top 5
- Gestionar carta de evento jugada
- Configurar listener de `hasToReveal`
- Reponer desde descarte

**Exports:**
- `showEndDialog`, `setShowEndDialog`
- `winnerData`, `setWinnerData`
- `showDiscardDialog`, `setShowDiscardDialog`
- `playedActionCard`, `setPlayedActionCard`
- `startDiscardTop5Action()`
- `handleReplenishFromDiscard()`

---

## Ventajas de la Modularización

1. **Separación de responsabilidades:** Cada hook tiene un propósito claro
2. **Reutilización:** Los hooks pueden ser reutilizados en otros componentes
3. **Testabilidad:** Es más fácil testear cada hook de forma aislada
4. **Mantenibilidad:** Más fácil encontrar y modificar lógica específica
5. **Legibilidad:** El componente principal es más compacto y legible
6. **Escalabilidad:** Facilita agregar nuevas funcionalidades

## Comparación

**Antes:** 888 líneas en un solo archivo  
**Después:** ~270 líneas en `Game.jsx` + 8 hooks modulares

## Uso

```javascript
import { useGameData, useWebSocket, useSecretActions, ... } from "./hooks";

function Game() {
  // Usar los hooks
  const { turnData, playerData, isLoading, fetchGameData } = useGameData(...);
  const { message } = useTurnMessages(...);
  // ...
}
```
