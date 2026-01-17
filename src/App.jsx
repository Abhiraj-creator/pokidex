import React, { useState, useRef } from 'react'
import PokemonBattleCard from './components/PokemonBattleCard';
import BattleResult from './components/BattleResult';
import MoveSelector from './components/MoveSelector';
import BattleAnimation from './components/BattleAnimation';
import PokemonAutocomplete from './components/PokemonAutocomplete';
import axios from 'axios'

// Type effectiveness chart (simplified)
const TYPE_EFFECTIVENESS = {
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

const App = () => {
  const [pokemon1Name, setPokemon1Name] = useState('')
  const [pokemon2Name, setPokemon2Name] = useState('')
  const [pokemon1, setPokemon1] = useState(null)
  const [pokemon2, setPokemon2] = useState(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [selectedMove1, setSelectedMove1] = useState(null)
  const [selectedMove2, setSelectedMove2] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [pokemon1Health, setPokemon1Health] = useState(500)
  const [pokemon2Health, setPokemon2Health] = useState(500)
  const [damage1, setDamage1] = useState(0) // Damage dealt by pokemon1 to pokemon2
  const [damage2, setDamage2] = useState(0) // Damage dealt by pokemon2 to pokemon1
  const [usedMoves1, setUsedMoves1] = useState([]) // Track used moves for pokemon1
  const [usedMoves2, setUsedMoves2] = useState([]) // Track used moves for pokemon2
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleOver, setBattleOver] = useState(false)
  const [currentTurnMove1, setCurrentTurnMove1] = useState(null) // Moves for current animation
  const [currentTurnMove2, setCurrentTurnMove2] = useState(null) // Moves for current animation
  const damageRef = useRef({ damage1: 0, damage2: 0 })

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

  const handleStartBattle = () => {
    if (pokemon1 && pokemon2 && selectedMove1 && selectedMove2) {
      // Reset health to 500 and battle state
      setPokemon1Health(500);
      setPokemon2Health(500);
      setUsedMoves1([]);
      setUsedMoves2([]);
      setBattleStarted(true);
      setBattleOver(false);
      setShowResult(false);
      setBattleResult(null);
      
      // Execute first turn
      executeTurn();
    }
  }

  const executeTurn = () => {
    if (!pokemon1 || !pokemon2 || !selectedMove1 || !selectedMove2) return;
    
    // Store moves for current turn animation
    setCurrentTurnMove1(selectedMove1);
    setCurrentTurnMove2(selectedMove2);
    
    // Use move power directly as damage (e.g., Ice Punch with 40 power = 40 damage)
    const dmg1 = selectedMove1.power || 0;
    const dmg2 = selectedMove2.power || 0;
    
    setDamage1(dmg1);
    setDamage2(dmg2);
    damageRef.current = { damage1: dmg1, damage2: dmg2 };
    
    setIsAnimating(true);
  }

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    // Apply damage after animation completes
    if (pokemon1 && pokemon2 && currentTurnMove1 && currentTurnMove2) {
      // Apply pre-calculated damage using ref to ensure we have latest values
      const { damage1: dmg1, damage2: dmg2 } = damageRef.current;
      const newHealth1 = Math.max(0, pokemon1Health - dmg2);
      const newHealth2 = Math.max(0, pokemon2Health - dmg1);
      
      setPokemon1Health(newHealth1);
      setPokemon2Health(newHealth2);
      
      // Add moves to used moves list
      setUsedMoves1(prev => [...prev, currentTurnMove1.name]);
      setUsedMoves2(prev => [...prev, currentTurnMove2.name]);
      
      // Clear selected moves for next turn (but keep current turn moves for display)
      setSelectedMove1(null);
      setSelectedMove2(null);
      
      // Clear current turn moves after a small delay to ensure animation cleanup
      setTimeout(() => {
        setCurrentTurnMove1(null);
        setCurrentTurnMove2(null);
      }, 100);
      
      // Check if battle is over
      if (newHealth1 <= 0 || newHealth2 <= 0) {
        setBattleOver(true);
        const winner = newHealth1 <= 0 ? pokemon2.name : pokemon1.name;
        
        // Get types for type effectiveness calculation
        const types1 = pokemon1.types.map(t => t.type.name);
        const types2 = pokemon2.types.map(t => t.type.name);
        const typeEffectiveness = getTypeEffectiveness(types1, types2);
        
        const result = {
          winner,
          reason: `${winner} wins! ${newHealth1 <= 0 ? pokemon1.name : pokemon2.name} fainted.`,
          stats1: pokemon1.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
          stats2: pokemon2.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
          score1: newHealth1 > 0 ? 100 : 0,
          score2: newHealth2 > 0 ? 100 : 0,
          winPercentage: 100,
          typeInfo: typeEffectiveness
        };
        setBattleResult(result);
        setShowResult(true);
      }
    }
  }

  React.useEffect(() => {
    // Reset moves when Pokemon change
    setSelectedMove1(null);
    setSelectedMove2(null);
    setBattleResult(null);
    setShowResult(false);
    setIsAnimating(false);
    setPokemon1Health(500);
    setPokemon2Health(500);
    setDamage1(0);
    setDamage2(0);
    setUsedMoves1([]);
    setUsedMoves2([]);
    setBattleStarted(false);
    setBattleOver(false);
    setCurrentTurnMove1(null);
    setCurrentTurnMove2(null);
  }, [pokemon1, pokemon2])

  const handleNextTurn = () => {
    if (selectedMove1 && selectedMove2 && !isAnimating && !battleOver) {
      executeTurn();
    }
  }

  const calculateBattleResult = (poke1, poke2, move1, move2) => {
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

    // Move-based calculations
    const move1Power = move1?.power || 0;
    const move2Power = move2?.power || 0;
    const move1Accuracy = (move1?.accuracy || 100) / 100;
    const move2Accuracy = (move2?.accuracy || 100) / 100;

    // Calculate move type effectiveness
    const moveTypeEffect1 = getMoveTypeEffectiveness(move1?.type, types2);
    const moveTypeEffect2 = getMoveTypeEffectiveness(move2?.type, types1);

    // Base stats contribution (30% weight)
    score1 += stats1 * 0.3;
    score2 += stats2 * 0.3;

    // Move power contribution (25% weight) - actual move damage
    score1 += move1Power * move1Accuracy * moveTypeEffect1 * 0.25;
    score2 += move2Power * move2Accuracy * moveTypeEffect2 * 0.25;

    // Type effectiveness multipliers (20% weight)
    score1 += (stats1 * typeEffectiveness.multiplier1) * 0.2;
    score2 += (stats2 * typeEffectiveness.multiplier2) * 0.2;

    // Base experience (8% weight)
    score1 += (poke1.base_experience || 0) * 0.08;
    score2 += (poke2.base_experience || 0) * 0.08;

    // Speed advantage (12% weight) - speed determines who strikes first and critical hits
    score1 += speed1 * 0.12;
    score2 += speed2 * 0.12;

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
      if (move1Power > move2Power) advantages.push(`stronger move: ${move1?.name || 'N/A'} (${move1Power} power)`);
      if (stats1 > stats2) advantages.push(`superior total stats (${stats1} vs ${stats2})`);
      if (moveTypeEffect1 > 1) advantages.push(`move type advantage: ${move1?.type || 'N/A'} vs ${types2.join(', ')}`);
      if (typeEffectiveness.advantage1) advantages.push(`type advantage: ${typeEffectiveness.advantage1}`);
      if (speed1 > speed2) advantages.push(`faster speed (${speed1} vs ${speed2})`);
      reason = `${poke1.name} wins with ${winPercentage}% advantage! Key factors: ${advantages.join(', ')}`;
    } else {
      winner = poke2.name;
      const advantages = [];
      if (move2Power > move1Power) advantages.push(`stronger move: ${move2?.name || 'N/A'} (${move2Power} power)`);
      if (stats2 > stats1) advantages.push(`superior total stats (${stats2} vs ${stats1})`);
      if (moveTypeEffect2 > 1) advantages.push(`move type advantage: ${move2?.type || 'N/A'} vs ${types1.join(', ')}`);
      if (typeEffectiveness.advantage2) advantages.push(`type advantage: ${typeEffectiveness.advantage2}`);
      if (speed2 > speed1) advantages.push(`faster speed (${speed2} vs ${speed1})`);
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
    let multiplier1 = 1;
    let multiplier2 = 1;
    let advantage1 = '';
    let advantage2 = '';

    // Calculate effectiveness of pokemon1's types against pokemon2's types
    types1.forEach(type1 => {
      types2.forEach(type2 => {
        if (TYPE_EFFECTIVENESS[type1] && TYPE_EFFECTIVENESS[type1][type2] !== undefined) {
          const eff = TYPE_EFFECTIVENESS[type1][type2];
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
        if (TYPE_EFFECTIVENESS[type2] && TYPE_EFFECTIVENESS[type2][type1] !== undefined) {
          const eff = TYPE_EFFECTIVENESS[type2][type1];
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

  const getMoveTypeEffectiveness = (moveType, opponentTypes) => {
    if (!moveType) return 1;
    
    let multiplier = 1;
    opponentTypes.forEach(opponentType => {
      if (TYPE_EFFECTIVENESS[moveType] && TYPE_EFFECTIVENESS[moveType][opponentType] !== undefined) {
        multiplier *= TYPE_EFFECTIVENESS[moveType][opponentType];
      }
    });

    return multiplier;
  }

  return (
    <div className='min-h-screen w-full bg-[#222] text-white p-4 md:p-8'>
      <h1 className='text-2xl md:text-3xl text-center pt-4 uppercase font-mono mb-8'>
        Pokemon Battle Arena
      </h1>

      {/* Input Section */}
      <form onSubmit={handleBattle} className='flex flex-col md:flex-row items-center justify-center gap-4 mb-8'>
        <PokemonAutocomplete
          value={pokemon1Name}
          onChange={setPokemon1Name}
          placeholder="Input 1 - Pokemon Name"
        />
        <PokemonAutocomplete
          value={pokemon2Name}
          onChange={setPokemon2Name}
          placeholder="Input 2 - Pokemon Name"
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

      {/* Move Selection Section */}
      {pokemon1 && pokemon2 && !loading1 && !loading2 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6'>
          <MoveSelector
            pokemon={pokemon1}
            onMoveSelect={setSelectedMove1}
            selectedMove={selectedMove1}
            label="Pokemon 1 Moves"
            usedMoves={usedMoves1}
          />
          <MoveSelector
            pokemon={pokemon2}
            onMoveSelect={setSelectedMove2}
            selectedMove={selectedMove2}
            label="Pokemon 2 Moves"
            usedMoves={usedMoves2}
          />
        </div>
      )}

      {/* Battle Button - Start Battle */}
      {pokemon1 && pokemon2 && selectedMove1 && selectedMove2 && !battleStarted && !isAnimating && (
        <div className='text-center mb-6'>
          <button
            onClick={handleStartBattle}
            className='text-xl md:text-2xl uppercase px-12 md:px-20 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg text-white font-bold cursor-pointer active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-red-500/50 animate-pulse'
          >
            ⚔️ START BATTLE ⚔️
          </button>
        </div>
      )}

      {/* Next Turn Button */}
      {battleStarted && !battleOver && !isAnimating && pokemon1 && pokemon2 && selectedMove1 && selectedMove2 && (
        <div className='text-center mb-6'>
          <button
            onClick={handleNextTurn}
            className='text-xl md:text-2xl uppercase px-12 md:px-20 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-bold cursor-pointer active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50'
          >
            ⚔️ NEXT TURN ⚔️
          </button>
        </div>
      )}

      {/* Health Display */}
      {battleStarted && (
        <div className='text-center mb-4'>
          <div className='grid grid-cols-2 gap-4 max-w-2xl mx-auto'>
            <div className='bg-zinc-800/50 border border-white/10 rounded-lg p-4'>
              <p className='text-lg font-bold mb-2'>{pokemon1?.name}</p>
              <div className='w-full bg-zinc-700 rounded-full h-6 mb-2'>
                <div 
                  className={`h-6 rounded-full transition-all duration-500 ${
                    pokemon1Health > 300 ? 'bg-green-500' : pokemon1Health > 150 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (pokemon1Health / 500) * 100))}%` }}
                ></div>
              </div>
              <p className='text-sm'>{Math.max(0, Math.floor(pokemon1Health))} / 500 HP</p>
            </div>
            <div className='bg-zinc-800/50 border border-white/10 rounded-lg p-4'>
              <p className='text-lg font-bold mb-2'>{pokemon2?.name}</p>
              <div className='w-full bg-zinc-700 rounded-full h-6 mb-2'>
                <div 
                  className={`h-6 rounded-full transition-all duration-500 ${
                    pokemon2Health > 300 ? 'bg-green-500' : pokemon2Health > 150 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (pokemon2Health / 500) * 100))}%` }}
                ></div>
              </div>
              <p className='text-sm'>{Math.max(0, Math.floor(pokemon2Health))} / 500 HP</p>
            </div>
          </div>
        </div>
      )}

      {/* Battle Animation */}
      {isAnimating && pokemon1 && pokemon2 && currentTurnMove1 && currentTurnMove2 && (
        <div className='mb-6'>
          <BattleAnimation
            pokemon1={pokemon1}
            pokemon2={pokemon2}
            move1={currentTurnMove1}
            move2={currentTurnMove2}
            isAnimating={isAnimating}
            onAnimationComplete={handleAnimationComplete}
            pokemon1Health={pokemon1Health}
            pokemon2Health={pokemon2Health}
            damage1={damage1}
            damage2={damage2}
          />
        </div>
      )}

      {/* Battle Result Section */}
      <BattleResult result={battleResult} pokemon1={pokemon1} pokemon2={pokemon2} showResult={showResult} />
    </div>
  )
}

export default App
