import {useEffect, useState} from "react";
import "./PokemonModal.css";

function PokemonModal({id, onClose}) {
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

            try{
                const [pokemonResponse, speciesResponse] = await Promise.all([
                    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
                    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
                ]);

                const pokemonData = await pokemonResponse.json();
                const speciesData = await speciesResponse.json();

                const flavorEntry = speciesData.flavor_text_entries.find(
                    (entry) => entry.language.name === "en"
                );

                if (cancelled) return;

                setDetails({
                    id: pokemonData.id,
                    name: pokemonData.name,
                    image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemonData.id.toString().padStart(3, "0")}.png`,
                    types: pokemonData.types,
                    height: pokemonData.height,
                    weight: pokemonData.weight,
                    abilities: pokemonData.abilities,
                    stats: pokemonData.stats,
                    description: flavorEntry ? flavorEntry.flavor_text.replace(/\f|\n/g, " ") : "No description available.", // Clean up the description text
                });
            } catch (err){
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

    

    // Close on escape key press
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    if (!id) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close Modal">
                    &times;
                </button>

                {loading && <p>Loading details...</p>}
                {error && <p className="modal-error">{error}</p>}
                
                {details && !loading && (
                    <>
                        <h2 className="modal-name">
                            #{details.id} {details.name}
                        </h2>
                        <img src={details.image} alt={details.name} className="modal-image"/>

                        <div className="modal-types">
                            {details.types.map((type) => (
                                <span key={type.type.name} className="type-badge">
                                    {type.type.name}
                                </span>
                            ))}
                        </div>

                        <p className = "modal-description">{details.description}</p>

                        <div className="modal-physical">
                            <span>Height: {details.height / 10} m</span>
                            <span>Weight: {details.weight / 10} kg</span>
                        </div>

                        <h3>Abilities</h3>
                        <ul className="modal-abilities">
                            {details.abilities.map((ability) => (
                                <li key={ability.ability.name} className="modal-ability">
                                    {ability.ability.name}
                                    {ability.is_hidden ? " (hidden)" : ""}
                                </li>
                            ))}
                        </ul>
                        
                        <h3>Base Stats</h3>
                        <ul className="modal-stats">
                            {details.stats.map((stat) => (
                                <li key={stat.stat.name} className="modal-stat">
                                    <span>{stat.stat.name}</span>
                                    <span>{stat.base_stat}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export default PokemonModal;