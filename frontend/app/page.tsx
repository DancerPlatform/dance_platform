import { redirect } from "next/navigation";

export default function Home() {
  // Mock data for artist cards
  redirect("/main");

  return (
    <div className="min-h-screen bg-black text-white pb-32">
    </div>
  );
}
