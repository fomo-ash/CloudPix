export function Footer() {
  return (
    <footer className="border-t border-[var(--color-graphite)] bg-[var(--color-obsidian)]">
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-12">
        <div className="flex items-center gap-2 text-sm text-[var(--color-steel)]">
          <span className="font-display tracking-[0.01em]">CloudPix</span>
          <span className="text-[var(--color-graphite)]">·</span>
          <span className="text-xs">Event-Driven Image Processing</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[var(--color-steel)]">
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-bone)]"
          >
            Documentation
          </a>
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-bone)]"
          >
            GitHub
          </a>
          <a
            href="#"
            className="transition-colors duration-200 hover:text-[var(--color-copper)]"
          >
            API Reference
          </a>
        </div>
      </div>
    </footer>
  );
}
