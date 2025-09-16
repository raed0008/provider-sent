import { RFValue } from 'react-native-responsive-fontsize';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { mainFont } from './app/constant/styles';

const toastConfig = {
  /*
      Overwrite 'success' type,
      by modifying the existing `BaseToast` component
    */
  success: props => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#42ba96' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: RFValue(11),
        fontWeight: '400',
        fontFamily: mainFont.bold,
      }}
      text1NumberOfLines={4}
      text2Style={{
        fontSize: RFValue(9),
        color: 'black',
        opacity: 0.5,
        fontFamily: mainFont.bold,
      }}
      text2NumberOfLines={6}
    />
  ),
  /*
      Overwrite 'error' type,
      by modifying the existing `ErrorToast` component
    */
  error: props => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: RFValue(11),
        // fontWeight: '400',
        fontFamily: mainFont.bold,

        // fontFamily: "Poppins-Regular",
        
      }}
text1NumberOfLines={5}
      text2Style={{
        fontSize: RFValue(10),
        color: 'black',
        opacity: 0.9,
        fontFamily: mainFont.bold,

        // fontFamily: "Poppins-Regular"



      }}
      text2NumberOfLines={7}
      style={{
        minHeight: RFValue(11),
        borderLeftColor: 'red',
        // paddingVertical:RFValue(20)
        fontFamily: mainFont.bold,

        // paddingBottom:scaler(5)
      }}

    />
  ),
};

export default toastConfig;