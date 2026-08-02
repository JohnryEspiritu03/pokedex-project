import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import PokemonCard from "./components/PokemonCard";
import "./PokedexHome.css";
import PokemonModal from "./components/PokemonModal";
import SearchBar from "./components/SearchBar";

const LIMIT = 10;

function Home() {
  const [masterList, setMasterList] = useState([]); // State to hold the complete list of Pokemon
  const [pokemon, setPokemon] = useState([]); // State to hold the list of Pokemon
  const [onDisplay, setOnDisplay] = useState(LIMIT); // State to hold the total number of Pokemon available
  const [search, setSearch] = useState(""); // State to hold the search query
  const [sortBy, setSortBy] = useState("id"); // State to hold the sorting criteria
  const [sortOrder, setSortOrder] = useState("asc"); // State to hold the sorting order
  const [loading, setLoading] = useState(true); // State to indicate if data is being loaded

  const [selectedPokemonId, setSelectedPokemonId] = useState(null); // State to hold the ID of the selected Pokemon for modal display

  // Fetch the complete list of Pokemon from the PokeAPI when the component mounts
  useEffect(() => {
    // Function to fetch the complete list of Pokemon from the PokeAPI
    async function fetchMasterList() {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0`,
      );
      const data = await response.json();

      const list = data.results.map((pokemon) => {
        const id = pokemon.url.split("/").filter(Boolean).pop(); // Extract the Pokemon ID from the URL
        return {
          id: Number(id),
          name: pokemon.name,
        };
      });
      setMasterList(list);
      setLoading(false); // Set loading to false after fetching the master list
    }
    fetchMasterList();
  }, []);

  const query = search.trim().toLowerCase(); // Trim and convert the search query to lowercase for case-insensitive matching
  const filteredUnsorted = query
    ? masterList.filter(
        (pokemon) =>
          pokemon.name.includes(query) || pokemon.id.toString().includes(query),
      )
    : masterList; // Filter the master list based on the search query, or use the complete list if no query is provided

  const filtered = [...filteredUnsorted].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "id") {
      comparison = a.id - b.id; // Sort by ID in ascending order
    } else if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name); // Sort by name in ascending order
    }

    return sortOrder === "asc" ? comparison : -comparison; // Reverse the comparison for descending order
  });

  const hasMore = onDisplay < filtered.length; // Check if there are more Pokemon to display based on the current display count and the filtered list length

  // Reset the number of Pokemon to display to the limit whenever the search query changes
  useEffect(() => {
    setOnDisplay(LIMIT); // Reset the number of Pokemon to display to the limit
    setPokemon([]); // Clear the current list of Pokemon to display
  }, [query, sortBy, sortOrder]);

  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100; 
        // 100px threshold so it triggers slightly before the exact pixel-perfect bottom

      setIsAtBottom(scrolledToBottom);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check immediately in case content is short enough to already be at the bottom

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (masterList.length === 0) return; // If the master list is empty, do not fetch Pokemon data

    async function fetchPageDetails() {
      setLoading(true); // Set loading to true before fetching data

      const targetSlice = filtered.slice(0, onDisplay); // Get the slice of Pokemon to display based on the current display count

      const alreadyLoadedIds = new Set(pokemon.map((p) => p.id)); // Create a set of already loaded Pokemon IDs to avoid duplicates
      const toFetch = targetSlice.filter((p) => !alreadyLoadedIds.has(p.id)); // Filter out already loaded Pokemon from the target slice

      const newDetails = await Promise.all(
        toFetch.map(async (pokemon) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`,
          );
          const data = await response.json();
          return {
            id: data.id,
            name: data.name,
            image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${data.id.toString().padStart(3, "0")}.png`,
            types: data.types,
          };
        }),
      );

      const detailMap = new Map(
        [...pokemon, ...newDetails].map((p) => [p.id, p]),
      );
      const ordered = targetSlice
        .map((p) => detailMap.get(p.id))
        .filter(Boolean); // Order the Pokemon details based on the target slice

      setPokemon(ordered); // Update the state with the fetched Pokemon details
      setLoading(false); // Set loading to false after fetching data
    }

    fetchPageDetails();
  }, [onDisplay, query, masterList, sortBy, sortOrder]);

  return (
    <>
      <div className="fixed-header">
        <Navbar />

        <div className="controls-row">
          <SearchBar searchTerm={search} onSearchChange={setSearch} />

          <div className="sort-controls">
            <label>
              Sort By:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="id">ID</option>
                <option value="name">Name</option>
              </select>
            </label>

            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
      </div>
      

      {filtered.length === 0 && !loading && <p>No Pokemon match "{search}".</p>}

      <div className="container">
        <div className="pokemon-grid">
          {pokemon.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPokemonId(p.id)}
              style={{ cursor: "pointer" }}
            >
              <PokemonCard key={p.id} pokemon={p} />
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className={`load-more ${isAtBottom ? "load-more-floating" : ""}`}>
          <button
            onClick={() => setOnDisplay((c) => c + LIMIT)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      <PokemonModal
        id={selectedPokemonId}
        minId={1}
        maxId={masterList.length}
        onClose={() => setSelectedPokemonId(null)}
        onPrevious={() => setSelectedPokemonId((id) => id - 1)}
        onNext={() => setSelectedPokemonId((id) => id + 1)}
      />
    </>
  );
}

export default Home;
