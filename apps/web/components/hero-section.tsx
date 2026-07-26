import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-b border-[var(--color-graphite)]">
      {/* Abstract Animated Background Artwork */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1c1e_1px,transparent_1px),linear-gradient(to_bottom,#1b1c1e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Deep blue pulsating wash */}
        <div className="animate-pulse-glow absolute h-[700px] w-[900px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(4,63,150,0.55)_0%,_rgba(6,18,37,0)_65%)] opacity-80 mix-blend-screen" />
        
        {/* Primary Coral Light Beam */}
        <div className="animate-ray absolute h-[240px] w-[700px] -rotate-12 bg-gradient-to-r from-[#ff6363] via-[#ff4343] to-transparent opacity-25 blur-[90px]" />

        {/* Secondary Cyan / Electric Sky Light Beam */}
        <div className="animate-ray-reverse absolute h-[180px] w-[650px] rotate-12 bg-gradient-to-r from-[#63a1ff] via-[#56c2ff] to-transparent opacity-20 blur-[80px]" />

        {/* Floating Glowing Ambient Orbs */}
        <div className="animate-orb-float absolute h-[320px] w-[320px] translate-x-40 translate-y-24 rounded-full bg-[#ff6363] opacity-20 blur-[110px]" />
        <div className="animate-orb-float absolute h-[280px] w-[280px] -translate-x-44 -translate-y-20 rounded-full bg-[#63a1ff] opacity-15 blur-[100px]" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="mx-auto flex w-full flex-col items-center justify-center px-6 pt-32 pb-24 lg:px-12">
        <div className="flex w-full max-w-[1200px] flex-col items-center text-center">
          <h1 className="font-sans text-[44px] font-normal leading-[1.17] tracking-[0.22px] text-[var(--color-pure-white)] sm:text-[56px] lg:text-[64px]">
            Event-Driven Image Processing
          </h1>

          <p className="mt-6 max-w-[480px] font-sans text-[16px] leading-[1.5] text-[var(--color-ash)]">
            Upload images directly to S3. Workers compress, generate thumbnails, and extract text — asynchronously.
          </p>

          <div className="mt-24 flex flex-col items-center gap-2">
            <Button
              size="lg"
              className="h-[36px] cursor-pointer gap-2 rounded-[8px] bg-[var(--color-mist)] px-4 py-2 text-[14px] font-medium text-[var(--color-iron)] hover:bg-[#d0d0d0]"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
            <div className="mt-4 flex items-center text-[12px] text-[var(--color-smoke)]">
              <span className="font-mono">v1.0.0</span>
              <span className="mx-2">|</span>
              <span className="font-mono">AWS S3</span>
              <span className="mx-2">|</span>
              <span className="font-mono">Background Workers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
