import "./App.css";
import GameModalController from "./containers/formCreateGame/GameModalController";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from "./containers/waitingRoom/WaitingRoom";
function App() {
  return (
    <div className="min-h-screen bg-[#340c0c] flex">
      {/* <GameModalController /> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameModalController />} />
          <Route path="/waiting" element={<WaitingRoom />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
