// src/pages/HomeLoyalty/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import colors from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { useLocationCtx } from "../../context/LocationContext";
import ProgressRing from "../../components/ProgressRing";
import api from "../../services/api";
import type { BenefitItem } from "../../types/domain";

type LoyaltyProgress = {
  meta: number;
  points: number;
  percent: number; // 0..1
  daily_rate: number;
  milestones: { pct: number; label: string; reached: boolean }[];
  month_bonus_available: boolean;
};

const EDU_LABEL = "Educação e Desenvolvimento";
const SAUDE_LABEL = "Saúde e Bem Estar";

const HomeLoyalty = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { location } = useLocationCtx();

  // loyalty
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);
  const [prog, setProg] = useState<LoyaltyProgress | null>(null);

  // recomendações (somente itens vindos do back)
  const [featured, setFeatured] = useState<BenefitItem[]>([]);
  const [loadingFeat, setLoadingFeat] = useState(false);

  const pct = useMemo(() => (prog ? Math.min(prog.percent, 1) : 0), [prog]);

  function goCarteirinha() {
    navigation.navigate("Wallet");
  }
  function goMap() {
    navigation.navigate("Points", {
      uf: location.state || "CE",
      city: location.city || "Pacajus",
    });
  }
  function goOnline() {
    navigation.navigate("Results", {
      state: location.state || "CE",
      city: location.city || "Pacajus",
      categoryId: undefined,
    } as any);
  }

  async function loadLoyalty() {
    try {
      setLoadingLoyalty(true);
      // credita pontos pendentes do dia e obtém progresso
      await api.post("/loyalty/accrue");
      const { data } = await api.get<LoyaltyProgress>("/loyalty/progress");
      setProg(data);
    } catch (e) {
      // silencioso para não travar a home
    } finally {
      setLoadingLoyalty(false);
    }
  }

  async function claimMonthly() {
    try {
      await api.post("/loyalty/claim-month");
      await loadLoyalty();
      Alert.alert("Pronto!", "Bônus mensal creditado na sua conta.");
    } catch (e: any) {
      Alert.alert("Ops", e?.response?.data?.message ?? "Não foi possível resgatar agora.");
    }
  }

  async function loadFeatured() {
    try {
      setLoadingFeat(true);
      // Busca online somente (estado e cidade ajudam a respeitar disponibilidade)
      const { data } = await api.get<BenefitItem[]>("/catalog/benefits", {
        params: {
          state: location.state || "CE",
          city: location.city || "Pacajus",
          onlyOnline: true,
        },
      });

      // filtra somente 2 itens: um de Educação e um de Saúde
      // (usamos title das categorias do seed — caso use ids fixos, troque por category_id === 1/2)
      const edu = data.find((b) => b.category_id != null && (b.title || "").toLowerCase().includes("minicursos"))
        ?? data.find((b) => b.category_id != null && (b.partner_name || "").toLowerCase().includes("igt"))
        ?? data.find((b) => b.category_id != null && (b.details || "").toLowerCase().includes("curso"));

      const sau = data.find((b) => b.category_id != null && (b.details || "").toLowerCase().includes("psicol"))
        ?? data.find((b) => b.category_id != null && (b.title || "").toLowerCase().includes("consulta"));

      setFeatured([edu, sau].filter(Boolean) as BenefitItem[]);
    } catch {
      setFeatured([]);
    } finally {
      setLoadingFeat(false);
    }
  }

  useEffect(() => {
    loadLoyalty();
  }, []);

  useEffect(() => {
    loadFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.city]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.hello}>Olá,</Text>
          <Text style={s.username}>{user?.name ?? "Usuário"}</Text>
          {!!location.state && !!location.city && (
            <Text style={{ color: colors.textBody, marginTop: 4 }}>
              {location.city}/{location.state}
            </Text>
          )}
        </View>
        <TouchableOpacity style={s.avatar} onPress={goCarteirinha}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{(user?.name || "U")[0]}</Text>
        </TouchableOpacity>
      </View>

      {/* Loyalty Widget */}
      <View style={s.pointsCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <ProgressRing progress={pct} label="nível" />
          <View style={{ flex: 1 }}>
            <Text style={s.pointsLabel}>Sua jornada</Text>
            {loadingLoyalty ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={s.pointsValue}>
                  {prog?.points?.toLocaleString("pt-BR") ?? 0} /{" "}
                  {prog?.meta?.toLocaleString("pt-BR") ?? 0} pts
                </Text>
                <Text style={{ color: colors.textBody, marginTop: 4 }}>
                  Progresso:{" "}
                  <Text style={{ fontWeight: "800", color: colors.textTitle }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={s.actionsRow}>
          <TouchableOpacity style={s.primaryBtn} onPress={goOnline}>
            <Icon name="gift" size={18} color="#fff" />
            <Text style={s.primaryBtnText}>Benefícios Online</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.primaryBtn, s.secondaryBtn]} onPress={goMap}>
            <Icon name="map-pin" size={18} color={colors.primary} />
            <Text style={[s.primaryBtnText, { color: colors.primary }]}>Perto de mim</Text>
          </TouchableOpacity>
        </View>

        {/* Bônus mensal */}
        {!!prog && prog.month_bonus_available && (
          <TouchableOpacity style={s.monthBtn} onPress={claimMonthly}>
            <Icon name="zap" size={16} color="#fff" />
            <Text style={s.monthBtnText}>Resgatar bônus mensal (+10.000 pts)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lembrete de sorteios */}
      <View style={s.reminderCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={s.reminderIcon}>
            <Icon name="star" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.reminderTitle}>Sorteios Trimestrais</Text>
            <Text style={s.reminderSub}>Fique de olho em Cultura & Lazer</Text>
          </View>
          <Icon name="chevron-right" size={18} color="#fff" />
        </View>
      </View>

      {/* Recomendados */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recomendados pra você</Text>
        <TouchableOpacity onPress={goOnline}>
          <Text style={s.sectionAll}>ver todos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {loadingFeat && (
          <View style={s.cardMini}>
            <ActivityIndicator />
          </View>
        )}

        {!loadingFeat &&
          featured.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={s.cardMini}
              onPress={() => navigation.navigate("Details", { benefit: b, location: b.locations?.[0] })}
            >
              <Image
                style={s.cardImg}
                source={{ uri: b.image_url || b.logo_url || "https://placehold.co/640x360/png" }}
              />
              <View style={{ padding: 12 }}>
                <Text numberOfLines={2} style={s.cardTitle}>
                  {b.title || b.partner_name}
                </Text>
                {!!b.discount_label && (
                  <Text style={s.cardBadge}>{b.discount_label}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

        {!loadingFeat && featured.length === 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ color: colors.textBody }}>Sem recomendações no momento.</Text>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 16, android: 12 }),
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: { color: colors.textBody },
  username: { color: colors.textTitle, fontSize: 22, fontWeight: "800" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  pointsCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsLabel: { color: colors.textBody, fontSize: 13 },
  pointsValue: { color: colors.textTitle, fontSize: 22, fontWeight: "900" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.primary },

  monthBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  monthBtnText: { color: "#fff", fontWeight: "800" },

  reminderCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 14,
  },
  reminderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTitle: { color: "#fff", fontWeight: "900" },
  reminderSub: { color: "#fff" },

  sectionHeader: {
    marginTop: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: colors.textTitle, fontWeight: "900", fontSize: 16 },
  sectionAll: { color: colors.primary, fontWeight: "700" },

  cardMini: {
    width: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImg: { width: "100%", height: 110, backgroundColor: "#eee" },
  cardTitle: { fontWeight: "800", color: colors.textTitle },
  cardBadge: { color: colors.primary, fontWeight: "700", marginTop: 2 },
});

export default HomeLoyalty;
