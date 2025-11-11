import React from "react";
import FaceCard from "../FaceCard/FaceCard";
import "./HandCard.css";
import { useState, useEffect, useRef } from "react";

function HandCard({
  playerCards = [],
  onSetStateChange,
  onCardStateChange,
  availableToPlay,
  turnState,
  setsPlayed,
  inDisgrace = false,
  setSelectionMode,
}) {
  const [selectedCards, setSelectedCards] = useState([]); // array donde se van guardando las cartas seleccionadas por el usuario.
  const [maxAllowed, setMaxAllowed] = useState(0);
  const handRef = useRef(null);
  const [matchingSets, setMatchingSets] = useState([]);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (inDisgrace) {
      setSelectedCards([]);
      setMaxAllowed(0);
      if (onSetStateChange) onSetStateChange(false, []);
    }
  }, [inDisgrace]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el clic NO fue dentro del contenedor de la mano, limpiar selección
      if (handRef.current && !handRef.current.contains(event.target)) {
        setSelectedCards([]);
        setMaxAllowed(0);
        setMatchingSets([]);
        if (onCardStateChange) {
          onCardStateChange([]);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onCardStateChange]);

  const getSetSize = (cardName) => {
    switch (cardName) {
      case "Hercule Poirot":
      case "Miss Marple":
        return 3; // sets de 3 cartas
      default:
        return 2; // todo lo demás → sets de 2 cartas
    }
  };

  const isBeresford = (name) =>
    ["tommy beresford", "tuppence beresford"].includes(name.toLowerCase());
  const isWildcard = (name) => name.toLowerCase() === "harley quin wildcard";

  const getTargetName = (cards) => {
    const nonWildcards = cards.filter((c) => !isWildcard(c.card_name));
    if (nonWildcards.length > 0) {
      return nonWildcards[0].card_name.toLowerCase();
    }
    // Si solo hay Wildcard, no hay nombre objetivo aún.
    return null;
  };

  const handleSelect = (card) => {
    //si el jugador está en desgracia social, no puede seleccionar cartas para jugar sets
    if (inDisgrace) return;

    if (!availableToPlay || turnState.toLowerCase() !== "None".toLowerCase())
      return;

    const cardName = card.card_name.toLowerCase();
    const isNewWildcard = isWildcard(card.card_name);
    const isAriadneOliver = cardName === "adriane oliver";
    const isDetective =
      card.type.toLowerCase() === "detective" && !isAriadneOliver;

    // 1. Deseleccionar si ya estaba seleccionada
    if (selectedCards.some((c) => c.card_id === card.card_id)) {
      const newSelected = selectedCards.filter(
        (c) => c.card_id !== card.card_id
      );
      setSelectedCards(newSelected);
      // Si al deseleccionar queda 1 carta, re-evaluamos el maxAllowed
      if (newSelected.length === 1 && !isWildcard(newSelected[0].card_name)) {
        setMaxAllowed(getSetSize(newSelected[0].card_name));
      } else if (newSelected.length === 0) {
        setMaxAllowed(0);
        // Limpiar matchingSets cuando no hay cartas seleccionadas
        setMatchingSets([]);
        if (onCardStateChange) {
          onCardStateChange([]);
        }
      }
      return;
    }

    // 2. Si la selección está vacía
    if (selectedCards.length === 0) {
      // Permitir seleccionar Ariadne Oliver sola
      if (isAriadneOliver) {
        setSelectedCards([card]);
        setMaxAllowed(1); // Solo se puede seleccionar Ariadne sola
        
        return;
      }

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
      if (currentMax === 0 && isDetective) {
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
    if (isNewWildcard && !selectedCards.some((c) => isWildcard(c.card_name))) {
      setSelectedCards([...selectedCards, card]);
      return;
    }

    // C. Caso: Añadir carta del mismo tipo (Detective o Beresford)
    const isSameName = targetName === cardName;
    const isBeresfordGroup =
      targetName && isBeresford(targetName) && isBeresford(cardName);

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
    console.log("useEffect disparado - selectedCards:", selectedCards);
    console.log("setsPlayed:", setsPlayed);
    // Si hay exactamente 1 carta detective seleccionada => buscar coincidencias
if (selectedCards.length === 1) {
      // 2. Si hay 1, define la lógica de Ariadne Oliver AQUÍ
      const card = selectedCards[0];
      const cardNameLower = card.card_name.toLowerCase();
      const isAriadneOliver = cardNameLower === "adriane oliver";

      // 3. Ahora SÍ puedes usar tu 'if'
      if (isAriadneOliver) {
        console.log("Ariadne Oliver detectada - activando select-player");
        if (onCardStateChange) {
          onCardStateChange([
            {
              isAriadne: true,
              card: card,
            },
          ]);
        }
        return;
      }
    }
    if (
      selectedCards.length === 1 &&
      !isWildcard(selectedCards[0].card_name) &&
      selectedCards[0].type.toLowerCase() === "detective" &&
      setsPlayed.length > 0
    ) {
      const cardNameLower = selectedCards[0].card_name.toLowerCase();

   
      console.log("✅ Cumple condiciones - buscando coincidencias...");
      const tempMatches = [];
      setsPlayed.forEach((set, index) => {
        const setTypeLower = set.set_type.toLowerCase();

        console.log(
          ` Comparando: "${cardNameLower}" vs set "${setTypeLower}"`
        );

        const isMatch =
          cardNameLower.includes(setTypeLower) ||
          setTypeLower.includes(cardNameLower.split(" ").pop()) ||
          ((cardNameLower.includes("tommy") ||
            cardNameLower.includes("tuppence")) &&
            (setTypeLower.includes("tommy") ||
              setTypeLower.includes("tuppence")));

        console.log(`   ${isMatch ? "✅ MATCH" : "❌ NO match"}`);

        if (isMatch) {
          tempMatches.push({
            setIndex: index,
            setType: set.set_type,
            cards: set.cards,
            setId: set.set_id,
          });
        }
      });
      console.log("📦 Matches encontrados:", tempMatches);
      setMatchingSets(tempMatches);
      if (onCardStateChange) {
        onCardStateChange(tempMatches);
      }
    } else if (selectedCards.length === 0) {
      if (matchingSets.length > 0) {
        setMatchingSets([]);
      }
      if (onCardStateChange) {
        onCardStateChange([]);
      }
    } else if (selectedCards.length > 1) {
      setMatchingSets([]);
      if (onCardStateChange) {
        onCardStateChange([]);
      }
    }
  }, [selectedCards, setsPlayed, onCardStateChange]);

  useEffect(() => {
    setRenderKey(prev => prev + 1); 
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
    <div
      className={`hand-card ${inDisgrace ? "hand-card--disgrace" : ""}`}
      ref={handRef}
      title={
        inDisgrace
          ? "Estás en desgracia social: no podés seleccionar cartas para sets."
          : undefined
      }
    >
      {playerCards.map((card) => (
        <FaceCard
          key={`${renderKey}-${card.card_id}`}
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
