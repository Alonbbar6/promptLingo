import React from 'react';
import { BrandedButton, BrandedCard, FeatureCard, TestimonialCard, FAQ } from './ui';
import brandContent from '../data/brandContent';
import brandDesignSystem from '../config/brandDesignSystem';

interface LandingPageProps {
  onGetStarted: () => void;
}

/**
 * LandingPage - Main marketing page for PromptLingo
 * Integrates fenago21 UI components with PromptLingo brand content
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-neutral-backgroundLight">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-brand text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-serif">
              {brandDesignSystem.brand.name}
            </h1>
            <p className="text-xl sm:text-2xl mb-4 opacity-90">
              {brandDesignSystem.brand.tagline}
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto opacity-80 leading-relaxed">
              {brandContent.narrative.solution}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BrandedButton 
                variant="secondary" 
                size="lg"
                onClick={onGetStarted}
                className="text-lg px-8 py-4"
              >
                {brandContent.cta.primary}
              </BrandedButton>
            </div>
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-backgroundLight to-transparent" />
      </section>

      {/* Problem Statement */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <BrandedCard variant="elevated" className="text-center">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            The Challenge You Face
          </h2>
          <p className="text-lg text-neutral-textSecondary leading-relaxed max-w-4xl mx-auto">
            {brandContent.narrative.problem}
          </p>
        </BrandedCard>
      </section>

      {/* Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Why PromptLingo?
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            Six core principles that power your success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandContent.valueProps.map((prop, index) => (
            <FeatureCard
              key={index}
              title={prop.title}
              description={prop.description}
              highlight={index === 0}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
              Powerful Features
            </h2>
            <p className="text-lg text-neutral-textSecondary">
              Everything you need to communicate with authority
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brandContent.features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                highlight={feature.highlight}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
            Success Stories
          </h2>
          <p className="text-lg text-neutral-textSecondary">
            Real experiences from professionals like you
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandContent.testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              quote={testimonial.quote}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-textPrimary mb-4 font-serif">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-textSecondary">
              Everything you need to know about PromptLingo
            </p>
          </div>
          
          <FAQ items={brandContent.faq} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">
            Ready to Speak with Authority?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {brandContent.cta.tagline}
          </p>
          <BrandedButton 
            variant="secondary" 
            size="lg"
            onClick={onGetStarted}
            className="text-lg px-8 py-4"
          >
            {brandContent.cta.secondary}
          </BrandedButton>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
