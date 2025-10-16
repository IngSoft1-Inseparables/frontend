import "./FaceCard.css";
import { useDraggable } from "@dnd-kit/core";

export default function FaceCard({
  cardId,
  imageName,
  cardName,
  showBack = false,
  imageBackName,
  onSelect,
  isSelected = false,
  onDragInitiate,
  isOverlay = false,
  // style: externalStyle,
}) {
  if (!imageName) {
    return null;
  }

  // Determinar qué imagen mostrar
  const imageToShow = showBack && imageBackName ? imageBackName : imageName;
  const imageSrc = `/cards/${imageToShow}.png`;
  const altText = cardName || imageName;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card-${cardId}`,
      data: { cardId, cardName, imageName },
      disabled: isOverlay,
    });

  const handleDragStart = (event) => {
    event.preventDefault();
    if (onDragInitiate) onDragInitiate(); //  llama al padre
  };

  // Aplicar transform cuando se arrastra
  const style =
    transform && !isOverlay
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "grab",
          transition: "none",
        }
      : {
          cursor: "grab",
          transition: "none",
        };
  // const finalStyle = externalStyle
  //   ? { ...internalStyle, ...externalStyle }
  //   : internalStyle;

  return (
  <img
      ref={setNodeRef}
      className={`face-card ${
        isSelected && !isOverlay ? "face-card-selected" : ""
      } ${isOverlay ? 'face-card-overlay' : ''} `} 
      onClick={onSelect}
      src={imageSrc}
      alt={altText}
      style={style} // Solo aplica el transform de dnd-kit o el cursor/transition
      onDragStart={!isOverlay ? handleDragStart : undefined}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
    />
  );
}
