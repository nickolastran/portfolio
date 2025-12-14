// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
    title: "Nickolas Tran - Portfolio",
    description: "Full-stack developer and ML/AI researcher",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    themes={["dark", "light", "navy"]}
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
