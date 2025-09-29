import './App.css';
import Home from "../Pages/HomePage";
import GameList from '../GameList';
import { BrowserRouter, Routes, Route } from "react-router-dom";



function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gameList" element={<GameList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
