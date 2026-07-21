import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useParkingLot } from '../contexts/ParkingLotContext';
import { colors } from '../theme/colors';
import LoginScreen from '../screens/auth/LoginScreen';
import SelectParkingLotScreen from '../screens/SelectParkingLotScreen';
import MainTabNavigator from './MainTabNavigator';
import CheckOutScreen from '../screens/sessions/CheckOutScreen';
import CreateContractScreen from '../screens/contracts/CreateContractScreen';
import EditContractScreen from '../screens/contracts/EditContractScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { parkingLotId, isLoading: isLotLoading } = useParkingLot();

  if (isAuthLoading || isLotLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const screenOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.textPrimary,
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : !parkingLotId ? (
          <Stack.Screen
            name="SelectParkingLot"
            component={SelectParkingLotScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CheckOut"
              component={CheckOutScreen}
              options={{ title: 'Check-out xe' }}
            />
            <Stack.Screen
              name="CreateContract"
              component={CreateContractScreen}
              options={{ title: 'Tạo hợp đồng vé tháng' }}
            />
            <Stack.Screen
              name="EditContract"
              component={EditContractScreen}
              options={{ title: 'Hợp đồng vé tháng' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
