import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from '../waitingRoom/WaitingRoom.jsx';
import Game from '../game/Game.jsx';
import Lobby from '../lobby/Lobby.jsx';
import GameList from '../../pages/GameList.jsx';
import Decks from '../../pages/Decks.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<Game />} />
        <Route path="/games" element={<GameList />} />
        <Route path="/deck" element={<Decks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;