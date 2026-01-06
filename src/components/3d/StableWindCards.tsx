import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { shuffleArray, ALL_CARDS } from '../../hooks/useCardTextures';

// ============================================
// CONFIGURATION
// ============================================
export const CARD_CONFIG = {
    CARD_WIDTH: 1.0,
    CARD_HEIGHT: 1.7,
    CARD_SPACING: 1.3,
    FORMATION_Y: 1.0,

    INITIAL_FLIP_DELAY: 0.5,
    FLIP_STAGGER: 0.6,
    FLIP_DURATION: 0.9,
    DISPLAY_DURATION: 3.5,

    // NEW ANIMATION CONFIG
    EXIT_DURATION: 1.5,          // Time to float UP (faster to avoid gaps)
    ENTER_DURATION: 1.5,         // Time to descend DOWN from top (faster to avoid gaps)
    REPLACEMENT_STAGGER: 3.5,    // Stagger > exit+enter to avoid 2 empty cards

    SPAWN_Y: 7.0,                // Enter from TOP (High above viewport)
    VANISH_Y: 7.0,               // Exit to TOP (High above viewport)

    // REFINED WOBBLE
    SWAY_AMOUNT: 0.05,           // Reduced from 0.12 (User requested "gentle")
    SWAY_SPEED: 0.4,             // Reduces from 0.6 (Slower, more languid)
    FADE_START: 0.85,

    // Mobile
    MOBILE_CARD_WIDTH: 0.7,
    MOBILE_CARD_HEIGHT: 1.2,
    MOBILE_CARD_SPACING: 0.9,

    BASE_PATH: '/assets/cards/',
    BACK_TEXTURE_PATH: '/assets/cards/back.png',
};

// ============================================
// Easing function
// ============================================
function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// Single animated card
// ============================================
function AnimatedCard({ cardName, index, cardPool, scrollOffsetRef, isMobile }: {
    cardName: string;
    index: number;
    cardPool: React.MutableRefObject<string[]>;
    scrollOffsetRef: React.MutableRefObject<number>;
    isMobile: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null!);
    const frontMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
    const backMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
    const [currentCard, setCurrentCard] = useState(cardName);
    const [nextCard, setNextCard] = useState<string | null>(null);

    // Responsive card sizing
    const cardWidth = isMobile ? CARD_CONFIG.MOBILE_CARD_WIDTH : CARD_CONFIG.CARD_WIDTH;
    const cardHeight = isMobile ? CARD_CONFIG.MOBILE_CARD_HEIGHT : CARD_CONFIG.CARD_HEIGHT;
    const cardSpacing = isMobile ? CARD_CONFIG.MOBILE_CARD_SPACING : CARD_CONFIG.CARD_SPACING;

    // Load textures
    const frontTexture = useTexture(`${CARD_CONFIG.BASE_PATH}${currentCard}.png`);
    const backTexture = useTexture(CARD_CONFIG.BACK_TEXTURE_PATH);

    frontTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.colorSpace = THREE.SRGBColorSpace;

    // Preload next texture when it's determined
    useEffect(() => {
        if (nextCard) {
            useTexture.preload(`${CARD_CONFIG.BASE_PATH}${nextCard}.png`);
        }
    }, [nextCard]);

    // Animation state
    const state = useRef({
        phase: 'initial_back' as 'initial_back' | 'initial_flip' | 'displaying' | 'exiting' | 'entering' | 'replacement_flip',
        timer: 0,
        flipProgress: 0,
        positionY: CARD_CONFIG.FORMATION_Y,
        swayPhase: 0,
        opacity: 1,
        nextCardQueued: false
    });

    const getNextCard = () => {
        if (cardPool.current.length === 0) {
            cardPool.current = shuffleArray([...ALL_CARDS]);
        }
        return cardPool.current.pop()!;
    };

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const s = state.current;
        s.timer += delta;
        s.swayPhase += delta * CARD_CONFIG.SWAY_SPEED;

        switch (s.phase) {
            case 'initial_back': {
                const triggerTime = CARD_CONFIG.INITIAL_FLIP_DELAY + (index * CARD_CONFIG.FLIP_STAGGER);
                if (s.timer >= triggerTime) {
                    s.phase = 'initial_flip';
                    s.timer = 0;
                }
                break;
            }

            case 'initial_flip': {
                const progress = Math.min(1, s.timer / CARD_CONFIG.FLIP_DURATION);
                s.flipProgress = easeInOutCubic(progress);
                if (s.timer >= CARD_CONFIG.FLIP_DURATION) {
                    s.phase = 'displaying';
                    s.timer = 0;
                    s.flipProgress = 1;
                }
                break;
            }

            case 'displaying': {
                s.flipProgress = 1;
                s.positionY = CARD_CONFIG.FORMATION_Y;

                // Queue next card near the end of display time to start preloading
                const displayTime = CARD_CONFIG.DISPLAY_DURATION + (index * CARD_CONFIG.REPLACEMENT_STAGGER);

                if (!s.nextCardQueued && s.timer >= displayTime - 1.0) {
                    const next = getNextCard();
                    setNextCard(next); // Triggers preloading
                    s.nextCardQueued = true;
                }

                if (s.timer >= displayTime) {
                    s.phase = 'exiting';
                    s.timer = 0;
                }
                break;
            }

            case 'exiting': { // Slide UP to vanish (Center -> Top)
                const progress = Math.min(1, s.timer / CARD_CONFIG.EXIT_DURATION);
                const easedProgress = easeInOutCubic(progress);

                // Move from Formation UP to Vanish (Top)
                s.positionY = THREE.MathUtils.lerp(CARD_CONFIG.FORMATION_Y, CARD_CONFIG.VANISH_Y, easedProgress);
                s.flipProgress = 1;

                if (progress >= CARD_CONFIG.FADE_START) {
                    const fadeProgress = (progress - CARD_CONFIG.FADE_START) / (1 - CARD_CONFIG.FADE_START);
                    s.opacity = 1 - easeInOutCubic(fadeProgress);
                } else {
                    s.opacity = 1;
                }

                if (progress >= 1) {
                    s.phase = 'entering';
                    s.timer = 0;

                    // Apply preloaded next card
                    if (nextCard) {
                        setCurrentCard(nextCard);
                        setNextCard(null); // Reset for next cycle
                    }
                    s.nextCardQueued = false;

                    s.flipProgress = 0;
                    s.positionY = CARD_CONFIG.SPAWN_Y;
                    s.opacity = 0;
                    s.swayPhase = 0;
                }
                break;
            }

            case 'entering': { // Slide DOWN from Top (Top -> Center)
                const progress = Math.min(1, s.timer / CARD_CONFIG.ENTER_DURATION);
                const easedProgress = easeInOutCubic(progress);

                // Move from Spawn (Top) DOWN to Formation
                s.positionY = THREE.MathUtils.lerp(CARD_CONFIG.SPAWN_Y, CARD_CONFIG.FORMATION_Y, easedProgress);
                s.flipProgress = 0;

                if (progress <= 0.3) {
                    s.opacity = easeInOutCubic(progress / 0.3);
                } else {
                    s.opacity = 1;
                }

                if (progress >= 1) {
                    s.phase = 'replacement_flip';
                    s.timer = 0;
                    s.positionY = CARD_CONFIG.FORMATION_Y;
                    // Don't reset swayPhase - let it continue smoothly
                    s.flipProgress = 0;
                }
                break;
            }

            case 'replacement_flip': {
                const progress = Math.min(1, s.timer / CARD_CONFIG.FLIP_DURATION);
                s.flipProgress = easeInOutCubic(progress);
                if (s.timer >= CARD_CONFIG.FLIP_DURATION) {
                    s.phase = 'displaying';
                    s.timer = 0;
                    s.flipProgress = 1;
                }
                break;
            }
        }

        const xPos = (index - 1) * cardSpacing;
        const swayX = Math.sin(s.swayPhase) * CARD_CONFIG.SWAY_AMOUNT;
        const yPosWithScroll = s.positionY + scrollOffsetRef.current;

        groupRef.current.position.set(xPos + swayX, yPosWithScroll, 0);
        groupRef.current.rotation.set(0, (1 - s.flipProgress) * Math.PI, 0);

        // CRITICAL FIX: Update material properties dynamically
        const needsTransparency = s.opacity < 1;

        if (frontMaterialRef.current) {
            frontMaterialRef.current.transparent = needsTransparency;
            frontMaterialRef.current.opacity = s.opacity;
            frontMaterialRef.current.needsUpdate = true;
        }

        if (backMaterialRef.current) {
            backMaterialRef.current.transparent = needsTransparency;
            backMaterialRef.current.opacity = s.opacity;
            backMaterialRef.current.needsUpdate = true;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Front face - pulled toward camera with polygonOffset */}
            <mesh renderOrder={2}>
                <planeGeometry args={[cardWidth, cardHeight]} />
                <meshBasicMaterial
                    ref={frontMaterialRef}
                    map={frontTexture}
                    transparent={false}
                    opacity={1}
                    side={THREE.FrontSide}
                    toneMapped={false}
                    depthWrite={true}
                    polygonOffset={true}
                    polygonOffsetFactor={-1}
                    polygonOffsetUnits={-1}
                />
            </mesh>
            {/* 
                Back face - pushed away from camera with polygonOffset
                Increased Z-separation from 0.005 to 0.02 for extra safety
            */}
            <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.02]} renderOrder={1}>
                <planeGeometry args={[cardWidth, cardHeight]} />
                <meshBasicMaterial
                    ref={backMaterialRef}
                    map={backTexture}
                    transparent={false}
                    opacity={1}
                    side={THREE.FrontSide}
                    toneMapped={false}
                    depthWrite={true}
                    polygonOffset={true}
                    polygonOffsetFactor={1}
                    polygonOffsetUnits={1}
                />
            </mesh>
        </group>
    );
}

// ============================================
// Main component
// ============================================
export function StableWindCards() {
    const [initialCards] = useState(() => {
        const shuffled = shuffleArray([...ALL_CARDS]);
        return [shuffled.pop()!, shuffled.pop()!, shuffled.pop()!];
    });

    const cardPool = useRef(shuffleArray([...ALL_CARDS]));
    const scrollOffset = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useFrame(() => {
        const scrollY = window.scrollY || 0;
        const scrollFactor = 0.01; // Increased from 0.003 - cards recede faster when scrolling
        scrollOffset.current = scrollY * scrollFactor;
    });

    return (
        <group>
            {initialCards.map((cardName, index) => (
                <AnimatedCard
                    key={index}
                    cardName={cardName}
                    index={index}
                    cardPool={cardPool}
                    scrollOffsetRef={scrollOffset}
                    isMobile={isMobile}
                />
            ))}
        </group>
    );
}
