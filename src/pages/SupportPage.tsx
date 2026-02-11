import React from 'react';
import { Mail, MessageCircle, Phone, Clock, Shield, HelpCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PromptLingo Support Center
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to help you get the most out of PromptLingo. Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Email Support</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get help via email for any questions or issues.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Response time: 24 hours</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Secure and private</span>
              </div>
            </div>
            <a 
              href="mailto:support@promptlingo.ai" 
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              support@promptlingo.ai
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Live Chat</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Chat with our support team for immediate assistance.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Available: Mon-Fri, 9AM-5PM EST</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Real-time support</span>
              </div>
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Chat
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I upgrade my subscription?
              </h3>
              <p className="text-gray-600">
                Visit our website at <a href="https://promptlingo.ai" className="text-blue-600 hover:underline">promptlingo.ai</a> and click on "Pricing" to upgrade your plan. Mobile app users can also access the web through their browser.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many translations do I get with the free plan?
              </h3>
              <p className="text-gray-600">
                The free plan includes 15 professional translations per day, resetting at midnight. This is perfect for testing the service and occasional use.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What languages does PromptLingo support?
              </h3>
              <p className="text-gray-600">
                We specialize in translating from Haitian Creole and Spanish to professional English, with 5 different tone styles: Casual, Business, Formal, Medical, and Informal.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                You can cancel your subscription anytime from your account settings on our website. Your access will continue until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes! We use industry-standard encryption and never share your personal information with third parties. Your translations are private and secure.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Technical issues or bug reports?
              </h3>
              <p className="text-gray-600">
                If you experience any technical issues, please email us at <a href="mailto:support@promptlingo.ai" className="text-blue-600 hover:underline">support@promptlingo.ai</a> with details about your device and the issue you're experiencing.
              </p>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="mt-8 text-center text-gray-600">
          <p className="font-medium mb-2">Support Hours</p>
          <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
          <p>Weekend: Emergency support only</p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
