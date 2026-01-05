import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate a soft glow texture programmatically
function getStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Track scroll position for parallax
function useScrollPosition() {
    const scrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            scrollY.current = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollY;
}

function BackgroundStars({ count = 1000 }) {
    const points = useRef<THREE.Points>(null!);
    const texture = useMemo(() => getStarTexture(), []);
    const scrollY = useScrollPosition();

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Spread stars widely
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
        }
        return positions;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        if (points.current) {
            // Organic, slow drift using sine waves
            points.current.rotation.y = Math.sin(time * 0.05) * 0.08 + time * 0.01;
            points.current.rotation.x = Math.cos(time * 0.03) * 0.03;

            // Smooth parallax: Move stars based on scroll position
            const parallaxFactor = 0.0008;
            const targetY = -scrollY.current * parallaxFactor;
            const targetX = Math.sin(scrollY.current * 0.0008) * 0.5;

            // Lerp for smooth movement
            points.current.position.y += (targetY - points.current.position.y) * 0.1;
            points.current.position.x += (targetX - points.current.position.x) * 0.1;
        }
    });

    return (
        <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                map={texture}
                color="#E8E6E3"
                size={0.12}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.9}
                alphaTest={0.001}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

export function StarField() {
    return (
        <group>
            <BackgroundStars count={1200} />
            {/* Shooting stars are now handled by a separate canvas overlay component */}
        </group>
    );
}

