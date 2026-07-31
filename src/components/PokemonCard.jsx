function PokemonCard({pokemon}) {
    return(
        <div className="card">
            <img 
                src={pokemon.image} 
                alt={pokemon.name} 
            />

            <h2>{pokemon.name}</h2>

            <p>#{pokemon.id}</p>
        </div>
    );
}

export default PokemonCard;