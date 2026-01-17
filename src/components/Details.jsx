import React from 'react'

const Details = (props) => {
    console.log(props.pokiDetail);
    
   const randomColor=()=>{
    `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`}
   
  
    if (!props.pokiDetail) {
        return <h2 className="text-center mt-10">Search for a Pokemon to see details!</h2>;
    }
  return (
    
    <div className='w-[90%] max-w-4xl h-[60vh] bg-zinc-900 text-white m-auto mt-8 rounded-3xl flex overflow-hidden shadow-2xl border border-white/10 transition-transform hover:scale-[1.01]'>
  
  {/* Left Side: Image Container with a Gradient Background */}
  <div className='h-full w-[40%]  flex items-center justify-center p-8'> 
      <img 
        className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
       src={props.pokiDetail.sprites.other['official-artwork'].front_default}
        alt="Charmander" 
      />
  </div>

  {/* Right Side: Details Container */}
  <div className='flex-1 p-10 flex flex-col justify-center'> 
      <div className='flex items-baseline gap-4 mb-2'>
          <h1 className='text-5xl font-black uppercase tracking-tighter italic'>{props.pokiDetail.name}</h1>
          <span className='text-zinc-500 font-mono text-xl'> {props.pokiDetail.order}</span>
      </div>

      <div className='mb-8'>
          <h2 style={{backgroundColor:{randomColor}}} className='inline-block px-4 py-1 rounded-full  text-sm font-bold uppercase tracking-widest '  >
         {props.pokiDetail.types.map((eachtype)=> eachtype.type.name).join(', ')}
          </h2>
      </div>


      {/* Info Grid */}
      <div className='grid grid-cols-2 gap-6'>
          <div className='flex flex-col border-l-2 border-orange-500 pl-4'>
              <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Weight</span>
              <h3 className='text-2xl font-semibold'>{(props.pokiDetail.weight)/10} kg</h3>
          </div>
          <div className='flex flex-col border-l-2 border-orange-500 pl-4'>
              <span className='text-zinc-400 text-xs uppercase font-bold tracking-widest'>Base Experience</span>
              <h4 className='text-2xl font-semibold'>{props.pokiDetail.base_experience}</h4>
          </div>
      </div>
  </div>
</div>
  )

}
export default Details