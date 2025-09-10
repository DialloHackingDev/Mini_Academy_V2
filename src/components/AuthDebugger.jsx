import { useAuth } from '../context/AuthContext';

export default function AuthDebugger() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
      <div className="space-y-1">
        <div>
          <strong>User:</strong> {user ? `${user.username} (${user.role})` : 'Non connecté'}
        </div>
        <div>
          <strong>Token:</strong> {token ? '✅ Présent' : '❌ Absent'}
        </div>
        <div>
          <strong>Token Preview:</strong> {token ? token.substring(0, 20) + '...' : 'N/A'}
        </div>
      </div>
    </div>
  );
}
