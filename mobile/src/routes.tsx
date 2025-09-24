import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./pages/Login";
import ChooseLocation from "./pages/ChooseLocation";
import HomeLoyalty from "./pages/Home";
import Points from "./pages/Points";
import Results from "./pages/Results";
import Details from "./pages/Detail";
import Wallet from "./pages/Wallet";

import type { RootStackParamList } from "./@types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* 👇 SOMENTE <Stack.Screen/> AQUI DENTRO */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ChooseLocation" component={ChooseLocation} />
        <Stack.Screen name="HomeLoyalty" component={HomeLoyalty} />
        <Stack.Screen name="Points" component={Points} />
        <Stack.Screen name="Results" component={Results} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Wallet" component={Wallet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
