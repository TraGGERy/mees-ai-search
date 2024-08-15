import { HoverEffect } from "../ui/card-hover-effect";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-3xl max-h-3xl px-4">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Stripe",
    description:
      "A technology company that builds ",
    link: "https://stripe.com",
  },
  {
    title: "Netflix",
    description:
      "A streaming service documentaries, .",
    link: "https://netflix.com",
  },
  {
    title: "Google",
    description:
      "A multinational technology .",
    link: "https://google.com",
  },
  
];
