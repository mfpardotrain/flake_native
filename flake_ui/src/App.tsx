import PocketBase from "pocketbase";
import React, { useState } from "react";
import { useMutation } from "react-query";
import GetStatus from "./GetStatus.js";
import "./styles/login.css";
import BurgerMenu from "./BurgerMenu.js";
import Header from "./Header.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { Button, TextInput, View } from "react-native";

const queryClient = new QueryClient();


const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

function LoggedOut({ setLoggedIn, }: { setLoggedIn: (loggedIn: boolean) => void; }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    type UserVars = {
        email: string;
        password: string;
        username?: string;
    }

    const createUserMutation =
        useMutation(({ email, password, username }: UserVars) => {
            return pb.collection("users")
                .create({
                    email,
                    username,
                    password,
                    passwordConfirm: password,
                })
        }
        );

    const loginMutation =
        useMutation(async ({ email, password, username }: UserVars) => {
            return await pb.collection("users")
                .authWithPassword(email, password)
                .then(() => setLoggedIn(true))
        })

    if (createUserMutation.isSuccess) {
        loginMutation.mutate({ email, password, username })
        if (loginMutation.isSuccess) {
            setLoggedIn(true)
        }
    };

    return (
        <View>
            <View >
                <label >email</label>
                <TextInput
                    id="email"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <View >
                <label >username</label>
                <TextInput
                    id="username"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View >
                <label >password</label>
                <TextInput
                    id="password"
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <Button onPress={() => createUserMutation.mutate({ email, password, username })} title="Signup" />

            <Button onPress={() => loginMutation.mutate({ email, password })} title="Sign In" />
        </View >
    );
}

export const StatusContext = React.createContext({});

function App() {
    const statuses = GetStatus()
    const [loggedIn, setLoggedIn] = useState(pb.authStore.isValid);

    return loggedIn ? (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <StatusContext.Provider value={statuses}>
                    <Header />
                    <BurgerMenu setLoggedIn={setLoggedIn} />
                </StatusContext.Provider>
            </QueryClientProvider>
        </React.StrictMode>
    ) : (
        <LoggedOut setLoggedIn={setLoggedIn} />
    )
}


export default App;