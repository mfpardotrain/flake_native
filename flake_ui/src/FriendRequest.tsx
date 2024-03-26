import React, { useContext, useState } from 'react'
import { useMutation, useQuery, } from 'react-query'
import PocketBase from "pocketbase";
import "./styles/friends.css";
import { StatusContext } from './App';
import { Button, View } from 'react-native';

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

type FriendRequestProps = {
    friendId: string,
    userId: string,
}

function FriendRequest({ friendId, userId }: FriendRequestProps) {
    const statuses = useContext(StatusContext);
    const [currentStatus, setCurrentStatus] = useState("");
    const [friendshipId, setFriendshipId] = useState("");
    const [requesterId, setRequesterId] = useState("");

    const currentStatusQuery = useQuery([friendId, userId], {
        queryFn: () => {
            return pb.collection("friendshipStatus").getList(1, 1,
                {
                    requestKey: null,
                    sort: '-created',
                    filter: pb.filter("(requesterId = {:userId} && addresseeId = {:friendId}) || (requesterId = {:friendId} && addresseeId = {:userId})",
                        { userId: userId, friendId: friendId }),
                }
            )
        },
        onSuccess(data) {
            if (data.totalItems > 0) {
                setFriendshipId(data.items[0].friendship)
                setRequesterId(data.items[0].requesterId)
                setCurrentStatus(data.items[0].statusCode)
            }
        },
    });

    const createFriendMutation =
        useMutation((_: string) => {
            return pb.collection("friendship")
                .create({
                    requesterId: userId,
                    addresseeId: friendId
                })
        },
        );

    type CreateFriendArgs = {
        friendshipId: string,
        statusCode: string,
    };

    const createFriendshipStatusMutation =
        useMutation({
            mutationFn: ({ friendshipId, statusCode }: CreateFriendArgs) => {
                return pb.collection("friendshipStatus")
                    .create({
                        friendship: friendshipId,
                        specifierId: userId,
                        statusCode: statusCode,
                        requesterId: userId,
                        addresseeId: friendId
                    })
            },
            onSuccess(data, variables, context) {
                currentStatusQuery.refetch()
            },
        }
        );

    const requestInitialFriendship = (status: string) => {
        createFriendMutation.mutateAsync("", {
            onSuccess(data, variables, context) {
                let friendshipId = data.id;
                let statusCode = statuses[status];
                setFriendshipId(friendshipId);
                setRequesterId(data.requesterId)

                createFriendshipStatusMutation.mutate({ friendshipId, statusCode })
            },
        });
    };

    const acceptedButton = (
        <Button

            onPress={() => createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Unfriended"] })}
            title="Unfriend"
        />
    )

    const friendRequested = (
        requesterId === userId ? (
            <View>
                Friend requested
            </View>
        ) : (
            <View >
                <Button

                    onPress={() => createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Accepted"] })}
                    title="Accept Request?"
                />
                <Button

                    onPress={() => createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Declined"] })}
                    title="Decline Request?" />
            </View>
        )
    )

    const friendDeclined = (
        <View>
            Friend request declined
            <Button

                onPress={() => createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Requested"] })}
                title="Request Again?"
            />
        </View>
    )

    const blockedRequest = (
        requesterId === userId ? (
            <Button

                onPress={() => createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Unblocked"] })}
                title="Unblock?"
            />
        ) : (
            <View>You are blocked</View>
        )
    )

    const defaultRequest = (
        <View >
            <Button

                onPress={() => requestInitialFriendship("Requested")}
                title="Add Friend" />
            <Button

                onPress={() => {
                    if (friendshipId !== "") {
                        createFriendshipStatusMutation.mutate({ friendshipId, statusCode: statuses["Blocked"] })
                    } else {
                        requestInitialFriendship("Blocked")
                    }
                }
                }
                title="Block?" />
        </View>
    )

    const currentFriendStatus = (statusCode: string) => {
        let humanStatus = statuses[statusCode]
        switch (humanStatus) {
            case ("Accepted"):
                return acceptedButton
            case ("Blocked"):
                return blockedRequest
            case ("Requested"):
                return friendRequested
            case ("Declined"):
                return friendDeclined
            default:
                return defaultRequest
        }
    }

    return (
        <View >
            {currentFriendStatus(currentStatus)}
        </View>

    )
};

export default FriendRequest;