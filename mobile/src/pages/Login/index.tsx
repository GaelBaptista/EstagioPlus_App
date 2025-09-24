import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import { useAuth } from "../../context/AuthContext";
import colors from "../../theme/colors";

const Login = () => {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  // valores padrão do seed
  const [email, setEmail] = useState("gabriel@estagioplus.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert("Atenção", "Informe e-mail e senha.");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      // ajuste o nome da rota conforme o seu setup: "SelectLocation" ou "ChooseLocation"
      nav.navigate("ChooseLocation" as any);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Não foi possível autenticar. Verifique seus dados.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        <Image
          style={s.logo}
          source={{ uri: "https://placehold.co/200x200/png?text=Estagio+Plus" }}
        />
        <Text style={s.title}>Estágio Plus</Text>
        <Text style={s.subtitle}>Entre para acessar seus benefícios</Text>

        <View style={s.box}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textBody}
            autoCapitalize="none"
            keyboardType="email-address"
            style={s.input}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            placeholderTextColor={colors.textBody}
            secureTextEntry
            style={s.input}
          />

          <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
            <Text style={s.btnText}>{loading ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.hint}>
          Dica: use <Text style={s.bold}>gabriel@estagioplus.com</Text> /{" "}
          <Text style={s.bold}>123456</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: { width: 120, height: 120, borderRadius: 28, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "900", color: colors.textTitle },
  subtitle: { color: colors.textBody, marginTop: 6, marginBottom: 8 },
  box: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textBody, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    color: colors.textTitle,
  },
  btn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
  hint: { marginTop: 12, color: colors.textBody },
  bold: { fontWeight: "800", color: colors.textTitle },
});

export default Login;
