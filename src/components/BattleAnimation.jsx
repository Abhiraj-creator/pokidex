import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
// Animated Pokemon model placeholder (using simple shapes for now)
function PokemonModel({ position, color, name, isAttacking, isHit, isLeft }) {
  const meshRef = useRef()
  const attackStartTimeRef = useRef(null)
  const hitStartTimeRef = useRef(null)
  const basePosition = useRef([...position])

  useEffect(() => {
    basePosition.current = [...position]
  }, [position])

  useFrame((state) => {
    if (meshRef.current) {
      
      // Idle animation - gentle floating
      if (!isAttacking && !isHit) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        meshRef.current.position.y = basePosition.current[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15
        meshRef.current.position.x = basePosition.current[0]
        meshRef.current.scale.setScalar(1)
      }

      // Attack animation - dash forward with impact
      if (isAttacking) {
        if (attackStartTimeRef.current === null) {
          attackStartTimeRef.current = state.clock.elapsedTime
        }
        
        const attackTime = state.clock.elapsedTime - attackStartTimeRef.current
        
        if (attackTime < 0.8) {
          // Dash forward phase
          if (attackTime < 0.4) {
            const progress = attackTime / 0.4
            const dashDistance = isLeft ? 2.5 : -2.5
            meshRef.current.position.x = basePosition.current[0] + dashDistance * progress
            meshRef.current.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.2)
            meshRef.current.rotation.y = Math.sin(progress * Math.PI * 2) * 0.3
          } 
          // Impact phase
          else if (attackTime < 0.6) {
            const impactProgress = (attackTime - 0.4) / 0.2
            const impactDistance = isLeft ? 2.5 : -2.5
            meshRef.current.position.x = basePosition.current[0] + impactDistance * (1 - impactProgress * 0.3)
            meshRef.current.scale.setScalar(1.2 - impactProgress * 0.2)
          }
          // Recoil phase
          else {
            const recoilProgress = (attackTime - 0.6) / 0.2
            const recoilDistance = isLeft ? -0.5 : 0.5
            meshRef.current.position.x = basePosition.current[0] + recoilDistance * (1 - recoilProgress)
            meshRef.current.scale.setScalar(1 - recoilProgress * 0.1)
          }
        } else {
          attackStartTimeRef.current = null
        }
      } else if (attackStartTimeRef.current !== null) {
        attackStartTimeRef.current = null
      }

      // Hit animation - shake and flash
      if (isHit) {
        if (hitStartTimeRef.current === null) {
          hitStartTimeRef.current = state.clock.elapsedTime
        }
        
        const hitTime = state.clock.elapsedTime - hitStartTimeRef.current
        
        if (hitTime < 0.3) {
          const shakeIntensity = 0.2 * (1 - hitTime / 0.3)
          meshRef.current.position.x = basePosition.current[0] + (Math.random() - 0.5) * shakeIntensity
          meshRef.current.position.y = basePosition.current[1] + (Math.random() - 0.5) * shakeIntensity
          meshRef.current.rotation.z = (Math.random() - 0.5) * shakeIntensity * 0.5
        } else {
          hitStartTimeRef.current = null
          meshRef.current.position.x = basePosition.current[0]
          meshRef.current.position.y = basePosition.current[1]
          meshRef.current.rotation.z = 0
        }
      } else if (hitStartTimeRef.current !== null) {
        hitStartTimeRef.current = null
      }
    }
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Pokemon body (sphere) with enhanced lighting */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isHit ? "#ffffff" : color} 
          emissiveIntensity={isHit ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.3, 0.3, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Name label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  )
}

// Move effect particles with realistic animation
function MoveEffect({ position, moveType, active, targetPosition }) {
  const particlesRef = useRef()
  const effectStartTimeRef = useRef(null)
  const particles = useRef([])

  useEffect(() => {
    if (active) {
      effectStartTimeRef.current = null
      // Initialize particles with random positions
      particles.current = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        startPos: [
          position[0] + (Math.random() - 0.5) * 0.5,
          position[1] + (Math.random() - 0.5) * 0.5,
          position[2] + (Math.random() - 0.5) * 0.5
        ],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ],
        life: 1.0
      }))
    }
  }, [active, position])

  useFrame((state) => {
    if (particlesRef.current && active) {
      if (effectStartTimeRef.current === null) {
        effectStartTimeRef.current = state.clock.elapsedTime
      }
      
      const elapsed = state.clock.elapsedTime - effectStartTimeRef.current
      
      // Update particles
      particles.current.forEach((particle, i) => {
        if (elapsed < 1.0) {
          particle.life = 1.0 - elapsed
          // Move particles toward target
          const progress = elapsed
          particle.startPos[0] += (targetPosition[0] - position[0]) * 0.05
          particle.startPos[1] += (targetPosition[1] - position[1]) * 0.05
          particle.startPos[2] += (targetPosition[2] - position[2]) * 0.05
          
          // Add velocity
          particle.startPos[0] += particle.velocity[0]
          particle.startPos[1] += particle.velocity[1]
          particle.startPos[2] += particle.velocity[2]
          
          // Apply gravity
          particle.velocity[1] -= 0.01
        }
      })
    }
  })

  if (!active) return null

  const getColor = () => {
    const colors = {
      fire: '#ff4444',
      water: '#4444ff',
      electric: '#ffff44',
      grass: '#44ff44',
      ice: '#44ffff',
      fighting: '#ff8844',
      psychic: '#ff44ff',
      normal: '#ffffff',
      dark: '#444444',
      fairy: '#ffaaff',
      dragon: '#8844ff',
      ground: '#dd8844',
      flying: '#aaaaff',
      bug: '#88ff44',
      poison: '#aa44ff',
      rock: '#aa8844',
      ghost: '#6644aa',
      steel: '#aaaaff'
    }
    return colors[moveType] || '#ffffff'
  }

  return (
    <group ref={particlesRef}>
      {particles.current.map((particle) => (
        <mesh 
          key={particle.id} 
          position={particle.startPos}
          scale={particle.life}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color={getColor()} 
            emissive={getColor()} 
            emissiveIntensity={particle.life * 1.5}
            transparent
            opacity={particle.life}
          />
        </mesh>
      ))}
    </group>
  )
}

// Health Bar Component
function HealthBar({ position, health, maxHealth, name, isLeft }) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100))
  const barWidth = 3
  const barHeight = 0.3
  
  return (
    <group position={position}>
      {/* Background bar */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshStandardMaterial color="#333333" opacity={0.8} transparent />
      </mesh>
      {/* Health bar */}
      <mesh position={[
        isLeft 
          ? -(barWidth / 2) + (barWidth * healthPercent / 200) 
          : (barWidth / 2) - (barWidth * healthPercent / 200), 
        0, 
        0.11
      ]}>
        <planeGeometry args={[barWidth * healthPercent / 100, barHeight * 0.8]} />
        <meshStandardMaterial 
          color={healthPercent > 60 ? "#44ff44" : healthPercent > 30 ? "#ffff44" : "#ff4444"} 
          emissive={healthPercent > 60 ? "#44ff44" : healthPercent > 30 ? "#ffff44" : "#ff4444"}
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Name label */}
      <Text
        position={[0, barHeight + 0.2, 0.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {name} - {Math.max(0, Math.floor(health))}/{maxHealth} HP
      </Text>
    </group>
  )
}

// Damage Number Component
function DamageNumber({ position, damage, active, moveType }) {
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(1)
  
  useEffect(() => {
    if (active && damage > 0) {
      setVisible(true)
      setOpacity(1)
      const fadeTimer = setTimeout(() => {
        setOpacity(0)
        setTimeout(() => setVisible(false), 500)
      }, 1500)
      return () => clearTimeout(fadeTimer)
    } else {
      setVisible(false)
      setOpacity(1)
    }
  }, [active, damage])
  
  if (!visible || damage === 0) return null
  
  const getColor = () => {
    const colors = {
      fire: '#ff4444',
      water: '#4444ff',
      electric: '#ffff44',
      grass: '#44ff44',
      ice: '#44ffff',
      fighting: '#ff8844',
      psychic: '#ff44ff',
      normal: '#ffffff',
      dark: '#444444',
      fairy: '#ffaaff'
    }
    return colors[moveType] || '#ffffff'
  }
  
  return (
    <Text
      position={[position[0], position[1] + 1.5, position[2]]}
      fontSize={0.6}
      color={getColor()}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor="#000000"
      style={{ opacity }}
    >
      -{damage}
    </Text>
  )
}

// Battle scene
function BattleScene({ pokemon1, pokemon2, move1, move2, isAnimating, onAnimationComplete, pokemon1Health, pokemon2Health, damage1, damage2 }) {
  const [p1Attacking, setP1Attacking] = useState(false)
  const [p2Attacking, setP2Attacking] = useState(false)
  const [move1Effect, setMove1Effect] = useState(false)
  const [move2Effect, setMove2Effect] = useState(false)
  const [showDamage1, setShowDamage1] = useState(false)
  const [showDamage2, setShowDamage2] = useState(false)
  const [p1Hit, setP1Hit] = useState(false)
  const [p2Hit, setP2Hit] = useState(false)
  const timersRef = useRef([])

  useEffect(() => {
    if (isAnimating) {
      // Clear any existing timers
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current = []
      
      // Pokemon 1 attacks first
      const timer1 = setTimeout(() => {
        setP1Attacking(true)
        setMove1Effect(true)
        const timer2 = setTimeout(() => {
          // Show damage and hit effect
          setP2Hit(true)
          setShowDamage1(true)
          const timer2a = setTimeout(() => {
            setP1Attacking(false)
            setMove1Effect(false)
            setP2Hit(false)
            
            // Pokemon 2 attacks
            const timer3 = setTimeout(() => {
              setP2Attacking(true)
              setMove2Effect(true)
              const timer4 = setTimeout(() => {
                // Show damage and hit effect
                setP1Hit(true)
                setShowDamage2(true)
                const timer4a = setTimeout(() => {
                  setP2Attacking(false)
                  setMove2Effect(false)
                  setP1Hit(false)
                  
                  // Complete animation
                  const timer5 = setTimeout(() => {
                    setShowDamage1(false)
                    setShowDamage2(false)
                    if (onAnimationComplete) onAnimationComplete()
                  }, 500)
                  timersRef.current.push(timer5)
                }, 300)
                timersRef.current.push(timer4a)
              }, 1000)
              timersRef.current.push(timer4)
            }, 500)
            timersRef.current.push(timer3)
          }, 300)
          timersRef.current.push(timer2a)
        }, 1000)
        timersRef.current.push(timer2)
      }, 500)
      timersRef.current.push(timer1)
      
      // Cleanup function to clear all timers
      return () => {
        timersRef.current.forEach(timer => clearTimeout(timer))
        timersRef.current = []
      }
    }
  }, [isAnimating, onAnimationComplete])

  const getPokemonColor = (pokemon) => {
    const types = pokemon?.types?.map(t => t.type.name) || []
    const typeColors = {
      fire: '#ff4444',
      water: '#4444ff',
      electric: '#ffff44',
      grass: '#44ff44',
      ice: '#44ffff',
      fighting: '#ff8844',
      psychic: '#ff44ff',
      normal: '#cccccc',
      dark: '#444444',
      fairy: '#ffaaff',
      dragon: '#8844ff',
      ground: '#dd8844',
      flying: '#aaaaff',
      bug: '#88ff44',
      poison: '#aa44ff',
      rock: '#aa8844',
      ghost: '#6644aa',
      steel: '#aaaaff'
    }
    return typeColors[types[0]] || '#cccccc'
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
      <pointLight position={[10, 10, 5]} intensity={0.3} color="#ff4444" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Health Bars */}
      {pokemon1 && (
        <HealthBar 
          position={[-3, 2.5, 0]} 
          health={pokemon1Health} 
          maxHealth={500} 
          name={pokemon1.name}
          isLeft={true}
        />
      )}
      {pokemon2 && (
        <HealthBar 
          position={[3, 2.5, 0]} 
          health={pokemon2Health} 
          maxHealth={500} 
          name={pokemon2.name}
          isLeft={false}
        />
      )}

      {/* Pokemon 1 */}
      {pokemon1 && (
        <>
          <PokemonModel
            position={[-3, 0, 0]}
            color={getPokemonColor(pokemon1)}
            name={pokemon1.name}
            isAttacking={p1Attacking}
            isHit={p1Hit}
            isLeft={true}
          />
          <MoveEffect
            position={[-3, 0, 0]}
            moveType={move1?.type || 'normal'}
            active={move1Effect}
            targetPosition={[3, 0, 0]}
          />
          <DamageNumber
            position={[3, 0, 0]}
            damage={damage1}
            active={showDamage1}
            moveType={move1?.type || 'normal'}
          />
        </>
      )}

      {/* Pokemon 2 */}
      {pokemon2 && (
        <>
          <PokemonModel
            position={[3, 0, 0]}
            color={getPokemonColor(pokemon2)}
            name={pokemon2.name}
            isAttacking={p2Attacking}
            isHit={p2Hit}
            isLeft={false}
          />
          <MoveEffect
            position={[3, 0, 0]}
            moveType={move2?.type || 'normal'}
            active={move2Effect}
            targetPosition={[-3, 0, 0]}
          />
          <DamageNumber
            position={[-3, 0, 0]}
            damage={damage2}
            active={showDamage2}
            moveType={move2?.type || 'normal'}
          />
        </>
      )}

      {/* Battle text */}
      {isAnimating && (
        <>
          {p1Attacking && move1 && (
            <Text
              position={[0, 2, 0]}
              fontSize={0.5}
              color="#ffff44"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {pokemon1?.name} used {move1.name}!
            </Text>
          )}
          {p2Attacking && move2 && (
            <Text
              position={[0, 2, 0]}
              fontSize={0.5}
              color="#ff4444"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {pokemon2?.name} used {move2.name}!
            </Text>
          )}
        </>
      )}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  )
}

const BattleAnimation = ({ pokemon1, pokemon2, move1, move2, isAnimating, onAnimationComplete, pokemon1Health = 500, pokemon2Health = 500, damage1 = 0, damage2 = 0 }) => {
  return (
    <div className='w-full h-[500px] bg-black rounded-xl overflow-hidden border-2 border-yellow-500/50'>
      <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
        <BattleScene
          pokemon1={pokemon1}
          pokemon2={pokemon2}
          move1={move1}
          move2={move2}
          isAnimating={isAnimating}
          onAnimationComplete={onAnimationComplete}
          pokemon1Health={pokemon1Health}
          pokemon2Health={pokemon2Health}
          damage1={damage1}
          damage2={damage2}
        />
      </Canvas>
    </div>
  )
}

export default BattleAnimation
