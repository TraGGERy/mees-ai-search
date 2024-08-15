"use client";
import React from "react";
import { AnimatedTooltip } from "../ui/animated-tooltip";
const people = [
  {
    id: 1,
    name: "Mees Ai Research",
    designation: "Politics and Governance",
    image:
      "/ai.jpeg",
  },
  {
    id: 2,
    name: "Mees Ai Research",
    designation: "Economy and Business",
    image:
      "/iam.jpg",
  },
  {
    id: 3,
    name: "Mees Ai Research",
    designation: "Science and Technology",
    image:
      "/iam.jpg",
  },
  {
    id: 4,
    name: "Mees Ai Research",
    designation: "Society and Culture",
    image:
      "/iam.jpg",
  },
  {
    id: 5,
    name: "Mees Ai Research",
    designation: "Environment and Climate",
    image:
      "/icon-192x192.png",
  },
  {
    id: 6,
    name: "Mees Ai Research",
    designation: "Global Conflicts and Security",
    image:
      "/iamai.jpg",
  },
];

export function AnimatedTooltipPreview() {
  return (
    <div className="flex flex-row items-center justify-center mb-10 w-full">
      <AnimatedTooltip items={people} />
    </div>
  );
}
