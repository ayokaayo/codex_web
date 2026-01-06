import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { shuffleArray, ALL_CARDS } from '../../hooks/useCardTextures';

// ============================================
// CONFIGURATION - Easy to edit!
// ============================================
export const RING_CONFIG = {
    // Ring geometry - PERFECT CIRCLE (full 360° carousel)
    CARD_COUNT: 20,              // Cards distributed around full circle
    RING_RADIUS: 5.0,            // Balanced radius - enough spacing, no overlap
    RING_OFFSET_Y: -4.2,         // MORE NEGATIVE = push circle DOWN more
    RING_OFFSET_Z: 0,            // Keep at origin Z

    // Card sizing - SMALLER to fit more cards and avoid cropping
    CARD_WIDTH: 0.95,
    CARD_HEIGHT: 1.66,           // Tarot ratio ~1:1.75
    CORNER_RADIUS: 0.04,

    // Animation
    ROTATION_SPEED: 0.04,        // SLOWER, more elegant rotation
    AUTO_ROTATE: true,
    ROTATION_DIRECTION: 1,       // 1 = clockwise, -1 = counter-clockwise

    // Flip settings - DISABLED for now
    ENABLE_FLIP: false,

    // Visual - FLAT orientation for now
    CARD_TILT: 0,                // No tilt - keep flat
    CARD_FACE_ROTATION: 0,       // No face rotation - keep flat
    BASE_PATH: '/assets/cards/',

    // Scale and opacity falloff - DISABLED for perfect centering
    ENABLE_SCALE_FALLOFF: false,
    ENABLE_OPACITY_FALLOFF: false,
};

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
// Perfect circle positioning - all cards same size/opacity
// ============================================
// (Removed falloff calculation for flat, centered positioning)

// ============================================
// Individual Card in Ring
// ============================================
interface RingCardProps {
    texturePath: string;
    geometry: THREE.ShapeGeometry;
    angleOffset: number;
    currentRotation: number;
    config: typeof RING_CONFIG;
}

function RingCard({
    texturePath,
    geometry,
    angleOffset,
    currentRotation,
    config,
}: RingCardProps) {
    const frontTexture = useTexture(texturePath);
    frontTexture.colorSpace = THREE.SRGBColorSpace;

    // Calculate card position on PERFECT CIRCLE
    const angle = angleOffset + currentRotation;

    // Perfect circle: X and Y use same radius
    const x = Math.sin(angle) * config.RING_RADIUS;
    const y = Math.cos(angle) * config.RING_RADIUS + config.RING_OFFSET_Y;
    const z = config.RING_OFFSET_Z;

    // FLAT orientation - no rotation for now
    const faceRotation = config.CARD_FACE_ROTATION;

    return (
        <group
            position={[x, y, z]}
            rotation={[config.CARD_TILT, faceRotation, 0]}
        >
            {/* Front face - always visible for now */}
            <mesh>
                <primitive object={geometry} attach="geometry" />
                <meshBasicMaterial
                    map={frontTexture}
                    side={THREE.FrontSide}
                    transparent
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

// ============================================
// CardRing Component
// ============================================
export function CardRing() {
    const groupRef = useRef<THREE.Group>(null!);
    const [rotation, setRotation] = useState(0);

    // Shuffle cards on mount
    const shuffledCards = useMemo(() => {
        const shuffled = shuffleArray(ALL_CARDS);
        return shuffled.slice(0, RING_CONFIG.CARD_COUNT);
    }, []);

    // Create shared geometry
    const geometry = useMemo(() => {
        const shape = createRoundedRectShape(
            RING_CONFIG.CARD_WIDTH,
            RING_CONFIG.CARD_HEIGHT,
            RING_CONFIG.CORNER_RADIUS
        );
        const geo = new THREE.ShapeGeometry(shape, 8);

        // Generate UV coordinates
        const pos = geo.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            uv[i * 2] = (pos.getX(i) + RING_CONFIG.CARD_WIDTH / 2) / RING_CONFIG.CARD_WIDTH;
            uv[i * 2 + 1] = (pos.getY(i) + RING_CONFIG.CARD_HEIGHT / 2) / RING_CONFIG.CARD_HEIGHT;
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

        return geo;
    }, []);

    // Calculate angle offset for each card
    const cardAngles = useMemo(() => {
        const angles: number[] = [];
        for (let i = 0; i < RING_CONFIG.CARD_COUNT; i++) {
            angles.push((i / RING_CONFIG.CARD_COUNT) * Math.PI * 2);
        }
        return angles;
    }, []);

    // Animate rotation
    useFrame((_, delta) => {
        if (RING_CONFIG.AUTO_ROTATE) {
            setRotation(prev =>
                prev + RING_CONFIG.ROTATION_SPEED * delta * RING_CONFIG.ROTATION_DIRECTION
            );
        }
    });

    return (
        <group ref={groupRef}>
            {shuffledCards.map((cardName, index) => (
                <RingCard
                    key={cardName}
                    texturePath={`${RING_CONFIG.BASE_PATH}${cardName}.png`}
                    geometry={geometry}
                    angleOffset={cardAngles[index]}
                    currentRotation={rotation}
                    config={RING_CONFIG}
                />
            ))}
        </group>
    );
}
