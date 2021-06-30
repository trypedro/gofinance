import 'react-native-gesture-handler'

import React from 'react'
import { ThemeProvider } from 'styled-components/native'

import AppLoading from 'expo-app-loading'

import { NavigationContainer } from '@react-navigation/native'

// fonts
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'

// themes that the colors is setted
import colorsTheme from './src/global/styles/theme'

// components of routing
import { AppRoutes } from './src/routes/app.routes'


export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={colorsTheme}>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </ThemeProvider>
  )
}
