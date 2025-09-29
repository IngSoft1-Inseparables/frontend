import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from './containers/waitingRoom/WaitingRoom.jsx';
import Game from './containers/game/Game.jsx';
import Lobby from './containers/lobby/Lobby.jsx';
import GameList from './pages/GameList.jsx';
import Hand from './pages/Hand.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<Game />} />
        <Route path="/games" element={<GameList />} />
        <Route path="/hand" element={<Hand />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;