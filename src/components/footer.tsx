import { PORTFOLIO } from "../constants/portfolio";

const LINKS = PORTFOLIO.socials.filter((s) =>
    ["GitHub", "LinkedIn"].includes(s.label),
);

export default function Footer() {
    return (
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-neutral-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-600 dark:text-neutral-500">
            <span>&copy; {new Date().getFullYear()} Nickolas Tran.</span>
            <div className="flex items-center gap-6">
                {LINKS.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </footer>
    );
}
