// src/pages/Home/index.tsx
import React, { useEffect, useState } from "react";
import { Image, ImageBackground, StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather as Icon } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import colors from "../../theme/colors";
import api from "../../services/api";
import type { Category } from "../../types/domain";

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catSelected, setCatSelected] = useState<number | undefined>(undefined);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((r) => setUfs(r.data.map((u: any) => u.sigla).sort()))
      .catch(() => Alert.alert("Ops", "Falha ao carregar UFs."));
  }, []);

  useEffect(() => {
    if (!selectedUf) { setCities([]); setSelectedCity(""); return; }
    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((r) => setCities(r.data.map((c: any) => c.nome).sort()))
      .catch(() => Alert.alert("Ops", "Falha ao carregar cidades."));
  }, [selectedUf]);

  useEffect(() => {
    setLoadingCats(true);
    api.get("/catalog/categories")
      .then((r) => setCategories(r.data))
      .catch(() => Alert.alert("Ops", "Falha ao carregar categorias."))
      .finally(() => setLoadingCats(false));
  }, []);

  function handleGo() {
  if (!selectedUf || !selectedCity) {
    alert("Atenção: selecione UF e Cidade");
    return;
  }

  navigation.navigate("Points", {
    uf: selectedUf,
    city: selectedCity,
    // categoryId: catSelected,
  });
}

  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368, opacity: 0.65 }}
    >
      <View style={styles.main}>
        <Image source={require("../../assets/logo.png")} style={{ width: 120, height: 120, resizeMode: "contain" }} />
        <Text style={styles.title}>Seus benefícios em um só lugar</Text>
        <Text style={styles.description}>
          Encontre vantagens próximas a você e também benefícios online.
        </Text>
      </View>

      <View style={styles.footer}>
        {/* UF */}
        <View style={styles.pickerBox}>
          <Picker selectedValue={selectedUf} onValueChange={setSelectedUf} style={styles.picker}>
            <Picker.Item label="Selecione a UF" value="" />
            {ufs.map((uf) => <Picker.Item key={uf} label={uf} value={uf} />)}
          </Picker>
        </View>
        {/* Cidade */}
        <View style={styles.pickerBox}>
          <Picker selectedValue={selectedCity} onValueChange={setSelectedCity} enabled={!!selectedUf} style={styles.picker}>
            <Picker.Item label="Selecione a cidade" value="" />
            {cities.map((city) => <Picker.Item key={city} label={city} value={city} />)}
          </Picker>
        </View>

        {/* Categorias (chips) */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        {loadingCats ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {categories.map((c) => {
              const active = catSelected === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCatSelected(active ? undefined : c.id)}
                >
                  <Image source={{ uri: c.icon }} style={styles.chipIcon} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.button} onPress={handleGo} activeOpacity={0.8}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" size={22} color="#fff" />
          </View>
          <Text style={styles.buttonText}>Ver benefícios</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, backgroundColor: colors.bg },
  main: { flex: 1, justifyContent: "center" },
  title: { color: colors.textTitle, fontSize: 32, fontFamily: "Ubuntu_700Bold", maxWidth: 320, marginTop: 24 },
  description: { color: colors.textBody, fontSize: 16, marginTop: 12, fontFamily: "Roboto_400Regular", maxWidth: 320, lineHeight: 24 },
  footer: {},
  pickerBox: { backgroundColor: colors.white, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  picker: { height: 56, color: colors.textTitle },
  sectionTitle: { marginTop: 8, marginBottom: 4, fontFamily: "Roboto_500Medium", color: colors.textTitle },
  chip: { backgroundColor: colors.chipBg, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, flexDirection: "row", alignItems: "center" },
  chipActive: { backgroundColor: colors.primary },
  chipIcon: { width: 20, height: 20, marginRight: 8 },
  chipText: { color: colors.chipText, fontFamily: "Roboto_500Medium" },
  chipTextActive: { color: "#fff" },
  button: { backgroundColor: colors.primary, height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", overflow: "hidden", marginTop: 10 },
  buttonIcon: { width: 56, height: 56, backgroundColor: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontFamily: "Roboto_500Medium", fontSize: 16, textAlign: "center", flex: 1 },
});

export default Home;
