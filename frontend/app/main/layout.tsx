import { BottomNav } from "@/components/bottom-nav";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <BottomNav />
    </div>
  )
}