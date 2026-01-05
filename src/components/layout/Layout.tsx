import type { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-void text-text-primary overflow-x-hidden selection:bg-gold selection:text-void">
            {children}
        </div>
    );
}
