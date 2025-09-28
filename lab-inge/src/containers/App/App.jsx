import "./App.css";
import GameModalController from "./GameModalController";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from "../waitingRoom/WaitingRoom";
function App() {
  return (
    <div className="min-h-screen bg-[#340c0c] flex">
      {/* <GameModalController /> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GameModalController />} />
          {/* <Route path="/lobby" element={<Lobby />} /> */}
          <Route path="/waiting" element={<WaitingRoom />} />
          {/* <Route path="/game" element={<Game />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
