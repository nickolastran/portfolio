"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-6 bg-background pt-20"
    >
      <div className="max-w-3xl w-full">
        <div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-foreground transition-colors duration-300">
              Hi, I&apos;m Nickolas Tran.{" "}
              <motion.span
                className="inline-block"
                animate={{
                  rotate: [0, 14, -8, 14, -4, 10, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              >
                👋
              </motion.span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg mb-6 leading-relaxed max-w-2xl transition-colors duration-300">
              A current undergraduate senior majoring in Computer Science and
              minoring in Applied Mathematics at University of California, Santa
              Cruz with research interests in ML/AI. I&apos;m also a full-stack
              software engineer building fun and meaningful applications.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
