import { useMemo } from 'react';
import * as THREE from 'three';

// Create a simple gradient nebula using a large plane with a radial gradient texture
function createNebulaTexture(color1: string, color2: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Radial gradient from center
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, 'rgba(10, 10, 15, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
    }
    return new THREE.CanvasTexture(canvas);
}

interface NebulaCloudProps {
    position: [number, number, number];
    scale: number;
    color1: string;
    color2: string;
    opacity: number;
}

function NebulaCloud({ position, scale, color1, color2, opacity }: NebulaCloudProps) {
    const texture = useMemo(() => createNebulaTexture(color1, color2), [color1, color2]);

    return (
        <mesh position={position} scale={scale}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={opacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

export function Nebula() {
    return (
        <group>
            {/* Large purple haze - bottom left */}
            <NebulaCloud
                position={[-8, -5, -20]}
                scale={6}
                color1="rgba(107, 91, 149, 0.35)"
                color2="rgba(74, 64, 102, 0.18)"
                opacity={0.5}
            />

            {/* Blue mist - top right */}
            <NebulaCloud
                position={[10, 8, -25]}
                scale={5}
                color1="rgba(74, 124, 155, 0.3)"
                color2="rgba(58, 95, 120, 0.12)"
                opacity={0.45}
            />

            {/* Deep purple - far back */}
            <NebulaCloud
                position={[-5, 5, -35]}
                scale={7}
                color1="rgba(74, 64, 102, 0.25)"
                color2="rgba(18, 18, 26, 0.08)"
                opacity={0.35}
            />
        </group>
    );
}
