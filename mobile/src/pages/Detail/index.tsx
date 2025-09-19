// src/pages/Detail/index.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Linking, Alert } from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, LocationItem } from "../../types/domain";
import { RectButton } from "react-native-gesture-handler";

type R = RouteProp<RootStackParamList, "Details">;

const Details = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();

  const benefit = params?.benefit as BenefitItem | undefined;
  const location = (params?.location as LocationItem | undefined) || benefit?.locations?.[0];

  if (!benefit || !location) {
    console.log("[Details] missing params", params);
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ marginBottom: 12 }}>Não foi possível carregar o benefício.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#34cb79", fontWeight: "700" }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ✅ daqui pra baixo, use as versões “seguras”
  const b = benefit as BenefitItem;
  const loc = location as LocationItem;

  const imageSrc = b.image_url || b.logo_url || "https://placehold.co/600x220/png";

  const handleNavigateBack = () => navigation.goBack();

  function handleComposeMail() {
    const email = "contato@estagioplus.example";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent("Interesse no benefício")}`)
      .catch(() => Alert.alert("Erro", "Não foi possível abrir o e-mail"));
  }

  function handleWhatsapp() {
    const phone = b.contact?.phone || "+5585999990000";
    const url = `https://wa.me/${phone.replace(/\D/g, "")}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp"));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color={"#34cb79"} />
        </TouchableOpacity>

        <Image style={styles.pointImage} source={{ uri: imageSrc }} />

        <Text style={styles.pointName}>{b.title || b.partner_name}</Text>
        {!!b.details && <Text style={styles.pointItems}>{b.details}</Text>}

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {loc.address} - {loc.city}/{loc.state}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color={"#fff"} />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>

        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon name="mail" size={20} color={"#fff"} />
          <Text style={styles.buttonText}>Email</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, paddingTop: 20 },
  pointImage: { width: "100%", height: 120, resizeMode: "cover", borderRadius: 10, marginTop: 32 },
  pointName: { color: "#322153", fontSize: 28, fontFamily: "Ubuntu_700Bold", marginTop: 24 },
  pointItems: { fontFamily: "Roboto_400Regular", fontSize: 16, lineHeight: 24, marginTop: 8, color: "#6C6C80" },
  address: { marginTop: 32 },
  addressTitle: { color: "#322153", fontFamily: "Roboto_500Medium", fontSize: 16 },
  addressContent: { fontFamily: "Roboto_400Regular", lineHeight: 24, marginTop: 8, color: "#6C6C80" },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: "#999", paddingVertical: 20, paddingHorizontal: 32, flexDirection: "row", justifyContent: "space-between" },
  button: { width: "48%", backgroundColor: "#34CB79", borderRadius: 10, height: 50, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  buttonText: { marginLeft: 8, color: "#FFF", fontSize: 16, fontFamily: "Roboto_500Medium" },
});

export default Details;
