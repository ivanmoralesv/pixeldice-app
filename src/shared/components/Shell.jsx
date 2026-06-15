import { IconDice, IconGames, IconSelector } from "./PixelIcons.jsx";

const tabs = [
  { id: "selector", label: "Selector", Icon: IconSelector },
  { id: "dice", label: "Dados", Icon: IconDice },
  { id: "games", label: "Juegos", Icon: IconGames },
];

export function AppShell({ activeTab, onTabChange, accent, children, flush = false, tone = "default", showNav = true }) {
  return (
    <div className={`pd-screen pd-screen--${tone}`} style={{ "--pd-accent": accent }}>
      <main className={`pd-body${flush ? " pd-body--flush" : ""}`}>{children}</main>
      {showNav && <GlassBar activeTab={activeTab} onTabChange={onTabChange} />}
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
