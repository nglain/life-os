import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'Life OS',
  webDir: 'dist',
  ios: {
    // Allow file input in WKWebView
    allowsLinkPreview: true,
  },
  server: {
    // For development - point to local server
    // url: 'http://localhost:5174',
    // cleartext: true,
  }
};

export default config;
