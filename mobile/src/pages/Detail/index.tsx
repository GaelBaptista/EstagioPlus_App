import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Linking, Alert, ScrollView } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, LocationItem } from "../../types/domain";
import colors from "../../theme/colors";

type R = RouteProp<RootStackParamList, "Details">;

const Details = () => {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();

  const benefit = params?.benefit as BenefitItem | undefined;
  const location = (params?.location as LocationItem | undefined) || benefit?.locations?.[0];

  if (!benefit) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Não foi possível carregar o benefício.</Text>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={{ color: colors.primary, fontWeight: "800" }}>Voltar</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const img = benefit.image_url || benefit.logo_url || "https://placehold.co/600x220/png";

  const openMail = () => {
    const email = "contato@estagioplus.example";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent("Interesse no benefício")}`).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o e-mail")
    );
  };

  const openWhats = () => {
    const phone = benefit.contact?.phone || "+5585999990000";
    const p = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${p}`).catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp"));
  };

  const openSite = () => {
    const url = benefit.contact?.website;
    if (url) Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o site"));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Icon name="arrow-left" color={colors.primary} size={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detalhes</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Image source={{ uri: img }} style={s.cover} />
        <Text style={s.title}>{benefit.title || benefit.partner_name}</Text>
        {!!benefit.discount_label && <Text style={s.badge}>{benefit.discount_label}</Text>}
        {!!benefit.details && <Text style={s.desc}>{benefit.details}</Text>}

        {location && (
          <View style={s.block}>
            <Text style={s.blockTitle}>Endereço</Text>
            <Text style={s.blockBody}>
              {location.address ? `${location.address} — ` : ""}
              {location.city}/{location.state}
            </Text>
          </View>
        )}

        <View style={s.actions}>
          {benefit.contact?.phone && (
            <TouchableOpacity style={s.btn} onPress={openWhats}><Text style={s.btnText}>WhatsApp</Text></TouchableOpacity>
          )}
          {benefit.contact?.website && (
            <TouchableOpacity style={s.btn} onPress={openSite}><Text style={s.btnText}>Abrir site</Text></TouchableOpacity>
          )}
          <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={openMail}><Text style={[s.btnText, s.btnGhostText]}>Email</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
  headerTitle: { fontWeight: "900", color: colors.textTitle },
  cover: { width: "100%", height: 160, borderRadius: 12, marginTop: 10 },
  title: { fontSize: 20, fontWeight: "900", color: colors.textTitle, marginTop: 12 },
  badge: { color: colors.primary, fontWeight: "700", marginTop: 2 },
  desc: { color: colors.textBody, marginTop: 8 },
  block: { marginTop: 12 },
  blockTitle: { color: colors.textTitle, fontWeight: "900" },
  blockBody: { color: colors.textBody, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" },
  btn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "800" },
  btnGhost: { backgroundColor: colors.primarySoft },
  btnGhostText: { color: colors.primary },
});

export default Details;
