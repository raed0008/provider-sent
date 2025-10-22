import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { Checkbox } from "react-native-paper";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";
import useCategories from "../../../utils/categories";
import { Colors } from "../../constant/styles";
import ArrowBack from "../../component/ArrowBack";
import AppText from "../../component/AppText";
import AppButton from "../../component/AppButton";
import { setCurrentRegisterProperties } from "../../store/features/registerSlice";
import { CHOOSE_DCOUMENT } from "../../navigation/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNameInLanguage from "../../hooks/useNameInLanguage";
import { useLanguageContext } from "../../context/LanguageContext";
import LocationPermissionComponent from "./LocationPermission/LocationPermissionComponent";

const { width, height } = Dimensions.get("screen");

export default function ChooseCategories({ navigation }) {
  const { data: categories } = useCategories();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { name: itemName } = useNameInLanguage();
  const language = useLanguageContext();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleChecked = (id) => {
    setChecked((prev) => {
      if (prev[id]) {
        return {};
      }
      return { [id]: true };
    });
  };

  const getSelectedIds = () => {
    return Object.keys(checked).filter((key) => checked[key]);
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    return categories?.filter((item) =>
      item?.attributes[itemName]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery, itemName]);

  const handlePressConfirm = async () => {
    const selectedId = getSelectedIds()[0];
    const selectedCategory = categories?.find((c) => c.id === selectedId);

    const categoriesData = {
      categories: { connect: [{ id: selectedId }] },
      basicCategory: selectedCategory?.attributes[itemName],
    };

    dispatch(setCurrentRegisterProperties(categoriesData));
    await AsyncStorage.setItem(
      "registerDataCategories",
      JSON.stringify(categoriesData)
    );
    navigation.navigate(CHOOSE_DCOUMENT);
  };

  const handleSelectAll = () => {
    const allIds = {};
    filteredCategories?.forEach((item) => {
      allIds[item.id] = true;
    });
    setChecked(allIds);
  };

  const handleClearAll = () => {
    setChecked({});
  };

  const selectedCount = getSelectedIds().length;
  const isRTL = language === "ar";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={Colors.primaryColor}
          barStyle="light-content"
        />
        <ArrowBack />

        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <AppText
              text={"What services do you intend to provide?"}
              centered={false}
              style={styles.titleText}
            />

            {/* Selection Counter & Actions */}
            {/* <View style={styles.actionRow}> */}
              {/* {selectedCount > 0 && (
                <Animated.View style={styles.counterBadge}>
                  <View style={styles.counterDot} />
                  <AppText
                    text={`${selectedCount} ${t("selected")}`}
                    style={styles.counterText}
                  />
                </Animated.View>
              )} */}

              {/* {selectedCount > 0 && (
                <Pressable onPress={handleClearAll} style={styles.clearButton}>
                  <AppText text="Clear" style={styles.clearText} />
                </Pressable>
              )}
            </View> */}

            {/* Search Bar */}
            {/* <View
              style={[
                styles.searchContainer,
                isRTL && styles.searchContainerRTL,
              ]}
            >
              <TextInput
                style={[styles.searchInput, isRTL && styles.searchInputRTL]}
                placeholder={t("Search specialties...")}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View> */}

            {/* Quick Actions */}
            {/* {!searchQuery && categories?.length > 0 && (
              <Pressable
                onPress={handleSelectAll}
                style={styles.selectAllButton}
              >
                <AppText text={t("Select All")} style={styles.selectAllText} />
              </Pressable>
            )} */}

            {/* Instruction Banner */}
            <View style={styles.instructionBanner}>
              <AppText
                text={t("Choose the most relevant specialty from the list")}
                style={styles.instructionText}
                centered={false}
              />
            </View>
          </View>

          {/* Categories List */}
          <FlatList
            data={filteredCategories}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <CategoryItem
                item={item}
                itemName={itemName}
                checked={checked[item?.id]}
                onPress={() => toggleChecked(item?.id)}
                language={language}
                index={index}
              />
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <AppText text="🔍" style={styles.emptyEmoji} />
                <AppText
                  text={
                    searchQuery
                      ? "No matching categories found"
                      : "No categories available"
                  }
                  style={styles.emptyText}
                />
                {searchQuery && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    style={styles.clearSearchButton}
                  >
                    <AppText
                      text="Clear search"
                      style={styles.clearSearchText}
                    />
                  </Pressable>
                )}
              </View>
            )}
          />

          {/* Floating Confirm Button */}
          {selectedCount > 0 && (
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <AppButton
                title={`${t("Confirm Selection")} (${selectedCount})`}
                style={styles.confirmButton}
                onPress={handlePressConfirm}
              />
              <View style={styles.buttonGlow} />
            </Animated.View>
          )}
        </Animated.View>

        <LocationPermissionComponent />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const CategoryItem = ({
  item,
  itemName,
  checked,
  onPress,
  language,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [language === "ar" ? 50 : -50, 0],
            }),
          },
        ],
        opacity: slideAnim,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.categoryItem,
          checked && styles.categoryItemSelected,
          { flexDirection: language === "ar" ? "row-reverse" : "row" },
        ]}
      >
        {/* Selection Indicator */}
        <View
          style={[
            styles.selectionIndicator,
            checked && styles.selectionIndicatorActive,
            language === "ar" ? styles.indicatorRight : styles.indicatorLeft,
          ]}
        />

        <View style={styles.categoryTextContainer}>
          <AppText
            text={item?.attributes[itemName]}
            style={[
              styles.categoryText,
              checked && styles.categoryTextSelected,
            ]}
          />
        </View>

        <View
          style={[
            styles.checkboxContainer,
            checked && styles.checkboxContainerSelected,
          ]}
        >
          <Checkbox
            color={Colors.primaryColor}
            status={checked ? "checked" : "unchecked"}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    paddingVertical: 12,
    gap: 12,
  },
  titleText: {
    fontSize: RFPercentage(2.6),
    color: Colors.primaryColor,
    fontWeight: "700",
    lineHeight: RFPercentage(3.2),
    marginBottom: 4,
  },
  selectAllButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  selectAllText: {
    fontSize: RFPercentage(1.6),
    color: Colors.primaryColor,
    fontWeight: "600",
  },
  instructionBanner: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: RFPercentage(1.6),
    color: "#92400E",
    lineHeight: RFPercentage(2.2),
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 120,
  },
  separator: {
    height: 10,
  },
  categoryItem: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  categoryItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: Colors.primaryColor,
    borderWidth: 2.5,
    shadowColor: Colors.primaryColor,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  selectionIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "transparent",
  },
  selectionIndicatorActive: {
    backgroundColor: Colors.primaryColor,
  },
  indicatorLeft: {
    left: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  indicatorRight: {
    right: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  categoryTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryText: {
    fontSize: RFPercentage(1.9),
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  categoryTextSelected: {
    color: Colors.primaryColor,
    fontWeight: "700",
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    fontSize: RFPercentage(1.3),
    color: Colors.whiteColor,
    fontWeight: "700",
  },
  checkboxContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 2,
  },
  checkboxContainerSelected: {
    backgroundColor: "#DBEAFE",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    paddingVertical: 16,
    backgroundColor: Colors.whiteColor,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 14,
  },
  // buttonGlow: {
  //   position: "absolute",
  //   top: -20,
  //   left: "25%",
  //   right: "25%",
  //   height: 40,
  //   backgroundColor: Colors.primaryColor,
  //   opacity: 0.1,
  //   borderRadius: 20,
  //   filter: "blur(20px)",
  // },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyEmoji: {
    fontSize: RFPercentage(6),
    marginBottom: 8,
  },
  emptyText: {
    fontSize: RFPercentage(1.9),
    color: "#6B7280",
    fontWeight: "500",
  },
  clearSearchButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryColor,
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: RFPercentage(1.7),
    color: Colors.whiteColor,
    fontWeight: "600",
  },
});
