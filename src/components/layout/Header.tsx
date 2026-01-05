import { useState } from 'react';
import { motion } from 'framer-motion';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <motion.a
                    href="/"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center"
                >
                    <img
                        src="/assets/brand/codex_logo_w.png"
                        alt="Codex Tarot"
                        className="h-8 md:h-10 w-auto"
                    />
                </motion.a>

                {/* Hamburger Menu */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 group cursor-pointer"
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-gold transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </motion.button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 glass-heavy mx-4 mt-2 rounded-xl"
                >
                    <ul className="py-4 px-6 space-y-4">
                        <li>
                            <a href="#features" className="block font-cinzel text-gold hover:text-gold-bright transition-colors">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#testimonials" className="block font-cinzel text-gold hover:text-gold-bright transition-colors">
                                Testimonials
                            </a>
                        </li>
                        <li>
                            <a href="#download" className="block font-cinzel text-gold hover:text-gold-bright transition-colors">
                                Download
                            </a>
                        </li>
                    </ul>
                </motion.nav>
            )}
        </header>
    );
}
