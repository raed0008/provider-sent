



import React from 'react'
import { ORDERS, PREVIOUS_ORDERS } from './routes';
import { useTranslation } from 'react-i18next';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors, mainFont } from '../constant/styles';
import CurrentOrders from '../screens/Orders/CurrentOrders';
import CompletedOrdersScreen from '../screens/Orders/CompletedOrderScreen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  
  return (
    <View style={[
      styles.tabBarContainer, 
      { backgroundColor:  Colors.whiteColor  }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName, tabLabel;
        if (route.name === ORDERS) {
          iconName = isFocused ? 'cart' : 'cart-outline';
          tabLabel = t('CurrentOrders'); 
        } else if (route.name === PREVIOUS_ORDERS) {
          iconName = isFocused ? 'time' : 'time-outline';
          tabLabel = t('PreviousOrders');
        }

        const color = isFocused 
          ? Colors.primaryColor 
          : Colors.blackColor;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={iconName}
                size={20}
                color={color}
              />
              <Text style={[styles.tabLabel, { color }]}>
                {tabLabel}
              </Text>
            </View>
            {isFocused && (
              <View style={[styles.indicator, { backgroundColor: Colors.primaryColor }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CurrentOrdersTabNavigator() {
  const Tab = createMaterialTopTabNavigator();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
         screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primaryColor,
      tabBarInactiveTintColor: Colors.grayColor,
      tabBarLabelStyle: {
        fontSize:RFPercentage(1.6),
        fontFamily: mainFont.light,
        textTransform: 'none'       },
      tabBarIndicatorStyle: {
        backgroundColor: Colors.primaryColor, // Change this to the color you want
        height: 3, // Change the height of the indicator line
      }, 
    }}
    >

      
       <Tab.Screen name={ORDERS} component={CurrentOrders} />
    <Tab.Screen name=
    {PREVIOUS_ORDERS} component={CompletedOrdersScreen} />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 60, // زيادة الارتفاع لاستيعاب النص والأيقونة
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginLeft: 6,
    fontSize: RFPercentage(1.8),
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
  },
});