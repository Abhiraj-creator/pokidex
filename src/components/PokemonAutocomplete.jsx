import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const PokemonAutocomplete = ({ value, onChange, placeholder, onPokemonSelect }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allPokemon, setAllPokemon] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    // Fetch all Pokemon names on mount
    const fetchAllPokemon = async () => {
      setLoading(true)
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1300')
        const pokemonList = response.data.results.map(p => ({
          name: p.name,
          displayName: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ')
        }))
        setAllPokemon(pokemonList)
      } catch (error) {
        console.error('Error fetching Pokemon list:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllPokemon()
  }, [])

  useEffect(() => {
    if (value && value.length > 0 && allPokemon.length > 0) {
      const filtered = allPokemon.filter(p => 
        p.name.toLowerCase().startsWith(value.toLowerCase()) ||
        p.displayName.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 10)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value, allPokemon])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (pokemon) => {
    onChange(pokemon.name)
    setShowSuggestions(false)
    if (onPokemonSelect) {
      onPokemonSelect(pokemon.name)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        className='text-lg md:text-xl uppercase px-6 md:px-12 py-3 bg-[#3d3838] rounded-lg outline-none border border-gray-600 focus:border-blue-500 w-full'
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-[#3d3838] border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((pokemon, index) => (
            <button
              key={index}
              onClick={() => handleSelect(pokemon)}
              className="w-full text-left px-4 py-2 hover:bg-blue-600/30 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <span className="text-white uppercase">{pokemon.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PokemonAutocomplete
