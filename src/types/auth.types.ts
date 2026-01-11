export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionTier?: string;
  emailVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  expiresIn: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    expiresIn: number;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
  };
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
  };
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
  message: string;
}

export interface TokenRefreshResponse {
  success: boolean;
  data: {
    expiresIn: number;
  };
  message: string;
}

export interface APIError {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

export interface UserPreferences {
  preferred_target_language?: string;
  preferred_tone?: string;
  auto_save_history?: boolean;
  theme?: string;
}

export interface TranslationHistoryItem {
  id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  tone: string;
  created_at: string;
}

// Password validation result
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength?: 'weak' | 'medium' | 'strong';
}
