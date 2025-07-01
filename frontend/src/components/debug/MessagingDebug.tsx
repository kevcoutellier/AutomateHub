import React, { useState, useEffect } from 'react';
import { conversationApi } from '../../services/conversationApi';

interface DebugInfo {
  token: string | null;
  apiResponse: any;
  error: string | null;
  loading: boolean;
}

export const MessagingDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    token: null,
    apiResponse: null,
    error: null,
    loading: true
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    testMessagingAPI();
  }, []);

  const testMessagingAPI = async () => {
    setDebugInfo((prev: DebugInfo) => ({ ...prev, loading: true }));
    
    try {
      // Check if token exists
      const token = localStorage.getItem('auth_token');
      console.log('Debug - Token:', token);
      
      // Test API call
      const response = await conversationApi.getConversations();
      console.log('Debug - API Response:', response);
      
      setDebugInfo({
        token: token ? 'Token exists' : 'No token found',
        apiResponse: response,
        error: null,
        loading: false
      });
    } catch (error) {
      console.error('Debug - Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    }
  };

  if (!mounted) {
    return <div className="p-6 bg-gray-100 text-center">Loading debug info...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Messaging Debug Info</h2>
      <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
        Component mounted: {mounted ? 'Yes' : 'No'} | Time: {new Date().toLocaleTimeString()}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Authentication Status:</h3>
          <p className={`p-2 rounded ${debugInfo.token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {debugInfo.token || 'No authentication token found'}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg">API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo.apiResponse, null, 2)}
          </pre>
        </div>

        {debugInfo.error && (
          <div>
            <h3 className="font-semibold text-lg text-red-600">Error:</h3>
            <p className="bg-red-100 text-red-800 p-2 rounded">
              {debugInfo.error}
            </p>
          </div>
        )}

        <button
          onClick={testMessagingAPI}
          disabled={debugInfo.loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {debugInfo.loading ? 'Testing...' : 'Test API Again'}
        </button>
      </div>
    </div>
  );
};
