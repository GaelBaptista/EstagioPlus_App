import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Image, Alert, Platform, TextInput, Linking } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import * as Location from "expo-location";
import { SvgUri } from "react-native-svg";
import api from "../../services/api";
import colors from "../../theme/colors";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, CategoryItem } from "../../types/domain";

let MapView: any = null; let Marker: any = null;
if (Platform.OS !== "web") { const Maps = require("react-native-maps"); MapView = Maps.default; Marker = Maps.Marker; }

type R = RouteProp<RootStackParamList, "Points">;
type TabKey = "map" | "online";
type MarkerItem = { id: string; name: string; image_url?: string; latitude: number; longitude: number; benefit: BenefitItem; };
const isSvg = (u?: string) => typeof u === "string" && u.toLowerCase().includes(".svg");

const CAT_ICON: Record<number, { name: any; labelFallback: string }> = {
  1: { name: "book-open", labelFallback: "Educação" },
  2: { name: "heart", labelFallback: "Saúde" },
  3: { name: "film", labelFallback: "Cultura" },
  4: { name: "shopping-bag", labelFallback: "Consumo" },
  5: { name: "star", labelFallback: "Outros" },
};

const Points = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<R>();
  const { uf, city } = route.params;

  const [tab, setTab] = useState<TabKey>("map");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [search, setSearch] = useState("");

  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [online, setOnline] = useState<BenefitItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Oooops...", "Precisamos da sua permissão de localização.");
          setInitialPosition([-4.1708, -38.463]);
          return;
        }
        const loc = await Location.getCurrentPositionAsync();
        setInitialPosition([loc.coords.latitude, loc.coords.longitude]);
      } catch { setInitialPosition([-4.1708, -38.463]); }
    })();
  }, []);

  useEffect(() => {
    api.get<CategoryItem[]>("/catalog/categories")
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]));
  }, []);

  // físicos
  useEffect(() => {
    if (tab !== "map") return;
    (async () => {
      try {
        const categoryId = selectedCategories[0];
        const params: any = { state: uf, city, onlyPhysical: true };
        if (categoryId) params.categoryId = categoryId;
        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", { params });

        const list = (data ?? []) as BenefitItem[];
        const filtered = list.filter((b) =>
          !search || (b.title?.toLowerCase().includes(search.toLowerCase()) || b.partner_name?.toLowerCase().includes(search.toLowerCase()))
        );
        const mks: MarkerItem[] = filtered.flatMap((b) =>
          (b.locations ?? []).map((l) => ({
            id: String(l.id ?? `${b.id}-${l.latitude ?? 0}-${l.longitude ?? 0}`),
            name: String(b.title || b.partner_name || "Benefício"),
            image_url: b.image_url || b.logo_url || undefined,
            latitude: Number(l.latitude ?? 0),
            longitude: Number(l.longitude ?? 0),
            benefit: b,
          }))
        );
        setMarkers(mks);
      } catch { setMarkers([]); }
    })();
  }, [tab, uf, city, selectedCategories, search]);

  // online
  useEffect(() => {
    if (tab !== "online") return;
    (async () => {
      try {
        const categoryId = selectedCategories[0];
        const params: any = { state: uf, city, onlyOnline: true };
        if (categoryId) params.categoryId = categoryId;
        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", { params });
        const filtered = (data || []).filter((b) =>
          !search || (b.title?.toLowerCase().includes(search.toLowerCase()) || b.partner_name?.toLowerCase().includes(search.toLowerCase()))
        );
        setOnline(filtered || []);
      } catch { setOnline([]); }
    })();
  }, [tab, uf, city, selectedCategories, search]);

  function handleNavigateBack() { navigation.goBack(); }
  function handleNavigateToDetail(benefit: BenefitItem, locationId?: string) {
    const loc = benefit?.locations?.find((l) => String(l.id) === locationId) ?? benefit?.locations?.[0];
    navigation.navigate("Details", { benefit, location: loc });
  }
  function handleSelectCategory(id: number) {
    setSelectedCategories((prev) => (prev.includes(id) ? [] : [id])); // single-select
  }
  const openSite = (url?: string) => { if (url) void Linking.openURL(url); };
  const openWhats = (phone?: string) => { const p = (phone || "").replace(/\D/g, ""); if (p) void Linking.openURL(`https://wa.me/${p}`); };

  return (
    <>
      <View style={s.container}>
        <TouchableOpacity onPress={handleNavigateBack}><Icon name="arrow-left" color={colors.primary} /></TouchableOpacity>
        <Text style={s.title}>Benefícios</Text>
        <Text style={s.desc}>{tab === "map" ? "Locais físicos em Pacajus/CE" : "Benefícios online disponíveis"}</Text>

        {/* Busca */}
        <View style={s.search}>
          <Icon name="search" size={18} color={colors.textBody} />
          <TextInput
            placeholder="Buscar por nome"
            placeholderTextColor={colors.textBody}
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && <TouchableOpacity onPress={() => setSearch("")}><Icon name="x" size={18} color={colors.textBody} /></TouchableOpacity>}
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <Chip active={tab === "map"} onPress={() => setTab("map")} label="Mapa" />
          <Chip active={tab === "online"} onPress={() => setTab("online")} label="Online" />
        </View>

        {/* Conteúdo */}
        <View style={s.content}>
          {tab === "map" ? (
            Platform.OS === "web" ? (
              <View style={{ paddingVertical: 12 }}>
                {markers.map((m) => (
                  <Text key={m.id} style={{ marginBottom: 6 }} onPress={() => handleNavigateToDetail(m.benefit, m.id)}>
                    📍 {m.name} ({m.latitude.toFixed(4)}, {m.longitude.toFixed(4)})
                  </Text>
                ))}
                {markers.length === 0 && <Text style={{ color: colors.textBody }}>Selecione uma categoria ou pesquise.</Text>}
              </View>
            ) : (
              initialPosition[0] !== 0 && MapView && Marker && (
                <MapView
                  style={s.map}
                  initialRegion={{ latitude: initialPosition[0], longitude: initialPosition[1], latitudeDelta: 0.035, longitudeDelta: 0.035 }}
                  loadingEnabled
                >
                  {markers.map((p) => (
                    <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} onPress={() => handleNavigateToDetail(p.benefit, p.id)}>
                      <View style={s.pin}>
                        {p.image_url ? <Image source={{ uri: p.image_url }} style={s.pinImg} /> : <Text>🏷️</Text>}
                      </View>
                    </Marker>
                  ))}
                </MapView>
              )
            )
          ) : (
            <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
              {online.map((b) => (
                <View key={b.id} style={s.card}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {b.logo_url && (isSvg(b.logo_url) ? <SvgUri width={36} height={36} uri={b.logo_url} /> : <Image source={{ uri: b.logo_url }} style={{ width: 36, height: 36, borderRadius: 6 }} />)}
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={s.cardTitle}>{b.title}</Text>
                      {!!b.discount_label && <Text style={s.cardBadge}>{b.discount_label}</Text>}
                    </View>
                  </View>
                  {!!b.details && <Text style={s.cardDesc}>{b.details}</Text>}
                  <View style={s.ctaRow}>
                    {b.contact?.phone && <TouchableOpacity style={s.cta} onPress={() => openWhats(b.contact?.phone)}><Text style={s.ctaText}>WhatsApp</Text></TouchableOpacity>}
                    {b.contact?.website && <TouchableOpacity style={s.cta} onPress={() => openSite(b.contact?.website)}><Text style={s.ctaText}>Abrir site</Text></TouchableOpacity>}
                    <TouchableOpacity style={[s.cta, s.ctaGhost]} onPress={() => handleNavigateToDetail(b)}><Text style={[s.ctaText, s.ctaGhostText]}>Ver detalhes</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
              {online.length === 0 && <Text style={{ color: colors.textBody }}>Nada por aqui… tente outra categoria.</Text>}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Chips de categorias */}
      <View style={s.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {categories.map((c) => {
            const active = selectedCategories.includes(c.id);
            const iconMeta = CAT_ICON[c.id] ?? { name: "tag", labelFallback: c.label };
            return (
              <TouchableOpacity key={c.id} onPress={() => handleSelectCategory(c.id)} activeOpacity={0.8} style={[s.catChip, active && s.catChipActive]}>
                <Icon name={iconMeta.name} size={18} color={active ? "#fff" : colors.textTitle} />
                <Text style={[s.catChipText, active && { color: "#fff" }]} numberOfLines={1}>{c.label || iconMeta.labelFallback}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

const Chip = ({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) => (
  <TouchableOpacity onPress={onPress} style={[s.tabBtn, active && s.tabActive]}>
    <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 + Constants.statusBarHeight },
  title: { fontSize: 22, fontWeight: "800", color: colors.textTitle, marginTop: 8 },
  desc: { color: colors.textBody, fontSize: 14, marginTop: 4 },
  search: { marginTop: 12, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, color: colors.textTitle },
  tabs: { flexDirection: "row", marginTop: 12, gap: 8 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.primarySoft },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.primary, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  content: { flex: 1, width: "100%", borderRadius: 12, overflow: "hidden", marginTop: 12 },

  map: { width: "100%", height: "100%" },
  pin: { backgroundColor: colors.primary, borderRadius: 12, padding: 4 },
  pinImg: { width: 36, height: 36, borderRadius: 8 },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginHorizontal: 2, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: "800", color: colors.textTitle },
  cardBadge: { color: colors.primary, fontWeight: "700", marginTop: 2 },
  cardDesc: { color: colors.textBody, marginTop: 8 },
  ctaRow: { flexDirection: "row", marginTop: 10, flexWrap: "wrap", gap: 8 },
  cta: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  ctaText: { color: "#fff", fontWeight: "700" },
  ctaGhost: { backgroundColor: colors.primarySoft },
  ctaGhostText: { color: colors.primary },

  catBar: { flexDirection: "row", marginTop: 8, marginBottom: 24 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, marginRight: 8 },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textTitle, fontSize: 13, maxWidth: 180 },
});

export default Points;
