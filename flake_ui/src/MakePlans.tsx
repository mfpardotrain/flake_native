import React, { useContext, useState } from 'react'
import { useMutation, useQuery, } from 'react-query'
import PocketBase from "pocketbase";
import "./styles/plans.css";
import { StatusContext } from './App';
import SelectDateTime from './SelectDateTime';
import SelectFriends from './SelectFriends';
import CurrentPlans from './CurrentPlans';
import { Button, TextInput, View } from 'react-native';

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

type Items = { name: string, id: string }[]

function MakePlans({ setActiveComponent }: { setActiveComponent: (component: any) => void; }) {
    const statuses = useContext(StatusContext);
    const [friends, setFriends] = useState<{ name: string, id: string }[]>([{ name: "name", id: "id" }]);
    const [selectedFriends, setSelectedFriends] = useState<Items>([]);
    const [userId, setUserId] = useState("");
    const [planName, setPlanName] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [when, setWhen] = useState("");

    // User query
    useQuery({
        queryKey: ['selfData'],
        queryFn: () => pb.authStore.model,
        onSuccess(data) {
            if (data) {
                setUserId(data.id)
            }
        },
    })

    // Friends query
    useQuery([statuses, userId], {
        queryFn: () => {
            return pb.collection('friendshipStatus').getList(1, 10, {
                requestKey: null,
                filter: `statusCode = "${statuses["Accepted"]}" && requesterId = "${userId}"`,
                expand: 'addresseeId',
                fields: 'expand.addresseeId.username,addresseeId'
            });
        },
        onSuccess(data) {
            let friends = data.items.flatMap((item): { name: string, id: string }[] | [] => {
                if (item.expand) {
                    return [{ name: item.expand.addresseeId.username, id: item.addresseeId }];
                }
                return [];
            });

            if (friends.length > 0) {
                setFriends(friends);
            }
        },
    });

    const createPlansMutation = useMutation({
        mutationFn: () => {
            let friends = selectedFriends.map((el) => el.id)
            return pb.collection("plans")
                .create({
                    name: planName,
                    description: planDescription,
                    when: when,
                    requesterId: userId,
                    addresseeId: friends,
                    planStatus: statuses["Requested"]
                })
        },
        onSuccess(data, variables, context) {
            createPlanStatusMutation.mutate(data.id)
            setActiveComponent(<CurrentPlans />)
        },
    }
    );

    const createPlanStatusMutation = useMutation({
        mutationFn: (planId: string) => {
            return pb.collection("planStatus").create({
                requesterId: userId,
                statusCode: statuses["Accepted"],
                addresseeId: userId,
                planId: planId,
            })
        },
    })

    return (
        <View >
            <View>Make Plans</View>
            <View >
                <View>Plan Name</View>
                <TextInput
                    id="plan-name"
                    value={planName}
                    onChangeText={setPlanName}
                />
            </View>
            <View >
                <View>Description</View>
                <TextInput
                    id="plan-description"
                    value={planDescription}
                    onChangeText={setPlanDescription}
                />
            </View>
            <SelectDateTime setWhen={setWhen} />
            <SelectFriends items={friends} setSelectedFriends={setSelectedFriends} />
            <Button onPress={() => createPlansMutation.mutate()} title="Make Plans" />
        </View >
    )
};

export default MakePlans;