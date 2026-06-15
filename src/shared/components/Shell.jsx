import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../app/ThemeProvider.jsx";
import { playerColors } from "../../features/player-selector/selectorModes.js";
import { IconDice, IconGames, IconMore, IconSelector } from "./PixelIcons.jsx";

const tabs = [
  { id: "selector", label: "Selector", Icon: IconSelector },
  { id: "dice", label: "Dados", Icon: IconDice },
  { id: "games", label: "Juegos", Icon: IconGames },
];

const themeOptions = [
  { value: "auto", label: "auto" },
  { value: "light", label: "claro" },
  { value: "dark", label: "oscuro" },
];

export function AppShell({
  activeTab,
  onTabChange,
  accent,
  onAccentChange,
  children,
  flush = false,
  tone = "default",
  showNav = true,
  showSettings = showNav,
}) {
  return (
    <div className={`pd-screen pd-screen--${tone}`} style={{ "--pd-accent": accent }}>
      {showSettings && onAccentChange && <SettingsMenu accent={accent} onAccentChange={onAccentChange} />}
      <main className={`pd-body${flush ? " pd-body--flush" : ""}`}>{children}</main>
      {showNav && <GlassBar activeTab={activeTab} onTabChange={onTabChange} />}
    </div>
  );
}

function SettingsMenu({ accent, onAccentChange }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="pd-settings-menu" ref={menuRef}>
      <button
        type="button"
        className="pd-settings-trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Abrir ajustes"
        aria-expanded={isOpen}
        title="Ajustes"
      >
        <IconMore />
      </button>

      {isOpen && (
        <section className="pd-settings-popover" role="dialog" aria-label="Ajustes">
          <Eyebrow>Ajustes</Eyebrow>

          <div className="pd-section">
            <div className="pd-label">Tema</div>
            <div className="pd-seg" role="group" aria-label="Tema">
              {themeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={theme === item.value ? "is-active" : ""}
                  onClick={() => setTheme(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-section">
            <div className="pd-label">Color de acento</div>
            <div className="pd-swatches">
              {playerColors.slice(0, 6).map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`pd-swatch-lg${color === accent ? " is-active" : ""}`}
                  style={{ background: color }}
                  onClick={() => onAccentChange(color)}
                  aria-label={`Usar color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="pd-list">
            <div className="pd-listrow">
              <span>Sonido</span>
              <span className="pd-toggle is-on"><i /></span>
            </div>
            <div className="pd-listrow">
              <span>Vibración</span>
              <span className="pd-toggle is-on"><i /></span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export function GlassBar({ activeTab, onTabChange }) {
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  return (
    <nav className="pd-glassbar-wrap" aria-label="Navegacion principal">
      <div className="pd-glassbar">
        <div className="pd-glassbar__fill" />
        <div className="pd-glassbar__bloom" style={{ left: `${((activeIndex + 0.5) / tabs.length) * 100}%` }} />
        <div className="pd-glassbar__edge" />
        <div className="pd-tabs">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} type="button" className={`pd-tab${id === activeTab ? " is-active" : ""}`} onClick={() => onTabChange(id)}>
              <span className="pd-tab__icon">
                <Icon />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function Eyebrow({ children }) {
  return (
    <div className="pd-eyebrow">
      <i className="pd-dot" />
      {children}
    </div>
  );
}

export function PixelDust({ points }) {
  return (
    <div className="pd-dust" aria-hidden="true">
      {points.map((point, index) => (
        <i key={index} style={{ left: point[0], top: point[1], width: point[2] || 4, height: point[2] || 4 }} />
      ))}
    </div>
  );
}
