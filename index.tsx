import { registerRootComponent } from 'expo';

import App from './App';
import { ThemeProvider } from './src/theme/colors';
import { AuthProvider } from './src/hooks/AuthContext';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(() => (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
));
