import { motion } from 'framer-motion';

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-between pt-20 pb-12 overflow-hidden">
            {/* Top spacer for card */}
            <div className="h-[280px] md:h-[300px]">
                {/* Card renders in fixed canvas here */}
            </div>

            {/* Content Container - centered in remaining space */}
            <div className="z-10 text-center px-4 max-w-3xl flex-1 flex flex-col justify-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="font-cinzel text-3xl md:text-4xl lg:text-5xl text-gold mb-4 tracking-widest"
                >
                    CODEX TAROT
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="font-garamond italic text-lg md:text-xl text-text-secondary tracking-wide mb-8"
                >
                    The cards await your question
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    <button className="px-8 py-3 bg-gold/10 border border-gold text-gold font-cinzel text-lg rounded-sm hover:bg-gold/20 transition-all cursor-pointer backdrop-blur-sm">
                        Download App
                    </button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <div className="flex flex-col items-center gap-2 text-text-muted">
                    <span className="font-garamond text-sm">Scroll to explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
