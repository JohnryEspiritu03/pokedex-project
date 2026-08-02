import { useEffect, useState } from "react";
import "./PokemonModal.css";

const TYPE_COLORS = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

function PokemonModal({ id, onClose, minId = 1, maxId, onNext, onPrevious }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      setError(null);
      setDetails(null);

      try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);

        const pokemonData = await pokemonResponse.json();
        const speciesData = await speciesResponse.json();

        const flavorEntry = speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        );

        const typeResponses = await Promise.all(
          pokemonData.types.map((t) => fetch(t.type.url).then((res) => res.json()))
        );

        const multipliers = {};
        typeResponses.forEach((typeData) => {
          typeData.damage_relations.double_damage_from.forEach((type) => {
            multipliers[type.name] = (multipliers[type.name] || 1) * 2;
          });
          typeData.damage_relations.half_damage_from.forEach((type) => {
            multipliers[type.name] = (multipliers[type.name] || 1) * 0.5;
          });
          typeData.damage_relations.no_damage_from.forEach((type) => {
            multipliers[type.name] = (multipliers[type.name] || 1) * 0;
          });
        });

        const weaknesses = Object.entries(multipliers)
          .filter(([_, multiplier]) => multiplier > 1)
          .sort((a, b) => b[1] - a[1]);

        if (cancelled) return;

        setDetails({
          id: pokemonData.id,
          name: pokemonData.name,
          image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemonData.id
            .toString()
            .padStart(3, "0")}.png`,
          types: pokemonData.types,
          height: pokemonData.height,
          weight: pokemonData.weight,
          abilities: pokemonData.abilities,
          stats: pokemonData.stats,
          weaknesses,
          description: flavorEntry
            ? flavorEntry.flavor_text.replace(/\f|\n/g, " ")
            : "No description available.",
        });
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Failed to fetch Pokemon details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const canGoPrevious = id != null && id > minId;
  const canGoNext = id != null && (maxId == null || id < maxId);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && canGoPrevious) onPrevious();
      if (event.key === "ArrowRight" && canGoNext) onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious, canGoNext, canGoPrevious]);

  if (!id) return null;

  const primaryType = details?.types?.[0]?.type?.name;
  const accentColor = TYPE_COLORS[primaryType] || "#888";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button
        className="modal-nav modal-nav-prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        disabled={!canGoPrevious}
        aria-label="Previous Pokemon"
      >
        &larr;
      </button>

      <div
        className="modal-content"
        style={{ "--accent-color": accentColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close Modal">
          &times;
        </button>

        {loading && <p className="modal-status">Loading details...</p>}
        {error && <p className="modal-error">{error}</p>}

        {details && !loading && (
          <div className="modal-columns">
            <div className="modal-left">
              <p className="modal-id">#{details.id.toString().padStart(3, "0")}</p>

              <div className="modal-image-frame">
                <img src={details.image} alt={details.name} className="modal-image" />
              </div>

              <h2 className="modal-name">
                {details.name.charAt(0).toUpperCase() + details.name.slice(1)}
              </h2>

              <div className="modal-types">
                {details.types.map((t) => {
                  const typeName = t.type.name;
                  const typeColor = TYPE_COLORS[typeName] || "#888";
                  return (
                    <span
                      key={typeName}
                      className="type-badge"
                      style={{
                        "--type-color": typeColor,
                        color: typeColor,
                        borderColor: typeColor,
                      }}
                    >
                      {typeName}
                    </span>
                  );
                })}
              </div>

              <p className="modal-description">{details.description}</p>

              <div className="modal-physical">
                <div>
                  <p className="stat-label">Weight</p>
                  <p className="stat-value">{details.weight / 10} kg</p>
                </div>
                <div>
                  <p className="stat-label">Height</p>
                  <p className="stat-value">{details.height / 10} m</p>
                </div>
              </div>
            </div>

            <div className="modal-right">
              <h3 className="modal-section-title">Weaknesses</h3>
              {details.weaknesses.length === 0 ? (
                <p className="modal-no-weaknesses">No notable weaknesses.</p>
              ) : (
                <ul className="modal-weaknesses">
                  {details.weaknesses.map(([typeName, multiplier]) => {
                    const typeColor = TYPE_COLORS[typeName] || "#888";
                    return (
                      <li
                        key={typeName}
                        className="type-badge weakness-badge"
                        style={{
                          "--type-color": typeColor,
                          color: typeColor,
                          borderColor: typeColor,
                        }}
                      >
                        {typeName} x{multiplier}
                      </li>
                    );
                  })}
                </ul>
              )}

              <h3 className="modal-section-title">Abilities</h3>
              <ul className="modal-abilities">
                {details.abilities.map((ability) => (
                  <li key={ability.ability.name} className="modal-ability">
                    {ability.ability.name}
                    {ability.is_hidden ? " (hidden)" : ""}
                  </li>
                ))}
              </ul>

              <h3 className="modal-section-title">Base Stats</h3>
              <ul className="modal-stats">
                {details.stats.map((stat) => (
                  <li key={stat.stat.name} className="modal-stat">
                    <span className="modal-stat-name">{stat.stat.name}</span>
                    <div className="modal-stat-bar-track">
                      <div
                        className="modal-stat-bar-fill"
                        style={{
                          width: `${Math.min((stat.base_stat / 180) * 100, 100)}%`,
                          background: accentColor,
                        }}
                      />
                    </div>
                    <span className="modal-stat-value">{stat.base_stat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <button
        className="modal-nav modal-nav-next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        disabled={!canGoNext}
        aria-label="Next Pokemon"
      >
        &rarr;
      </button>
    </div>
  );
}

export default PokemonModal;