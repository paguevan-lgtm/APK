import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boradevan.app',
  appName: 'Bora de Van',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
