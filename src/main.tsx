import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting main.tsx');

// Static import
import { AuthProvider } from './hooks/useAuth';

console.log('✅ AuthProvider:', AuthProvider);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);