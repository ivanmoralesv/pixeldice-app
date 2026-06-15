import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/Shell.jsx";
import { useTheme } from "../../app/ThemeProvider.jsx";
import { addDieToPool, defaultPool, diceTypes, poolLabel, rollPool, updateDieQuantity } from "./diceEngine.js";
import { createSavedPool, loadSavedPools, savePoolList } from "./diceStorage.js";
import DiceScene from "./DiceScene.jsx";

const swatches = ["#050505", "#E8FF00", "#4DFF1A", "#00E5FF", "#FF2E9A", "#B026FF", "#FF7A00"];

export default function DiceRoller({ accent, activeTab, onTabChange, onAccentChange }) {
  const { isDark } = useTheme();
  const [pool, setPool] = useState(defaultPool);
  const [selectedColor, setSelectedColor] = useState(accent);
  const [savedPools, setSavedPools] = useState(loadSavedPools);
  const [roll, setRoll] = useState(() => rollPool(defaultPool));
  const [view, setView] = useState("builder");
  const activeDiceCount = pool.reduce((sum, die) => sum + die.quantity, 0);
  const breakdown = useMemo(() => summarizeRoll(roll), [roll]);

  function setQuantity(sides, delta) {
    setPool((current) => updateDieQuantity(current, sides, delta));
  }

  function addDie(sides) {
    setPool((current) => addDieToPool(current, sides, selectedColor));
  }

  function launchRoll() {
    const nextRoll = rollPool(pool);
    setRoll(nextRoll);
    setView("roll");
  }

  function saveCurrentPool() {
    const name = poolLabel(pool) || "Pool vacio";
    const next = [createSavedPool(name, pool), ...savedPools].slice(0, 8);
    setSavedPools(next);
    savePoolList(next);
  }

  function loadPool(savedPool) {
    setPool(savedPool.dice);
    setView("builder");
  }

  if (view === "roll") {
    return (
      <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange} flush showNav={false} onClose={() => setView("builder")}>
        <div className="pd-roll-view">
          <DiceScene key={roll.id} roll={roll} isDark={isDark} />
          <div className="pd-roll-view__top">
            <div className="pd-chips">
              {breakdown.map((item) => (
                <span key={item.sides} className="pd-chip">{item.quantity}xd{item.sides} {"->"} {item.total}</span>
              ))}
            </div>
          </div>
          <div className="pd-roll-view__bottom">
            <div>
              <span className="pd-mark pd-label">Total</span>
              <div className="pd-roll-total">{roll.total}</div>
            </div>
            <div className="pd-roll-actions">
              <button type="button" className="pd-pill-button" onClick={() => setView("builder")}>Editar</button>
              <button type="button" className="pd-pill-button" onClick={launchRoll}>Tirar de nuevo</button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange}>
      <div className="pd-page-head">
        <h1 className="pd-title pd-title--lg">Tu pool</h1>
        <button type="button" className="pd-text-action" onClick={saveCurrentPool}>Guardar</button>
      </div>

      <section className="pd-pool">
        {pool.map((die) => (
          <div key={die.id} className="pd-poolrow">
            <span className="pd-die-mini" style={{ "--die-color": die.color }}>
              d{die.sides}
            </span>
            <span className="pd-poolrow__meta">
              <strong>d{die.sides}</strong>
              <small>
                {die.color !== "#050505" && <i className="pd-swatch" style={{ background: die.color, borderColor: die.color }} />}
                {die.color === "#050505" ? "Estándar · números" : "Variante · color propio"}
              </small>
            </span>
            <span className="pd-qty">
              <button type="button" onClick={() => setQuantity(die.sides, -1)}>–</button>
              <span>{die.quantity}</span>
              <button type="button" onClick={() => setQuantity(die.sides, 1)}>+</button>
            </span>
          </div>
        ))}
      </section>

      <section className="pd-section">
        <div className="pd-label">Añadir dado</div>
        <div className="pd-chips">
          {diceTypes.map((sides) => (
            <button key={sides} type="button" className="pd-chip" onClick={() => addDie(sides)}>d{sides}</button>
          ))}
        </div>
      </section>

      <section className="pd-section">
        <div className="pd-label">Color</div>
        <div className="pd-swatches">
          {swatches.map((color) => (
            <button
              key={color}
              type="button"
              className={`pd-swatch-lg${selectedColor === color ? " is-active" : ""}`}
              style={{ background: color }}
              onClick={() => {
                setSelectedColor(color);
                if (color !== "#050505") onAccentChange(color);
              }}
              aria-label={`Usar color ${color}`}
            />
          ))}
        </div>
      </section>

      {savedPools.length > 0 && (
        <section className="pd-saved">
          <div className="pd-label">Listas guardadas</div>
          {savedPools.map((savedPool) => (
            <button key={savedPool.id} type="button" className="pd-saved-row" onClick={() => loadPool(savedPool)}>
              <span>{savedPool.name}</span>
              <small>Cargar</small>
            </button>
          ))}
        </section>
      )}

      <div className="pd-spacer" />
      <button className="pd-cta" type="button" disabled={activeDiceCount === 0} onClick={launchRoll}>
        Tirar {activeDiceCount} dados
      </button>
    </AppShell>
  );
}

function summarizeRoll(roll) {
  const map = new Map();
  for (const die of roll.dice) {
    const current = map.get(die.sides) || { sides: die.sides, quantity: 0, total: 0 };
    current.quantity += 1;
    current.total += die.value;
    map.set(die.sides, current);
  }
  return [...map.values()].sort((a, b) => a.sides - b.sides);
}
