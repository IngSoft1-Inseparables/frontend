import React from "react";
import FaceCard from "../FaceCard/FaceCard";
import "./HandCard.css";
import { useState, useEffect, useRef } from "react";

function HandCard({
  playerCards = [],
  onSetStateChange,
  availableToPlay,
  turnState,
}) {
  const [selectedCards, setSelectedCards] = useState([]); // array donde se van guardando las cartas seleccionadas por el usuario.
  const [maxAllowed, setMaxAllowed] = useState(0);
  const handRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el clic NO fue dentro del contenedor de la mano, limpiar selección
      if (handRef.current && !handRef.current.contains(event.target)) {
        setSelectedCards([]);
        setMaxAllowed(0);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

 const getSetSize = (cardName) => {
    switch (cardName) {
      case "Hercule Poirot":
      case "Miss Marple":
        return 3; // sets de 3 cartas
      default:
        return 2; // todo lo demás → sets de 2 cartas
    }
  };

  const isBeresford = (name) => ["tommy beresford", "tuppence beresford"].includes(name.toLowerCase());
  const isWildcard = (name) => name.toLowerCase() === "harley quin wildcard";

  const getTargetName = (cards) => {
    const nonWildcards = cards.filter(c => !isWildcard(c.card_name));
    if (nonWildcards.length > 0) {
        return nonWildcards[0].card_name.toLowerCase();
    }
    // Si solo hay Wildcard, no hay nombre objetivo aún.
    return null;
  };
  
  const handleSelect = (card) => {
    if (!availableToPlay || turnState.toLowerCase() !== "None".toLowerCase())
      return;

    const cardName = card.card_name.toLowerCase();
    const isNewWildcard = isWildcard(card.card_name);
    const isDetective = card.type.toLowerCase() === "detective" && cardName !== "adriane oliver";

    // 1. Deseleccionar si ya estaba seleccionada
    if (selectedCards.some((c) => c.card_id === card.card_id)) {
      const newSelected = selectedCards.filter(
        (c) => c.card_id !== card.card_id
      );
      setSelectedCards(newSelected);
      // **Ajuste:** Si al deseleccionar queda 1 carta, re-evaluamos el maxAllowed
      if (newSelected.length === 1 && !isWildcard(newSelected[0].card_name)) {
         setMaxAllowed(getSetSize(newSelected[0].card_name));
      } else if (newSelected.length === 0) {
         setMaxAllowed(0);
      }
      return;
    }

    // 2. Si la selección está vacía
    if (selectedCards.length === 0) {
      if (!isDetective && !isNewWildcard) return; // No se puede empezar con cartas que no sean set.
      
      setSelectedCards([card]);
      if (isNewWildcard) {
        setMaxAllowed(0); // El máximo se determinará con la segunda carta
      } else {
        setMaxAllowed(getSetSize(card.card_name));
      }
      return;
    }

    // 3. Evaluar la nueva carta en el contexto del set actual
    
    // Obtener el tipo de set que estamos formando (ignorando Wildcards ya seleccionadas)
    const targetName = getTargetName(selectedCards);
    const currentMax = maxAllowed;
    const nextLength = selectedCards.length + 1;
    
    // Si ya estamos llenos, no permitir más selecciones (cae en el reinicio al final)
    if (selectedCards.length >= currentMax && currentMax !== 0) {
        // La única excepción es si currentMax es 0 (solo Wildcard) y la nueva carta es detective
        if(currentMax === 0 && isDetective) {
            // Permitimos la selección para establecer el maxAllowed
            const newMax = getSetSize(card.card_name);
            setMaxAllowed(newMax);
            setSelectedCards([...selectedCards, card]);
            return;
        }
        // Si el set está lleno, cualquier otra carta intentada debe reiniciar la selección.
        setSelectedCards(isDetective ? [card] : []);
        setMaxAllowed(isDetective ? getSetSize(card.card_name) : 0);
        return;
    }

    // A. Caso: Set con Wildcard en primer lugar (maxAllowed es 0)
    if (currentMax === 0 && isDetective && !isNewWildcard) {
        const newMax = getSetSize(card.card_name);
        setMaxAllowed(newMax);
        setSelectedCards([...selectedCards, card]);
        return;
    }

    // B. Caso: Añadir Wildcard a un set incompleto
    if (isNewWildcard && !selectedCards.some(c => isWildcard(c.card_name))) {
        setSelectedCards([...selectedCards, card]);
        return;
    }

    // C. Caso: Añadir carta del mismo tipo (Detective o Beresford)
    
    const isSameName = targetName === cardName;
    const isBeresfordGroup = targetName && isBeresford(targetName) && isBeresford(cardName);

    if ((isSameName || isBeresfordGroup) && !isNewWildcard) {
      // Si la nueva carta es del mismo detective O forma parte del grupo Beresford
      setSelectedCards([...selectedCards, card]);
    } else {
      // 4. Si no es el mismo tipo, reiniciar (comenzar un nuevo set)
      setSelectedCards(isDetective ? [card] : []);
      setMaxAllowed(isDetective ? getSetSize(card.card_name) : 0);
    }
  };
  const isSetPlayable =
    selectedCards.length > 0 && selectedCards.length === maxAllowed;
  useEffect(() => {
    if (onSetStateChange) {
      onSetStateChange(isSetPlayable, selectedCards);
    }
  }, [isSetPlayable, selectedCards, onSetStateChange]);
  useEffect(() => {
    const updatedSelected = selectedCards.filter((c) =>
      playerCards.some((pc) => pc.card_id === c.card_id)
    );
    if (updatedSelected.length !== selectedCards.length) {
      setSelectedCards(updatedSelected);
      const isPlayable = updatedSelected.length === maxAllowed;
      if (onSetStateChange) onSetStateChange(isPlayable, updatedSelected);
    }
  }, [playerCards]);

  return (
    <div className="hand-card" ref={handRef}>
      {playerCards.map((card) => (
        <FaceCard
          key={card.card_id}
          cardId={card.card_id}
          imageName={card.image_name}
          cardName={card.card_name}
          imageBackName={card.image_back_name}
          onSelect={() => handleSelect(card)}
          isSelected={selectedCards.some((c) => c.card_id === card.card_id)}
        />
      ))}
    </div>
  );
}

export default HandCard;
