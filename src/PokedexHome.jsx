import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Navbar from './components/Navbar'
import PokemonCard from './components/PokemonCard';
import './PokedexHome.css';

function Home() {
  const [pokemon, setPokemon] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(0);

  const limit = 10;
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalPokemon / limit);

  useEffect(() => {
    async function fetchPokemon() {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );

      const data = await response.json();

      console.log(data);

      const pokemonList = await Promise.all(
        data.results.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          const details = await response.json();

          return {
            id: details.id,
            name: details.name,

            image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${details.id
              .toString()
              .padStart(3, "0")}.png`,

            types: details.types,
          };
        })
      );

      setPokemon(pokemonList);
      setTotalPokemon(data.count);

    }

    fetchPokemon();
  }, [page]);

  return (
    <>
    <Navbar/>

    <div className="pagination">
      {[page - 2, page - 1, page + 1, page + 2]
        .filter((num) => num >= 1 && num <= totalPages)
        .map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
          >
            {num}
          </button>
      ))}
      <button
        onClick={()=>setPage(page-1)}~
        disabled = {page === 1}
      >
        Previous
      </button>

      <span>Page {page}</span>
      
      <button
        onClick={()=>setPage(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>

    </div>

    <div className="container">
      <div className="pokemon-grid">
      {pokemon.map((p) => (
        <PokemonCard
          key = {p.id}
          pokemon= {p}
        />
      ))}
    </div>
    </div>
    
    
    </>
  );
}

export default Home
