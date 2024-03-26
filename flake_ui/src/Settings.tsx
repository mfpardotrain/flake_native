import React, { useState } from 'react';
import { useMutation, useQuery, } from 'react-query';
import PocketBase from "pocketbase";
import "./styles/settings.css";
import { Button, TextInput, View } from 'react-native';

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

const SettingsPage = () => {
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [username, setUsername] = useState("");

    useQuery({
        queryFn: () => {
            return pb.authStore.model
        },
        onSuccess(data) {
            if (data) {
                setUserId(data.id)
                setEmail(data.email)
                setUsername(data.username)
            }
        },
    });

    const createUserMutation =
        useMutation(() => {
            return pb.collection("users")
                .update(userId, {
                    email,
                    username,
                    password,
                    passwordConfirm: password,
                    oldPassword,
                });
        }
        );

    return (
        <View>
            <View >Settings</View>
            <View >
                <View>email</View>
                <TextInput
                    id="email"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <View >
                <View>username</View>
                <TextInput
                    id="username"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View >
                <View>new password</View>
                <TextInput
                    id="password"
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
            <View >
                <View >current password</View>
                <TextInput
                    id="old-password"
                    value={password}
                    onChangeText={setOldPassword}
                />
            </View>
            <Button onPress={() => createUserMutation.mutate()} title="Save" />
        </View>
    );
};

export default SettingsPage;
