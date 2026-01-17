import React, { useState, useEffect } from 'react'

const PokemonBattleCard = ({ pokemon, loading, label, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [statAnimations, setStatAnimations] = useState({});

  useEffect(() => {
    if (pokemon && !loading) {
      const visibilityTimer = setTimeout(() => {
        setIsVisible(true);
        // Animate stat bars
        pokemon.stats.forEach((stat, idx) => {
          setTimeout(() => {
            setStatAnimations(prev => ({
              ...prev,
              [idx]: true
            }));
          }, idx * 100);
        });
      }, delay);
      
      return () => clearTimeout(visibilityTimer);
    } else {
      setIsVisible(false);
      setStatAnimations({});
    }
  }, [pokemon, loading, delay]);
  if (loading) {
    return (
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-8 min-h-[400px] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading {label}...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-8 min-h-[400px] flex items-center justify-center'>
        <p className='text-zinc-500 text-center'>{label} - Enter Pokemon name to see details</p>
      </div>
    );
  }

  const getTypeColor = (type) => {
    const colors = {
      normal: 'bg-gray-500',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-500',
      grass: 'bg-green-500',
      ice: 'bg-cyan-400',
      fighting: 'bg-orange-600',
      poison: 'bg-purple-500',
      ground: 'bg-amber-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-amber-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-violet-600',
      dark: 'bg-gray-800',
      steel: 'bg-gray-400',
      fairy: 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-600';
  };

  return (
    <div 
      className={`bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Image Section */}
      <div className='flex-shrink-0 mb-4 flex items-center justify-center bg-zinc-800/50 rounded-2xl p-4 h-48 md:h-56 overflow-hidden'>
        <img
          className={`w-full h-full object-contain drop-shadow-lg transition-all duration-700 ${
            isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
          alt={pokemon.name}
        />
      </div>

      {/* Details Section */}
      <div className='flex-1 flex flex-col'>
        <div className='flex items-baseline gap-3 mb-3'>
          <h2 className='text-2xl md:text-3xl font-black uppercase tracking-tighter'>
            {pokemon.name}
          </h2>
          <span className='text-zinc-500 font-mono text-sm md:text-base'>
            #{pokemon.order}
          </span>
        </div>

        {/* Types */}
        <div className='mb-4 flex flex-wrap gap-2'>
          {pokemon.types.map((typeInfo, idx) => (
            <span
              key={idx}
              className={`${getTypeColor(typeInfo.type.name)} px-3 py-1 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider text-white transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{ transitionDelay: `${(idx + 1) * 100}ms` }}
            >
              {typeInfo.type.name}
            </span>
          ))}
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3 md:gap-4 mb-4'>
          <div className='flex flex-col border-l-2 border-orange-500 pl-3'>
            <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Weight</span>
            <h3 className='text-lg md:text-xl font-semibold'>{(pokemon.weight) / 10} kg</h3>
          </div>
          <div className='flex flex-col border-l-2 border-orange-500 pl-3'>
            <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Base Exp</span>
            <h3 className='text-lg md:text-xl font-semibold'>{pokemon.base_experience}</h3>
          </div>
          <div className='flex flex-col border-l-2 border-blue-500 pl-3'>
            <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Height</span>
            <h3 className='text-lg md:text-xl font-semibold'>{(pokemon.height) / 10} m</h3>
          </div>
          <div className='flex flex-col border-l-2 border-blue-500 pl-3'>
            <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Total Stats</span>
            <h3 className='text-lg md:text-xl font-semibold'>
              {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
            </h3>
          </div>
        </div>

        {/* Individual Stats */}
        <div className='mt-auto'>
          <h4 className='text-xs uppercase text-zinc-400 font-bold mb-2'>Base Stats</h4>
          <div className='space-y-1'>
            {pokemon.stats.map((stat, idx) => {
              const width = Math.min(100, (stat.base_stat / 255) * 100);
              return (
                <div key={idx} className='flex items-center gap-2'>
                  <span className='text-xs text-zinc-500 uppercase w-16 md:w-20'>{stat.stat.name.replace('-', ' ')}</span>
                  <div className='flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden'>
                    <div
                      className={`bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out ${
                        statAnimations[idx] ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        width: statAnimations[idx] ? `${width}%` : '0%',
                        transitionDelay: `${idx * 100}ms`
                      }}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold w-10 text-right transition-all duration-500 ${
                    statAnimations[idx] ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}>{stat.base_stat}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonBattleCard;
