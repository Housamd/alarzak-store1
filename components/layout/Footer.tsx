// components/layout/Footer.tsx
type FooterProps = {
  siteName?: string;
  tagline?: string;
};

export default function Footer({
  siteName = "Al-Razak Cash & Carry",
  tagline = "The best place to stock your shop or your home.",
}: FooterProps) {
  return (
    <footer className="border-t bg-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-4 text-[11px] text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <span className="font-medium text-gray-700">
            {siteName}
          </span>{" "}
          – {tagline}
        </div>
        <div className="flex gap-3">
          <span>Manchester, UK</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
