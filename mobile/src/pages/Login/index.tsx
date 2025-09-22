// src/pages/Login/index.tsx
import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import colors from "../../theme/colors";
import api from "../../services/api";

const Login = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      // back pronto:
      // const { data } = await api.post("/auth/login", { email, password: pass });
      // guardar token se quiser...
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("Falha no login", "Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>Entrar</Text>
      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={pass}
          onChangeText={setPass}
        />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.textTitle, marginBottom: 16, textAlign: "center" },
  form: { backgroundColor: colors.white, borderRadius: 16, padding: 16, borderColor: colors.border, borderWidth: 1 },
  label: { color: colors.textTitle, fontWeight: "600", marginBottom: 6 },
  input: {
    height: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, color: colors.textTitle, backgroundColor: colors.white,
  },
  btn: { marginTop: 16, backgroundColor: colors.primary, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default Login;
