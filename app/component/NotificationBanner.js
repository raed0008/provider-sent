import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons'; // أيقونات احترافية

const NotificationBanner = ({ message, onClose, type = 'error' }) => {
  const backgroundColor =
    type === 'error'
      ? 'rgba(255, 59, 48, 0.95)'
      : type === 'success'
      ? 'rgba(52, 199, 89, 0.95)'
      : 'rgba(255, 149, 0, 0.95)';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default NotificationBanner;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  message: {
    color: 'white',
    fontSize: RFPercentage(1.9),
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 6,
  },
});
