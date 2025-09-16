import { useTranslation } from "react-i18next";
import { Platform, Switch } from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import { memo, useCallback } from 'react';
import { Colors, mainFont } from "../../constant/styles";
import { useDispatch, useSelector } from "react-redux";
import { getUserByPhoneNumber, updateUserData } from "../../../utils/user";
import { setUserData, userRegisterSuccess } from "../../store/features/userSlice";

const CustomSwitch = () => {
  const { t } = useTranslation(); // If you're using i18next for localization
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const switchValue = userData?.attributes?.status === "active";

  const handleChangeStatus = useCallback(async (ison) => {
    try {
      const res = await updateUserData(userData?.id, { status: ison ? "active" : "inactive" });
      if (userData?.attributes?.phoneNumber) {
        const gottenUser = await getUserByPhoneNumber(userData?.attributes?.phoneNumber);
        if (gottenUser) {
          dispatch(setUserData(gottenUser));
          dispatch(userRegisterSuccess(gottenUser));
          console.log('The switch changes');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [userData, dispatch]);

  if (Platform.OS === 'android') {
    return (
      <ToggleSwitch
        isOn={switchValue}
        onColor={Colors.success}
        offColor={Colors.grayColor}
        label={t("Receive Orders")}
        animationSpeed={0}
        labelStyle={styles.labelStyle}
        size="large"
        onToggle={handleChangeStatus}
      />
    );
  } else {
    return (
      <Switch
        value={switchValue}
        onValueChange={handleChangeStatus}
        // Add any additional props or styling here
      />
    );
  }
};

export default memo(CustomSwitch);

const styles = {
  labelStyle: {
    color: "black",
    fontWeight: "900",
    fontFamily: mainFont.bold,
    display: "none",
  },
};
