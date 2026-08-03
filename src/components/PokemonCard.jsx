import "./PokemonCard.css";

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

function PokemonCard({ pokemon }) {
  const primaryType = pokemon.types[0].type.name; 
  const backgroundColor = TYPE_COLORS[primaryType] || "#fff";

  const typeLabel = pokemon.types.map((t) => t.type.name).join(" / ");

  return (
    <div
      className="pokemon-card"
      style={{ "--background-color": backgroundColor }}
    >
      <span
        className="status-dot"
        style={{ background: backgroundColor }}
      ></span>

      <p className="card-id">#{pokemon.id.toString().padStart(3, "0")}</p>

      <div className="card-image-frame">
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop if fallback also fails
            e.target.src = "/pokeball.png";
          }}
        />
      </div>

      <h2 className="card-name">
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </h2>

      <div className="card-types">
        {pokemon.types.map((t) => {
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
    </div>
  );
}

export default PokemonCard;
