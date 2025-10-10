import './FaceCard.css'

export default function FaceCard({ imageName, cardName, showBack = false, imageBackName }) {
  if (!imageName) {
    return null
  }

  // Determinar qué imagen mostrar
  const imageToShow = showBack && imageBackName ? imageBackName : imageName
  const imageSrc = `/cards/${imageToShow}.png`
  const altText = cardName || imageName

  return (<img className="face-card" src={imageSrc} alt={altText} />)
}
