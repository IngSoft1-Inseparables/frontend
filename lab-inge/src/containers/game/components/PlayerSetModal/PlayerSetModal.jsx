import React from 'react';
import SetDeck from '../SetDeck/SetDeck';

/**
 * Componente Modal para mostrar los sets jugados por otro jugador.
 * Contiene la lógica para calcular el ancho dinámico del modal (dynamicModalWidth)
 * basándose en la cantidad de sets jugados para evitar forzar el escalado de SetDeck.
 */
function PlayerSetsModal({
  modalPlayerId,
  orderedPlayers,
  closeSetModal,
  onSetSelect,
  selectedSet,
  selectionMode,
}) {
  if (!modalPlayerId) return null;

  const targetPlayer = orderedPlayers.find((p) => p.id === modalPlayerId);
  const sets = targetPlayer?.setPlayed || [];
  const setLength = sets.length;

  // --- LÓGICA DE ANCHO DE MODAL DINÁMICO (MOVIMIENTO DE GAMEBOARD) ---
  const BASE_WIDTH = 120; // Ancho base de SetDeck (basado en BackCard.css/SetDeck)
  const GAP = 8;        // Gap (gap-2) de SetDeck
  const PADDING = 48;   // p-6 = 24px izquierda + 24px derecha = 48px (para mantener el padding del modal)

  let contentWidth = 0;
  if (setLength > 0) {
      // Ancho total necesario sin forzar el scaling
      contentWidth = (setLength * BASE_WIDTH) + ((setLength - 1) * GAP);
  }

  // Ancho total del modal (contenido + padding). Mínimo de 320px para la UI base.
  const dynamicModalWidth = Math.max(320, contentWidth + PADDING); 
  // ------------------------------------------------------------------

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={closeSetModal}
    >
      <div
        className="relative bg-gradient-to-b from-[#a1562e] to-[#72391c] p-6 rounded-2xl shadow-2xl border border-[#b87333] text-amber-50 w-80 transition-transform duration-300 ease-out scale-100"
        // Aplicamos el ancho dinámico aquí
        style={{ width: `${dynamicModalWidth}px`, maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()} // evita cerrar al clickear dentro
      >
        <button
          onClick={closeSetModal}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4">
          {targetPlayer?.name} - Set Jugado
        </h2>

        <SetDeck 
          setPlayed={sets}
          onSetClick={onSetSelect}
          selectedSetIndex={selectedSet}
          playerId={modalPlayerId}
          selectionMode={selectionMode}
        />
      </div>
    </div>
  );
}

export default PlayerSetsModal;
