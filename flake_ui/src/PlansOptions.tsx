import React, { useState } from "react";
import MakePlans from "./MakePlans.js";
import "./styles/planOptions.css";
import CurrentPlans from "./CurrentPlans.js";
import { Button, View } from "react-native";

const PlansOptions = () => {
    const [activeComponent, setActiveComponent] = useState(null);

    const renderComponent = (component) => {
        setActiveComponent(component);
    };

    const goBack = () => {
        setActiveComponent(null);
    };


    return (
        <>
            {activeComponent === null ? (
                <View>
                    <Button onPress={() => renderComponent(<CurrentPlans />)} title="Current Plans" />
                    <Button onPress={() => renderComponent(<MakePlans setActiveComponent={(item) => setActiveComponent(item)} />)} title="Make Plans" />
                </View>
            ) : (
                <View>
                    <Button onPress={goBack} title="Back" />
                    {activeComponent}
                </View>
            )}
        </>
    );
};

export default PlansOptions;