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
  isStatic = false, // <-- nuevo prop
}) {
  if (!imageName) return null;

  const imageToShow = showBack && imageBackName ? imageBackName : imageName;
  const imageSrc = `/cards/${imageToShow}.png`;
  const altText = cardName || imageName;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card-${cardId}`,
      data: { cardId, cardName, imageName },
      disabled: isStatic, // si es estática, deshabilita drag
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isStatic ? "default" : isDragging ? "grabbing" : "grab",
        transition: "none",
      }
    : { cursor: isStatic ? "default" : "grab", transition: "none" };

  return (
    <img
      ref={setNodeRef}
      className={`face-card ${isSelected ? "face-card-selected" : ""}`}
      onClick={!isStatic ? onSelect : undefined} // solo click si no es estática
      src={imageSrc}
      alt={altText}
      style={style}
      {...(!isStatic ? listeners : {})}
      {...(!isStatic ? attributes : {})}
    />
  );
}
