import { motion } from 'framer-motion';

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-visible">
            {/* Card space - renders in 3D canvas at top of hero */}
            <div className="h-[200px] sm:h-[240px] md:h-[280px] w-full pointer-events-none" />

            {/* Main content - conversion focused */}
            <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-4">
                {/* Value proposition - Primary headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                    className="font-garamond text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-primary max-w-3xl leading-tight"
                >
                    Your Personal Guide to Clarity
                </motion.h1>

                {/* Supporting copy */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="font-garamond italic text-lg sm:text-xl md:text-2xl text-text-secondary tracking-wide mb-1"
                >
                    Ancient wisdom, modern insight
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 mt-2"
                >
                    <a
                        href="https://play.google.com/apps/testing/com.codextarot.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-8 py-4 bg-gold text-void font-cinzel text-lg rounded-sm hover:bg-gold/90 transition-all cursor-pointer shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-105 min-w-[200px] inline-block text-center"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Get Early Access
                            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </a>
                    <button className="px-8 py-4 bg-transparent border-2 border-gold/40 text-gold font-cinzel text-lg rounded-sm hover:bg-gold/10 hover:border-gold/60 transition-all cursor-pointer min-w-[200px]">
                        Learn More
                    </button>
                </motion.div>

                {/* Social proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-2 text-text-primary font-garamond text-sm md:text-base"
                >
                    <span className="text-gold font-cinzel font-bold text-sm tracking-wider">Early Access</span>
                    <div className="hidden sm:block w-px h-4 bg-text-muted/30" />
                    <span>Android</span>
                    <div className="hidden sm:block w-px h-4 bg-text-muted/30" />
                    <span className="text-gold font-cinzel font-bold text-sm tracking-wider">Free to start</span>
                </motion.div>
            </div>

            {/* Scroll indicator - positioned relative to content flow on mobile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.8 }}
                className="mt-8 md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2"
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
