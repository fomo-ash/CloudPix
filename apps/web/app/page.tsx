import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { UploadCard } from "@/components/upload-card";
import { PipelineVisualization } from "@/components/pipeline-visualization";
import { RecentUploadsTable } from "@/components/recent-uploads-table";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left — Upload */}
          <div className="lg:col-span-3">
            <UploadCard />
          </div>

          {/* Right — Pipeline */}
          <div className="lg:col-span-2">
            <PipelineVisualization />
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="mt-12">
          <RecentUploadsTable />
        </div>
      </main>

      <Footer />
    </div>
  );
}
