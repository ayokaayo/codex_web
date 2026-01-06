export function Footer() {
    return (
        <footer className="relative py-6 px-4 border-t border-white/10 glass-heavy">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex gap-6">
                    <a href="#" className="font-garamond text-sm text-text-secondary hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="font-garamond text-sm text-text-secondary hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="font-garamond text-sm text-text-secondary hover:text-white transition-colors">Support</a>
                </div>

                <div className="flex flex-col md:items-end items-center gap-1">
                    <h2 className="font-cinzel text-lg text-gold">CODEX TAROT</h2>
                    <p className="font-garamond text-text-muted text-xs">
                        © {new Date().getFullYear()} Codex Tarot. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
