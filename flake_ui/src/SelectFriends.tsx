import React, { useEffect, useState } from 'react';
import "./styles/selectFriends.css";
import { TextInput, View } from 'react-native';

type Items = { name: string, id: string }[]
type SelectFriendsProps = {
    items: Items,
    setSelectedFriends: (selectedFriends: Items) => void;
}

const SelectFriends = ({ items, setSelectedFriends }: SelectFriendsProps) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleCheckboxToggle = (id) => {
        setSelectedItems((prevSelectedItems: string[]) => {
            if (prevSelectedItems.includes(id)) {
                return prevSelectedItems.filter(itemId => itemId !== id);
            } else {
                return [...prevSelectedItems, id];
            }
        });
    };

    useEffect(() => {
        let filteredFriends = items.filter((item => selectedItems.includes(item.id)))
        setSelectedFriends(filteredFriends)
    }, [selectedItems, items, setSelectedFriends])

    return (
        <View >
            <View>Friends</View>
            <View >
                {items.map(({ name, id }) => (
                    <View key={id} >
                        <select
                            id={id}
                            checked={selectedItems.includes(id)}
                            onChangeText={() => handleCheckboxToggle(id)}
                        />
                        <label htmlFor={id} >{name}</label>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default SelectFriends;
