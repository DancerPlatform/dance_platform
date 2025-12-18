import { BottomNav } from "@/components/bottom-nav";
import { Footer } from "@/components/footer";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      {/* <BottomNav /> */}
      {/* <Footer />  */}
    </div>
  )
}