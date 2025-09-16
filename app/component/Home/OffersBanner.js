import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import { offersBannerList } from '../../data/home'
import Carousel from 'react-native-reanimated-carousel';
import { useState } from 'react';
import PaginationComponent from './Pagination';
import { Image } from 'react-native';
import useBanners from '../../../utils/banners';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { ITEM_DETAILS } from '../../navigation/routes';
import SlideItem from '../SlideItem';
const { width } = Dimensions.get("window");

export default function OffersBanner() {
    const { data: banners } = useBanners()
    const [state, setState] = useState({
        offers: offersBannerList,
        activeSlide: 0,
        days: 694,
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))
    const {
        offers,
        activeSlide,
        days,
    } = state;

    return (
        <View>
            <Carousel
                width={width}
                height={200} // قم بتعديل الارتفاع حسب الحاجة
                data={banners?.data || []}
                scrollAnimationDuration={1000}
                autoPlay={true}
                autoPlayInterval={10000}
                loop={true}
                renderItem={({ item, index }) => (
                    <SlideItem item={item} />
                )}
                onSnapToItem={(index) => updateState({ activeSlide: index })}
            />
            <PaginationComponent 
                activeSlide={activeSlide} 
                length={banners?.data?.length || offers.length}
            />
        </View>
    )
}