"use client"

import { useState } from "react";
import { Upload, FileType, Loader2 } from "lucide-react";
import { Button } from "@/components/updic/ui/button";
import { Card } from "@/components/updic/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/updic/ui/tabs";
import { useToast } from "@/hooks/upload/use-toast";
import FileUploader from "@/components/upload/file-uploader";
import AIModelSelector from "@/components/upload/ai-model-selector";
import AnalysisResults from "@/components/upload/analysis-results";
import QAInterface from "@/components/upload/qa-interface";
import { analyzeDocument } from "@/lib/uploads/chatgpt-mini";

// Define the type for analysisResults
interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  confidence: number;
}

export default function UploadPage() {
  const [selectedModel, setSelectedModel] = useState("gpt4");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null); // Use the correct type here
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setAnalysisResults(null);
    
    toast({
      title: "File uploaded successfully",
      description: "Your document is ready for analysis.",
    });
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    try {
      const results = await analyzeDocument(
        await uploadedFile.text(),
        selectedModel
      );
      setAnalysisResults(results);
      
      toast({
        title: "Analysis complete",
        description: "Your document has been successfully analyzed.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">AI Document Analysis</h1>
        
        <Card className="p-6">
          <div className="space-y-8">
            <FileUploader onFileUpload={handleFileUpload} />
            
            {uploadedFile && (
              <>
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                />
                
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileType className="mr-2 h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </Card>

        {analysisResults && (
          <div className="mt-8 space-y-8">
            <Tabs defaultValue="results">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Analysis Results</TabsTrigger>
                <TabsTrigger value="qa">Q&A Interface</TabsTrigger>
              </TabsList>
              <TabsContent value="results">
                <AnalysisResults results={analysisResults} />
              </TabsContent>
              <TabsContent value="qa">
                <QAInterface documentContext={analysisResults} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
