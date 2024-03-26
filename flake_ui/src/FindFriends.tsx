import React, { useState } from 'react'
import { useQuery, } from 'react-query'
import PocketBase from "pocketbase";
import "./styles/friends.css";
import FriendRequest from './FriendRequest';
import { Button, TextInput, View } from 'react-native';

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

function FindFriends() {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState("");

    useQuery({
        queryKey: ['selfData'],
        queryFn: () => pb.authStore.model,
        onSuccess(data) {
            if (data) {
                setUserId(data.id)
            }
        },
    })

    const { isLoading, error, data, isFetching, refetch } = useQuery([page], {
        queryFn: () => {
            return pb.collection("users").getList(page, 7, {
                filter: pb.filter(
                    "id ~ {:search} || name ~ {:search} || username ~ {:search} || email ~ {:search}",
                    { search: searchTerm }
                )
            })
        },
    })

    if (isLoading) return 'Loading...'

    if (error && error instanceof Error) return 'An error has occurred: ' + error.message


    const records = () => {
        if (data && data.totalItems > 0) {
            return data.items.map((record) =>
            (
                <View key={record.username}>
                    {record.username}
                    <FriendRequest key="record.id" friendId={record.id} userId={userId} />
                </View>
            )
            )
        } else {
            return <View>No Records</View>
        }
    }

    const pageSelectors = () => {
        if (data && data.page) {
            return (
                <View >
                    <Button onPress={() => setPage(page - 1)} title="" />
                    {data.page > 1 && <Button onPress={() => setPage(page - 1)} title={(data.page - 1).toString()} />}
                    <View >{data.page}</View>
                    {data.totalPages > data.page && <Button onPress={() => setPage(page + 1)} title={(data.page + 1).toString()} />}
                    {data.totalPages > data.page && <Button onPress={() => setPage(page + 1)} title="" />}
                </View>
            )
        }
    }

    return (
        <View>
            <View >
                <TextInput
                    placeholder='Search'
                    id="searchTerm"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <Button onPress={() => {
                    if (page !== 1) {
                        setPage(1)
                    } else { refetch() }
                }} title="Submit" />
            </View>
            {records()}
            {pageSelectors()}
            {isFetching && <View>'Searching...'</View>}
        </View >

    )
};

export default FindFriends;