// src/pages/Detail/index.tsx
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
  type NavigationProp,
} from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, LocationItem } from "../../types/domain";
import { RectButton } from "react-native-gesture-handler";
import colors from "../../theme/colors";

type R = RouteProp<RootStackParamList, "Details">;

const Details = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();

  // ——— Discriminação do union ———
  let benefit: BenefitItem | undefined;
  let location: LocationItem | undefined;

  if ("benefit" in params) {
    benefit = params.benefit as BenefitItem;
    location =
      (params.location as LocationItem | undefined) ||
      benefit?.locations?.[0];
  } else if ("point_id" in params) {
    // fluxo legado (se não usar mais, pode só voltar)
    // navigation.goBack();
    benefit = undefined;
  }

  if (!benefit) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Não foi possível carregar o benefício.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: 8 }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const b = benefit;
  const img = b.image_url || b.logo_url || "https://placehold.co/600x220/png";

  function openMail() {
    const email = b.contact?.email || "contato@estagioplus.example";
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent("Interesse no benefício")}`
    ).catch(() => Alert.alert("Erro", "Não foi possível abrir o e-mail"));
  }

  function openWhats() {
    const phone = b.contact?.phone || "+5585999990000";
    const url = `https://wa.me/${phone.replace(/\D/g, "")}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" color={colors.primary} />
        </TouchableOpacity>

        <Image style={styles.pointImage} source={{ uri: img }} />

        <Text style={styles.pointName}>{b.title || b.partner_name}</Text>
        {!!b.details && <Text style={styles.pointItems}>{b.details}</Text>}

        {!!location && (
          <View style={styles.address}>
            <Text style={styles.addressTitle}>Endereço</Text>
            <Text style={styles.addressContent}>
              {location.address || `${location.city}/${location.state}`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={openWhats}>
          <FontAwesome name="whatsapp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={openMail}>
          <Icon name="mail" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Email</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, paddingTop: 20 },
  pointImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
    borderRadius: 12,
    marginTop: 24,
  },
  pointName: {
    color: colors.textTitle,
    fontSize: 24,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 16,
  },
  pointItems: {
    color: colors.textBody,
    fontFamily: "Roboto_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  address: { marginTop: 18 },
  addressTitle: {
    color: colors.textTitle,
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
  addressContent: {
    color: colors.textBody,
    fontFamily: "Roboto_400Regular",
    marginTop: 6,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD",
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    width: "48%",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
  },
});

export default Details;
