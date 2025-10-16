import React from 'react'; // Aseguramos que React está importado

// Usamos la declaración estándar y exportación por defecto
export default function SetDeck({ setsPlayed = [] }) {
  
  // Si la lista de cartas seleccionadas está vacía
  if (setsPlayed.length === 0) {
    return (
      <div className="relative w-24 h-36"> 
        <div className="w-full h-full rounded border-2 border-dashed border-white/40 flex items-center justify-center bg-red-500/50">
     
        HOLA
        </div>
      </div>
    );
  }

  // Si hay cartas seleccionadas (temporalmente, si se usa la prop setsPlayed)
  return (
    <div className="relative w-24 h-36 bg-blue-700/80 rounded flex items-center justify-center text-white">
        <p>Sets listos: {setsPlayed.length}</p>
    </div>
  );
}