import React, { useEffect, useState } from "react";
import { Feather as Icon } from "@expo/vector-icons";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => setUfs(res.data.map((uf: any) => uf.sigla)));
  }, []);

  useEffect(() => {
    if (!selectedUf) return;
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((res) => setCities(res.data.map((c: any) => c.nome)));
  }, [selectedUf]);

  function handleNavigateToPoints() {
    if (!selectedUf || !selectedCity) {
      alert("Selecione UF e Cidade!");
      return;
    }
    navigation.navigate("Points", { uf: selectedUf, city: selectedCity });
  }

  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require("../../assets/logo.png")} />
        <Text style={styles.title}>Seu Marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}>
          <Picker selectedValue={selectedUf} onValueChange={setSelectedUf} style={{ height: 60, color: "#322153" }}>
            <Picker.Item label="Selecione a UF" value="" />
            {ufs.map((uf) => <Picker.Item key={uf} label={uf} value={uf} />)}
          </Picker>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 8, marginBottom: 8 }}>
          <Picker selectedValue={selectedCity} onValueChange={setSelectedCity} enabled={!!selectedUf} style={{ height: 60, color: "#322153" }}>
            <Picker.Item label="Selecione a cidade" value="" />
            {cities.map((city) => <Picker.Item key={city} label={city} value={city} />)}
          </Picker>
        </View>

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text><Icon name="arrow-right" color="#fff" size={24} /></Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32 },
  main: { flex: 1, justifyContent: "center" },
  title: { color: "#322153", fontSize: 32, fontFamily: "Ubuntu_700Bold", maxWidth: 260, marginTop: 64 },
  description: { color: "#6C6C80", fontSize: 16, marginTop: 16, fontFamily: "Roboto_400Regular", maxWidth: 260, lineHeight: 24 },
  footer: {},
  button: { backgroundColor: "#34CB79", height: 60, flexDirection: "row", borderRadius: 10, overflow: "hidden", alignItems: "center", marginTop: 8 },
  buttonIcon: { height: 60, width: 60, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "center", alignItems: "center" },
  buttonText: { flex: 1, textAlign: "center", color: "#FFF", fontFamily: "Roboto_500Medium", fontSize: 16 },
});
export default Home;
