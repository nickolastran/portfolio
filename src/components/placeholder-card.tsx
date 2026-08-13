import Image from "next/image";
import { ImageIcon } from "lucide-react";
import BentoCard from "./bento-card";
import { cn } from "../lib/utils";

/* Empty slot filling out a bento grid — swap the inner div for real content.
   `photo`: true reserves a picture spot, a string fills it with that image.
   Photo cards keep room under the image for a title + caption. */
export default function PlaceholderCard({
    className = "",
    delay,
    photo,
    alt = "",
    title,
    caption,
}: {
    className?: string;
    delay: number;
    photo?: string | boolean;
    alt?: string;
    title?: string;
    caption?: string;
}) {
    if (!photo) {
        return (
            <BentoCard className={cn("border-dashed", className)} delay={delay}>
                <div className="h-full min-h-[180px]" />
            </BentoCard>
        );
    }

    return (
        <BentoCard
            className={cn(
                "border-dashed transition-all hover:scale-[1.02] hover:ring-2 hover:ring-neutral-300/70 dark:hover:ring-white/25 hover:shadow-[0_0_35px_-5px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_35px_-5px_rgba(255,255,255,0.25)]",
                typeof photo === "string" && "border-solid",
                className,
            )}
            delay={delay}
        >
            <div className="flex h-full min-h-[180px] flex-col gap-3">
                <div className="relative min-h-[120px] flex-1 overflow-hidden rounded-2xl border border-dashed border-neutral-300 dark:border-white/10">
                    {typeof photo === "string" ? (
                        <Image
                            src={photo}
                            alt={alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <ImageIcon
                                className="text-neutral-400 dark:text-neutral-600"
                                size={32}
                            />
                        </div>
                    )}
                </div>
                <div className="shrink-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {title ?? " "}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-500">
                        {caption ?? " "}
                    </p>
                </div>
            </div>
        </BentoCard>
    );
}
