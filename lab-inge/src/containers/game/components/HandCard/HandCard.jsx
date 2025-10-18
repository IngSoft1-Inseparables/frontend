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

  const handleSelect = (card) => {
    if (!availableToPlay)
      // if (!availableToPlay || turnState.toLowerCase() !== "None".toLowerCase())
      return;
    const cardName = card.card_name.toLowerCase();
    const selectedNames = selectedCards.map((c) => c.card_name.toLowerCase());

    // Deseleccionar si ya estaba seleccionada
    if (selectedCards.some((c) => c.card_id === card.card_id)) {
      const newSelected = selectedCards.filter(
        (c) => c.card_id !== card.card_id
      );
      setSelectedCards(newSelected);
      if (newSelected.length === 0) setMaxAllowed(0); // reset si vacía
      return;
    }

    const isWildcard = cardName === "Harley Quin Wildcard".toLowerCase();
    const hasWildcard = selectedNames.includes(
      "Harley Quin Wildcard".toLowerCase()
    );
    const beresfordGroup = ["tommy beresford", "tuppence beresford"];
    const isDetective =
      card.type.toLowerCase() === "detective" && cardName !== "adriane oliver";

    let currentMax = maxAllowed;

    if (selectedCards.length === 0 && isDetective) {
      currentMax = getSetSize(card.card_name);
      setMaxAllowed(currentMax);
    }

    if (selectedCards.length === 0 && isWildcard) {
      // No sabemos aún el tamaño del set, pero permitimos la selección inicial
      setSelectedCards([card]);
      return;
    }

    if (
      selectedCards.length === 1 &&
      selectedCards[0].card_name.toLowerCase() === "harley quin wildcard" &&
      isDetective &&
      !isWildcard
    ) {
      const newMax = getSetSize(card.card_name);
      setMaxAllowed(newMax);
      setSelectedCards([...selectedCards, card]);
      return;
    }

    const canAdd =
      selectedCards.length < currentMax &&
      (selectedNames.every((name) => name === cardName) || // mismo detective
        (beresfordGroup.includes(cardName) && // Beresford con otros Beresford o wildcard
          selectedNames.every((name) => beresfordGroup.includes(name))));
    if (
      isWildcard &&
      !selectedNames.includes("Harley Quin Wildcard".toLowerCase()) &&
      selectedCards.length < currentMax
    ) {
      setSelectedCards([...selectedCards, card]);
      return;
    }

    if (canAdd && !isWildcard) {
      setSelectedCards([...selectedCards, card]);
    } else {
      // Si no cumple, reiniciar selección
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
