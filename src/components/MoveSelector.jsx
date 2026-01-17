import React, { useState, useEffect } from 'react'
import axios from 'axios'

const MoveSelector = ({ pokemon, onMoveSelect, selectedMove, label, usedMoves = [] }) => {
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (pokemon) {
      fetchMoveDetails()
    } else {
      setMoves([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon, usedMoves])

  const fetchMoveDetails = async () => {
    if (!pokemon || !pokemon.moves) return
    
    setLoading(true)
    try {
      // Get first 20 moves (to avoid too many API calls)
      const movePromises = pokemon.moves.slice(0, 20).map(async (moveEntry) => {
        try {
          const response = await axios.get(moveEntry.move.url)
          const moveData = response.data
          return {
            name: moveData.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            power: moveData.power || 0,
            accuracy: moveData.accuracy || 100,
            type: moveData.type.name,
            pp: moveData.pp || 0,
            damage_class: moveData.damage_class?.name || 'status',
            url: moveEntry.move.url
          }
        } catch (error) {
          console.error(`Error fetching move ${moveEntry.move.name}:`, error)
          return null
        }
      })

      let moveDetails = (await Promise.all(movePromises)).filter(Boolean)
      // Filter out used moves
      moveDetails = moveDetails.filter(move => !usedMoves.includes(move.name))
      // Sort by power (highest first), then by name
      moveDetails.sort((a, b) => {
        if (b.power !== a.power) return b.power - a.power
        return a.name.localeCompare(b.name)
      })
      setMoves(moveDetails)
    } catch (error) {
      console.error('Error fetching moves:', error)
    } finally {
      setLoading(false)
    }
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
    }
    return colors[type] || 'bg-gray-600'
  }

  if (!pokemon) {
    return (
      <div className='bg-zinc-800/50 border border-white/10 rounded-xl p-4'>
        <p className='text-zinc-500 text-center'>{label} - Select Pokemon first</p>
      </div>
    )
  }

  return (
    <div className='bg-zinc-800/50 border border-white/10 rounded-xl p-4'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-bold uppercase text-white'>{label}</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className='text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors'
        >
          {expanded ? 'Hide' : 'Show'} Moves
        </button>
      </div>

      {loading && (
        <div className='text-center py-4'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto'></div>
          <p className='text-zinc-400 text-sm mt-2'>Loading moves...</p>
        </div>
      )}

      {!loading && expanded && (
        <div className='max-h-60 overflow-y-auto space-y-2 custom-scrollbar'>
          {usedMoves.length > 0 && (
            <div className='mb-2 p-2 bg-yellow-600/20 border border-yellow-500/50 rounded text-xs'>
              <p className='text-yellow-400 font-semibold'>Used Moves (excluded):</p>
              <p className='text-yellow-300'>{usedMoves.join(', ')}</p>
            </div>
          )}
          {moves.length === 0 ? (
            <p className='text-zinc-500 text-center py-4'>No moves available{usedMoves.length > 0 ? ' (all moves used)' : ''}</p>
          ) : (
            moves.map((move, index) => (
              <button
                key={index}
                onClick={() => onMoveSelect(move)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedMove?.name === move.name
                    ? 'bg-blue-600/30 border-blue-500 scale-105'
                    : 'bg-zinc-700/50 border-zinc-600 hover:bg-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className={`${getTypeColor(move.type)} px-2 py-0.5 rounded text-xs font-bold uppercase`}>
                        {move.type}
                      </span>
                      <span className='text-white font-semibold'>{move.name}</span>
                    </div>
                    <div className='flex gap-4 text-xs text-zinc-400'>
                      {move.power > 0 && <span>Power: {move.power}</span>}
                      <span>Accuracy: {move.accuracy}%</span>
                      <span>PP: {move.pp}</span>
                      <span className='capitalize'>{move.damage_class}</span>
                    </div>
                  </div>
                  {selectedMove?.name === move.name && (
                    <span className='text-blue-400 text-xl ml-2'>✓</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedMove && (
        <div className='mt-4 p-3 bg-green-600/20 border border-green-500/50 rounded-lg'>
          <p className='text-green-400 font-semibold'>Selected Move:</p>
          <p className='text-white'>{selectedMove.name}</p>
          <div className='flex gap-4 mt-2 text-sm text-zinc-300'>
            <span>Power: {selectedMove.power || 'N/A'}</span>
            <span>Type: <span className={`${getTypeColor(selectedMove.type)} px-1.5 py-0.5 rounded text-xs`}>{selectedMove.type}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoveSelector
