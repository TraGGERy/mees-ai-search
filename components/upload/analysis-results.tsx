import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

interface AnalysisResultsProps {
  results: {
    summary: string;
    keyPoints: string[];
    confidence: number;
  };
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const confidenceColor = results.confidence > 0.8 ? "text-green-500" : "text-yellow-500";

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-3">Document Summary</h3>
        <p className="text-muted-foreground">{results.summary}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Key Points</h3>
        <ul className="space-y-2">
          {results.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center space-x-2">
        <AlertCircle className={`h-5 w-5 ${confidenceColor}`} />
        <span className="text-sm">
          Analysis Confidence: {(results.confidence * 100).toFixed(1)}%
        </span>
      </div>
    </Card>
  );
}