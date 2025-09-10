import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authDebugger } from '../utils/authDebugger';

export default function AuthTester() {
  const { user, login, logout, loading } = useAuth();
  const [showDebugger, setShowDebugger] = useState(false);
  const [logs, setLogs] = useState([]);

  const refreshLogs = () => {
    const report = authDebugger.getReport();
    setLogs(report.logs.slice(-20)); // Derniers 20 logs
  };

  const clearLogs = () => {
    authDebugger.logs = [];
    setLogs([]);
  };

  const testLogin = () => {
    const testUser = {
      token: "test-token-123",
      role: "eleve",
      username: "TestUser",
      email: "test@test.com",
      _id: "test-id-123"
    };
    
    try {
      login(testUser);
      authDebugger.log('AuthTester', 'test_login_success', testUser);
    } catch (error) {
      authDebugger.log('AuthTester', 'test_login_error', { error: error.message });
    }
  };

  const testLogout = () => {
    try {
      logout();
      authDebugger.log('AuthTester', 'test_logout_success', {});
    } catch (error) {
      authDebugger.log('AuthTester', 'test_logout_error', { error: error.message });
    }
  };

  const checkLocalStorage = () => {
    const storage = {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      userId: localStorage.getItem('userId')
    };
    authDebugger.log('AuthTester', 'localStorage_check', storage);
    alert(JSON.stringify(storage, null, 2));
  };

  const exportDebugLogs = () => {
    authDebugger.exportLogs();
  };

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebugger(true)}
          className="bg-red-600 text-white px-4 py-2 rounded shadow-lg hover:bg-red-700"
        >
          🔍 Debug Auth
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🔍 Diagnostic d'Authentification</h2>
            <button
              onClick={() => setShowDebugger(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* État actuel */}
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">État Actuel:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Utilisateur:</strong> {user ? `${user.username} (${user.role})` : 'Non connecté'}
              </div>
              <div>
                <strong>Loading:</strong> {loading ? 'Oui' : 'Non'}
              </div>
              <div>
                <strong>Token:</strong> {user?.token ? 'Présent' : 'Absent'}
              </div>
              <div>
                <strong>URL:</strong> {window.location.pathname}
              </div>
            </div>
          </div>

          {/* Actions de test */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Actions de Test:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testLogin}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Test Login
              </button>
              <button
                onClick={testLogout}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Test Logout
              </button>
              <button
                onClick={checkLocalStorage}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Check localStorage
              </button>
              <button
                onClick={refreshLogs}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
              >
                Refresh Logs
              </button>
              <button
                onClick={clearLogs}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Clear Logs
              </button>
              <button
                onClick={exportDebugLogs}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
              >
                Export Logs
              </button>
            </div>
          </div>

          {/* Logs */}
          <div>
            <h3 className="font-semibold mb-2">Logs de Debug (Derniers 20):</h3>
            <div className="bg-black text-green-400 p-4 rounded max-h-96 overflow-auto text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500">Aucun log disponible. Cliquez sur "Refresh Logs"</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                    <div className="text-yellow-400">
                      [{log.timestamp}] {log.source} - {log.action}
                    </div>
                    <div className="ml-4 text-green-300">
                      Data: {JSON.stringify(log.data, null, 2)}
                    </div>
                    <div className="ml-4 text-blue-300">
                      LocalStorage: {JSON.stringify(log.localStorage, null, 2)}
                    </div>
                    <div className="ml-4 text-purple-300">
                      URL: {log.url}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analyse rapide */}
          <div className="mt-4 p-4 bg-yellow-100 rounded">
            <h3 className="font-semibold mb-2">🚨 Analyse Rapide:</h3>
            <div className="text-sm">
              <div>• Redirections détectées: {authDebugger.findRedirectSources().length}</div>
              <div>• Déconnexions détectées: {authDebugger.findLogoutTriggers().length}</div>
              <div>• Total logs: {authDebugger.logs.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
