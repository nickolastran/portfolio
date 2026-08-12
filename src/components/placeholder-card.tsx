import BentoCard from "./bento-card";

/* Empty slot filling out a bento grid — swap the inner div for real content. */
export default function PlaceholderCard({
    className = "",
    delay,
}: {
    className?: string;
    delay: number;
}) {
    return (
        <BentoCard className={`border-dashed ${className}`} delay={delay}>
            <div className="h-full min-h-[180px]" />
        </BentoCard>
    );
}
