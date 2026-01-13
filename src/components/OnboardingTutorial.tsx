import React, { useState } from 'react';
import { X, ArrowRight, Check, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * OnboardingTutorial - Shows the "Aha Moment" (Now Multilingual!)
 *
 * Guides users through Sofia's emotional journey:
 * 1. SHAME - See broken English (relatable)
 * 2. HOPE - Click "Transform"
 * 3. RELIEF - See professional output
 * 4. PRIDE - Understand the value
 *
 * This component should appear:
 * - First time user signs up
 * - Can be triggered from Help menu
 * - Shows real before/after examples
 * - NOW SUPPORTS: English, Spanish, Haitian Creole
 */

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  const totalSteps = 4;
  const stepKey = `step${currentStep + 1}`;
  const isLastStep = currentStep === totalSteps - 1;

  const handleTransform = () => {
    setShowAfter(true);
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
      setShowAfter(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowAfter(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-brand text-white p-6 relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close tutorial"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-serif">{t('onboarding.title')}</h2>
            <span className="text-sm opacity-80">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-neutral-textPrimary mb-2 font-serif">
              {t(`onboarding.steps.${stepKey}.title`)}
            </h3>
            <p className="text-neutral-textSecondary">{t(`onboarding.steps.${stepKey}.context`)}</p>
          </div>

          {/* Before/After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* BEFORE - Always visible */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-textPrimary flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-red-500" />
                  {t('onboarding.before')}
                </h4>
                {currentStep === 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {t('onboarding.awkward')}
                  </span>
                )}
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 min-h-[200px]">
                <p className="text-neutral-textPrimary whitespace-pre-wrap leading-relaxed">
                  {t(`onboarding.steps.${stepKey}.before`)}
                </p>
              </div>

              {!showAfter && (
                <div className="text-center">
                  <p className="text-sm text-neutral-textSecondary mb-3 italic">
                    {t('onboarding.quoteThought')}
                  </p>
                </div>
              )}
            </div>

            {/* AFTER - Shows after transformation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-neutral-textPrimary flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-green-500" />
                  {t('onboarding.after')}
                </h4>
                {showAfter && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {t('onboarding.professional')}
                  </span>
                )}
              </div>

              <div
                className={`border-2 rounded-lg p-6 min-h-[200px] transition-all duration-500 ${
                  showAfter
                    ? 'bg-green-50 border-green-200 opacity-100'
                    : 'bg-gray-100 border-gray-200 opacity-50 blur-sm'
                }`}
              >
                {showAfter ? (
                  <p className="text-neutral-textPrimary whitespace-pre-wrap leading-relaxed">
                    {t(`onboarding.steps.${stepKey}.after`)}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-textSecondary text-center">
                      {t('onboarding.clickToSee')}
                    </p>
                  </div>
                )}
              </div>

              {!showAfter && (
                <button
                  onClick={handleTransform}
                  className="w-full bg-gradient-brand text-white py-4 px-6 rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  {t('onboarding.transformButton')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {showAfter && (
                <div className="text-center">
                  <p className="text-sm text-primary-mint font-semibold mb-2">
                    {t('onboarding.ahaTitle')}
                  </p>
                  <p className="text-sm text-neutral-textSecondary italic">
                    {t('onboarding.ahaQuote')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Insight - Shows after transformation */}
          {showAfter && (
            <div className="bg-primary-skyBlue/10 border-2 border-primary-skyBlue/20 rounded-lg p-6 mb-8 animate-fadeIn">
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-skyBlue rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-textPrimary mb-2">{t('onboarding.differenceTitle')}</h4>
                  <p className="text-neutral-textPrimary leading-relaxed">
                    {t(`onboarding.steps.${stepKey}.insight`)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-textSecondary/10">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-neutral-textSecondary hover:text-neutral-textPrimary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('onboarding.previousExample')}
            </button>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-3 text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors"
              >
                {t('onboarding.skipTutorial')}
              </button>

              {showAfter && (
                <button
                  onClick={handleNext}
                  className="bg-primary-skyBlue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-indigo transition-all duration-200 flex items-center"
                >
                  {isLastStep ? t('onboarding.startUsing') : t('onboarding.nextExample')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Encouragement */}
        {showAfter && currentStep === totalSteps - 1 && (
          <div className="bg-gradient-brand text-white p-6 text-center">
            <h3 className="text-xl font-bold mb-2 font-serif">
              {t('onboarding.finalTitle')}
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              {t('onboarding.finalMessage')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingTutorial;
