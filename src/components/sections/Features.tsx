import { motion } from 'framer-motion';

const features = [
    {
        title: "Daily Guidance",
        description: "Start each day with a card drawn specifically for you, providing consistent wisdom and direction.",
        icon: "✨"
    },
    {
        title: "AI Interpretation",
        description: "Advanced AI analyzes your spread in deep context, going far beyond generic book definitions.",
        icon: "🔮"
    },
    {
        title: "Personal Journal",
        description: "Track your spiritual journey with a beautiful, searchable history of all your readings.",
        icon: "📜"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

export function Features() {
    return (
        <section className="relative py-32 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Section Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-cinzel text-3xl md:text-5xl text-center text-gold mb-20"
                >
                    DIVINE FEATURES
                </motion.h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-10"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="glass p-10 rounded-lg text-center hover:bg-surface/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/5"
                        >
                            <div className="text-5xl mb-6">{feature.icon}</div>
                            <h3 className="font-cinzel text-xl text-gold mb-4">{feature.title}</h3>
                            <p className="font-garamond text-text-secondary text-lg leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

