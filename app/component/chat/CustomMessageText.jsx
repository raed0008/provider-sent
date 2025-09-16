import { RFPercentage } from "react-native-responsive-fontsize";
import { Colors, mainFont } from "../../constant/styles";
import { MessageText } from "react-native-gifted-chat";

export   const CustomMessageText = (props) => {
    return (
      <MessageText
        {...props}
        
        textStyle={{
          left: {
            color:Colors.blackColor,
            fontFamily:mainFont.bold,
            fontSize:RFPercentage(1.6)

            // Change the text color for messages from the left
          },
          right: {
            color: Colors.whiteColor,
            fontFamily:mainFont.bold,
            fontSize:RFPercentage(1.6)
            // Ce text color for messages from the right
          },
        }}
      />
    );
  };