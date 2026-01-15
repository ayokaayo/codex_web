import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { shuffleArray, ALL_CARDS } from '../../hooks/useCardTextures';

// ============================================
// CONFIGURATION
// ============================================
export const WIND_CONFIG = {
    // Card sizing
    CARD_WIDTH: 0.7,
    CARD_HEIGHT: 1.2,
    CORNER_RADIUS: 0.04,

    // Layout - horizontal line
    CARD_SPACING: 1.8,           // Space between cards
    FORMATION_Y: 1.5,            // Height of card formation (camera is at Y=1, cards above camera)

    // Animation timing (seconds)
    INITIAL_FLIP_DELAY: 0.5,     // Delay before first reveal
    FLIP_STAGGER: 0.8,           // Time between each initial flip
    FLIP_DURATION: 0.8,          // Duration of flip animation
    DISPLAY_DURATION: 4.0,       // How long to show before replacing
    FALL_DURATION: 3.5,          // How long card takes to fall
    RISE_DURATION: 3.5,          // How long new card takes to rise
    REPLACEMENT_STAGGER: 2.0,    // Time between each card replacement

    // Physics
    SPAWN_Y: 5.5,                // Where cards spawn above
    VANISH_Y: -4.0,              // Where cards vanish below (viewport bottom)
    SWAY_AMOUNT: 0.15,           // Horizontal sway during fall (reduced for subtlety)
    SWAY_SPEED: 1.5,             // Speed of sway oscillation
    ROTATION_WOBBLE: 0.08,       // Rotation wobble (radians, reduced)
    FADE_START_PERCENT: 0.65,    // When to start fading (at 65% of journey)

    // Mobile adjustments
    MOBILE_BREAKPOINT: 768,
    MOBILE_CARD_WIDTH: 0.4,
    MOBILE_CARD_HEIGHT: 0.7,
    MOBILE_CARD_SPACING: 1.0,
    MOBILE_FORMATION_Y: 1.8,     // Higher for mobile (smaller cards)

    BASE_PATH: '/assets/cards/',
};

// ============================================
// Card back texture
// ============================================
function createCardBackTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 448;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0A0A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const borderWidth = 8;
    ctx.strokeStyle = '#C9A962';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);

    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
    gradient.addColorStop(0, 'rgba(201, 169, 98, 0.3)');
    gradient.addColorStop(0.5, 'rgba(107, 91, 149, 0.2)');
    gradient.addColorStop(1, 'rgba(10, 10, 26, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C9A962';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * 50;
        const y = centerY + Math.sin(angle) * 50;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

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

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// ============================================
// Rounded rectangle shape
// ============================================
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
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
// Card State Machine
// ============================================
type CardState =
    | 'initial_back'      // Starting state, showing back
    | 'initial_flip'      // First flip to reveal
    | 'displaying'        // Showing face, idle
    | 'falling'           // Old card falling with sway
    | 'rising'            // New card rising from below
    | 'replacement_flip'; // New card flipping to reveal

interface CardData {
    state: CardState;
    cardName: string;
    stateTimer: number;
    flipProgress: number;
    positionY: number;
    swayPhase: number;
    opacity: number;
}

// ============================================
// Individual Wind Card
// ============================================
interface WindCardProps {
    index: number;
    geometry: THREE.ShapeGeometry;
    backTexture: THREE.Texture;
    cardData: CardData;
    config: typeof WIND_CONFIG;
}

function WindCard({ index, geometry, backTexture, cardData, config }: WindCardProps) {
    const frontTexture = useTexture(`${config.BASE_PATH}${cardData.cardName}.webp`);
    frontTexture.colorSpace = THREE.SRGBColorSpace;

    // Calculate position
    const xPos = (index - 1) * config.CARD_SPACING; // -1, 0, 1 for 3 cards
    const yPos = cardData.positionY;

    // Calculate sway (horizontal drift)
    const swayX = Math.sin(cardData.swayPhase) * config.SWAY_AMOUNT;

    // Calculate rotation wobble
    const wobbleZ = Math.sin(cardData.swayPhase * 1.3) * config.ROTATION_WOBBLE;

    // Determine which side is showing based on flip progress
    const showingBack = cardData.flipProgress < 0.5;

    return (
        <group
            position={[xPos + swayX, yPos, 0]}
            rotation={[0, cardData.flipProgress * Math.PI, wobbleZ]}
        >
            {/* Front face */}
            <mesh visible={!showingBack}>
                <primitive object={geometry} attach="geometry" />
                <meshBasicMaterial
                    map={frontTexture}
                    side={THREE.FrontSide}
                    transparent
                    opacity={cardData.opacity}
                    toneMapped={false}
                    depthWrite={cardData.opacity > 0.5}
                />
            </mesh>

            {/* Back face */}
            <mesh rotation={[0, Math.PI, 0]} visible={showingBack}>
                <primitive object={geometry.clone()} attach="geometry" />
                <meshBasicMaterial
                    map={backTexture}
                    side={THREE.FrontSide}
                    transparent
                    opacity={cardData.opacity}
                    toneMapped={false}
                    depthWrite={cardData.opacity > 0.5}
                />
            </mesh>
        </group>
    );
}

// ============================================
// Main Component
// ============================================
export function WindReplacementCards() {
    const groupRef = useRef<THREE.Group>(null!);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < WIND_CONFIG.MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Active config (desktop or mobile)
    const activeConfig = useMemo(() => ({
        ...WIND_CONFIG,
        CARD_WIDTH: isMobile ? WIND_CONFIG.MOBILE_CARD_WIDTH : WIND_CONFIG.CARD_WIDTH,
        CARD_HEIGHT: isMobile ? WIND_CONFIG.MOBILE_CARD_HEIGHT : WIND_CONFIG.CARD_HEIGHT,
        CARD_SPACING: isMobile ? WIND_CONFIG.MOBILE_CARD_SPACING : WIND_CONFIG.CARD_SPACING,
        FORMATION_Y: isMobile ? WIND_CONFIG.MOBILE_FORMATION_Y : WIND_CONFIG.FORMATION_Y,
    }), [isMobile]);

    // Initialize 3 cards with random names
    const [cards, setCards] = useState<CardData[]>(() => {
        const shuffled = shuffleArray([...ALL_CARDS]);
        const initialFormationY = WIND_CONFIG.FORMATION_Y; // Use default config for initial state
        return [0, 1, 2].map(() => ({
            state: 'initial_back' as CardState,
            cardName: shuffled.pop()!,
            stateTimer: 0,
            flipProgress: 0, // 0 = back, 1 = front
            positionY: initialFormationY,
            swayPhase: 0,
            opacity: 1,
        }));
    });

    // Shared geometry
    const geometry = useMemo(() => {
        const shape = createRoundedRectShape(
            activeConfig.CARD_WIDTH,
            activeConfig.CARD_HEIGHT,
            activeConfig.CORNER_RADIUS
        );
        const geo = new THREE.ShapeGeometry(shape, 8);

        const pos = geo.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            uv[i * 2] = (pos.getX(i) + activeConfig.CARD_WIDTH / 2) / activeConfig.CARD_WIDTH;
            uv[i * 2 + 1] = (pos.getY(i) + activeConfig.CARD_HEIGHT / 2) / activeConfig.CARD_HEIGHT;
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

        return geo;
    }, [activeConfig.CARD_WIDTH, activeConfig.CARD_HEIGHT, activeConfig.CORNER_RADIUS]);

    // Shared back texture
    const backTexture = useMemo(() => createCardBackTexture(), []);

    // Card pool for getting new random cards
    const cardPool = useRef(shuffleArray([...ALL_CARDS]));
    const getNextCard = () => {
        if (cardPool.current.length === 0) {
            cardPool.current = shuffleArray([...ALL_CARDS]);
        }
        return cardPool.current.pop()!;
    };

    // Animation loop
    useFrame((_, delta) => {
        setCards(prevCards => prevCards.map((card, index) => {
            const newCard = { ...card };
            newCard.stateTimer += delta;

            // Always update sway phase for physics
            if (newCard.state === 'falling' || newCard.state === 'rising') {
                newCard.swayPhase += delta * activeConfig.SWAY_SPEED;
            }

            // State machine
            switch (newCard.state) {
                case 'initial_back': {
                    // Wait for initial delay + stagger
                    const triggerTime = activeConfig.INITIAL_FLIP_DELAY + (index * activeConfig.FLIP_STAGGER);
                    if (newCard.stateTimer >= triggerTime) {
                        newCard.state = 'initial_flip';
                        newCard.stateTimer = 0;
                    }
                    break;
                }

                case 'initial_flip': {
                    // Flip from back (0) to front (1)
                    newCard.flipProgress = Math.min(1, newCard.stateTimer / activeConfig.FLIP_DURATION);
                    if (newCard.stateTimer >= activeConfig.FLIP_DURATION) {
                        newCard.state = 'displaying';
                        newCard.stateTimer = 0;
                        newCard.flipProgress = 1;
                    }
                    break;
                }

                case 'displaying': {
                    // Show card, then trigger replacement based on index stagger
                    const displayTime = activeConfig.DISPLAY_DURATION + (index * activeConfig.REPLACEMENT_STAGGER);
                    if (newCard.stateTimer >= displayTime) {
                        newCard.state = 'falling';
                        newCard.stateTimer = 0;
                        newCard.swayPhase = Math.random() * Math.PI * 2; // Random start phase
                        newCard.flipProgress = 1; // Lock at front-facing
                    }
                    break;
                }

                case 'falling': {
                    // Fall from formation to vanish point
                    const progress = Math.min(1, newCard.stateTimer / activeConfig.FALL_DURATION);
                    newCard.positionY = THREE.MathUtils.lerp(
                        activeConfig.FORMATION_Y,
                        activeConfig.VANISH_Y,
                        progress
                    );

                    // Keep showing front face while falling
                    newCard.flipProgress = 1;

                    // Fade out starting at FADE_START_PERCENT
                    if (progress >= activeConfig.FADE_START_PERCENT) {
                        const fadeProgress = (progress - activeConfig.FADE_START_PERCENT) / (1 - activeConfig.FADE_START_PERCENT);
                        newCard.opacity = 1 - fadeProgress;
                    }

                    if (progress >= 1) {
                        // Reset for new card rising
                        newCard.state = 'rising';
                        newCard.stateTimer = 0;
                        newCard.cardName = getNextCard();
                        newCard.flipProgress = 0; // Back to showing back
                        newCard.positionY = activeConfig.SPAWN_Y;
                        newCard.opacity = 0;
                        newCard.swayPhase = Math.random() * Math.PI * 2;
                    }
                    break;
                }

                case 'rising': {
                    // Rise from spawn point to formation
                    const progress = Math.min(1, newCard.stateTimer / activeConfig.RISE_DURATION);
                    newCard.positionY = THREE.MathUtils.lerp(
                        activeConfig.SPAWN_Y,
                        activeConfig.FORMATION_Y,
                        progress
                    );

                    // Keep showing back while rising
                    newCard.flipProgress = 0;

                    // Fade in during first 30%
                    if (progress <= 0.3) {
                        newCard.opacity = progress / 0.3;
                    } else {
                        newCard.opacity = 1;
                    }

                    if (progress >= 1) {
                        newCard.state = 'replacement_flip';
                        newCard.stateTimer = 0;
                        newCard.positionY = activeConfig.FORMATION_Y;
                        newCard.swayPhase = 0;
                        newCard.flipProgress = 0; // Ensure it starts from back
                    }
                    break;
                }

                case 'replacement_flip': {
                    // Flip new card from back to front
                    newCard.flipProgress = Math.min(1, newCard.stateTimer / activeConfig.FLIP_DURATION);
                    if (newCard.stateTimer >= activeConfig.FLIP_DURATION) {
                        newCard.state = 'displaying';
                        newCard.stateTimer = 0;
                        newCard.flipProgress = 1;
                    }
                    break;
                }
            }

            return newCard;
        }));
    });

    return (
        <group ref={groupRef}>
            {cards.map((cardData, index) => (
                <WindCard
                    key={index}
                    index={index}
                    geometry={geometry}
                    backTexture={backTexture}
                    cardData={cardData}
                    config={activeConfig}
                />
            ))}
        </group>
    );
}
