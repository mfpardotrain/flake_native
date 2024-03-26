import PocketBase from "pocketbase";
import React from "react";
import "./styles/login.css";
import { Button } from "react-native";

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

function LoggedIn({ setLoggedIn, }: { setLoggedIn: (loggedIn: boolean) => void; }) {
    return (
        <Button
            onPress={(e) => {
                e.preventDefault();
                pb.authStore.clear();
                setLoggedIn(false);
            }}
            title="Logout"
        />
    );
};

export default LoggedIn;