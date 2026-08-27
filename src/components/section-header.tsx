import type { LucideIcon } from "lucide-react";

export const SECTION =
    "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-20";

export default function SectionHeader({
    icon: Icon,
    iconClassName,
    title,
    subtitle,
}: {
    /* A lucide component, or a path to an image in /public — the image is used
       as a mask so it picks up iconClassName's color like a real icon. */
    icon: LucideIcon | string;
    iconClassName: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3">
                {typeof Icon === "string" ? (
                    <span
                        className={`${iconClassName} h-6 w-6 shrink-0 bg-current`}
                        style={{
                            maskImage: `url(${Icon})`,
                            WebkitMaskImage: `url(${Icon})`,
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                        }}
                    />
                ) : (
                    <Icon className={iconClassName} size={24} />
                )}
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
