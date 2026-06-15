import { AppShell, Eyebrow } from "../../shared/components/Shell.jsx";
import { useTheme } from "../../app/ThemeProvider.jsx";
import { playerColors } from "../player-selector/selectorModes.js";
import { gamesSeed } from "./gamesSeed.js";

export default function GamesGallery({ accent, activeTab, onTabChange, onAccentChange }) {
  const { theme, setTheme } = useTheme();
  const featuredGame = gamesSeed.find((game) => game.featured) || gamesSeed[0];

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent}>
      <Eyebrow>Juegos · Última novedad</Eyebrow>

      <section className="pd-game-feature">
        <div className="pd-omerta-card" aria-label="Portada de Omerta">
          <div className="pd-omerta-card__mark">OM</div>
          <div className="pd-omerta-card__title">Omertà</div>
          <div className="pd-omerta-card__line">Callar o traicionar</div>
        </div>

        <div className="pd-game-feature__head">
          <h1 className="pd-title pd-title--xl">{featuredGame.title}</h1>
          <span className="pd-status-badge">Disponible</span>
        </div>
        <p className="pd-sub pd-sub--wide">{featuredGame.summary}</p>

        <div className="pd-facts">
          <Fact label="Jugadores" value={`${featuredGame.playersMin} - ${featuredGame.playersMax}`} />
          <Fact label="Duración" value={`${featuredGame.durationMinutes} min`} />
          <Fact label="Tipo" value={featuredGame.type} />
          <Fact label="Estado" value="Disponible" />
        </div>

        <a className="pd-link" href={featuredGame.sourceUrl} target="_blank" rel="noreferrer">
          Descubre Omertà
        </a>
      </section>

      <section className="pd-settings">
        <Eyebrow>Ajustes</Eyebrow>
        <div className="pd-section">
          <div className="pd-label">Tema</div>
          <div className="pd-seg" role="group" aria-label="Tema">
            {["auto", "light", "dark"].map((value) => (
              <button key={value} type="button" className={theme === value ? "is-active" : ""} onClick={() => setTheme(value)}>
                {value}
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
          <div className="pd-listrow">
            <span>Catálogo de juegos</span>
            <span>Seed local</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Fact({ label, value }) {
  return (
    <span className="pd-fact">
      <small>{label}</small>
      {value}
    </span>
  );
}
