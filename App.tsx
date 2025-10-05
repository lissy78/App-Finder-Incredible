import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ClimateCountdown } from './components/ClimateCountdown';
import { InfiniteScrollFeed } from './components/InfiniteScrollFeed';
import { FreelanceMap } from './components/FreelanceMap';
import { UserProfile } from './components/UserProfile';
import { ChatBot } from './components/ChatBot';
import { AuthModal } from './components/AuthModal';
import { DigitalResume } from './components/DigitalResume';
import { UserMatcher } from './components/UserMatcher';
import { PersonalizedResume } from './components/PersonalizedResume';

export default function App() {
  const [currentView, setCurrentView] = useState('feed');
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <FreelanceMap />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <UserProfile />
          </div>
        );
      case 'resume':
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <DigitalResume />
          </div>
        );
      case 'matcher':
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <UserMatcher 
              currentUserId={user?.id} 
              userLevel={user?.goodnessLevel || 500}
            />
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <ChatBot />
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <ClimateCountdown />
            <InfiniteScrollFeed />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">GoodImpact - Revolucionando el mundo, una misión a la vez</p>
            <p className="text-sm">Uniendo tecnología, sostenibilidad y bondad humana</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}