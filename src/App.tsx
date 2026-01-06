import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Layout } from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Testimonials } from './components/sections/Testimonials';
import { Footer } from './components/sections/Footer';
import { StarField } from './components/3d/StarField';
import { Nebula } from './components/3d/Nebula';
import { StableWindCards } from './components/3d/StableWindCards';
import { ShootingStars } from './components/ShootingStars';

function App() {
  return (
    <>
      <Layout>
        <Header />
        {/* Three.js 3D background */}
        <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 1, 4.5], fov: 50 }}
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
            frameloop="always"
          >
            <color attach="background" args={['#0A0A0F']} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#C9A962" />

            {/* Background elements - always rendered */}
            <StarField />
            <Nebula />

            {/* Cards with Suspense - they track scroll internally */}
            <Suspense fallback={null}>
              <StableWindCards />
            </Suspense>
          </Canvas>
        </div>

        {/* Canvas-based shooting stars overlay */}
        <ShootingStars />

        {/* Main content */}
        <div className="relative z-10 w-full" style={{ pointerEvents: 'auto' }}>
          <Hero />
          <Features />
          <Testimonials />
          <Footer />
        </div>
      </Layout>
    </>
  );
}

export default App;


