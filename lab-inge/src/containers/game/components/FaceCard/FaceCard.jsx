import './FaceCard.css'
import { useDraggable } from '@dnd-kit/core';

export default function FaceCard({ cardId, imageName, cardName, showBack = false, imageBackName, onSelect ,isSelected = false, onDragInitiate }) {
  if (!imageName) {
    return null
  }

  // Determinar qué imagen mostrar
  const imageToShow = showBack && imageBackName ? imageBackName : imageName
  const imageSrc = `/cards/${imageToShow}.png`
  const altText = cardName || imageName

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${cardId}`,
    data: { cardId, cardName, imageName }
  });

  const handleDragStart = (event) => {
  event.preventDefault(); // opcional
  if (onDragInitiate) onDragInitiate(); // 🔥 llama al padre
};

  // Aplicar transform cuando se arrastra
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: 'none',
  } : {
    cursor: 'grab',
  };

  return (
    <img
      ref={setNodeRef}
      className={`face-card ${isSelected ? 'face-card-selected' : ''}`}
      onClick={onSelect}
      src={imageSrc}
      alt={altText}
      style={style}
      onDragStart={handleDragStart}
      {...listeners}
      {...attributes}
    />
  )
}
