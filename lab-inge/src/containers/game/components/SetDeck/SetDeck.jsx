import BackCard from "../BackCard/BackCard";
import { useRef, useEffect, useState } from "react";

export default function SetDeck({ 
  setPlayed = [], 
  onSetClick = null,
  selectedSetIndex = null,
  playerId = null,
  selectionMode = null 
}) {
  // const setPlayed = [
  //   {
  //     cards: [
  //       { card_id: 1, card_name: "Poirot", image_name: "07-detective_poirot" },
  //       { card_id: 2, card_name: "Poirot", image_name: "07-detective_poirot" },
  //       { card_id: 3, card_name: "Poirot", image_name: "07-detective_poirot" },
  //     ],
  //   },
  //   {
  //     cards: [
  //       {
  //         card_id: 4,
  //         card_name: "Miss Marple",
  //         image_name: "07-detective_poirot",
  //       },
  //       {
  //         card_id: 5,
  //         card_name: "Miss Marple",
  //         image_name: "07-detective_poirot",
  //       },
  //     ],
  //   },
  //   {
  //     cards: [
  //       { card_id: 1, card_name: "Poirot", image_name: "08-detective_marple" },
  //       { card_id: 2, card_name: "Poirot", image_name: "08-detective_marple" },
  //       { card_id: 3, card_name: "Harley Quin Wildcard", image_name: "14-detective_quin" },
  //     ],
  //   },
  //   {
  //     cards: [
  //       {
  //         card_id: 4,
  //         card_name: "Tommy Beresford",
  //         image_name: "12-detective_tommyberesford",
  //       },
  //       {
  //         card_id: 5,
  //         card_name: "Tuppence Beresford",
  //         image_name: "13-detective_tuppenceberesford",
  //       },
  //     ],
  //   },

  //   {
  //     cards: [
  //       {
  //         card_id: 4,
  //         card_name: "Miss Marple",
  //         image_name: "08-detective_marple",
  //       },
  //       {
  //         card_id: 5,
  //         card_name: "Miss Marple",
  //         image_name: "08-detective_marple",
  //       },
  //     ],
  //   },
  // ];

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (setPlayed.length === 0) {
    return;
  }

  // base dimensions from BackCard.css
  const BASE_WIDTH = 120; // container width
  const BASE_HEIGHT = 180; // container height
  const GAP = 8; // gap-2 = 0.5rem = 8px

  // Use measured container width or fallback to a reasonable default
  const AVAILABLE_WIDTH = containerWidth || 1000;

  // Calculate how many sets fit at full size
  const setsAtFullSize = Math.floor(
    (AVAILABLE_WIDTH + GAP) / (BASE_WIDTH + GAP)
  );

  // Only scale down if we have more sets than fit at full size
  let scaleFactor = 1;
  let perSetWidth = BASE_WIDTH;

  if (setPlayed.length > setsAtFullSize) {
    // Calculate the scale needed to fit all sets
    const totalGapWidth = GAP * (setPlayed.length - 1);
    const availableForCards = AVAILABLE_WIDTH - totalGapWidth;
    const calculatedWidth = availableForCards / setPlayed.length;

    // Don't go below a minimum size
    const MIN_WIDTH = 60;
    perSetWidth = Math.max(MIN_WIDTH, Math.floor(calculatedWidth));
    scaleFactor = perSetWidth / BASE_WIDTH;
  }

  // Determinar si los sets son clicables
  const isClickable = onSetClick && selectionMode === "select-set";

  // Manejar click en un set
  const handleSetClick = (index) => {
    if (isClickable && onSetClick && playerId) {
      onSetClick(playerId, index);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* wrapper allows horizontal scrolling prevention and forces shrinking */}
      <div className="flex gap-2 overflow-hidden justify-center">
        {setPlayed.filter((set) => set.cards && set.cards.length > 0).map((set, index) => (
          <div
            key={index}
            className={`relative ${
              isClickable ? "border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-yellow-400 transition-transform" : ""
            } ${
              selectedSetIndex === index ? "border-2 border-yellow-400 rounded-lg" : ""
            }`}
            style={{
              // Keep full size until we need to shrink
              flex: `0 0 ${perSetWidth}px`,
              width: `${perSetWidth}px`,
              overflow: "hidden",
            }}
            onClick={() => handleSetClick(index)}
          >
            <BackCard
              type="set"
              deck={set.cards.map((carta) => ({
                id: carta.card_id,
                back: `/cards/${carta.image_name}.png`,
                alt: carta.card_name,
              }))}
              containerStyle={{
                // pass scaled container dimensions so inner card sizes scale too
                width: `${perSetWidth}px`,
                height: `${Math.round(BASE_HEIGHT * scaleFactor)}px`,
                position: "relative",
              }}
            />
            {/* Icono de información en el borde superior derecho */}
            <span
              className={`absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-xs font-bold rounded-full cursor-pointer ${
                set.cards.some((c) => c.card_name.toLowerCase() === "harley quin wildcard")
                  ? "bg-green-300/80" // comodín
                  : set.cards.some(
                      (c) => c.card_name.toLowerCase() === "tuppence beresford"
                    ) &&
                    set.cards.some((c) => c.card_name.toLowerCase() === "tommy beresford")
                  ? "bg-blue-300" // hermanos
                  : "bg-white/80" // default
              }`}
              title={`Cantidad de cartas: ${
                set.cards.length
              }\nCompuesto por: ${set.cards
                .map((c) => c.card_name)
                .join(", ")}`}
            >
              i
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
