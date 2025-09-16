import { TouchableOpacity, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { Colors } from "../constant/styles";
import { useTranslation } from "react-i18next";
import AppText from "./AppText";

export default function CustomAcceptButton({
  onPress,
  textKey,
  textStyle,
  IconComponent,
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primaryColor,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        minWidth: 90,
        alignSelf: "center",
      }}
    >
    <View style={{ marginRight: 8 }}>
      <AppText
        text={t(textKey)}
        style={[{ color: "white", fontSize: RFPercentage(1.9) }, textStyle]}
      />
    </View>
      {IconComponent && <>{IconComponent}</>}
    </TouchableOpacity>
  );
}
