"use client";

import Image from "next/image";
import { useState } from "react";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

interface DesignProcessProps {
  steps: readonly ProcessStep[];
  imageUrl?: string;
}

export default function DesignProcess({
  steps,
  imageUrl = "https://placehold.net/default.svg",
}: DesignProcessProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      {/* Cards */}
      <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:items-end">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={isActive}
              className="group flex h-full flex-col text-left focus-visible:outline-none hover:cursor-pointer"
            >
              <div
                className={`relative w-full aspect-[3/4] overflow-hidden bg-background-alt transition-all duration-300`}
              >
                <Image
                  src={imageUrl}
                  alt={step.title}
                  fill
                  className={`object-cover opacity-100 transition-opacity duration-300 ${
                    isActive
                      ? "lg:opacity-100"
                      : "lg:opacity-70 lg:group-hover:opacity-90"
                  }`}
                />
                <div
                  className={`absolute inset-0 ring-1 ring-inset ring-headline/40 transition-colors duration-300 ${
                    isActive ? "lg:ring-headline/40" : "lg:ring-transparent"
                  }`}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-4 font-serif text-base text-headline">
                <span className="text-eyebrow">{step.number}</span> {step.title}
              </p>

              <p
                className={`mt-3 line-clamp-4 max-w-xs text-sm leading-relaxed text-body lg:line-clamp-none ${
                  isActive ? "lg:block" : "lg:hidden"
                }`}
              >
                {step.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="mt-12 hidden lg:grid lg:grid-cols-5 lg:gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <span
              className={`-ml-2 h-px flex-1 bg-headline/15 ${
                index === 0 ? "invisible" : ""
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${step.number} ${step.title}`}
              aria-current={index === activeIndex}
              className={`shrink-0 rounded-full transition-all duration-300 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-2 ${
                index === activeIndex
                  ? "h-3.5 w-3.5 bg-headline"
                  : "h-2.5 w-2.5 bg-headline/20 hover:bg-headline/40"
              }`}
            />
            <span
              className={`-mr-2 h-px flex-1 bg-headline/15 ${
                index === steps.length - 1 ? "invisible" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
