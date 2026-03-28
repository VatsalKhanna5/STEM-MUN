import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      <Navbar />
      <div className="pt-24 min-h-screen relative z-10">
        {children}
      </div>
    </div>
  );
}
