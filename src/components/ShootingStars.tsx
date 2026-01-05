import { useEffect, useRef } from 'react';

interface ShootingStar {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

/**
 * Canvas-based shooting stars overlay component
 * Based on: https://dev.to/usman_awan/how-i-built-a-grok-inspired-starfield-shooting-stars-using-html-canvas-3872
 */
export function ShootingStars() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shootingStarsRef = useRef<ShootingStar[]>([]);
    const animationIdRef = useRef<number>(0);
    const nextSpawnRef = useRef<number>(Date.now() + 5000); // First spawn in 5 seconds

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handler
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear with transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn shooting star on timer (every 20-30 seconds)
            if (shootingStarsRef.current.length === 0 && nextSpawnRef.current <= Date.now()) {
                // Start from top-right area, move toward bottom-left
                shootingStarsRef.current.push({
                    x: Math.random() * canvas.width * 0.6 + canvas.width * 0.3,
                    y: Math.random() * canvas.height * 0.3,
                    vx: -(8 + Math.random() * 6),  // Move left (faster)
                    vy: 4 + Math.random() * 4,     // Move down (faster)
                    life: 1.0
                });
                // Schedule next spawn in 20-30 seconds
                nextSpawnRef.current = Date.now() + 20000 + Math.random() * 10000;
            }

            // Update and draw shooting stars
            shootingStarsRef.current = shootingStarsRef.current.filter(s => {
                // Update position
                s.x += s.vx;
                s.y += s.vy;
                s.life -= 0.008;

                // Skip if dead or off-screen
                if (s.life <= 0 || s.x < -50 || s.y > canvas.height + 50) {
                    return false;
                }

                // Draw the trail with gradient
                const trailLength = 45;
                const grad = ctx.createLinearGradient(
                    s.x, s.y,
                    s.x - s.vx * trailLength,
                    s.y - s.vy * trailLength
                );

                const alpha = s.life;
                grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                grad.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.6})`);
                grad.addColorStop(0.6, `rgba(150, 180, 255, ${alpha * 0.3})`);
                grad.addColorStop(1, 'rgba(100, 150, 255, 0)');

                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * trailLength, s.y - s.vy * trailLength);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw bright head glow
                const headGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4);
                headGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                headGrad.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.5})`);
                headGrad.addColorStop(1, 'rgba(150, 180, 255, 0)');

                ctx.beginPath();
                ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = headGrad;
                ctx.fill();

                return true;
            });

            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationIdRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
