import React, { useEffect, useState } from 'react'

const BattleResult = ({ result, pokemon1, pokemon2, showResult }) => {
  const [animatedScore1, setAnimatedScore1] = useState(0);
  const [animatedScore2, setAnimatedScore2] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showResult && result) {
      setIsVisible(true);
      // Animate score counting
      const duration = 1500;
      const steps = 60;
      const stepTime = duration / steps;
      const step1 = result.score1 / steps;
      const step2 = result.score2 / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedScore1(Math.min(result.score1, currentStep * step1));
        setAnimatedScore2(Math.min(result.score2, currentStep * step2));

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedScore1(result.score1);
          setAnimatedScore2(result.score2);
        }
      }, stepTime);
    } else {
      setIsVisible(false);
      setAnimatedScore1(0);
      setAnimatedScore2(0);
    }
  }, [showResult, result]);
  if (!result || !pokemon1 || !pokemon2) {
    return (
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 text-center min-h-[200px] flex items-center justify-center'>
        <p className='text-zinc-500 text-lg animate-pulse'>
          Final result between fighting both pokemon on the basis of stats or type or any other factor
        </p>
      </div>
    );
  }

  const pokemon1Wins = result.winner === pokemon1.name;
  const pokemon2Wins = result.winner === pokemon2.name;

  return (
    <div 
      className={`bg-zinc-900 border-2 border-yellow-500/50 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'
      }`}
    >
      <h2 className={`text-2xl md:text-3xl font-black uppercase text-center mb-6 tracking-tighter transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        Battle Result
      </h2>

      {/* Winner Display */}
      <div className='text-center mb-6'>
        <div 
          className={`inline-block ${pokemon1Wins ? 'bg-blue-600/20 border-2 border-blue-500' : 'bg-red-600/20 border-2 border-red-500'} rounded-2xl px-8 py-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-75'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <h3 
            className={`text-3xl md:text-4xl font-black mb-2 ${pokemon1Wins ? 'text-blue-400' : 'text-red-400'} transition-all duration-500 ${
              isVisible ? 'animate-bounce' : ''
            }`}
          >
            🏆 {result.winner.toUpperCase()} WINS! 🏆
          </h3>
          <p 
            className={`text-lg md:text-xl ${pokemon1Wins ? 'text-blue-300' : 'text-red-300'} transition-all duration-700 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {result.reason}
          </p>
          {result.winPercentage && (
            <p 
              className={`text-sm md:text-base mt-2 ${pokemon1Wins ? 'text-blue-200' : 'text-red-200'} transition-all duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              Win Margin: {result.winPercentage}%
            </p>
          )}
        </div>
      </div>

      {/* Battle Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
        {/* Pokemon 1 Stats */}
        <div className='bg-zinc-800/50 rounded-2xl p-6 border border-blue-500/30'>
          <h4 className='text-xl font-bold text-blue-400 mb-4 uppercase'>
            {pokemon1.name} Analysis
          </h4>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-zinc-400'>Total Stats:</span>
              <span className='font-semibold text-white'>{result.stats1}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-400'>Battle Score:</span>
              <span className='font-semibold text-blue-400 text-lg transition-all duration-300'>
                {Math.round(animatedScore1)}
              </span>
            </div>
            {result.typeInfo.advantage1 && (
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Type Advantage:</span>
                <span className='font-semibold text-green-400'>{result.typeInfo.advantage1}</span>
              </div>
            )}
            {result.typeInfo.multiplier1 !== 1 && (
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Type Multiplier:</span>
                <span className='font-semibold text-yellow-400'>{result.typeInfo.multiplier1.toFixed(2)}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Pokemon 2 Stats */}
        <div className='bg-zinc-800/50 rounded-2xl p-6 border border-red-500/30'>
          <h4 className='text-xl font-bold text-red-400 mb-4 uppercase'>
            {pokemon2.name} Analysis
          </h4>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-zinc-400'>Total Stats:</span>
              <span className='font-semibold text-white'>{result.stats2}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-400'>Battle Score:</span>
              <span className='font-semibold text-red-400 text-lg transition-all duration-300'>
                {Math.round(animatedScore2)}
              </span>
            </div>
            {result.typeInfo.advantage2 && (
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Type Advantage:</span>
                <span className='font-semibold text-green-400'>{result.typeInfo.advantage2}</span>
              </div>
            )}
            {result.typeInfo.multiplier2 !== 1 && (
              <div className='flex justify-between'>
                <span className='text-zinc-400'>Type Multiplier:</span>
                <span className='font-semibold text-yellow-400'>{result.typeInfo.multiplier2.toFixed(2)}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Battle Explanation */}
      <div className='mt-6 pt-6 border-t border-zinc-700'>
        <p className='text-zinc-300 text-center text-sm md:text-base leading-relaxed'>
          The battle result is calculated based on total base stats, type effectiveness, 
          and base experience. Type advantages can significantly impact the outcome!
        </p>
      </div>
    </div>
  );
}

export default BattleResult;
