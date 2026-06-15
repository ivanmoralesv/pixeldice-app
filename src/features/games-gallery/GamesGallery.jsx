import { AppShell } from "../../shared/components/Shell.jsx";
import { FoilCard } from "./FoilCard.jsx";
import { gamesSeed } from "./gamesSeed.js";

export default function GamesGallery({ accent, activeTab, onTabChange, onAccentChange }) {
  const game = gamesSeed.find((item) => item.featured) || gamesSeed[0];
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      accent={accent}
      onAccentChange={onAccentChange}
      tone="omerta"
    >
      <section className="pd-omerta-feature" id="juegos">
        <div className="pd-omerta-feature__cover">
          <FoilCard
            width={260}
            parallax={1}
            depth={0}
            motion="drift"
            foil={0.8}
            reduced={reduced}
            href={game.sourceUrl}
          />
        </div>

        <h1 className="pd-omerta-feature__title">{game.name}</h1>
        <p className="pd-omerta-feature__tagline">{game.tagline}</p>

        {game.desc.map((paragraph, index) => (
          <p key={index} className="pd-omerta-feature__desc">{paragraph}</p>
        ))}

        <div className="pd-omerta-feature__tech">
          <div className="pd-omerta-feature__techlabel">{game.techLabel}</div>
          <div className="pd-omerta-meta">
            {game.meta.map((row) => (
              <div key={row.k} className="pd-omerta-meta__row">
                <span className="pd-omerta-meta__k">{row.k}</span>
                <span className="pd-omerta-meta__v">{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        <a className="pd-omerta-feature__cta" href={game.sourceUrl} target="_blank" rel="noreferrer">
          {game.cta} <span aria-hidden="true">→</span>
        </a>
      </section>
    </AppShell>
  );
}
