// src/pages/Results/index.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp, type NavigationProp } from "@react-navigation/native";
import colors from "../../theme/colors";
import api from "../../services/api";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem } from "../../types/domain"; // ajuste se o caminho for diferente

type R = RouteProp<RootStackParamList, "Results">;

const Results = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<R>();

  // ✅ pegue os params assim:
  const { state, city, categoryId } = route.params;

  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);

  useEffect(() => {
    setLoading(true);
    api
      .get<BenefitItem[]>("/catalog/benefits", {
        params: {
          state,
          city,
          categoryId,
          // aqui você decide o que quer ver no Results:
          // onlyPhysical: true,   // só físicos
          // onlyOnline: true,     // só online
        },
      })
      .then((r) => setBenefits(r.data || []))
      .catch(() => Alert.alert("Ops", "Não foi possível carregar os benefícios"))
      .finally(() => setLoading(false));
  }, [state, city, categoryId]);

  const openSite = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o site"));
  };

  const openWhats = (phone?: string) => {
    const p = (phone || "").replace(/\D/g, "");
    if (!p) return;
    Linking.openURL(`https://wa.me/${p}`).catch(() =>
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp")
    );
  };

  const goDetails = (b: BenefitItem) => navigation.navigate("Details", { benefit: b });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 8, color: colors.textBody }}>Carregando…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados</Text>
      <Text style={styles.sub}>
        {city}/{state} {categoryId ? `• Categoria ${categoryId}` : ""}
      </Text>

      <FlatList
        data={benefits}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {!!item.logo_url && (
                <Image source={{ uri: item.logo_url }} style={styles.logo} />
              )}
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title || item.partner_name}</Text>
                {!!item.discount_label && (
                  <Text style={styles.cardBadge}>{item.discount_label}</Text>
                )}
              </View>
            </View>

            {!!item.details && <Text style={styles.cardDesc}>{item.details}</Text>}

            <View style={styles.ctaRow}>
              {item.contact?.phone && (
                <TouchableOpacity style={styles.cta} onPress={() => openWhats(item.contact?.phone)}>
                  <Text style={styles.ctaText}>WhatsApp</Text>
                </TouchableOpacity>
              )}
              {item.contact?.website && (
                <TouchableOpacity style={styles.cta} onPress={() => openSite(item.contact?.website)}>
                  <Text style={styles.ctaText}>Abrir site</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.cta, styles.ctaGhost]} onPress={() => goDetails(item)}>
                <Text style={[styles.ctaText, styles.ctaGhostText]}>Ver detalhes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textBody, textAlign: "center", marginTop: 24 }}>
            Nenhum benefício encontrado para esse filtro.
          </Text>
        }
      />
    </View>
  );
};

export default Results;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "800", color: colors.textTitle },
  sub: { color: colors.textBody, marginTop: 4, marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: { width: 36, height: 36, borderRadius: 6 },
  cardTitle: { fontWeight: "800", color: colors.textTitle },
  cardBadge: { color: colors.primary, fontWeight: "700", marginTop: 2 },
  cardDesc: { color: colors.textBody, marginTop: 8 },
  ctaRow: { flexDirection: "row", marginTop: 10, flexWrap: "wrap", gap: 8 },
  cta: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  ctaText: { color: "#fff", fontWeight: "700" },
  ctaGhost: { backgroundColor: colors.primarySoft },
  ctaGhostText: { color: colors.primary },
});
