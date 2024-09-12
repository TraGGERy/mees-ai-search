import React from "react";
import { FlipWords } from "../ui/flip-words";

export function FlipWordsDemo() {
  const words = ["better", "Research", "Personal-Assistant", "modern"];

  return (
    <div className="h-[4rem] flex justify-center items-center px-3">
      <div className="text-1xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Mees Ai 
        <FlipWords words={words} /> <br />
      </div>
    </div>
  );
}
