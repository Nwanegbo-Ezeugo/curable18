import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';
import ChatBox from '@/components/ChatBox';

export default function SymptomChecker() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisplayName() {
      try {
        const maybeName =
          (user as any)?.user_metadata?.full_name ||
          (user as any)?.full_name;
        if (maybeName) {
          setFullName(maybeName);
          return;
        }
        if (user?.email) {
          setFullName(user.email.split('@')[0]);
        }
      } catch (err) {
        console.error('Could not get display name', err);
      }
    }
    fetchDisplayName();
  }, [user]);

  const userId = user?.id ?? ''; // still used for ChatBox
  const username = fullName || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-purple-100">
      {/* Header */}
      <header className="border-b border-purple-800/40 bg-purple-950/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-purple-400 drop-shadow-[0_0_10px_rgba(125,0,255,0.45)]" />
            <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(255,0,255,0.12)]">
              Curable
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-purple-300/80 italic tracking-wide">
              Welcome, {fullName || user?.email || 'Guest'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-purple-600 text-purple-300 hover:bg-purple-700/30"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-purple-200 tracking-wide">
              Symptom Checker
            </h2>
            <p className="text-sm text-purple-400/80 mt-1">
              Chat with Curable's AI assistant using your personal profile for personalized diagnosis and advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div>
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 shadow-lg shadow-purple-800/20">
                <ProfileCard username={username} />
              </div>
            </div>

            {/* Chat Box */}
            <div>
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-2xl p-4 shadow-lg shadow-purple-800/20">
                <ChatBox userId={userId} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-purple-300/80 italic">
              All chats auto-archive after 30 days; important summaries are stored.
            </div>
            <div className="text-xs text-pink-300">Y2K mode enabled ✨</div>
          </div>
        </div>
      </main>
    </div>
  );
}
