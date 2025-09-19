import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens();

import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, ScrollView } from "react-native";
import Routes from "./src/routes";
import { useFonts, Ubuntu_700Bold } from "@expo-google-fonts/ubuntu";
import { Roboto_400Regular, Roboto_500Medium } from "@expo-google-fonts/roboto";

// ErrorBoundary simples:
class Boundary extends React.Component<any, { error?: Error }> {
  constructor(p:any){ super(p); this.state = {}; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any){ console.log("[BOUNDARY]", error, info); }
  render(){
    if (this.state.error) {
      return (
        <ScrollView style={{ flex:1, padding:16 }}>
          <Text style={{ fontSize:18, fontWeight:"bold", marginBottom:8 }}>Falha no app</Text>
          <Text selectable style={{ color:"#d00" }}>{String(this.state.error?.message || this.state.error)}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular, Roboto_500Medium, Ubuntu_700Bold,
  });
  if (!fontsLoaded) return null;

  return (
    <Boundary>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Routes />
    </Boundary>
  );
}
