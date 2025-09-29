import RegularDeck from "../components/RegularDeck/RegularDeck"
import DiscardDeck from "../components/DiscardDeck/DiscardDeck"

function Decks() {
  return (
    <div>
        <DiscardDeck/>
        <RegularDeck />
    </div>
    
  )
}

export default Decks