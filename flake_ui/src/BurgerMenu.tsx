import React, { useState } from 'react';
import './styles/burgerMenu.css';
import PlansOptions from './PlansOptions';
import FindFriends from './FindFriends';
import SettingsPage from './Settings';
import LoggedIn from './LoggedIn';
import { Button, View } from 'react-native';

const BurgerMenu = ({ setLoggedIn, }: { setLoggedIn: (loggedIn: boolean) => void; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(<PlansOptions />);

    const options = [
        { label: "Plans", component: <PlansOptions /> },
        { label: "Friends", component: <FindFriends /> },
        { label: "Settings", component: <SettingsPage /> },
    ]

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionPress = (component: React.JSX.Element) => {
        setSelectedComponent(component);
        setIsOpen(false);
    };

    return (
        <View>
            <Button onPress={toggleMenu} title={isOpen ? '✕' : '☰'} />
            <View >
                <View >
                    {options.map((option, index) => (
                        <Button key={index} onPress={() => handleOptionPress(option.component)} title={option.label} />
                    ))}
                </View>
                <LoggedIn setLoggedIn={setLoggedIn} key={"logged-in"} />
            </View>
            <View >
                {selectedComponent && selectedComponent}
            </View>
        </View>
    );
};

export default BurgerMenu;
