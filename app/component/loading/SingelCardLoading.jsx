import { Skeleton } from 'moti/skeleton';
import { Dimensions, View } from 'react-native';
import { Colors } from '../../constant/styles';
const { height, width } = Dimensions.get('screen')
export const SingleCardLoading = () => {
    const Spacer = ({ height = 16 }) => <View style={{ height }} />;
    return (
        <View style={{ marginHorizontal: 10 }}>

            <Skeleton colorMode={Colors.redColor} backgroundColor={Colors.grayColor}


                width={width * 0.92} height={height * 0.18} />
            <Spacer />
        </View>
    )
}