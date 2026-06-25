import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import EventsPage from './pages/EventsPage';
import LostFoundPage from './pages/LostFoundPage';
import HelpPage from './pages/HelpPage';
import MarketplacePage from './pages/MarketplacePage';
import DirectoryPage from './pages/DirectoryPage';
import AlertsPage from './pages/AlertsPage';
import FilesPage from './pages/FilesPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/lost-found" element={<LostFoundPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/post/new" element={<CreatePostPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <p className="text-sm text-gray-400">
                  NeighborHub · Connecting neighborhoods, one post at a time
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
