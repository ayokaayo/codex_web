export function Footer() {
    return (
        <footer className="relative py-12 px-4 border-t border-white/10 glass-heavy">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
                <h2 className="font-cinzel text-2xl text-gold mb-6">CODEX TAROT</h2>

                <div className="flex gap-6 mb-8">
                    <a href="#" className="font-garamond text-text-secondary hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="font-garamond text-text-secondary hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="font-garamond text-text-secondary hover:text-white transition-colors">Support</a>
                </div>

                <p className="font-garamond text-text-muted text-sm">
                    © {new Date().getFullYear()} Codex Tarot. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
