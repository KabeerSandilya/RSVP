import { Heart } from 'lucide-react';
import heroImg from './hero.jpg'; // adjust extension/path if needed

// Hero component — uses imported image (Vite handles hashing) with a public placeholder fallback
export function Hero() {
  const placeholderUrl = `${import.meta.env.BASE_URL}placeholder.svg`;

  return (
    <div className="relative h-screen w-full overflow-hidden" role="region" aria-label="Hero">
      {/* Background Image — imported so Vite bundles/fingerprints it */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          onError={(e) => {
            // fallback to public placeholder if the imported asset fails (safest)
            (e.currentTarget as HTMLImageElement).src = placeholderUrl;
          }}
          alt="Celebration background"
          className="absolute inset-0 w-full h-full object-cover object-top"
          aria-hidden={false}
          loading="eager"
        />

        {/* Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="animate-fade-in">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-float" fill="currentColor" />

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-lg">
            25 Years
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-8 font-serif italic">
            of Love & Togetherness
          </p>

          <div className="w-24 h-1 bg-primary mx-auto mb-8" />

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Join us as we celebrate a quarter century of cherished memories, unwavering love, and endless adventures together
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
