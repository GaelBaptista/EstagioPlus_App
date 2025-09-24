import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, CategoryItem } from "../../types/domain";
import api from "../../services/api";
import colors from "../../theme/colors";

type R = RouteProp<RootStackParamList, "Results">;

const isSvg = (u?: string) => typeof u === "string" && u.toLowerCase().includes(".svg");

const Results = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();
  const state = params?.state ?? "CE";
  const city = params?.city ?? "Pacajus";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [items, setItems] = useState<BenefitItem[]>([]);

  // categorias
  useEffect(() => {
    let mounted = true;
    api.get<CategoryItem[]>("/catalog/categories")
      .then((r) => mounted && setCategories(r.data || []))
      .catch(() => mounted && setCategories([]));
    return () => { mounted = false; };
  }, []);

  // benefícios
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const params: any = { state, city };
        if (selected) params.categoryId = selected;
        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", { params });
        mounted && setItems(Array.isArray(data) ? data : []);
      } catch {
        mounted && setItems([]);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [state, city, selected]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.partner_name?.toLowerCase().includes(q) ||
        b.details?.toLowerCase().includes(q)
    );
  }, [items, search]);

  function openWhatsSafe(phone?: string) {
    const p = (phone || "").replace(/\D/g, "");
    if (!p) return;
    try {
      void Linking.openURL(`https://wa.me/${p}`);
    } catch {}
  }

  function openUrlSafe(url?: string) {
    if (!url) return;
    try {
      void Linking.openURL(url);
    } catch {}
  }

  function goDetails(b: BenefitItem) {
    const loc = b.locations?.[0];
    navigation.navigate("Details", { benefit: b, location: loc });
  }

  return (
    <View style={s.container}>
      {/* header simples */}
      <View style={s.header}>
        <Text style={s.h1}>Benefícios Online</Text>
        <Text style={s.sub}>{city}/{state}</Text>
      </View>

      {/* busca */}
      <View style={s.searchBox}>
        <Icon name="search" size={18} color={colors.textBody} />
        <TextInput
          placeholder="Buscar por nome"
          placeholderTextColor={colors.textBody}
          value={search}
          onChangeText={setSearch}
          style={s.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Icon name="x" size={18} color={colors.textBody} />
          </TouchableOpacity>
        )}
      </View>

      {/* chips de categoria */}
      <View style={s.chipsRow}>
        <TouchableOpacity
          onPress={() => setSelected(null)}
          style={[s.chip, selected === null && s.chipActive]}
        >
          <Text style={[s.chipText, selected === null && s.chipTextActive]}>Todos</Text>
        </TouchableOpacity>

        {categories.map((c) => {
          const active = selected === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelected(active ? null : c.id)}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={[s.chipText, active && s.chipTextActive]} numberOfLines={1}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* lista */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          renderItem={({ item: b }) => (
            <View style={s.card}>
              {b.image_url ? (
                <Image source={{ uri: b.image_url }} style={s.cardImg} />
              ) : (
                <View style={[s.cardImg, s.cardImgAlt]} />
              )}

              <View style={{ padding: 12 }}>
                <Text style={s.cardTitle}>{b.title || b.partner_name}</Text>
                {!!b.details && <Text style={s.cardDesc}>{b.details}</Text>}

                <View style={s.row}>
                  {!!b.contact?.phone && (
                    <TouchableOpacity
                      style={s.pill}
                      onPress={() => openWhatsSafe(b.contact?.phone)}
                    >
                      <Icon name="message-circle" size={14} color="#fff" />
                      <Text style={s.pillText}>WhatsApp</Text>
                    </TouchableOpacity>
                  )}
                  {!!b.contact?.website && (
                    <TouchableOpacity
                      style={s.pill}
                      onPress={() => openUrlSafe(b.contact?.website)}
                    >
                      <Icon name="external-link" size={14} color="#fff" />
                      <Text style={s.pillText}>Abrir site</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={[s.pill, s.pillGhost]} onPress={() => goDetails(b)}>
                  <Text style={[s.pillText, { color: colors.primary }]}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textBody, textAlign: "center", marginTop: 24 }}>
              Nada encontrado.
            </Text>
          }
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  h1: { fontSize: 18, fontWeight: "900", color: colors.textTitle },
  sub: { color: colors.textBody, marginTop: 2 },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.textTitle },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginTop: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#fff", borderColor: colors.border, borderWidth: 1, borderRadius: 999 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textTitle, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  card: { backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardImg: { width: "100%", height: 140 },
  cardImgAlt: { backgroundColor: "#f2f2f2" },
  cardTitle: { fontWeight: "900", color: colors.textTitle },
  cardDesc: { color: colors.textBody, marginTop: 6 },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  pillText: { color: "#fff", fontWeight: "800" },
  pillGhost: { backgroundColor: "#FFE7D3", marginTop: 8, alignSelf: "flex-start" },
});

export default Results;
