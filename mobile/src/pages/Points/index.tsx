import React, { useEffect, useState } from "react";
import {
  StyleSheet, View, TouchableOpacity, Text, ScrollView, Image, Alert
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import Constants from "expo-constants";
import {
  useNavigation, useRoute, type NavigationProp, type RouteProp
} from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import * as Location from "expo-location";

import type { RootStackParamList } from "../../@types/navigation";
import type { BenefitItem, CategoryItem } from "../../types/domain";
import api from "../../services/api";

type PointsRouteProp = RouteProp<RootStackParamList, "Points">;

type MarkerItem = {
  id: string;
  name: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  benefit: BenefitItem;
};

const isSvg = (u?: string) => typeof u === "string" && u.toLowerCase().includes(".svg");

const Points = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<PointsRouteProp>();
  const { uf, city } = route.params;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [markers, setMarkers] = useState<MarkerItem[]>([]);

  // localização inicial com fallback
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Oooops.....", "Precisamos de sua permissão para obter a localização");
          setInitialPosition([-3.71722, -38.54337]); // Fortaleza
          return;
        }
        const loc = await Location.getCurrentPositionAsync();
        setInitialPosition([loc.coords.latitude, loc.coords.longitude]);
      } catch (e) {
        console.log("[Location] error:", e);
        setInitialPosition([-3.71722, -38.54337]);
      }
    })();
  }, []);

  // categorias
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<CategoryItem[]>("/catalog/categories");
        if (alive) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("[Categories] error:", e);
        if (alive) setCategories([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  // benefícios -> markers
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const categoryId = selectedCategories[0];
        const params: any = {
          state: uf,
          city,
          radius: 80000,
        };
        if (initialPosition[0] !== 0) { params.lat = initialPosition[0]; params.lng = initialPosition[1]; }
        if (categoryId) params.categoryId = categoryId;

        const { data } = await api.get<BenefitItem[]>("/catalog/benefits", { params });
        const arr = Array.isArray(data) ? data : [];
        const mks: MarkerItem[] = arr.flatMap((b) =>
          (b.locations || []).map((l) => ({
            id: l.id,
            name: b.title || b.partner_name || "Benefício",
            image_url: b.image_url || b.logo_url,
            latitude: Number(l.latitude),
            longitude: Number(l.longitude),
            benefit: b,
          }))
        );
        if (alive) setMarkers(mks);
      } catch (e) {
        console.log("[Benefits] error:", e);
        if (alive) setMarkers([]);
      }
    })();
    return () => { alive = false; };
  }, [uf, city, selectedCategories, initialPosition]);

  const handleNavigateBack = () => navigation.goBack();

  function handleNavigateToDetail(benefit: BenefitItem, locationId?: string) {
    try {
      const loc = benefit?.locations?.find((l) => l.id === locationId) ?? benefit?.locations?.[0];
      if (!benefit || !loc) {
        Alert.alert("Ops", "Não foi possível abrir o benefício.");
        return;
      }
      navigation.navigate("Details", { benefit, location: loc });
    } catch (e) {
      console.log("[Navigate Detail] error:", e);
      Alert.alert("Erro", "Falha ao abrir o detalhe.");
    }
  }

  function handleSelectCategory(id: number) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id]));
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" color={"#34cb79"} />
        </TouchableOpacity>

        <Text style={styles.title}>Bem Vindo.</Text>
        <Text style={styles.description}>Encontre benefícios no mapa.</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              loadingEnabled
            >
              {/* {markers.map((point) => (
                <Marker
                  key={point.id}
                  style={styles.mapMarker}
                  coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                  onPress={() => handleNavigateToDetail(point.benefit, point.id)}
                >
                  <View style={styles.mapMarkerContainer}>
                    {!!point.image_url && !isSvg(point.image_url) && (
                      <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                    )}
                    {!!point.image_url && isSvg(point.image_url) && (
                      // SVG remota (Ecoleta usa SVG nos items) — fallback se falhar
                      <SvgUri
                        width={120}
                        height={46}
                        uri={point.image_url}
                        onError={(e) => console.log("[SvgUri] error:", e)}
                      />
                    )}
                    <Text style={styles.mapMarkerTitle} numberOfLines={1}>
                      {point.name}
                    </Text>
                  </View>
                </Marker>
              ))} */}
              <View style={{ paddingVertical: 12 }}>
  {markers.map((m) => (
    <Text key={m.id} style={{ marginBottom: 6 }} onPress={() => handleNavigateToDetail(m.benefit, m.id)}>
      📍 {m.name}  ({m.latitude.toFixed(4)}, {m.longitude.toFixed(4)})
    </Text>
  ))}
</View>
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map((cat) => {
            const selected = selectedCategories.includes(cat.id);
            const icon = (cat as any).icon as string | undefined;
            return (
              <TouchableOpacity
                key={String(cat.id)}
                style={[styles.item, selected ? styles.selectedItem : {}]}
                onPress={() => handleSelectCategory(cat.id)}
                activeOpacity={0.6}
              >
                {icon && isSvg(icon) ? (
                  <SvgUri width={42} height={42} uri={icon} onError={(e) => console.log("[SvgUri cat] error:", e)} />
                ) : icon ? (
                  <Image source={{ uri: icon }} style={{ width: 42, height: 42, borderRadius: 6 }} />
                ) : (
                  <Text style={{ fontSize: 24 }}>🏷️</Text>
                )}
                <Text style={styles.itemTitle} numberOfLines={2}>{(cat as any).label ?? "Categoria"}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingTop: 20 + Constants.statusBarHeight },
  title: { fontSize: 20, fontFamily: "Ubuntu_700Bold", marginTop: 24 },
  description: { color: "#6C6C80", fontSize: 16, marginTop: 4, fontFamily: "Roboto_400Regular" },
  mapContainer: { flex: 1, width: "100%", borderRadius: 10, overflow: "hidden", marginTop: 16 },
  map: { width: "100%", height: "100%" },
  mapMarker: { width: 90, height: 80 },
  mapMarkerContainer: { width: 120, height: 76, backgroundColor: "#34CB79", flexDirection: "column", borderRadius: 8, overflow: "hidden", alignItems: "center" },
  mapMarkerImage: { width: 120, height: 46, resizeMode: "cover" },
  mapMarkerTitle: { flex: 1, fontFamily: "Roboto_400Regular", color: "#FFF", fontSize: 12, lineHeight: 22, paddingHorizontal: 4 },
  itemsContainer: { flexDirection: "row", marginTop: 16, marginBottom: 32 },
  item: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#eee", height: 120, width: 120, borderRadius: 8, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, marginRight: 8, alignItems: "center", justifyContent: "space-between", textAlign: "center" },
  selectedItem: { borderColor: "#34CB79", borderWidth: 2 },
  itemTitle: { fontFamily: "Roboto_400Regular", textAlign: "center", fontSize: 13 },
});

export default Points;
