import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert,
  Platform,
  TextInput,
  Linking,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import Constants from "expo-constants";
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from "@react-navigation/native";
import { SvgUri } from "react-native-svg";
import * as Location from "expo-location";
import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, CategoryItem } from "../../types/domain";
import api from "../../services/api";
import colors from "../../theme/colors";

// Maps (nativo somente)
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

type PointsRouteProp = RouteProp<RootStackParamList, "Points">;
const isSvg = (u?: string) =>
  typeof u === "string" && u.toLowerCase().includes(".svg");
type TabKey = "map" | "online";

type MarkerItem = {
  id: string;
  name: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  benefit: BenefitItem;
};

const Points = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<PointsRouteProp>();
  const { uf, city } = route.params;

  const [tab, setTab] = useState<TabKey>("map");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0, 0,
  ]);
  const [search, setSearch] = useState("");

  const [markers, setMarkers] = useState<MarkerItem[]>([]); // físicos
  const [online, setOnline] = useState<BenefitItem[]>([]); // online

  // localização inicial
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Oooops.....",
            "Precisamos de sua permissão para obter a localização"
          );
          setInitialPosition([-4.1708, -38.463]); // Pacajus/CE
          return;
        }
        const loc = await Location.getCurrentPositionAsync();
        setInitialPosition([loc.coords.latitude, loc.coords.longitude]);
      } catch {
        setInitialPosition([-4.1708, -38.463]);
      }
    })();
  }, []);

  // categorias
  useEffect(() => {
    api
      .get<CategoryItem[]>("/catalog/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  // físicos (map)
  useEffect(() => {
    if (tab !== "map") return;
    (async () => {
      try {
        const categoryId = selectedCategories[0];
        const params: any = {
          state: uf,
          city,
          onlyPhysical: true,
        };
        if (categoryId) params.categoryId = categoryId;
        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", {
          params,
        });

        const filtered: BenefitItem[] = (data ?? []) as BenefitItem[];

        const mks: MarkerItem[] = filtered.flatMap((b) =>
          (b.locations ?? []).map((l) => ({
            id: String(
              l.id ?? `${b.id}-${l.latitude ?? 0}-${l.longitude ?? 0}`
            ),
            name: String(b.title || b.partner_name || "Benefício"),
            image_url: b.image_url || b.logo_url || undefined,
            latitude: Number(l.latitude ?? 0),
            longitude: Number(l.longitude ?? 0),
            benefit: b,
          }))
        );

        setMarkers(mks);
      } catch {
        setMarkers([]);
      }
    })();
  }, [tab, uf, city, selectedCategories, search]);

  // online (lista)
  useEffect(() => {
    if (tab !== "online") return;
    (async () => {
      try {
        const categoryId = selectedCategories[0];
        const params: any = {
          state: uf,
          city,
          onlyOnline: true,
        };
        if (categoryId) params.categoryId = categoryId;
        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", {
          params,
        });

        const filtered = (data || []).filter(
          (b) =>
            !search ||
            b.title?.toLowerCase().includes(search.toLowerCase()) ||
            b.partner_name?.toLowerCase().includes(search.toLowerCase())
        );
        setOnline(filtered || []);
      } catch {
        setOnline([]);
      }
    })();
  }, [tab, uf, city, selectedCategories, search]);

  function handleNavigateBack() {
    navigation.goBack();
  }
  function handleNavigateToDetail(benefit: BenefitItem, locationId?: string) {
    const loc =
      benefit?.locations?.find((l) => String(l.id) === locationId) ??
      benefit?.locations?.[0];
    navigation.navigate("Details", { benefit, location: loc });
  }
  function handleSelectCategory(id: number) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id]
    ); // single-select
  }
  const openSite = (url?: string) => {
    if (url) {
      try {
        // eslint-disable-next-line no-void
        void Linking.openURL(url);
      } catch {}
    }
  };
  const openWhats = (phone?: string) => {
    const p = (phone || "").replace(/\D/g, "");
    if (p) {
      try {
        void Linking.openURL(`https://wa.me/${p}`);
      } catch {}
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Benefícios</Text>
        <Text style={styles.description}>
          {tab === "map"
            ? "Locais físicos em Pacajus/CE"
            : "Benefícios online disponíveis"}
        </Text>

        {/* Busca */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.textBody} />
          <TextInput
            placeholder="Buscar por nome"
            placeholderTextColor={colors.textBody}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Icon name="x" size={18} color={colors.textBody} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTab("map")}
            style={[styles.tabBtn, tab === "map" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "map" && styles.tabTextActive]}>
              Mapa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("online")}
            style={[styles.tabBtn, tab === "online" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                tab === "online" && styles.tabTextActive,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          {tab === "map" ? (
            Platform.OS === "web" ? (
              <View style={{ paddingVertical: 12 }}>
                {markers.map((m) => (
                  <Text
                    key={m.id}
                    style={{ marginBottom: 6 }}
                    onPress={() => handleNavigateToDetail(m.benefit, m.id)}
                  >
                    📍 {m.name} ({m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}
                    )
                  </Text>
                ))}
                {markers.length === 0 && (
                  <Text style={{ color: colors.textBody }}>
                    Selecione uma categoria ou pesquise.
                  </Text>
                )}
              </View>
            ) : (
              initialPosition[0] !== 0 &&
              MapView &&
              Marker && (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: initialPosition[0],
                    longitude: initialPosition[1],
                    latitudeDelta: 0.035,
                    longitudeDelta: 0.035,
                  }}
                  loadingEnabled
                >
                  {markers.map((p) => (
                    <Marker
                      key={p.id}
                      coordinate={{
                        latitude: p.latitude,
                        longitude: p.longitude,
                      }}
                      onPress={() => handleNavigateToDetail(p.benefit, p.id)}
                    >
                      <View style={styles.pin}>
                        {p.image_url ? (
                          <Image
                            source={{ uri: p.image_url }}
                            style={styles.pinImg}
                          />
                        ) : (
                          <Text>🏷️</Text>
                        )}
                      </View>
                    </Marker>
                  ))}
                </MapView>
              )
            )
          ) : (
            // ONLINE: lista de cards
            <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
              {online.map((b) => (
                <View key={b.id} style={styles.card}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {b.logo_url &&
                      (isSvg(b.logo_url) ? (
                        <SvgUri width={36} height={36} uri={b.logo_url} />
                      ) : (
                        <Image
                          source={{ uri: b.logo_url }}
                          style={{ width: 36, height: 36, borderRadius: 6 }}
                        />
                      ))}
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.cardTitle}>{b.title}</Text>
                      {!!b.discount_label && (
                        <Text style={styles.cardBadge}>{b.discount_label}</Text>
                      )}
                    </View>
                  </View>

                  {!!b.details && (
                    <Text style={styles.cardDesc}>{b.details}</Text>
                  )}

                  <View style={styles.ctaRow}>
                    {b.contact?.phone && (
                      <TouchableOpacity
                        style={styles.cta}
                        onPress={() => openWhats(b.contact?.phone)}
                      >
                        <Text style={styles.ctaText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                    {b.contact?.website && (
                      <TouchableOpacity
                        style={styles.cta}
                        onPress={() => openSite(b.contact?.website)}
                      >
                        <Text style={styles.ctaText}>Abrir site</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.cta, styles.ctaGhost]}
                      onPress={() => handleNavigateToDetail(b)}
                    >
                      <Text style={[styles.ctaText, styles.ctaGhostText]}>
                        Ver detalhes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {online.length === 0 && (
                <Text style={{ color: colors.textBody }}>
                  Nada por aqui… tente outra categoria.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* categorias (chips) */}
      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {categories.map((cat) => {
            const selected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={String(cat.id)}
                style={[styles.item, selected ? styles.selectedItem : {}]}
                onPress={() => handleSelectCategory(cat.id)}
                activeOpacity={0.7}
              >
                {cat.icon && isSvg(cat.icon) ? (
                  <SvgUri width={42} height={42} uri={cat.icon} />
                ) : cat.icon ? (
                  <Image
                    source={{ uri: cat.icon }}
                    style={{ width: 42, height: 42, borderRadius: 6 }}
                  />
                ) : (
                  <Text style={{ fontSize: 24 }}>🏷️</Text>
                )}
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20 + Constants.statusBarHeight,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.textTitle, marginTop: 8 },
  description: { color: colors.textBody, fontSize: 14, marginTop: 4 },
  searchBox: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.textTitle },
  tabs: { flexDirection: "row", marginTop: 12 },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.primary, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  content: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
  },

  // MAPA
  map: { width: "100%", height: "100%" },
  pin: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  pinImg: { width: 36, height: 36, borderRadius: 8 },

  // CARDS ONLINE
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: "800", color: colors.textTitle },
  cardBadge: { color: colors.primary, fontWeight: "700", marginTop: 2 },
  cardDesc: { color: colors.textBody, marginTop: 8 },
  ctaRow: { flexDirection: "row", marginTop: 10, flexWrap: "wrap", gap: 8 },
  cta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
  ctaGhost: { backgroundColor: colors.primarySoft },
  ctaGhostText: { color: colors.primary },

  // CHIPS
  itemsContainer: { flexDirection: "row", marginTop: 8, marginBottom: 24 },
  item: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    height: 120,
    width: 120,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedItem: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  itemTitle: { textAlign: "center", fontSize: 13, color: colors.textTitle },
});

export default Points;
