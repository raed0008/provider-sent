import { Bubble } from "react-native-gifted-chat";
import { Colors, mainFont } from "../../constant/styles";
import { memo} from 'react'
 const CustomBubble = (props) => {
    return (
      <Bubble
        {...props}
        
        wrapperStyle={{
          left: {
            backgroundColor: "red"// Change the background color for messages from the left
          },
          right: {
            backgroundColor: "#EEF2F4", // Change the background color for messages from the right
          },
          
        }}
        
        textStyle={{
          left: {
            fontFamily:mainFont.bold,
            color: Colors.blackColor // Change the text color for messages from the left
          },
          right: {
            fontFamily:mainFont.bold,

            color: Colors.whiteColor // Change the text color for messages from the left
          },
        }}
      />
    );
  };

  export default memo(CustomBubble)