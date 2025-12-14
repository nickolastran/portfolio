import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";

export const metadata: Metadata = {
    title: "Your Name - Portfolio",
    description: "Full-stack developer portfolio",
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
