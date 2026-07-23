import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { CheckCircle2 } from 'lucide-react';

import { SingleFieldLoginModal } from './components/layout/SingleFieldLoginModal';
import { DeveloperProfileModal } from './components/developer/DeveloperProfileModal';
import { DeveloperVideoCallModal } from './components/developer/DeveloperVideoCallModal';

import { LandingPage } from './pages/LandingPage';
import { ProposalGeneratorPage } from './pages/ProposalGeneratorPage';
import { AiChatAssistantPage } from './pages/AiChatAssistantPage';
import { ProposalHistoryPage } from './pages/ProposalHistoryPage';
import { ProposalPreviewPage } from './pages/ProposalPreviewPage';
import { PortalAuthGatePage } from './pages/PortalAuthGatePage';

function AppContent() {
  const { 
    activeTab, 
    isLoggedIn,
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    selectedDevForProfile, 
    setSelectedDevForProfile, 
    selectedDevForVideoCall, 
    setSelectedDevForVideoCall,
    notification 
  } = useApp();

  // If user is not logged in and not on public landing page preview, or explicitly clicked auth, show Portal Entry Gate
  if (activeTab === 'auth' || (!isLoggedIn && activeTab !== 'landing')) {
    return <PortalAuthGatePage />;
  }

  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage />
        <SingleFieldLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        {selectedDevForProfile && (
          <DeveloperProfileModal
            developer={selectedDevForProfile}
            onClose={() => setSelectedDevForProfile(null)}
            onTalkToDeveloper={(dev) => setSelectedDevForVideoCall(dev)}
          />
        )}
        {selectedDevForVideoCall && (
          <DeveloperVideoCallModal
            developer={selectedDevForVideoCall}
            onClose={() => setSelectedDevForVideoCall(null)}
          />
        )}
      </>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'aichat': return <AiChatAssistantPage />;
      case 'generator': return <ProposalGeneratorPage />;
      case 'history': return <ProposalHistoryPage />;
      case 'preview': return <ProposalPreviewPage />;
      default: return <AiChatAssistantPage />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <main className="flex-1">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <SingleFieldLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {selectedDevForProfile && (
        <DeveloperProfileModal
          developer={selectedDevForProfile}
          onClose={() => setSelectedDevForProfile(null)}
          onTalkToDeveloper={(dev) => setSelectedDevForVideoCall(dev)}
        />
      )}

      {selectedDevForVideoCall && (
        <DeveloperVideoCallModal
          developer={selectedDevForVideoCall}
          onClose={() => setSelectedDevForVideoCall(null)}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
