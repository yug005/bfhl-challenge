import { useState } from 'react';
import { Play, FileText, AlertCircle } from 'lucide-react';

const SAMPLE_INPUT = `A->B
A->C
B->D`;

export default function InputForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError('Please enter some data.');
      return;
    }

    const lines = text.split('\n').filter((line) => line.trim() !== '');
    onSubmit({ data: lines });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-blue-500" />
          Input Data
        </h2>
        <button
          type="button"
          onClick={() => setText(SAMPLE_INPUT)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
        >
          Load Sample
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A->B&#10;A->C&#10;B->D"
            rows={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Play size={18} />
              Process Data
            </>
          )}
        </button>
      </form>
    </div>
  );
}
