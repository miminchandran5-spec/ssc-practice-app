import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import CinematicIntro from './components/CinematicIntro';
import { isOnboardingComplete, clearAllData } from './store';

// Lazy load pages for performance
const Welcome = lazy(() => import('./pages/Welcome'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subjects = lazy(() => import('./pages/Subjects'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const Practice = lazy(() => import('./pages/Practice'));
const TestCenter = lazy(() => import('./pages/TestCenter'));
const TestSession = lazy(() => import('./pages/TestSession'));
const TestResult = lazy(() => import('./pages/TestResult'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const MistakeVault = lazy(() => import('./pages/MistakeVault'));
const Search = lazy(() => import('./pages/Search'));
const AiGenerator = lazy(() => import('./pages/AiGenerator'));

// Loading fallback
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '12px'
    }}>
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div className="skeleton skeleton-text" style={{ width: 200 }} />
    </div>
  );
}

// Header component
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Don't show header on welcome/onboarding/test pages
  const hideHeader = ['/', '/onboarding', '/test-session'].some(p =>
    location.pathname === p || location.pathname.startsWith('/test-session')
  );
  if (hideHeader) return null;

  return (
    <header className="app-header" role="banner">
      <div className="container flex items-center justify-between" style={{ width: '100%', maxWidth: 'var(--max-width)' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '16px'
          }}>P</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }} className="hide-mobile">
            PrepMaster
          </span>
        </Link>

        <nav className="flex items-center gap-1 hide-mobile" role="navigation" aria-label="Main navigation">
          {[
            { path: '/dashboard', label: 'Home', icon: '🏠' },
            { path: '/subjects', label: 'Subjects', icon: '📚' },
            { path: '/ai-generator', label: 'AI Gen', icon: '✨' },
            { path: '/test-center', label: 'Tests', icon: '📝' },
            { path: '/progress', label: 'Progress', icon: '📊' },
            { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`btn btn-ghost btn-sm ${location.pathname === item.path ? 'active' : ''}`}
              style={{
                color: location.pathname === item.path ? 'var(--primary-600)' : 'var(--text-secondary)',
                fontWeight: location.pathname === item.path ? 600 : 500,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('/search')}
            aria-label="Search"
          >
            🔍
          </button>
          
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout? This will reset your profile and progress on this device.')) {
                clearAllData();
                window.location.href = '/';
              }
            }}
            aria-label="Logout"
            title="Log Out"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}

// Bottom Navigation for mobile
function BottomNav() {
  const location = useLocation();

  // Don't show on welcome/onboarding/test pages
  const hideNav = ['/', '/onboarding'].some(p =>
    location.pathname === p || location.pathname.startsWith('/test-session')
  );
  if (hideNav) return null;

  const items = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/subjects', label: 'Subjects', icon: '📚' },
    { path: '/ai-generator', label: 'AI Gen', icon: '✨' },
    { path: '/test-center', label: 'Tests', icon: '📝' },
    { path: '/progress', label: 'Progress', icon: '📊' },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="bottom-nav-items">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

let introPlayed = false;

export default function App() {
  const [ready, setReady] = useState(false);
  const [showCinematic, setShowCinematic] = useState(!introPlayed);
  const location = useLocation(); // Force re-render on route change

  useEffect(() => {
    setReady(true);
  }, []);

  if (showCinematic) {
    return (
      <CinematicIntro onComplete={() => {
        introPlayed = true;
        setShowCinematic(false);
      }} />
    );
  }

  if (!ready) return <LoadingScreen />;

  const onboarded = isOnboardingComplete();

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main" role="main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={onboarded ? <Navigate to="/dashboard" replace /> : <Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={onboarded ? <Dashboard /> : <Navigate to="/" replace />} />
            <Route path="/subjects" element={onboarded ? <Subjects /> : <Navigate to="/" replace />} />
            <Route path="/subjects/:subjectId" element={onboarded ? <Subjects /> : <Navigate to="/" replace />} />
            <Route path="/topic/:topicId" element={onboarded ? <TopicPage /> : <Navigate to="/" replace />} />
            <Route path="/practice" element={onboarded ? <Practice /> : <Navigate to="/" replace />} />
            <Route path="/test-center" element={onboarded ? <TestCenter /> : <Navigate to="/" replace />} />
            <Route path="/test-session/:testId" element={onboarded ? <TestSession /> : <Navigate to="/" replace />} />
            <Route path="/test-result/:resultId" element={onboarded ? <TestResult /> : <Navigate to="/" replace />} />
            <Route path="/progress" element={onboarded ? <ProgressPage /> : <Navigate to="/" replace />} />
            <Route path="/bookmarks" element={onboarded ? <Bookmarks /> : <Navigate to="/" replace />} />
            <Route path="/mistakes" element={onboarded ? <MistakeVault /> : <Navigate to="/" replace />} />
            <Route path="/search" element={onboarded ? <Search /> : <Navigate to="/" replace />} />
            <Route path="/ai-generator" element={onboarded ? <AiGenerator /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
