import React, { useState } from 'react';
import { View } from 'react-native';

type SwipeableWrapperType = {
    onSwipe: (val: string) => void,
    children: React.JSX.Element
}

const SwipeableWrapper = ({ onSwipe, children }: SwipeableWrapperType) => {
    const [startX, setStartX] = useState(null);
    const [endX, setEndX] = useState(null);

    const handleTouchStart = (event) => {
        setStartX(event.touches[0].clientX);
    };

    const handleTouchMove = (event) => {
        setEndX(event.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (startX && endX) {
            const deltaX = endX - startX;
            if (deltaX > 50) {
                onSwipe('right');
            } else if (deltaX < -50) {
                onSwipe('left');
            }
        }
        setStartX(null);
        setEndX(null);
    };

    return (
        <View
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </View>
    );
};

export default SwipeableWrapper;
