/**
 * ParkingPro Mobile — app cho nhân viên/quản lý bãi xe.
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { ParkingLotProvider } from './src/contexts/ParkingLotContext';
import { UiProvider } from './src/contexts/UiContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AuthProvider>
          <ParkingLotProvider>
            <UiProvider>
              <RootNavigator />
            </UiProvider>
          </ParkingLotProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
