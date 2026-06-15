import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { AppShell, Eyebrow, PixelDust } from "../../shared/components/Shell.jsx";
import { IconCheck, IconOrder, IconStart, IconTeams } from "../../shared/components/PixelIcons.jsx";
import { assignTeams, buildOrder, chooseWinner } from "./selectorEngine.js";
import { playerColors, playerEmoji, selectorModes } from "./selectorModes.js";

const MAX_TOUCH_PLAYERS = 5;
const MAX_SELECTOR_PLAYERS = 30;
const STARTER_COUNTDOWN_SECONDS = 3;
const STARTER_COUNTDOWN_STEP_MS = 1000;
const STARTER_WIN_DELAY_MS = 960;
const TOUCH_EDGE_PADDING = 40;

const modeIcons = {
  starter: IconStart,
  order: IconOrder,
  teams: IconTeams,
};

const dicePositions = [
  [0, 0],
  [188, 0],
  [94, 94],
  [0, 188],
  [188, 188],
];

export default function PlayerSelector({ accent, activeTab, onTabChange, onAccentChange }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [mode, setMode] = useState("starter");
  const [teamCount, setTeamCount] = useState(2);
  const [phase, setPhase] = useState("setup");
  const [claimed, setClaimed] = useState([]);
  const [result, setResult] = useState(null);

  const maxPlayers = MAX_SELECTOR_PLAYERS;
  const maxTeams = Math.max(2, playerCount - 1);
  const isDiceFaceMode = playerCount <= MAX_TOUCH_PLAYERS;
  const ready = claimed.length >= playerCount;

  const cells = useMemo(() => {
    const count = isDiceFaceMode ? playerCount : Math.max(30, Math.ceil(playerCount / 5) * 10);
    return Array.from({ length: count }, (_, index) => index);
  }, [isDiceFaceMode, playerCount]);

  function reset(nextPhase = "setup") {
    setClaimed([]);
    setResult(null);
    setPhase(nextPhase);
  }

  function changePlayerCount(delta) {
    setPlayerCount((value) => {
      const next = Math.max(2, Math.min(maxPlayers, value + delta));
      setTeamCount((teams) => Math.min(Math.max(2, teams), Math.max(2, next - 1)));
      return next;
    });
    reset("setup");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    reset("setup");
  }

  function claimCell(cell) {
    if (phase !== "claim" || claimed.some((player) => player.cell === cell) || claimed.length >= playerCount) return;
    const index = claimed.length;
    setClaimed((players) => [
      ...players,
      {
        id: `player_${index + 1}`,
        label: playerEmoji[index % playerEmoji.length],
        color: playerColors[index % playerColors.length],
        cell,
      },
    ]);
  }

  function resolveSelection() {
    if (!ready) return;
    if (mode === "order") setResult({ type: "order", players: buildOrder(claimed) });
    else if (mode === "teams") setResult({ type: "teams", players: assignTeams(claimed, teamCount) });
    else setResult({ type: "starter", winner: chooseWinner(claimed), players: claimed });
    setPhase("result");
  }

  const resolveStarterTouch = useCallback((winner, players) => {
    setResult({ type: "starter", winner, players });
    setPhase("result");
  }, []);

  if (phase === "claim") {
    if (mode === "starter" && isDiceFaceMode) {
      return (
        <StarterTouchSelector
          accent={accent}
          activeTab={activeTab}
          onTabChange={onTabChange}
          maxPlayers={MAX_TOUCH_PLAYERS}
          onBack={() => reset("setup")}
          onComplete={resolveStarterTouch}
        />
      );
    }

    return (
      <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange}>
        <Eyebrow>{isDiceFaceMode ? "Selector · Modo dado" : "Selector · Parrilla"}</Eyebrow>
        <h1 className="pd-title pd-title--md">{isDiceFaceMode ? "Mantén pulsado tu cuadrado" : "Elige tu píxel"}</h1>
        <p className="pd-sub">{modeCopy(mode, teamCount, isDiceFaceMode)}</p>

        <div className="pd-claim-stage">
          <PixelDust points={[[24, 30], [310, 60], [40, 360], [300, 380, 6], [180, 24]]} />
          {isDiceFaceMode ? (
            <div className="pd-diceface">
              {cells.map((cell) => {
                const player = claimed.find((item) => item.cell === cell);
                const [left, top] = dicePositions[cell];
                return (
                  <button
                    key={cell}
                    type="button"
                    className={`pd-claim${player ? " is-claimed" : ""}`}
                    style={{ left, top, background: player?.color }}
                    onPointerDown={() => claimCell(cell)}
                    aria-label={player ? `${player.label} seleccionado` : "Reclamar cuadrado"}
                  >
                    {player?.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pd-grid-claim">
              {cells.map((cell) => {
                const player = claimed.find((item) => item.cell === cell);
                return (
                  <button
                    key={cell}
                    type="button"
                    className={`pd-pix${player ? " is-claimed" : ""}`}
                    style={player ? { background: player.color } : undefined}
                    onClick={() => claimCell(cell)}
                    aria-label={player ? `${player.label} seleccionado` : "Reclamar pixel"}
                  >
                    {player?.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="pd-status-row">
          <span className="pd-label">{claimed.length} / {playerCount} listos</span>
          <ProgressDots current={claimed.length} total={playerCount} />
        </div>
        <div className="pd-action-row">
          <button className="pd-cta pd-cta--ghost" type="button" onClick={() => reset("setup")}>Volver</button>
          <button className="pd-cta" type="button" disabled={!ready} onClick={resolveSelection}>Resolver</button>
        </div>
      </AppShell>
    );
  }

  if (phase === "result" && result) {
    return (
      <SelectorResult
        accent={accent}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onAccentChange={onAccentChange}
        mode={mode}
        result={result}
        onReset={() => reset("setup")}
        onRepeat={() => reset("claim")}
      />
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange}>
      <h1 className="pd-title pd-title--lg">¿Quién empieza?</h1>

      <section className="pd-section">
        <div className="pd-label">Jugadores</div>
        <div className="pd-bigcount">
          <button type="button" className="pd-cbtn" disabled={playerCount <= 2} onClick={() => changePlayerCount(-1)}>–</button>
          <span className="pd-num">{playerCount}</span>
          <button type="button" className="pd-cbtn" disabled={playerCount >= maxPlayers} onClick={() => changePlayerCount(1)}>+</button>
        </div>
      </section>

      <section className="pd-section">
        <div className="pd-label">Modo</div>
        <div className="pd-modes">
          {selectorModes.map((item) => {
            const Icon = modeIcons[item.id];
            const isActive = mode === item.id;
            return (
              <button key={item.id} type="button" className={`pd-mode${isActive ? " is-active" : ""}`} onClick={() => changeMode(item.id)}>
                <span className="pd-mode__icon"><Icon /></span>
                <span className="pd-mode__text">
                  <span className="pd-mode__name">{item.name}</span>
                  <span className="pd-mode__desc">{item.description}</span>
                </span>
                {isActive && <span className="pd-mode__check"><IconCheck /></span>}
              </button>
            );
          })}
        </div>
      </section>

      {mode === "teams" && (
        <section className="pd-section">
          <div className="pd-label">Equipos</div>
          <div className="pd-stepper">
            <button type="button" onClick={() => setTeamCount((value) => Math.max(2, value - 1))}>–</button>
            <span>{teamCount}</span>
            <button type="button" onClick={() => setTeamCount((value) => Math.min(maxTeams, value + 1))}>+</button>
          </div>
        </section>
      )}

      <div className="pd-spacer" />
      <button className="pd-cta" type="button" onClick={() => reset("claim")}>Empezar</button>
    </AppShell>
  );
}

function StarterTouchSelector({ accent, activeTab, onTabChange, maxPlayers, onBack, onComplete }) {
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [winner, setWinner] = useState(null);
  const playersRef = useRef(players);
  const completionTimerRef = useRef(null);

  const commitPlayers = useCallback((nextPlayers) => {
    playersRef.current = nextPlayers;
    setPlayers(nextPlayers);
  }, []);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => () => window.clearTimeout(completionTimerRef.current), []);

  useEffect(() => {
    if (winner) return undefined;
    if (!players.length) {
      setCountdown(null);
      return undefined;
    }

    setCountdown(STARTER_COUNTDOWN_SECONDS);

    const timers = [];
    for (let step = 1; step < STARTER_COUNTDOWN_SECONDS; step += 1) {
      timers.push(window.setTimeout(() => {
        setCountdown(STARTER_COUNTDOWN_SECONDS - step);
      }, step * STARTER_COUNTDOWN_STEP_MS));
    }

    timers.push(window.setTimeout(() => {
      const currentPlayers = playersRef.current;
      if (!currentPlayers.length) {
        setCountdown(null);
        return;
      }

      const selected = chooseWinner(currentPlayers);
      setWinner(selected);
      setCountdown(null);
      triggerWinnerHaptic();
      completionTimerRef.current = window.setTimeout(() => {
        onComplete(selected, currentPlayers);
      }, STARTER_WIN_DELAY_MS);
    }, STARTER_COUNTDOWN_SECONDS * STARTER_COUNTDOWN_STEP_MS));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [onComplete, players.length, winner]);

  function handlePointerDown(event) {
    if (winner || event.button > 0) return;
    event.preventDefault();
    captureStagePointer(event.currentTarget, event.pointerId);

    const currentPlayers = playersRef.current;
    if (currentPlayers.some((player) => player.pointerId === event.pointerId) || currentPlayers.length >= maxPlayers) return;

    const slot = getNextOpenSlot(currentPlayers, maxPlayers);
    if (slot === -1) return;

    const point = getStagePoint(event);
    const nextPlayers = [
      ...currentPlayers,
      {
        id: `player_${slot + 1}`,
        pointerId: event.pointerId,
        label: playerEmoji[slot % playerEmoji.length],
        color: playerColors[slot % playerColors.length],
        slot,
        x: point.x,
        y: point.y,
      },
    ];

    commitPlayers(nextPlayers);
    triggerSelectionHaptic();
  }

  function handlePointerMove(event) {
    if (winner) return;
    const currentPlayers = playersRef.current;
    if (!currentPlayers.some((player) => player.pointerId === event.pointerId)) return;

    event.preventDefault();
    const point = getStagePoint(event);
    commitPlayers(currentPlayers.map((player) => (
      player.pointerId === event.pointerId ? { ...player, x: point.x, y: point.y } : player
    )));
  }

  function releasePointer(event) {
    if (winner) return;
    const currentPlayers = playersRef.current;
    const nextPlayers = currentPlayers.filter((player) => player.pointerId !== event.pointerId);
    if (nextPlayers.length === currentPlayers.length) return;

    releaseStagePointer(event.currentTarget, event.pointerId);
    commitPlayers(nextPlayers);
    triggerSelectionHaptic();
  }

  const resolving = Boolean(winner);

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} flush showNav={false}>
      <section className={`pd-touch-selector${resolving ? " is-resolving" : ""}`}>
        <div
          className="pd-touch-surface"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onLostPointerCapture={releasePointer}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="Selector táctil de jugador inicial"
        >
          <div className="pd-touch-countdown" aria-live="polite">{countdown}</div>
          {players.map((player) => {
            const isWinner = winner?.pointerId === player.pointerId;
            return (
              <div
                key={player.pointerId}
                className={`pd-touch-player${isWinner ? " is-winner" : ""}${winner && !isWinner ? " is-faded" : ""}`}
                style={{
                  "--player-x": `${player.x}px`,
                  "--player-y": `${player.y}px`,
                  "--player-color": player.color,
                }}
              >
                <span className="pd-touch-player__label">{player.label}</span>
                <span className="pd-touch-player__pixel" />
              </div>
            );
          })}
        </div>

        <div className="pd-touch-hud" onPointerDown={(event) => event.stopPropagation()}>
          <button className="pd-touch-back" type="button" onClick={onBack}>Volver</button>
          <div className="pd-touch-meta">
            <span>Jugador inicial</span>
            <strong>{players.length} / {maxPlayers}</strong>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div className="pd-progress">
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < current ? "is-on" : ""} />
      ))}
    </div>
  );
}

function SelectorResult({ accent, activeTab, onTabChange, onAccentChange, mode, result, onReset, onRepeat }) {
  if (mode === "starter") {
    return (
      <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={result.winner?.color || accent} tone="winner" flush showNav={false}>
        <div className="pd-result pd-result--starter">
          <div className="pd-result__winner-lockup">
            <div className="pd-result__emoji pd-result__emoji--winner">{result.winner?.label}</div>
            <h1 className="pd-title pd-title--xl">Primer jugador</h1>
          </div>
          <button className="pd-cta pd-cta--on-accent" type="button" onClick={onRepeat}>Repetir</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange}>
      <Eyebrow>{mode === "order" ? "Orden final" : "Equipos"}</Eyebrow>
      <h1 className="pd-title pd-title--md">{mode === "order" ? "Turno a turno" : "Mesa equilibrada"}</h1>
      <div className="pd-result-list">
        {result.players
          .slice()
          .sort((a, b) => (a.order || a.team) - (b.order || b.team))
          .map((player) => (
            <div key={player.id} className="pd-result-row">
              <span className="pd-result-row__mark" style={{ background: player.color }}>{player.label}</span>
              <span>{mode === "order" ? `Posición ${player.order}` : `Equipo ${player.team}`}</span>
            </div>
          ))}
      </div>
      <div className="pd-spacer" />
      <div className="pd-action-row">
        <button className="pd-cta pd-cta--ghost" type="button" onClick={onReset}>Nuevo</button>
        <button className="pd-cta" type="button" onClick={onRepeat}>Repetir</button>
      </div>
    </AppShell>
  );
}

function modeCopy(mode, teamCount, isDiceFaceMode) {
  if (mode === "order") return "Cada jugador reclama un píxel. Después revelamos el orden.";
  if (mode === "teams") return `Cada jugador reclama un píxel. Después repartimos ${teamCount} equipos equilibrados.`;
  if (isDiceFaceMode) return "Cada jugador coloca un dedo. La cuenta atrás elige el primer turno.";
  return "Cada jugador reclama un píxel. Después revelamos el primer jugador.";
}

function getNextOpenSlot(players, maxSlots) {
  const usedSlots = new Set(players.map((player) => player.slot));
  for (let slot = 0; slot < maxSlots; slot += 1) {
    if (!usedSlots.has(slot)) return slot;
  }
  return -1;
}

function getStagePoint(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {
    x: clamp(x, TOUCH_EDGE_PADDING, rect.width - TOUCH_EDGE_PADDING),
    y: clamp(y, TOUCH_EDGE_PADDING, rect.height - TOUCH_EDGE_PADDING),
  };
}

function clamp(value, min, max) {
  if (max < min) return value;
  return Math.min(Math.max(value, min), max);
}

function captureStagePointer(element, pointerId) {
  try {
    element.setPointerCapture?.(pointerId);
  } catch (error) {
    // Pointer capture can be unavailable for synthetic or interrupted pointers.
  }
}

function releaseStagePointer(element, pointerId) {
  try {
    if (element.hasPointerCapture?.(pointerId)) {
      element.releasePointerCapture?.(pointerId);
    }
  } catch (error) {
    // Pointer capture can be unavailable for synthetic or interrupted pointers.
  }
}

async function triggerSelectionHaptic() {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch (error) {
    // Haptics are best-effort; never let device feedback break a touch.
  }
}

async function triggerWinnerHaptic() {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  } catch (error) {
    // Haptics are best-effort; never let device feedback break a touch.
  }
}
