import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { MainTabParamList } from './types';

import ParkingMapScreen from '../screens/map/ParkingMapScreen';
import CheckInScreen from '../screens/sessions/CheckInScreen';
import ActiveSessionsScreen from '../screens/sessions/ActiveSessionsScreen';
import MonthlyContractsScreen from '../screens/contracts/MonthlyContractsScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import UsersScreen from '../screens/users/UsersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

/**
 * Tab hiển thị theo role:
 * - Staff: Sơ đồ bãi xe, Check-in, Đang gửi, Hồ sơ
 * - Manager: thêm Hợp đồng tháng, Báo cáo
 * - Admin: thêm cả Nhân viên
 */
export default function MainTabNavigator() {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'Manager' || user?.role === 'Admin';
  const isAdmin = user?.role === 'Admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}>
      <Tab.Screen
        name="Map"
        component={ParkingMapScreen}
        options={{
          title: 'Sơ đồ bãi xe',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🅿️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          title: 'Check-in',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={ActiveSessionsScreen}
        options={{
          title: 'Đang gửi',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🕐" focused={focused} />,
        }}
      />
      {isManagerOrAdmin && (
        <Tab.Screen
          name="Contracts"
          component={MonthlyContractsScreen}
          options={{
            title: 'Hợp đồng',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📄" focused={focused} />,
          }}
        />
      )}
      {isManagerOrAdmin && (
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Báo cáo',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
      )}
      {isAdmin && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            title: 'Nhân viên',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
