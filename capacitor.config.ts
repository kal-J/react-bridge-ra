import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.react_bridge_ra',
  appName: 'react-bridge-ra',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
