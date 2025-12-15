"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation, Variants } from "framer-motion";

interface BlurFadeProps {
    children: React.ReactNode;
    className?: string;
    variant?: {
        hidden: { y: number };
        visible: { y: number };
    };
    duration?: number;
    delay?: number;
    yOffset?: number;
    inView?: boolean;
    inViewMargin?: string;
    blur?: string;
}

export default function BlurFade({
    children,
    className,
    variant,
    duration = 0.4,
    delay = 0,
    yOffset = 6,
    inView = false,
    inViewMargin = "-50px",
    blur = "6px",
}: BlurFadeProps) {
    const ref = useRef(null);
    const inViewResult = useInView(ref, {
        once: true,
        margin: inViewMargin as `${number}${"px" | "%"}`,
    });
    const isInView = !inView || inViewResult;
    const controls = useAnimation();

    const defaultVariants: Variants = {
        hidden: {
            y: yOffset,
            opacity: 0,
            filter: `blur(${blur})`,
        },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
        },
    };

    const combinedVariants = variant || defaultVariants;

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={combinedVariants}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
