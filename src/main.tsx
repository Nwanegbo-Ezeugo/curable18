import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug: Check if AuthProvider can be imported
try {
  const { AuthProvider } = await import('./hooks/useAuth.tsx');
  console.log('✅ AuthProvider imported successfully');
  
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} catch (error) {
  console.error('❌ Error importing AuthProvider:', error);
  // Fallback without AuthProvider for debugging
  createRoot(document.getElementById("root")!).render(<App />);
}