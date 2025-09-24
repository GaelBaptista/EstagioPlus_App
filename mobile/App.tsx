import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens();

import React from "react";
import { StatusBar } from "expo-status-bar";
import Routes from "./src/routes";
import { AuthProvider } from "./src/context/AuthContext";
import { LocationProvider } from "./src/context/LocationContext";

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <Routes />
      </LocationProvider>
    </AuthProvider>
  );
}
