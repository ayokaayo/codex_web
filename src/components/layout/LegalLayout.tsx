import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

// CSS-based subtle star field for legal pages (lightweight alternative to Three.js)
function StarBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-nebula to-void" />
      
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-purple/5 via-transparent to-transparent" />
      
      {/* Animated stars layer 1 */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #C9A962, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(201,169,98,0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 130px 80px, #C9A962, transparent),
            radial-gradient(1.5px 1.5px at 160px 120px, rgba(255,255,255,0.9), transparent)
          `,
          backgroundSize: '200px 200px',
          animation: 'twinkle 4s ease-in-out infinite',
        }}
      />
      
      {/* Animated stars layer 2 */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 100px 50px, rgba(201,169,98,0.8), transparent),
            radial-gradient(1px 1px at 150px 100px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 75px 180px, rgba(201,169,98,0.5), transparent),
            radial-gradient(1px 1px at 180px 20px, rgba(255,255,255,0.6), transparent)
          `,
          backgroundSize: '250px 250px',
          animation: 'twinkle 6s ease-in-out infinite reverse',
        }}
      />

      {/* Subtle gold vignette at top */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gold/3 to-transparent" />
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// Decorative divider with mystical styling
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
      <div className="w-2 h-2 rotate-45 bg-gold/80" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}

export function LegalLayout({ children, title, subtitle }: LegalLayoutProps) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <StarBackground />
      
      {/* Header */}
      <header className="relative z-20 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/brand/codex_logo_w.png"
                alt="Codex Tarot"
                className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/"
              className="font-garamond text-sm text-text-secondary hover:text-gold transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl text-gold text-glow mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="font-garamond text-lg text-text-secondary italic">
                {subtitle}
              </p>
            )}
            <GoldDivider />
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card p-8 md:p-12 border-gold/20"
          >
            <div className="prose prose-invert prose-gold max-w-none">
              {children}
            </div>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="flex flex-wrap justify-center gap-6 text-sm font-garamond">
              <Link to="/privacy" className="text-text-secondary hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <span className="text-text-muted">•</span>
              <Link to="/delete-account" className="text-text-secondary hover:text-gold transition-colors">
                Delete Account
              </Link>
              <span className="text-text-muted">•</span>
              <Link to="/" className="text-text-secondary hover:text-gold transition-colors">
                Home
              </Link>
            </div>
            <p className="mt-6 font-garamond text-text-muted text-xs">
              © {new Date().getFullYear()} Codex Tarot. All rights reserved.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Export the divider for use in pages
export { GoldDivider };

