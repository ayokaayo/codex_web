import { motion } from 'framer-motion';

export function Testimonials() {
    return (
        <section id="feedback" className="relative py-32 px-4 bg-surface/20">
            <div className="max-w-3xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-cinzel text-3xl md:text-5xl text-gold mb-8"
                >
                    BE AMONG THE FIRST
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-void/40 border border-white/5 p-10 md:p-14 rounded-sm"
                >
                    <p className="font-garamond text-xl md:text-2xl text-text-primary mb-8 leading-relaxed">
                        We're just launching and would love your honest feedback. Test the app, share your experience, and help shape Codex Tarot.
                    </p>
                    <a
                        href="mailto:feedback@codextarot.app?subject=Codex%20Tarot%20Feedback"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-gold/40 text-gold font-cinzel text-lg rounded-sm hover:bg-gold/10 hover:border-gold/60 transition-all"
                    >
                        Share Your Experience
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

