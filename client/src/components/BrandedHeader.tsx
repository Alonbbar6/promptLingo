import React from 'react';
import { BrandedButton } from './ui';
import brandDesignSystem from '../config/brandDesignSystem';

interface BrandedHeaderProps {
  currentPage: 'landing' | 'translator' | 'tts';
  onPageChange: (page: 'landing' | 'translator' | 'tts') => void;
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
          {showNavigation && (
            <div className="hidden md:flex items-center gap-6">
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
              <BrandedButton
                variant="gradient"
                size="sm"
                onClick={() => onPageChange('translator')}
              >
                Get Started
              </BrandedButton>
            </div>
          )}

          {/* Mobile menu button */}
          {showNavigation && (
            <div className="md:hidden">
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
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {showNavigation && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
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
              <BrandedButton
                variant="gradient"
                size="md"
                onClick={() => {
                  onPageChange('translator');
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                Get Started
              </BrandedButton>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default BrandedHeader;
