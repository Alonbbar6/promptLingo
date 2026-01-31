import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { BrandedButton } from './ui';
import brandDesignSystem from '../config/brandDesignSystem';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import LanguageSelector from './LanguageSelector';
import { shouldShowSubscriptionUI } from '../utils/platform';

interface BrandedHeaderProps {
  currentPage: 'landing' | 'translator' | 'tts' | 'live' | 'pricing' | 'subscription' | 'privacy' | 'refund-policy' | 'settings';
  onPageChange: (page: 'landing' | 'translator' | 'tts' | 'live' | 'pricing' | 'subscription' | 'privacy' | 'refund-policy' | 'settings') => void;
  showNavigation?: boolean;
}

/**
 * BrandedHeader - Enhanced header with brand design system
 * Adapted from fenago21 Header component
 */
export const BrandedHeader: React.FC<BrandedHeaderProps> = ({
  currentPage,
  onPageChange,
  showNavigation = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onPageChange('landing')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-bold text-neutral-textPrimary font-serif group-hover:text-brand-skyBlue transition-colors">
                {brandDesignSystem.brand.name}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Selector - always visible */}
            <LanguageSelector />

            {showNavigation && (
              <>
                <button
                  onClick={() => onPageChange('translator')}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === 'translator'
                      ? 'text-brand-skyBlue'
                      : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                  }`}
                >
                  Translator
                </button>
                <button
                  onClick={() => onPageChange('tts')}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === 'tts'
                      ? 'text-brand-skyBlue'
                      : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                  }`}
                >
                  Text-to-Speech
                </button>
                <button
                  onClick={() => onPageChange('live')}
                  className={`text-sm font-medium transition-colors ${
                    currentPage === 'live'
                      ? 'text-brand-skyBlue'
                      : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                  }`}
                >
                  Live Transcription
                </button>
                {/* Pricing link hidden in native apps (Netflix model) */}
                {shouldShowSubscriptionUI() && (
                  <button
                    onClick={() => onPageChange('pricing')}
                    className={`text-sm font-medium transition-colors ${
                      currentPage === 'pricing'
                        ? 'text-brand-skyBlue'
                        : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                    }`}
                  >
                    Pricing
                  </button>
                )}
              </>
            )}

            {/* Auth Section */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserProfile onNavigate={onPageChange} />
                ) : showNavigation && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile: Language Selector and Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Selector - always visible on mobile */}
            <div className="md:hidden">
              <LanguageSelector />
            </div>

            {/* Mobile menu button - only show if navigation enabled */}
            {showNavigation && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-neutral-textSecondary hover:text-neutral-textPrimary"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showNavigation && isMenuOpen && (
          <>
          {/* Backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="md:hidden absolute left-0 right-0 top-16 bg-white py-4 border-t border-gray-200 shadow-lg z-50 animate-slide-in">
            <div className="flex flex-col gap-3 px-4">
              <button
                onClick={() => {
                  onPageChange('translator');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'translator'
                    ? 'bg-brand-skyBlue/10 text-brand-skyBlue'
                    : 'text-neutral-textSecondary hover:bg-gray-50'
                }`}
              >
                Translator
              </button>
              <button
                onClick={() => {
                  onPageChange('tts');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'tts'
                    ? 'bg-brand-skyBlue/10 text-brand-skyBlue'
                    : 'text-neutral-textSecondary hover:bg-gray-50'
                }`}
              >
                Text-to-Speech
              </button>
              <button
                onClick={() => {
                  onPageChange('live');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'live'
                    ? 'bg-brand-skyBlue/10 text-brand-skyBlue'
                    : 'text-neutral-textSecondary hover:bg-gray-50'
                }`}
              >
                Live Transcription
              </button>
              {/* Pricing link hidden in native apps (Netflix model) */}
              {shouldShowSubscriptionUI() && (
                <button
                  onClick={() => {
                    onPageChange('pricing');
                    setIsMenuOpen(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'pricing'
                      ? 'bg-brand-skyBlue/10 text-brand-skyBlue'
                      : 'text-neutral-textSecondary hover:bg-gray-50'
                  }`}
                >
                  Pricing
                </button>
              )}

              {/* Auth Section for Mobile */}
              <div className="border-t border-gray-200 pt-3 mt-2">
                {isAuthenticated ? (
                  <UserProfile onNavigate={(page) => {
                    onPageChange(page);
                    setIsMenuOpen(false);
                  }} />
                ) : (
                  <BrandedButton
                    variant="gradient"
                    size="md"
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </BrandedButton>
                )}
              </div>
            </div>
          </div>
          </>
        )}
      </nav>

      {/* Login Modal */}
      {showLoginModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to PromptLingo</h2>
              <p className="text-gray-600">Create a profile to save your translations</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </button>

              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/register');
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-all"
              >
                Create Account
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Your data is secure and private</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default BrandedHeader;
