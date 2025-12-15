"use client";

export default function Hero() {
    return (
        <section
            id="hero"
            className="min-h-screen flex items-center justify-center px-6 bg-background pt-20"
        >
            <div className="max-w-3xl w-full">
                <div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                            Hi, I&apos;m Nickolas Tran. 👋
                        </h1>
                        <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                            A current undergraduate senior majoring in Computer
                            Science and minoring in Applied Mathematics at
                            University of California, Santa Cruz with research
                            interests in ML/AI. I&apos;m also a full-stack
                            software engineer building fun and meaningful
                            applications.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
