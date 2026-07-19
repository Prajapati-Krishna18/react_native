import React from 'react';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SurveyProvider } from '../context/SurveyContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawer } from '../components/CustomDrawer';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SurveyProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
              headerShown: false,
              drawerType: 'slide',
              overlayColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* The main Bottom Tabs route */}
            <Drawer.Screen
              name="(tabs)"
              options={{
                title: 'Dashboard',
              }}
            />
            {/* Extra pages in drawer */}
            <Drawer.Screen
              name="camera"
              options={{
                title: 'Camera',
              }}
            />
            <Drawer.Screen
              name="location"
              options={{
                title: 'Location',
              }}
            />
            <Drawer.Screen
              name="contacts"
              options={{
                title: 'Contacts',
              }}
            />
            <Drawer.Screen
              name="clipboard"
              options={{
                title: 'Clipboard',
              }}
            />
          </Drawer>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SurveyProvider>
    </GestureHandlerRootView>
  );
}
