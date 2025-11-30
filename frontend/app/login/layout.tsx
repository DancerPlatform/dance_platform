
export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main lang="en" className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/abstract_video.mp4" type="video/mp4" />
      </video>

      {/* Blur Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}
