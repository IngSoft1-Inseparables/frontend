import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from './containers/waitingRoom/WaitingRoom';
import Game from './containers/game/Game2';
import Lobby from './containers/lobby/Lobby';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;