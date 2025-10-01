import ScrollHeroSection from '@/components/ScrollHeroSection';
import CanvasScrollImageSequence from '@/components/CanvasScrollImageSequence';

export default function Home() {
  // Generate array of 30 tennis court images
  const tennisCourtImages = Array.from({ length: 30 }, (_, i) => `/images/${i + 1}.jpg`);

  return (
    <div className="min-h-screen">
      {/* Scroll-triggered hero section with mountain */}
      <ScrollHeroSection />

      {/* Tennis court scroll sequence */}
      <CanvasScrollImageSequence
        images={tennisCourtImages}
        containerHeight={4000}
        textTriggerFrame={26}
      />

      {/* Content section after tennis sequence */}
      <section className="relative z-10 h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-white">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Test Text          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            test test test eihfpoewihfp pqeihfpeihg peihg 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
              test text
            </button>
            <button className="px-8 py-3 border border-white hover:bg-white hover:text-slate-900 rounded-lg font-semibold transition-colors">
              test text
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
