import React from 'react'
import { View, StyleSheet } from 'react-native';
import { Colors, Sizes } from '../../constant/styles';

export default function PaginationComponent({ length, activeSlide }) {
    const renderDots = () => {
        const dots = [];
        for (let i = 0; i < length; i++) {
            dots.push(
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === activeSlide ? styles.sliderActiveDotStyle : styles.sliderInactiveDotStyle
                    ]}
                />
            );
        }
        return dots;
    };

    return (
        <View style={styles.sliderPaginationWrapStyle}>
            {renderDots()}
        </View>
    );
}

const styles = StyleSheet.create({
    dot: {
        borderRadius: 5.0,
        marginHorizontal: Sizes.fixPadding - 15.0
    },
    sliderActiveDotStyle: {
        width: 10,
        height: 10,
        backgroundColor: Colors.primaryColor,
    },
    sliderInactiveDotStyle: {
        width: 9,
        height: 9,
        backgroundColor: Colors.primaryColor,
        opacity: 0.5, // لجعل النقاط غير النشطة أقل وضوحاً
    },
    sliderPaginationWrapStyle: {
        position: 'absolute',
        bottom: -20.0,
        left: 0.0,
        right: 0.0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
})