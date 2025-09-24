import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import { useAuth } from "../../context/AuthContext";
import colors from "../../theme/colors";

function maskCpf(cpf?: string) {
  if (!cpf) return "";
  const only = cpf.replace(/\D/g, "");
  if (only.length !== 11) return cpf;
  return `${only.slice(0, 3)}.${only.slice(3, 6)}.${only.slice(6, 9)}-${only.slice(9)}`;
}

const Wallet = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const progressPct = useMemo(() => {
    if (!user) return 0;
    const pct = (user.points ?? 0) / (user.nextLevel || 1);
    return Math.max(0, Math.min(1, pct));
  }, [user]);

  function copyId() {
    // Sem depender de clipboard por enquanto (opcional instalar expo-clipboard)
    Alert.alert("Carteirinha", `ID do membro: ${user?.id}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.textTitle} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteirinha</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Card */}
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* Logo do app (troque quando tiver o oficial) */}
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 28, height: 28, borderRadius: 6 }}
            />
            <Text style={styles.brand}>Estágio Plus</Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{user?.name ?? "Usuário"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Nível</Text>
              <Text style={styles.valueStrong}>{user?.level ?? "Bronze"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CPF</Text>
              <Text style={styles.value}>{maskCpf(user?.cpf)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Pontos</Text>
              <Text style={styles.valueStrong}>{user?.points ?? 0}</Text>
            </View>
          </View>

          <View style={styles.progressBox}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Faltam{" "}
              <Text style={{ fontWeight: "800" }}>
                {(user?.nextLevel ?? 0) - (user?.points ?? 0)}
              </Text>{" "}
              pts para o próximo nível
            </Text>
          </View>

          <View style={styles.memberRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ID do Membro</Text>
              <Text style={styles.memberId}>#{user?.id ?? "--"}</Text>
            </View>
            <TouchableOpacity style={styles.qrBtn} onPress={copyId}>
              <Icon name="copy" size={16} color={colors.primary} />
              <Text style={styles.qrBtnText}>Ver/Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("HomeLoyalty")}>
            <Icon name="home" size={18} color="#fff" />
            <Text style={styles.actionText}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionOutline} onPress={() => navigation.navigate("Results", { state: "CE", city: "Pacajus" })}>
            <Icon name="gift" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Ver benefícios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textTitle },

  wrapper: { paddingHorizontal: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  brand: { fontSize: 16, fontWeight: "800", color: colors.textTitle },

  row: { flexDirection: "row", alignItems: "flex-end", marginTop: 8, gap: 12 },
  label: { color: colors.textBody, fontSize: 12 },
  value: { color: colors.textTitle, fontSize: 16, fontWeight: "700", marginTop: 2 },
  valueStrong: { color: colors.primary, fontSize: 18, fontWeight: "900", marginTop: 2 },

  progressBox: { marginTop: 16 },
  progressTrack: { height: 10, backgroundColor: colors.primarySoft, borderRadius: 999 },
  progressFill: { height: 10, backgroundColor: colors.primary, borderRadius: 999 },
  progressText: { marginTop: 8, color: colors.textBody, fontSize: 12 },

  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  memberId: { fontSize: 16, fontWeight: "900", color: colors.textTitle },

  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  qrBtnText: { color: colors.primary, fontWeight: "800" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  action: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionOutline: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionText: { color: "#fff", fontWeight: "800" },
});

export default Wallet;
