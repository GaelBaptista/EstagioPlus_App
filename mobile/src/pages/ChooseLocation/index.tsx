import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import axios from "axios";
import colors from "../../theme/colors";
import { useLocationCtx } from "../../context/LocationContext";

const bg = { uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop" };

const ChooseLocation = () => {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { setLocation } = useLocationCtx();

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [uf, setUf] = useState("CE");
  const [city, setCity] = useState("Pacajus");

  useEffect(() => {
    axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then(r => setUfs(r.data.map((u: any) => u.sigla).sort()))
      .catch(() => setUfs(["CE"]));
  }, []);

  useEffect(() => {
    if (!uf) return;
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(r => setCities(r.data.map((c: any) => c.nome)))
      .catch(() => setCities(["Pacajus"]));
  }, [uf]);

  function confirm() {
    if (!uf || !city) return;
    setLocation({ state: uf, city });
    nav.navigate("HomeLoyalty");
  }

  return (
    <ImageBackground source={bg} style={s.bg} imageStyle={{ opacity: 0.15 }}>
      <View style={s.card}>
        <Text style={s.title}>Sua Localização</Text>
        <Text style={s.subtitle}>Escolha seu estado e cidade</Text>

        <View style={s.inputWrap}>
          <Picker selectedValue={uf} onValueChange={setUf} style={s.picker}>
            {ufs.map(u => <Picker.Item key={u} label={u} value={u} />)}
          </Picker>
        </View>

        <View style={s.inputWrap}>
          <Picker selectedValue={city} onValueChange={setCity} enabled={!!uf} style={s.picker}>
            {cities.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
        </View>

        <TouchableOpacity style={s.btn} onPress={confirm}>
          <Text style={s.btnText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const s = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: colors.bg },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, ...Platform.select({ ios: { shadowOpacity: .08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 3 }}) },
  title: { fontSize: 22, fontWeight: "900", color: colors.textTitle },
  subtitle: { color: colors.textBody, marginTop: 6, marginBottom: 12 },
  inputWrap: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginTop: 10 },
  picker: { height: 52, color: colors.textTitle },
  btn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 12, height: 52, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
export default ChooseLocation;
