import { motion } from 'framer-motion';

const testimonials = [
    {
        name: "Sarah M.",
        role: "Daily User",
        text: "The accuracy of the AI interpretations scares me sometimes. It's become an essential part of my morning routine.",
        stars: 5
    },
    {
        name: "Marcus K.",
        role: "Tarot Enthusiast",
        text: "Finally, a digital deck that respects the tradition while adding something new. The visual fidelity is incredible.",
        stars: 5
    },
    {
        name: "Elena R.",
        role: "Beginner",
        text: "I always wanted to learn Tarot but felt intimidated. Codex makes it accessible without dumbing it down.",
        stars: 5
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94] as const
        }
    }
};

export function Testimonials() {
    return (
        <section className="relative py-32 px-4 bg-surface/20">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-cinzel text-3xl md:text-5xl text-center text-gold mb-20"
                >
                    WHAT SEEKERS SAY
                </motion.h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-10"
                >
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            className="bg-void/40 border border-white/5 p-10 rounded-sm hover:border-gold/20 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5"
                        >
                            <div className="flex text-gold mb-5 text-lg">
                                {[...Array(t.stars)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <p className="font-garamond italic text-lg text-text-primary mb-8 leading-relaxed">"{t.text}"</p>
                            <div>
                                <h4 className="font-cinzel text-gold text-sm">{t.name}</h4>
                                <span className="font-garamond text-text-muted text-xs uppercase tracking-wider">{t.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

