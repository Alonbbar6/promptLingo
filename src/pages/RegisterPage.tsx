import React from 'react';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="PromptLingo Logo" 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">
              Join PromptLingo and start translating
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
