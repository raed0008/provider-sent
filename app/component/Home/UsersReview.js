import { View, Dimensions, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react';
import React from 'react'

import Carousel from 'react-native-reanimated-carousel';
import { userReviews } from '../../data/home'
import PaginationComponent from './Pagination';
import ReviewCard from './ReviewCard';
import useReviews from '../../../utils/reviews';

const { width } = Dimensions.get("window");

export default function UsersReviews() {
    const { data } = useReviews();
    const [state, setState] = useState({
        reviews: userReviews,
        activeSlide: 0,
        days: 694,
    });

    const updateState = (data) => {
        setState((state) => ({ ...state, ...data }));
    };

    const { reviews, activeSlide, days } = state;

    useEffect(() => {
        // Fetch data when the component mounts or when the data changes
        // You can add a dependency array to control when this effect runs
        // For now, it runs whenever 'data' changes
        // If you want it to run only once when the component mounts, provide an empty dependency array: []
        if (data) {
            updateState({ reviews: data });
        }
    }, [data]);

    return (
        <View style={styles.container}>
            <Carousel
                width={width}
                height={250} // قم بتعديل الارتفاع حسب حجم ReviewCard
                data={data?.data || []}
                autoPlay={true}
                autoPlayInterval={4000}
                loop={true}
                scrollAnimationDuration={1000}
                renderItem={({ item, index }) => (
                    <ReviewCard
                        username={item?.attributes?.username}
                        review={item?.attributes?.content[0]?.children[0]?.text}
                        userImage={item?.attributes?.image?.data?.attributes?.url}
                    />
                )}
                onSnapToItem={(index) => updateState({ activeSlide: index })}
            />
            <PaginationComponent 
                activeSlide={activeSlide} 
                length={data?.data?.length || reviews.length}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    }
})