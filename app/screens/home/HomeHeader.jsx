import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect } from 'react';
import AppHeader from '../../component/AppHeader';
import AppText from '../../component/AppText';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { CURRENCY } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../constant/styles';
import { useTranslation } from 'react-i18next';
import { getUserByPhoneNumber } from '../../../utils/user'; // تأكد من المسار الصحيح
import { setUserData } from '../../store/features/userSlice'; // تأكد من المسار الصحيح

const { width } = Dimensions.get('screen');

const HomeHeader = () => {
  const userData = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Polling لتحديث الرصيد تلقائياً
  useEffect(() => {
    let interval;
    if (userData?.attributes?.phoneNumber) {
      interval = setInterval(() => {
        getUserByPhoneNumber(userData.attributes.phoneNumber)
          .then((updatedUser) => {
            if (
              updatedUser?.attributes?.wallet_amount !==
              userData?.attributes?.wallet_amount
            ) {
              dispatch(setUserData(updatedUser));
            }
          })
          .catch((err) => console.log('Error polling user data:', err));
      }, 15000); // كل 15 ثانية
    }
    return () => clearInterval(interval); // تنظيف عند الخروج
  }, [dispatch, userData?.attributes?.phoneNumber, userData?.attributes?.wallet_amount]);

  return (
    <View style={styles.headerContainer}>
      <AppHeader />
      <TouchableWithoutFeedback>
        <View style={styles.WalletContainer}>
          <AppText
            style={{ fontSize: RFPercentage(1.9), color: 'white', paddingVertical: 1 }}
            text={`${userData?.attributes?.wallet_amount}`}
          />
          <AppText
            style={{ fontSize: RFPercentage(1.9), color: 'white', paddingVertical: 1 }}
            text={` ${t(CURRENCY)}`}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  WalletContainer: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 19,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
});
