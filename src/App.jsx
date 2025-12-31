import React, { useState } from 'react'
import Details from './components/Details';
import axios from 'axios'
const App = () => {
  const formHandler=(e)=>{
    e.preventDefault();
    
  }
  const PokemonApi= async ()=>{
    const response= await axios.get(`https://pokeapi.co/api/v2/pokemon/${PokemonName}`)
    setpokiDetail(response.data);

  }
  const PokemonValue=(e)=>{
    setPokemonName(e.target.value);
  }
  const [PokemonName, setPokemonName] = useState('')
  const [pokiDetail, setpokiDetail] = useState(null)
  
  return (
    <div className='h-screen w-full bg-[#222] text-white'>
      <h1 className='text-2xl text-center pt-4 uppercase font-mono'>Welcome To Pokemon World <span>Where you can get details about all pokemons</span></h1>
      <form onSubmit={(e)=>{
        formHandler(e)
      }} className='flex flex-col items-center mt-10 gap-10'>
        <input type="text" value={PokemonName} onChange={(e)=>{
          PokemonValue(e)
        }} placeholder='Enter pokemon Name' className='text-2xl uppercase px-16 py-2 bg-[#3d3838] rounded-lg outline-none' />
        <button onClick={()=>{
          PokemonApi();
        }} className='text-2xl uppercase px-16 py-2 bg-green-600 rounded-lg text-[#111] cursor-pointer active:scale-95'>Get Details</button>
      </form>
      <Details pokiDetail={pokiDetail}/>
    </div>
  )
}

export default App