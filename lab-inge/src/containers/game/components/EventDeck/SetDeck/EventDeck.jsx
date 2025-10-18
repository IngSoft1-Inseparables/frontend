import React from "react"; // Aseguramos que React está importado

// Usamos la declaración estándar y exportación por defecto
export default function EventDeck({ setsPlayed = [] }) {
  // Si la lista de cartas seleccionadas está vacía
  if (setsPlayed.length === 0) {
    return (
      <div className="relative w-24 h-36">
        <div className="w-full h-full rounded border-2 border-dashed border-white/40 flex items-center justify-center bg-red-500/20">
          <img
            src="/icons/discard-slot.png"
            alt="Zona de descarte"
            style={{
              width: "65px",
              height: "65px",
              opacity: 0.85,
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>
    );
  }

 
}

