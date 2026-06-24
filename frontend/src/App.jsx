import { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleProcessData = async (payload) => {
    setIsLoading(true);
    setApiError('');
    setResult(null);

    try {
      // VITE_API_URL falls back to empty string if not set, 
      // allowing it to hit relative path if deployed together, but we explicitly use the var.
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await axios.post(`${API_URL}/bfhl`, payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setApiError(
        err.response?.data?.message || 
        'Failed to connect to the backend API. Please make sure the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 py-8 space-y-8">
        
        {/* API Error Toast */}
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{apiError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <InputForm onSubmit={handleProcessData} isLoading={isLoading} />
          
          <div className={isLoading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <Dashboard result={result} />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <p>Built for Chitkara Full Stack Engineering Challenge</p>
      </footer>
    </div>
  );
}
