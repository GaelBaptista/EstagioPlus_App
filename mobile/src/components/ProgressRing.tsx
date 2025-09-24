import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = { size?: number; stroke?: number; progress: number; label?: string };
const ProgressRing = ({ size = 72, stroke = 8, progress, label }: Props) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - c * Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#eee" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FF7A00"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ position: "absolute", fontWeight: "800" }}>{Math.round(progress * 100)}%</Text>
      {!!label && <Text style={{ position: "absolute", bottom: -16, fontSize: 12, color: "#666" }}>{label}</Text>}
    </View>
  );
};

export default ProgressRing;
