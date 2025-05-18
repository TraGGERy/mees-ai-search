import React, { useState } from 'react';
import { Chart } from './chart';
import { Button } from './ui/button';
import { BarChart, LineChart } from 'lucide-react';

interface TimeSeriesData {
  title: string;
  description?: string;
  columns: {
    year: number;
    value: number;
  }[];
  displayOptions: {
    maxTableRows: number;
    chartType: 'line' | 'bar';
    yAxisLabel: string;
    formatValue?: (value: number) => string;
  };
}

interface DataVisualizationProps {
  data: TimeSeriesData;
  className?: string;
}

export function DataVisualization({ data, className = '' }: DataVisualizationProps) {
  const [showAll, setShowAll] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>(data.displayOptions.chartType);

  // Format the data for the chart
  const chartData = {
    labels: data.columns.map(col => col.year.toString()),
    datasets: [{
      label: data.displayOptions.yAxisLabel,
      data: data.columns.map(col => col.value),
      borderColor: 'hsl(var(--chart-1))',
      backgroundColor: 'hsl(var(--chart-1))',
      tension: 0.1
    }]
  };

  // Get visible table rows
  const visibleRows = showAll ? data.columns : data.columns.slice(0, data.displayOptions.maxTableRows);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title and description */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        {data.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{data.description}</p>
        )}
      </div>

      {/* Chart controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={chartType === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('line')}
        >
          <LineChart className="h-4 w-4 mr-1" />
          Line
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
        >
          <BarChart className="h-4 w-4 mr-1" />
          Bar
        </Button>
      </div>

      {/* Chart visualization */}
      <Chart
        type={chartType}
        data={chartData}
        className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
      />

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-800">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800">
              <th className="border border-zinc-200 dark:border-zinc-800 p-2 text-left">Year</th>
              <th className="border border-zinc-200 dark:border-zinc-800 p-2 text-left">{data.displayOptions.yAxisLabel}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.year} className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="border border-zinc-200 dark:border-zinc-800 p-2">{row.year}</td>
                <td className="border border-zinc-200 dark:border-zinc-800 p-2">
                  {data.displayOptions.formatValue ? data.displayOptions.formatValue(row.value) : row.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more/less button */}
      {data.columns.length > data.displayOptions.maxTableRows && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  );
} 