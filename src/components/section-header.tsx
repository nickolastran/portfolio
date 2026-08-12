import type { LucideIcon } from "lucide-react";

/** Shared shell for every top-level section, so widths and rhythm match. */
export const SECTION =
    "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-20";

export default function SectionHeader({
    icon: Icon,
    iconClassName,
    title,
    subtitle,
}: {
    icon: LucideIcon;
    iconClassName: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3">
                <Icon className={iconClassName} size={24} />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {title}
                </h2>
            </div>
            {subtitle && (
                <p className="text-neutral-600 dark:text-neutral-500 text-sm mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
