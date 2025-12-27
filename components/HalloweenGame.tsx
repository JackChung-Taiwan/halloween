
import React, { useRef, useEffect, useCallback } from 'react';
import { GameDataItem, Card, Particle, SaberPoint, FloatingText } from '../types';
import { GAME_DATA, GRAVITY, SABER_LIFE, PARTICLE_COUNT } from '../constants';

interface Props {
  isPlaying: boolean;
  onScoreChange: (score: number) => void;
  onVictory: () => void;
}

const HalloweenGame: React.FC<Props> = ({ isPlaying, onScoreChange, onVictory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<Card[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const saberTrailRef = useRef<SaberPoint[]>([]);
  const screenFlashRef = useRef(0);
  const screenFlashColorRef = useRef('255, 117, 24'); // Default orange
  const isTransitioningRef = useRef(false); 
  
  const scoreRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying && !isTransitioningRef.current && cardsRef.current.length === 0) {
      nextRound();
    }
  }, [isPlaying]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95; // Slightly slower speech
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech error", e);
    }
  }, []);

  const spawnCards = useCallback((target: GameDataItem, distractor: GameDataItem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = Math.min(canvas.width, canvas.height) * 0.22;
    const items = Math.random() > 0.5 ? [target, distractor] : [distractor, target];
    
    cardsRef.current = items.map((item, index) => ({
      id: Math.random().toString(36),
      x: canvas.width * (index === 0 ? 0.3 : 0.7),
      y: canvas.height + 100,
      vx: (Math.random() - 0.5) * 3, // Reduced lateral speed
      vy: -canvas.height * 0.012 - Math.random() * 3, // Reduced upward launch speed
      angle: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      data: item,
      isTarget: item.word === target.word,
      size,
      isSlashed: false,
    }));
    isTransitioningRef.current = false;
  }, []);

  const nextRound = useCallback(() => {
    if (!isPlayingRef.current || isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    const targetIdx = Math.floor(Math.random() * GAME_DATA.length);
    const target = GAME_DATA[targetIdx];

    let distractorIdx;
    do {
      distractorIdx = Math.floor(Math.random() * GAME_DATA.length);
    } while (distractorIdx === targetIdx);
    const distractor = GAME_DATA[distractorIdx];

    speak(target.word);
    
    setTimeout(() => {
      if (isPlayingRef.current) {
        spawnCards(target, distractor);
      } else {
        isTransitioningRef.current = false;
      }
    }, 1000); // Wait a bit longer for player to prepare
  }, [speak, spawnCards]);

  const createExplosion = (x: number, y: number, isTarget: boolean) => {
    const color = isTarget ? '#ff7518' : '#ff4444'; // Red for wrong explosions
    for (let i = 0; i < PARTICLE_COUNT * 2; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 1.0,
        color,
        size: Math.random() * 6 + 2
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(36),
      x,
      y,
      text,
      color,
      life: 1.0,
      velocity: -2.5
    });
  };

  const handleSlash = (card: Card) => {
    if (card.isSlashed || isTransitioningRef.current) return;
    card.isSlashed = true;
    createExplosion(card.x, card.y, card.isTarget);

    if (card.isTarget) {
      scoreRef.current += 1;
      onScoreChange(scoreRef.current);
      screenFlashColorRef.current = '255, 117, 24'; // Orange for correct
      screenFlashRef.current = 0.5;
      addFloatingText(card.x, card.y - 40, "CORRECT! +1", "#ff7518");
      speak("Great job!");
      cardsRef.current = []; 
      setTimeout(nextRound, 1000);
    } else {
      screenFlashColorRef.current = '255, 50, 50'; // Red for incorrect
      screenFlashRef.current = 0.4;
      addFloatingText(card.x, card.y - 40, "WRONG!", "#ff4444");
      speak("Not quite! That was the " + card.data.word);
      cardsRef.current = [];
      setTimeout(nextRound, 1200);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    let animationId: number;

    const loop = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Screen Flash with dynamic color
      if (screenFlashRef.current > 0) {
        ctx.fillStyle = `rgba(${screenFlashColorRef.current}, ${screenFlashRef.current})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        screenFlashRef.current -= 0.02;
      }

      // Draw Saber Trail
      if (saberTrailRef.current.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(saberTrailRef.current[0].x, saberTrailRef.current[0].y);
        for (let i = 1; i < saberTrailRef.current.length; i++) {
          ctx.lineTo(saberTrailRef.current[i].x, saberTrailRef.current[i].y);
        }
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.4)';
        ctx.lineWidth = 25;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff64';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(saberTrailRef.current[0].x, saberTrailRef.current[0].y);
        for (let i = 1; i < saberTrailRef.current.length; i++) {
          ctx.lineTo(saberTrailRef.current[i].x, saberTrailRef.current[i].y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.shadowBlur = 0;
        ctx.stroke();
        
        ctx.restore();
      }

      // Update Saber Points
      saberTrailRef.current = saberTrailRef.current
        .map(p => ({ ...p, life: p.life - 1 }))
        .filter(p => p.life > 0);

      // Update & Draw Particles
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.3,
        life: p.life - 0.025
      })).filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Update & Draw Floating Texts
      floatingTextsRef.current = floatingTextsRef.current.map(ft => ({
        ...ft,
        y: ft.y + ft.velocity,
        life: ft.life - 0.015
      })).filter(ft => ft.life > 0);

      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${34 + (1 - ft.life) * 24}px 'Creepster', cursive`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Update & Draw Cards
      if (isPlayingRef.current) {
        const currentCards = cardsRef.current;
        for (let i = currentCards.length - 1; i >= 0; i--) {
          const card = currentCards[i];
          
          card.x += card.vx;
          card.y += card.vy;
          card.vy += GRAVITY;
          card.angle += card.rotationSpeed;

          // Collision detection
          const isMouseNearby = saberTrailRef.current.some(p => {
            const d = Math.sqrt((p.x - card.x) ** 2 + (p.y - card.y) ** 2);
            return d < card.size / 1.5;
          });

          if (isMouseNearby && !card.isSlashed) {
            handleSlash(card);
            continue; 
          }

          // Off-screen detection
          if (card.y > canvas.height + 250) {
            currentCards.splice(i, 1);
            if (currentCards.length === 0 && isPlayingRef.current && !isTransitioningRef.current) {
              nextRound();
            }
            continue;
          }

          if (!card.isSlashed) {
            ctx.save();
            ctx.translate(card.x, card.y);
            ctx.rotate(card.angle);
            
            if (card.isTarget) {
              ctx.shadowBlur = 20;
              ctx.shadowColor = 'rgba(255, 117, 24, 0.7)';
            }

            ctx.fillStyle = '#2d1440';
            ctx.strokeStyle = card.isTarget ? '#ff7518' : '#444';
            ctx.lineWidth = 6;
            const w = card.size;
            const h = card.size * 1.3;
            
            const r = 20;
            ctx.beginPath();
            ctx.moveTo(-w/2 + r, -h/2);
            ctx.lineTo(w/2 - r, -h/2);
            ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
            ctx.lineTo(w/2, h/2 - r);
            ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
            ctx.lineTo(-w/2 + r, h/2);
            ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
            ctx.lineTo(-w/2, -h/2 + r);
            ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${card.size * 0.6}px Arial`;
            ctx.fillText(card.data.emoji, 0, -card.size * 0.15);

            ctx.fillStyle = card.isTarget ? '#ffc064' : '#aaaaaa';
            ctx.font = `bold ${card.size * 0.18}px sans-serif`;
            ctx.fillText(card.data.word.toUpperCase(), 0, card.size * 0.45);

            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    const handleInput = (x: number, y: number) => {
      saberTrailRef.current.push({ x, y, life: SABER_LIFE });
    };

    const onMouseMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleInput(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, [nextRound, onScoreChange, speak]);

  return <canvas ref={canvasRef} className="cursor-none" />;
};

export default HalloweenGame;
