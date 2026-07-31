import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Navbar from './components/Navbar'
import PokemonCard from './components/PokemonCard';
import './PokedexHome.css'

function Home() {
  const [pokemon, setPokemon] = useState([]);

  useEffect(() => {
    async function fetchPokemon() {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=10"
      );

      const data = await response.json();

      console.log(data);

      const pokemonList = data.results.map((pokemon) => {
        const id = pokemon.url.split("/").filter(Boolean).pop();

        return {
          id,
          name: pokemon.name,

          image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id.toString().padStart(3,"0")}.png`

        };
      });

      setPokemon(pokemonList);

    }

    fetchPokemon();
  }, []);

  return (
    <>
    <Navbar/>

    {pokemon.map((p) => (
      <PokemonCard
        key = {p.id}
        pokemon= {p}
      />
    ))}
    </>
  );
}

export default Home
