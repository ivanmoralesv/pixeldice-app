import { AppShell, Eyebrow } from "../../shared/components/Shell.jsx";
import { gamesSeed } from "./gamesSeed.js";

export default function GamesGallery({ accent, activeTab, onTabChange, onAccentChange }) {
  const featuredGame = gamesSeed.find((game) => game.featured) || gamesSeed[0];

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} accent={accent} onAccentChange={onAccentChange}>
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
