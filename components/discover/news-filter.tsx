import { Button } from "@/components/ui/button";

interface NewsFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function NewsFilter({ selectedCategory, onCategoryChange }: NewsFilterProps) {
  const categories = [
    { id: "all", label: "All" },
    { id: "AI", label: "AI" },
    { id: "Quantum", label: "Quantum" },
    { id: "Startups", label: "Startups" },
    { id: "Web3", label: "Web3" }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={selectedCategory === category.id ? "bg-purple-600 hover:bg-purple-700" : ""}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}