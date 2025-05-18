import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';

interface SummarizationPopupProps {
  input: string;
  tone: string;
  onClose: () => void;
}

export const SummarizationPopup: React.FC<SummarizationPopupProps> = ({ input, tone, onClose }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input || !tone) return;
    setLoading(true);
    setError('');
    setSummary('');
    fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, tone }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to summarize');
        const data = await res.json();
        setSummary(data.summary || 'No summary returned.');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [input, tone]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      <div className="bg-black rounded-lg shadow-lg p-6 max-w-lg w-full relative border border-gray-700">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-2 text-white">Summary ({tone})</h2>
        {loading && <div className="text-gray-400">Summarizing...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="relative">
            <div className="whitespace-pre-line text-gray-100 bg-gray-900 rounded p-4 mb-2 border border-gray-700">
              {summary}
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white bg-gray-900 rounded"
              aria-label="Copy summary"
              disabled={copied}
              style={{ lineHeight: 0 }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="outline" className="bg-black text-white border-gray-600 hover:bg-gray-900">Close</Button>
        </div>
      </div>
    </div>
  );
}; 