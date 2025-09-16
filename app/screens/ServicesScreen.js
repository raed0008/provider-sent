import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Colors } from "../../constant/styles";
import AppText from "../AppText";
import { useSelector, useDispatch } from "react-redux";
import { addServiceToCart, updateServiceQuantity } from "../../store/features/CartServiceSlice";

const DropDownServices = ({ services, visible }) => {
    const dispatch = useDispatch();
    const cartServices = useSelector((state) => state.cartService.services);

    if (!visible) return null;

    const handleAdd = (item) => {
        const selected = cartServices.find((s) => s.id === item.id);
        if (!selected) {
            dispatch(addServiceToCart({
                id: item.id,
                qty: 1,
                price: item.attributes?.Price,
                name_ar: item.attributes?.name_ar,
                name_en: item.attributes?.name_en
            }));
        } else {
            dispatch(updateServiceQuantity({ id: item.id, quantity: selected.qty + 1 }));
        }
    };

    const handleRemove = (item) => {
        const selected = cartServices.find((s) => s.id === item.id);
        if (selected && selected.qty > 0) {
            dispatch(updateServiceQuantity({ id: item.id, quantity: selected.qty - 1 }));
        }
    };

    const renderItem = ({ item }) => {
        const selected = cartServices.find((s) => s.id === item.id);
        const qty = selected?.qty || 0;

        return (
            <View style={styles.card}>
                <AppText text={item.attributes?.name_ar} style={styles.name} />
                <AppText text={`${item.attributes?.Price} ريال`} style={styles.price} />

                <View style={styles.quantityWrapper}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleRemove(item)}>
                        <AppText text="−" style={styles.quantityText} />
                    </TouchableOpacity>

                    <AppText text={qty} style={styles.quantityCount} />

                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleAdd(item)}>
                        <AppText text="+" style={styles.quantityText} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.dropdown}>
            <FlatList
                data={services}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <AppText text="لا توجد خدمات متاحة" style={{ textAlign: "center", marginTop: 20, color: Colors.grayColor }} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        maxHeight: 280, // عشان يصير فيه سكرول لو القائمة طويلة
        paddingVertical: 4,
    },
    card: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.blackColor,
        flex: 1,
    },
    price: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.primaryColor,
        marginLeft: 8,
    },
    quantityWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    quantityButton: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: Colors.primaryColor,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityText: {
        fontSize: 16,
        color: Colors.whiteColor,
        fontWeight: "bold",
    },
    quantityCount: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primaryColor,
        minWidth: 20,
        textAlign: "center",
    },
});
