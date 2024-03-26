import PocketBase from "pocketbase";
import "./styles/friends.css";
import { useQuery } from "react-query";
import { useState } from "react";

const pb = new PocketBase(process.env.REACT_APP_FLAKE_API_URL);

function GetStatus(): {} {
    const [statuses, setStatuses] = useState({});

    useQuery({
        queryKey: ['statuses'],
        queryFn: () => pb.collection("status").getFullList({ requestKey: "statuses" }).then((result) => {
            let statusObj = {}
            Object.keys(result).forEach((key) => {
                statusObj[result[key].name] = result[key].id
                statusObj[result[key].id] = result[key].name
            })
            return statusObj
        }),
        onSuccess(data) {
            setStatuses(data)
        },
    });

    return statuses
}

export default GetStatus;