import { useRef, useState, useMemo, useEffect, Suspense, memo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { shuffleArray, ALL_CARDS } from '../../hooks/useCardTextures';

// ============================================
// CONFIGURATION
// ============================================
export const CARD_CONFIG = {
    CARD_WIDTH: 0.7,
    CARD_HEIGHT: 1.2,
    CARD_SPACING: 1.8,
    FORMATION_Y: 1.5,

    INITIAL_FLIP_DELAY: 0.8,
    FLIP_STAGGER: 0.8,
    FLIP_DURATION: 0.8,
    DISPLAY_DURATION: 4.0,
    FALL_DURATION: 3.5,
    RISE_DURATION: 3.5,
    REPLACEMENT_STAGGER: 2.5,

    SPAWN_Y: 5.5,
    VANISH_Y: -4.0,
    SWAY_AMOUNT: 0.15,
    SWAY_SPEED: 1.5,
    FADE_START: 0.65,

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

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// ============================================
// Card state
// ============================================
type CardState = 'initial_back' | 'initial_flip' | 'displaying' | 'falling' | 'rising' | 'replacement_flip';

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
// Single Card Component (Memoized to prevent re-renders)
// ============================================
const Card = memo(function Card({ cardName, index, flipProgress, positionY, opacity, swayPhase }: {
    cardName: string;
    index: number;
    flipProgress: number;
    positionY: number;
    opacity: number;
    swayPhase: number;
}) {
    const frontTexturePath = useMemo(() => `${CARD_CONFIG.BASE_PATH}${cardName}.webp`, [cardName]);

    // Load texture once per cardName
    const frontTexture = useLoader(THREE.TextureLoader, frontTexturePath);
    const backTexture = useMemo(() => createCardBackTexture(), []);

    useEffect(() => {
        if (frontTexture) {
            frontTexture.colorSpace = THREE.SRGBColorSpace;
        }
    }, [frontTexture]);

    const xPos = (index - 1) * CARD_CONFIG.CARD_SPACING;
    const swayX = Math.sin(swayPhase) * CARD_CONFIG.SWAY_AMOUNT;
    const wobbleZ = Math.sin(swayPhase * 1.3) * 0.08;

    const showingBack = flipProgress < 0.5;

    return (
        <group
            position={[xPos + swayX, positionY, 0]}
            rotation={[0, flipProgress * Math.PI, wobbleZ]}
        >
            <mesh visible={!showingBack}>
                <planeGeometry args={[CARD_CONFIG.CARD_WIDTH, CARD_CONFIG.CARD_HEIGHT]} />
                <meshBasicMaterial
                    map={frontTexture}
                    transparent
                    opacity={opacity}
                    side={THREE.FrontSide}
                    toneMapped={false}
                />
            </mesh>

            <mesh rotation={[0, Math.PI, 0]} visible={showingBack}>
                <planeGeometry args={[CARD_CONFIG.CARD_WIDTH, CARD_CONFIG.CARD_HEIGHT]} />
                <meshBasicMaterial
                    map={backTexture}
                    transparent
                    opacity={opacity}
                    side={THREE.FrontSide}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
});

// ============================================
// Fallback while loading
// ============================================
function CardFallback({ index }: { index: number }) {
    const xPos = (index - 1) * CARD_CONFIG.CARD_SPACING;
    return (
        <mesh position={[xPos, CARD_CONFIG.FORMATION_Y, 0]}>
            <planeGeometry args={[CARD_CONFIG.CARD_WIDTH, CARD_CONFIG.CARD_HEIGHT]} />
            <meshBasicMaterial color="#1a1a2e" transparent opacity={0.3} />
        </mesh>
    );
}

// ============================================
// Main Cards System
// ============================================
export function SimpleWindCards() {
    const [cards, setCards] = useState<CardData[]>(() => {
        const shuffled = shuffleArray([...ALL_CARDS]);
        return [0, 1, 2].map(() => ({
            state: 'initial_back' as CardState,
            cardName: shuffled.pop()!,
            stateTimer: 0,
            flipProgress: 0,
            positionY: CARD_CONFIG.FORMATION_Y,
            swayPhase: 0,
            opacity: 1,
        }));
    });

    const cardPool = useRef(shuffleArray([...ALL_CARDS]));
    const getNextCard = () => {
        if (cardPool.current.length === 0) {
            cardPool.current = shuffleArray([...ALL_CARDS]);
        }
        return cardPool.current.pop()!;
    };

    useFrame((_, delta) => {
        setCards(prevCards => prevCards.map((card, index) => {
            const newCard = { ...card };
            newCard.stateTimer += delta;

            if (newCard.state === 'falling' || newCard.state === 'rising') {
                newCard.swayPhase += delta * CARD_CONFIG.SWAY_SPEED;
            }

            switch (newCard.state) {
                case 'initial_back': {
                    const triggerTime = CARD_CONFIG.INITIAL_FLIP_DELAY + (index * CARD_CONFIG.FLIP_STAGGER);
                    if (newCard.stateTimer >= triggerTime) {
                        newCard.state = 'initial_flip';
                        newCard.stateTimer = 0;
                    }
                    break;
                }

                case 'initial_flip': {
                    newCard.flipProgress = Math.min(1, newCard.stateTimer / CARD_CONFIG.FLIP_DURATION);
                    if (newCard.stateTimer >= CARD_CONFIG.FLIP_DURATION) {
                        newCard.state = 'displaying';
                        newCard.stateTimer = 0;
                        newCard.flipProgress = 1;
                    }
                    break;
                }

                case 'displaying': {
                    const displayTime = CARD_CONFIG.DISPLAY_DURATION + (index * CARD_CONFIG.REPLACEMENT_STAGGER);
                    if (newCard.stateTimer >= displayTime) {
                        newCard.state = 'falling';
                        newCard.stateTimer = 0;
                        newCard.swayPhase = Math.random() * Math.PI * 2;
                        newCard.flipProgress = 1;
                    }
                    break;
                }

                case 'falling': {
                    const progress = Math.min(1, newCard.stateTimer / CARD_CONFIG.FALL_DURATION);
                    newCard.positionY = THREE.MathUtils.lerp(
                        CARD_CONFIG.FORMATION_Y,
                        CARD_CONFIG.VANISH_Y,
                        progress
                    );
                    newCard.flipProgress = 1;

                    if (progress >= CARD_CONFIG.FADE_START) {
                        const fadeProgress = (progress - CARD_CONFIG.FADE_START) / (1 - CARD_CONFIG.FADE_START);
                        newCard.opacity = 1 - fadeProgress;
                    }

                    if (progress >= 1) {
                        newCard.state = 'rising';
                        newCard.stateTimer = 0;
                        newCard.cardName = getNextCard();
                        newCard.flipProgress = 0;
                        newCard.positionY = CARD_CONFIG.SPAWN_Y;
                        newCard.opacity = 0;
                        newCard.swayPhase = Math.random() * Math.PI * 2;
                    }
                    break;
                }

                case 'rising': {
                    const progress = Math.min(1, newCard.stateTimer / CARD_CONFIG.RISE_DURATION);
                    newCard.positionY = THREE.MathUtils.lerp(
                        CARD_CONFIG.SPAWN_Y,
                        CARD_CONFIG.FORMATION_Y,
                        progress
                    );
                    newCard.flipProgress = 0;

                    if (progress <= 0.3) {
                        newCard.opacity = progress / 0.3;
                    } else {
                        newCard.opacity = 1;
                    }

                    if (progress >= 1) {
                        newCard.state = 'replacement_flip';
                        newCard.stateTimer = 0;
                        newCard.positionY = CARD_CONFIG.FORMATION_Y;
                        newCard.swayPhase = 0;
                        newCard.flipProgress = 0;
                    }
                    break;
                }

                case 'replacement_flip': {
                    newCard.flipProgress = Math.min(1, newCard.stateTimer / CARD_CONFIG.FLIP_DURATION);
                    if (newCard.stateTimer >= CARD_CONFIG.FLIP_DURATION) {
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
        <group>
            {cards.map((cardData, index) => (
                <Suspense key={index} fallback={<CardFallback index={index} />}>
                    <Card
                        cardName={cardData.cardName}
                        index={index}
                        flipProgress={cardData.flipProgress}
                        positionY={cardData.positionY}
                        opacity={cardData.opacity}
                        swayPhase={cardData.swayPhase}
                    />
                </Suspense>
            ))}
        </group>
    );
}
