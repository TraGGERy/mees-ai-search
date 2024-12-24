"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface TableFiltersProps {
  onSearch: (value: string) => void;
  onExport: () => void;
  columns: string[];
  onFilterChange: (column: string, value: string) => void;
}

export function TableFilters({
  onSearch,
  onExport,
  columns,
  onFilterChange,
}: TableFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <Input
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-xs"
      />
      <Select onValueChange={(value) => onFilterChange("column", value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
} 