import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { TreeProvider } from '@/context/TreeContext';
import { VoiceProvider } from '@/context/VoiceContext';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';

// Main app content with auth check
function AppContent() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto" />
          <p className="text-zinc-400 mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <TreeProvider>
      <VoiceProvider>
        <HomePage />
      </VoiceProvider>
    </TreeProvider>
  );
}

// Root app with providers
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
