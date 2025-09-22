import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import type { RootStackParamList } from "./@types/navigation";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Points from "./pages/Points";
import Results from "./pages/Results";
import Details from "./pages/Detail";

const AppStack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  // DEBUG: se algum sair "undefined", é este o problema.
  console.log(
    "ROUTES components =>",
    { Login: typeof Login, Home: typeof Home, Points: typeof Points, Results: typeof Results, Details: typeof Details }
  );

  return (
    <NavigationContainer>
      <AppStack.Navigator
        initialRouteName="Login"   // <- troque para "Home" se ainda não tiver Login
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#f8f8fa" },
        }}
      >
        <AppStack.Screen name="Login" component={Login} />
        <AppStack.Screen name="Home" component={Home} />
        <AppStack.Screen name="Points" component={Points} />
        <AppStack.Screen name="Results" component={Results} />
        <AppStack.Screen name="Details" component={Details} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
