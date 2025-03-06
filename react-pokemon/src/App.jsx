import { useState } from 'react'
import axios from "axios";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [pokemon, setPokemon] = useState(null);
  const [similarPokemon, setSimilarPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPokemon = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let randomId = Math.floor(Math.random() * 1025) + 1;

      let response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      let responseData = response.data;

      setPokemon({
        name: responseData.name.toUpperCase(),
        img: responseData.sprites.front_default,
      });

      // get pokemon of the same time
      let primaryType = responseData.types[0].type.name;

      let typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${primaryType}`);
      let typeData = typeResponse.data;

      let similarPokemonUrls = typeData.pokemon
        .map((p) => p.pokemon.url)
        .filter((url) => !url.includes(`/pokemon/${randomId}/`)) //remove the orininal pokemon from the list
        .sort(() => 0.5 - Math.random())
        .slice(0, 5); // we pick the first five after shuffling

        //get name and pic for similar pokemon
        let similarData = await Promise.all(
        similarPokemonUrls.map(async (url) => {
          let res = await axios.get(url);
          let data = res.data;
          return {
            name: data.name.toUpperCase(),
            img: data.sprites.front_default,
          };
        })
      );

      setSimilarPokemon(similarData);
    } catch (err) {
      setError("Failed to fetch Pokémon. Please try again.");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <form onSubmit={getPokemon}>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Random Pokémon"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {pokemon && (
        <div className="pokemon-card">
          <h1>{pokemon.name}</h1>
          <img src={pokemon.img} alt={pokemon.name} />
        </div>
      )}

      <div className="pokemon-container">
        {similarPokemon.map((poke, index) => (
          <div key={index} className="pokemon-card">
            <img src={poke.img} alt={poke.name} title={poke.name} />
            <p>{poke.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;