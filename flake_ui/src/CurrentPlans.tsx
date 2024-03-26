import React, { useContext, useState } from 'react'
import { useMutation, useQuery, } from 'react-query'
import PocketBase from "pocketbase";
import "./styles/plans.css";
import { StatusContext } from './App';
import { Button, View } from 'react-native';

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

type PlanType = {
    description: string,
    when: string,
    name: string,
    planId: string,
    planStatusId: string,
    planStatusStatus: string,
    friends: string[],
    planStatus: string,

}

function CurrentPlans() {
    const statuses = useContext(StatusContext);
    const [currentPlans, setCurrentPlans] = useState<PlanType[]>([]);
    const [userId, setUserId] = useState("");

    // User query
    useQuery({
        queryKey: ['selfData'],
        queryFn: () => pb.authStore.model,
        onSuccess(data) {
            if (data) {
                setUserId(data.id)
                currentPlansQuery.refetch()
            }
        },
    })

    const currentPlansQuery = useQuery([userId], {
        queryFn: () => {
            return pb.collection('planStatus').getFullList({
                filter: `addresseeId = "${userId}" && @now <= planId.when && (statusCode = "${statuses["Accepted"]}" || statusCode = "${statuses["Requested"]}" || statusCode = "${statuses["Cancelled"]}")`,
                sort: 'created',
                requestKey: null,
                expand: "planId,planId.addresseeId",
            })
        },
        onSuccess(data) {
            let plans = data.flatMap((item): PlanType | [] => {
                if (item.expand) {
                    let planId = item.expand.planId
                    return {
                        name: planId.name,
                        planId: planId.id,
                        planStatusId: item.id,
                        planStatusStatus: item.statusCode,
                        when: planId.when,
                        description: planId.description,
                        friends: planId.expand.addresseeId.map(el => el.name),
                        planStatus: planId.planStatus,
                    };
                }
                return [];
            });
            if (plans) {
                setCurrentPlans(plans)
            }
        },

    })

    type UpdatePlanStatusArgs = {
        planStatusId: string,
        statusCode: string
    }

    const updatePlanStatusMutation = useMutation({
        mutationFn: ({ planStatusId, statusCode }: UpdatePlanStatusArgs) => {
            return pb.collection("planStatus")
                .update(planStatusId, {
                    statusCode: statuses[statusCode]
                })
        },
        onSuccess(data, variables, context) {
            currentPlansQuery.refetch()
        },
    });

    const acceptRejectButton = ({ planStatusId, statusCode }: UpdatePlanStatusArgs) => {
        if (statusCode === "Cancelled") {
            return <Button onPress={() => updatePlanStatusMutation.mutate({ planStatusId, statusCode: "Accepted" })} title="Uncancel" />
        } else if (statusCode === "Accepted") {
            return <Button onPress={() => updatePlanStatusMutation.mutate({ planStatusId, statusCode: "Cancelled" })} title="Cancel" />
        } else {
            return (
                <>
                    <Button onPress={() => updatePlanStatusMutation.mutate({ planStatusId, statusCode: "Accepted" })} title="Accept?" />
                    <Button onPress={() => updatePlanStatusMutation.mutate({ planStatusId, statusCode: "Cancelled" })} title="Cancel" />
                </>
            )
        };
    };

    const plans = () => {
        return currentPlans.map(plan => {
            if (statuses[plan.planStatus] === "Cancelled") {
                return (
                    <View key={plan.planId} >
                        <View >
                            <View>{plan.name}</View>
                            <View>{plan.description}</View>
                            <View>{plan.when}</View>
                            <View>{statuses[plan.planStatusStatus]}</View>
                        </View>
                        <View>
                            You all flaked!
                        </View>
                    </View>
                )
            } else {
                return (
                    <View key={plan.planId} >
                        <View >
                            <View>{plan.name}</View>
                            <View>{plan.description}</View>
                            <View>{plan.when}</View>
                            <View>{statuses[plan.planStatusStatus]}</View>
                        </View>
                        <View >
                            {acceptRejectButton({ planStatusId: plan.planStatusId, statusCode: statuses[plan.planStatusStatus] })}
                        </View>
                    </View>
                )
            }
        })
    }

    return (
        <View >
            {plans()}
        </View>
    )
};

export default CurrentPlans;