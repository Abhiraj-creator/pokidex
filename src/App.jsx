import React, { useState } from 'react'
import PokemonBattleCard from './components/PokemonBattleCard';
import BattleResult from './components/BattleResult';
import axios from 'axios'

const App = () => {
  const [pokemon1Name, setPokemon1Name] = useState('')
  const [pokemon2Name, setPokemon2Name] = useState('')
  const [pokemon1, setPokemon1] = useState(null)
  const [pokemon2, setPokemon2] = useState(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const fetchPokemon = async (name, setPokemon, setLoading) => {
    if (!name) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      setPokemon(response.data);
    } catch (e) {
      console.log(e);
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  }

  const handleBattle = async (e) => {
    e.preventDefault();
    await Promise.all([
      fetchPokemon(pokemon1Name, setPokemon1, setLoading1),
      fetchPokemon(pokemon2Name, setPokemon2, setLoading2)
    ]);
  }

  React.useEffect(() => {
    if (pokemon1 && pokemon2) {
      setShowResult(false);
      // Delay result reveal for animation
      const timer = setTimeout(() => {
        const result = calculateBattleResult(pokemon1, pokemon2);
        setBattleResult(result);
        setShowResult(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setBattleResult(null);
      setShowResult(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon1, pokemon2])

  const calculateBattleResult = (poke1, poke2) => {
    // Calculate total stats
    const stats1 = poke1.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const stats2 = poke2.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    // Get individual stat values for detailed comparison
    const hp1 = poke1.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const attack1 = poke1.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const defense1 = poke1.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const speed1 = poke1.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;

    const hp2 = poke2.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const attack2 = poke2.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const defense2 = poke2.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const speed2 = poke2.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;

    // Get types
    const types1 = poke1.types.map(t => t.type.name);
    const types2 = poke2.types.map(t => t.type.name);

    // Type effectiveness (simplified)
    const typeEffectiveness = getTypeEffectiveness(types1, types2);

    // Calculate comprehensive battle score with multiple factors
    let score1 = 0;
    let score2 = 0;

    // Base stats contribution (40% weight)
    score1 += stats1 * 0.4;
    score2 += stats2 * 0.4;

    // Type effectiveness multipliers (30% weight)
    score1 += (stats1 * typeEffectiveness.multiplier1) * 0.3;
    score2 += (stats2 * typeEffectiveness.multiplier2) * 0.3;

    // Base experience (10% weight)
    score1 += (poke1.base_experience || 0) * 0.1;
    score2 += (poke2.base_experience || 0) * 0.1;

    // Speed advantage (10% weight) - speed determines who strikes first
    score1 += speed1 * 0.1;
    score2 += speed2 * 0.1;

    // Offensive/Defensive balance (5% weight each)
    const offensive1 = attack1 + (poke1.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0);
    const offensive2 = attack2 + (poke2.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0);
    const defensive1 = defense1 + (poke1.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0);
    const defensive2 = defense2 + (poke2.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0);

    score1 += offensive1 * 0.05 + defensive1 * 0.05;
    score2 += offensive2 * 0.05 + defensive2 * 0.05;

    // Weight advantage (considering size) - bigger can mean more powerful or slower
    const sizeFactor1 = (poke1.weight * poke1.height) / 100;
    const sizeFactor2 = (poke2.weight * poke2.height) / 100;
    score1 += sizeFactor1 * 0.005;
    score2 += sizeFactor2 * 0.005;

    // ALWAYS determine a winner - if scores are too close, use tiebreakers
    let winner = null;
    let reason = '';
    const scoreDiff = Math.abs(score1 - score2);
    const winnerScore = Math.max(score1, score2);
    const loserScore = Math.min(score1, score2);
    const winPercentage = ((winnerScore - loserScore) / winnerScore * 100).toFixed(1);

    if (score1 > score2) {
      winner = poke1.name;
      const advantages = [];
      if (stats1 > stats2) advantages.push(`superior total stats (${stats1} vs ${stats2})`);
      if (typeEffectiveness.advantage1) advantages.push(`type advantage: ${typeEffectiveness.advantage1}`);
      if (speed1 > speed2) advantages.push(`faster speed (${speed1} vs ${speed2})`);
      if (offensive1 > offensive2) advantages.push(`greater offensive power`);
      reason = `${poke1.name} wins with ${winPercentage}% advantage! Key factors: ${advantages.join(', ')}`;
    } else {
      winner = poke2.name;
      const advantages = [];
      if (stats2 > stats1) advantages.push(`superior total stats (${stats2} vs ${stats1})`);
      if (typeEffectiveness.advantage2) advantages.push(`type advantage: ${typeEffectiveness.advantage2}`);
      if (speed2 > speed1) advantages.push(`faster speed (${speed2} vs ${speed1})`);
      if (offensive2 > offensive1) advantages.push(`greater offensive power`);
      reason = `${poke2.name} wins with ${winPercentage}% advantage! Key factors: ${advantages.join(', ')}`;
    }

    return {
      winner,
      reason,
      stats1,
      stats2,
      score1,
      score2,
      winPercentage: parseFloat(winPercentage),
      typeInfo: typeEffectiveness,
      detailedStats: {
        pokemon1: { hp: hp1, attack: attack1, defense: defense1, speed: speed1, offensive: offensive1, defensive: defensive1 },
        pokemon2: { hp: hp2, attack: attack2, defense: defense2, speed: speed2, offensive: offensive2, defensive: defensive2 }
      }
    };
  }

  const getTypeEffectiveness = (types1, types2) => {
    // Type effectiveness chart (simplified)
    const effectiveness = {
      normal: { rock: 0.5, ghost: 0 },
      fire: { water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
    };

    let multiplier1 = 1;
    let multiplier2 = 1;
    let advantage1 = '';
    let advantage2 = '';

    // Calculate effectiveness of pokemon1's types against pokemon2's types
    types1.forEach(type1 => {
      types2.forEach(type2 => {
        if (effectiveness[type1] && effectiveness[type1][type2] !== undefined) {
          const eff = effectiveness[type1][type2];
          if (eff > 1) {
            multiplier1 *= eff;
            if (!advantage1) advantage1 = `${type1} > ${type2}`;
          } else if (eff < 1 && eff > 0) {
            multiplier1 *= eff;
          }
        }
      });
    });

    // Calculate effectiveness of pokemon2's types against pokemon1's types
    types2.forEach(type2 => {
      types1.forEach(type1 => {
        if (effectiveness[type2] && effectiveness[type2][type1] !== undefined) {
          const eff = effectiveness[type2][type1];
          if (eff > 1) {
            multiplier2 *= eff;
            if (!advantage2) advantage2 = `${type2} > ${type1}`;
          } else if (eff < 1 && eff > 0) {
            multiplier2 *= eff;
          }
        }
      });
    });

    return { multiplier1, multiplier2, advantage1, advantage2 };
  }

  return (
    <div className='min-h-screen w-full bg-[#222] text-white p-4 md:p-8'>
      <h1 className='text-2xl md:text-3xl text-center pt-4 uppercase font-mono mb-8'>
        Pokemon Battle Arena
      </h1>

      {/* Input Section */}
      <form onSubmit={handleBattle} className='flex flex-col md:flex-row items-center justify-center gap-4 mb-8'>
        <input
          type="text"
          value={pokemon1Name}
          onChange={(e) => setPokemon1Name(e.target.value)}
          placeholder="Input 1 - Pokemon Name"
          className='text-lg md:text-xl uppercase px-6 md:px-12 py-3 bg-[#3d3838] rounded-lg outline-none border border-gray-600 focus:border-blue-500 flex-1 max-w-md'
        />
        <input
          type="text"
          value={pokemon2Name}
          onChange={(e) => setPokemon2Name(e.target.value)}
          placeholder="Input 2 - Pokemon Name"
          className='text-lg md:text-xl uppercase px-6 md:px-12 py-3 bg-[#3d3838] rounded-lg outline-none border border-gray-600 focus:border-blue-500 flex-1 max-w-md'
        />
        <button
          type="submit"
          disabled={loading1 || loading2}
          className='text-lg md:text-xl uppercase px-8 md:px-16 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {loading1 || loading2 ? 'Loading...' : 'Enter'}
        </button>
      </form>

      {/* Pokemon Details Section - Side by Side */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6'>
        <PokemonBattleCard pokemon={pokemon1} loading={loading1} label="Pokemon 1 Detail" delay={0} />
        <PokemonBattleCard pokemon={pokemon2} loading={loading2} label="Pokemon 2 Detail" delay={100} />
      </div>

      {/* Battle Result Section */}
      <BattleResult result={battleResult} pokemon1={pokemon1} pokemon2={pokemon2} showResult={showResult} />
    </div>
  )
}

export default App
