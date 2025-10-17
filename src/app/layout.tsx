import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "CuppaPlace",
  description: "Find Your Perfect Cup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${poppins.className} bg-[#2b210a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
