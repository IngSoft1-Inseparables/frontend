import HandCard from "../components/HandCard/HandCard"

function Hand() {
  // Datos de ejemplo en el nuevo formato
  const exampleCards = [
    { card_id: 1, image_name: "07-detective_poirot", card_name: "Poirot", image_back_name: "01-card_back" },
    { card_id: 2, image_name: "08-detective_marple", card_name: "Marple", image_back_name: "01-card_back" },
    { card_id: 3, image_name: "09-detective_satterthwaite", card_name: "Satterthwaite", image_back_name: "01-card_back" },
    { card_id: 4, image_name: "10-detective_pyne", card_name: "Pyne", image_back_name: "01-card_back" },
    { card_id: 5, image_name: "11-detective_brent", card_name: "Brent", image_back_name: "01-card_back" },
    { card_id: 6, image_name: "12-detective_tommyberesford", card_name: "Tommy", image_back_name: "01-card_back" }
  ];

  return (
    <div>
        <HandCard playerCards={exampleCards} />
    </div>
    
  )
}

export default Hand