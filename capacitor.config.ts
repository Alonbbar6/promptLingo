import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.promptlingo.app',
  appName: 'PromptLingo',
  webDir: 'build',
  // App loads bundled assets, API calls go to production backend
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
  },
};

export default config;
