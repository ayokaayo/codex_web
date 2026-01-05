import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface GalaxyProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color?: string;
    count?: number;
    radius?: number;
}

export function Galaxy({
    position = [0, 0, -20],
    rotation = [0.5, 0.5, 0],
    scale = 1,
    color = "#6B5B95",
    count = 3000,
    radius = 10
}: GalaxyProps) {
    const points = useRef<THREE.Points>(null!);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const centerColor = new THREE.Color("#FFB800"); // Gold center
        const outerColor = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const r = Math.random() * radius;
            const spinAngle = r * 5; // Spiral factor
            const branchAngle = ((i % 3) / 3) * Math.PI * 2; // 3 arms

            const x = Math.cos(branchAngle + spinAngle) * r + (Math.random() - 0.5) * (0.5 + r * 0.2);
            const y = (Math.random() - 0.5) * (r * 0.1); // Flattened disk
            const z = Math.sin(branchAngle + spinAngle) * r + (Math.random() - 0.5) * (0.5 + r * 0.2);

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Color mix
            const mixedColor = centerColor.clone().lerp(outerColor, r / radius);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }
        return { positions, colors };
    }, [count, radius, color]);

    useFrame((state) => {
        if (points.current) {
            // Slow rotation of the entire galaxy
            points.current.rotation.y += 0.001;
        }
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <Points ref={points} positions={particlesPosition.positions} colors={particlesPosition.colors} stride={3}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.1}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
            {/* Core Glow */}
            <mesh>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
}
