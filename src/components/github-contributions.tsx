"use client";

import { useEffect, useState } from "react";
import { Github } from "lucide-react";

import BlurFade from "./blur-fade";
import SectionHeader, { SECTION } from "./section-header";

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

// GitHub green color function
const getGreenColor = (count: number): string => {
  if (count === 0) return "var(--gh-empty)";
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

    // Group days into weeks
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
                className="w-3 h-3 rounded-sm hover:ring-2 hover:ring-blue-500/50 cursor-pointer transition-all duration-300 relative group"
                style={{
                  backgroundColor:
                    day.contributionCount > 0
                      ? getGreenColor(day.contributionCount)
                      : "var(--gh-empty)",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs
                    rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    pointer-events-none z-10 shadow-lg border border-white/10"
                >
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
      <section id="contributions" className={SECTION}>
        <SectionHeader
          icon={Github}
          iconClassName="text-emerald-500"
          title="GitHub Activity"
          subtitle="My contribution graph over the past year."
        />
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="contributions" className={SECTION}>
      <SectionHeader
        icon={Github}
        iconClassName="text-emerald-500"
        title="GitHub Activity"
        subtitle="My contribution graph over the past year."
      />
      <div>
        <BlurFade delay={0.2}>
          <div className="w-full">
            {/* Graph Container */}
            <div className="flex justify-center">
              {/* Mobile: Scrollable */}
              <div className="md:hidden w-full max-w-4xl">
                <div className="bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-3xl p-4">
                  <div className="flex items-center gap-4 mb-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm transition-colors duration-300"
                        style={{
                          backgroundColor: "var(--gh-empty)",
                        }}
                      ></div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
              <div className="hidden md:block bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm transition-colors duration-300"
                      style={{
                        backgroundColor: "var(--gh-empty)",
                      }}
                    ></div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
