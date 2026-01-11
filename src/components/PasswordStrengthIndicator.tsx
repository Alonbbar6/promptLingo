import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const passedRequirements = requirements.filter((req) => req.test(password));
  const strength = passedRequirements.length;

  // Calculate strength level
  let strengthLevel: 'weak' | 'medium' | 'strong' = 'weak';
  let strengthColor = 'bg-red-500';
  let strengthText = 'Weak';

  if (strength >= 5) {
    strengthLevel = 'strong';
    strengthColor = 'bg-green-500';
    strengthText = 'Strong';
  } else if (strength >= 3) {
    strengthLevel = 'medium';
    strengthColor = 'bg-yellow-500';
    strengthText = 'Medium';
  }

  const strengthPercentage = (strength / requirements.length) * 100;

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={`font-medium ${
            strengthLevel === 'strong' ? 'text-green-600' :
            strengthLevel === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {strengthText}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const passed = requirement.test(password);
          return (
            <div
              key={index}
              className={`flex items-center text-sm ${
                passed ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <svg
                className={`w-4 h-4 mr-2 ${passed ? 'text-green-500' : 'text-gray-400'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {passed ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {requirement.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
