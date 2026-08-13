import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Nickolas Tran - Full Stack Developer",
  description: "Full-stack developer and ML/AI researcher",
  icons: { icon: "/anyapfp.jpg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Dark only — the `dark` class stays put, so every dark: utility applies. */
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={manrope.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
