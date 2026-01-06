import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// CONFIGURATION - Easy to edit!
// ============================================
const CARD_CONFIG = {
    DEFAULT_WIDTH: 0.8,
    DEFAULT_HEIGHT: 1.4,        // Tarot ratio ~1:1.75
    CORNER_RADIUS: 0.04,        // Rounded corner size
    CORNER_SEGMENTS: 8,         // Smoothness of corners
    FLIP_DURATION: 0.8,         // Seconds for flip animation
    FLIP_EASING: 'easeInOut',   // Easing type
};

// ============================================
// Procedural Card Back Texture
// ============================================
function createCardBackTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 448; // Match tarot ratio
    const ctx = canvas.getContext('2d')!;

    // Deep navy background
    ctx.fillStyle = '#0A0A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gold border
    const borderWidth = 8;
    ctx.strokeStyle = '#C9A962';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);

    // Inner decorative border
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Central cosmic design
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Radial gradient background circle
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
    gradient.addColorStop(0, 'rgba(201, 169, 98, 0.3)');
    gradient.addColorStop(0.5, 'rgba(107, 91, 149, 0.2)');
    gradient.addColorStop(1, 'rgba(10, 10, 26, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Star pattern
    ctx.fillStyle = '#C9A962';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * 50;
        const y = centerY + Math.sin(angle) * 50;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Center symbol (simple star)
    ctx.beginPath();
    ctx.strokeStyle = '#C9A962';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * 30;
        const y1 = centerY + Math.sin(angle) * 30;
        const x2 = centerX + Math.cos(nextAngle) * 30;
        const y2 = centerY + Math.sin(nextAngle) * 30;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Small decorative dots in corners
    const dotPositions = [
        [30, 30], [canvas.width - 30, 30],
        [30, canvas.height - 30], [canvas.width - 30, canvas.height - 30]
    ];
    ctx.fillStyle = '#C9A962';
    dotPositions.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// ============================================
// Rounded Rectangle Geometry
// ============================================
function createRoundedRectShape(
    width: number,
    height: number,
    radius: number
): THREE.Shape {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
    shape.lineTo(x + width, y + height - radius);
    shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
    shape.lineTo(x + radius, y + height);
    shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
    shape.lineTo(x, y + radius);
    shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);

    return shape;
}

// ============================================
// TarotCard Component
// ============================================
export interface TarotCardProps {
    frontTexturePath: string;
    backTexturePath?: string;       // Optional - uses procedural if not provided
    isFlipped?: boolean;
    width?: number;
    height?: number;
    cornerRadius?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    onFlipComplete?: () => void;
}

export function TarotCard({
    frontTexturePath,
    backTexturePath,
    isFlipped = false,
    width = CARD_CONFIG.DEFAULT_WIDTH,
    height = CARD_CONFIG.DEFAULT_HEIGHT,
    cornerRadius = CARD_CONFIG.CORNER_RADIUS,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    onFlipComplete,
}: TarotCardProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const [currentFlipRotation, setCurrentFlipRotation] = useState(0);
    const targetFlipRotation = isFlipped ? Math.PI : 0;

    // Load front texture
    const frontTexture = useTexture(frontTexturePath);
    frontTexture.colorSpace = THREE.SRGBColorSpace;

    // Load or create back texture
    const backTexture = useMemo(() => {
        if (backTexturePath) {
            // Would need async loading here for custom back
            return createCardBackTexture();
        }
        return createCardBackTexture();
    }, [backTexturePath]);

    // Create rounded rectangle geometry
    const geometry = useMemo(() => {
        const shape = createRoundedRectShape(width, height, cornerRadius);
        const geometry = new THREE.ShapeGeometry(shape, CARD_CONFIG.CORNER_SEGMENTS);

        // Generate UV coordinates
        const pos = geometry.attributes.position;
        const uv = new Float32Array(pos.count * 2);

        for (let i = 0; i < pos.count; i++) {
            uv[i * 2] = (pos.getX(i) + width / 2) / width;
            uv[i * 2 + 1] = (pos.getY(i) + height / 2) / height;
        }

        geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        return geometry;
    }, [width, height, cornerRadius]);

    // Animate flip
    useFrame((_, delta) => {
        const speed = (1 / CARD_CONFIG.FLIP_DURATION) * Math.PI;
        const diff = targetFlipRotation - currentFlipRotation;

        if (Math.abs(diff) > 0.01) {
            const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * delta);
            setCurrentFlipRotation(prev => prev + step);
        } else if (Math.abs(diff) <= 0.01 && Math.abs(diff) > 0) {
            setCurrentFlipRotation(targetFlipRotation);
            onFlipComplete?.();
        }
    });

    // Determine which side is showing
    const showingBack = Math.abs(currentFlipRotation) > Math.PI / 2;

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={[rotation[0], rotation[1] + currentFlipRotation, rotation[2]]}
        >
            {/* Front face */}
            <mesh visible={!showingBack}>
                <primitive object={geometry} attach="geometry" />
                <meshBasicMaterial
                    map={frontTexture}
                    side={THREE.FrontSide}
                    transparent
                    toneMapped={false}
                />
            </mesh>

            {/* Back face (rotated 180 degrees) */}
            <mesh rotation={[0, Math.PI, 0]} visible={showingBack}>
                <primitive object={geometry.clone()} attach="geometry" />
                <meshBasicMaterial
                    map={backTexture}
                    side={THREE.FrontSide}
                    transparent
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export { CARD_CONFIG };
