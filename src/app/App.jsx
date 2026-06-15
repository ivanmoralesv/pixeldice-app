import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider.jsx";
import DiceRoller from "../features/dice-roller/DiceRoller.jsx";
import GamesGallery from "../features/games-gallery/GamesGallery.jsx";
import PlayerSelector from "../features/player-selector/PlayerSelector.jsx";
import { useLocalStorage } from "../shared/hooks/useLocalStorage.js";

function PixelDiceApp() {
  const [activeTab, setActiveTab] = useState("selector");
  const [accent, setAccent] = useLocalStorage("pixel-dice.accent", "#E8FF00");

  return (
    <div className="pd-app">
      {activeTab === "selector" && (
        <PlayerSelector accent={accent} activeTab={activeTab} onTabChange={setActiveTab} onAccentChange={setAccent} />
      )}
      {activeTab === "dice" && (
        <DiceRoller accent={accent} activeTab={activeTab} onTabChange={setActiveTab} onAccentChange={setAccent} />
      )}
      {activeTab === "games" && (
        <GamesGallery accent={accent} activeTab={activeTab} onTabChange={setActiveTab} onAccentChange={setAccent} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PixelDiceApp />
    </ThemeProvider>
  );
}
