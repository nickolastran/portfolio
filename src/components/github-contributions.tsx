"use client";

import { useEffect, useState } from "react";
import BlurFade from "./blur-fade";

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

// GitHub green color function
const getGreenColor = (count: number): string => {
  if (count === 0) return "hsl(var(--muted))";
  if (count <= 3) return "#9be9a8";
  if (count <= 6) return "#40c463";
  if (count <= 9) return "#30a14e";
  return "#216e39";
};

export default function GitHubContributions() {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        // Using GitHub contributions API
        const username = "nickolastran";
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
        );
        const data = await response.json();

        if (data.contributions) {
          // Get all contributions from the response
          const allContributions = data.contributions;

          // Get the last 365 days or all available data
          const contributionsToShow = allContributions.slice(-365);

          const formattedContributions = contributionsToShow.map(
            (day: { date: string; count: number }) => ({
              date: day.date,
              contributionCount: day.count,
              color: getGreenColor(day.count),
            }),
          );

          setContributions(formattedContributions);
        }
      } catch (error) {
        console.error("Error fetching GitHub contributions:", error);
        setContributions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  const renderContributionGraph = () => {
    // Use all contributions data, not just last 365
    const days = contributions;
    const weeks = [];

    // Group days into weeks (7 days per week)
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="w-3 h-3 rounded-sm hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all duration-300 relative group"
                style={{
                  backgroundColor:
                    day.contributionCount > 0
                      ? getGreenColor(day.contributionCount)
                      : "hsl(var(--muted))",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.2s ease",
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="font-medium">
                    {day.contributionCount} contribution
                    {day.contributionCount !== 1 ? "s" : ""}
                  </div>
                  <div className="text-gray-300">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section
        id="contributions"
        className="py-20 px-6 bg-background transition-colors duration-300"
      >
        <BlurFade delay={0.2}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground transition-colors duration-300"></div>
            </div>
          </div>
        </BlurFade>
      </section>
    );
  }

  return (
    <section
      id="contributions"
      className="py-20 px-6 bg-background transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0.2}>
          <div className="space-y-8 w-full">
            {/* Title Section */}
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl transition-colors duration-300">
                  My GitHub Activity.
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto transition-colors duration-300">
                  Here&apos;s my contribution graph showing my coding activity
                  over the past year.
                </p>
              </div>
            </div>

            {/* Graph Container */}
            <div className="flex justify-center">
              {/* Mobile: Scrollable */}
              <div className="md:hidden w-full max-w-4xl">
                <div className="bg-card border border-border rounded-xl p-4 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm transition-colors duration-300"
                        style={{
                          backgroundColor: "hsl(var(--muted))",
                        }}
                      ></div>
                      <span className="text-xs text-gray-400 transition-colors duration-300">
                        Less
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {["#9be9a8", "#40c463", "#30a14e", "#216e39"].map(
                        (color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                        ),
                      )}
                    </div>
                    <span className="text-xs text-gray-400 transition-colors duration-300">
                      More
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex justify-center min-w-[600px]">
                      {renderContributionGraph()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Full Width */}
              <div className="hidden md:block bg-card border border-border rounded-xl p-6 transition-colors duration-300">
                <div className="flex items-center gap-4 mb-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm transition-colors duration-300"
                      style={{
                        backgroundColor: "hsl(var(--muted))",
                      }}
                    ></div>
                    <span className="text-xs text-muted-foreground transition-colors duration-300">
                      Less
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {["#9be9a8", "#40c463", "#30a14e", "#216e39"].map(
                      (color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-sm"
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      ),
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground transition-colors duration-300">
                    More
                  </span>
                </div>
                <div className="flex justify-start">
                  {renderContributionGraph()}
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
