import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from './containers/waitingRoom/WaitingRoom.jsx';
import Game from './containers/game/Game.jsx';
import GameList from './containers/gameList/GameList.jsx';
import Home from './containers/homePages/HomePage.jsx';

function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/games" element={<GameList />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
