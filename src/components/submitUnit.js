import React, { useCallback, useEffect, useState } from "react";

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { post } from "../utils/API";

/*
Generic React component to draw a submission form.
The props `target` and `data` should be given by the parent component.
This abstract the creation of a form, and handling data submission and success/failure.
*/
export function SubmitUnit({children, target, data, endpoint}) {
    const queryClient = useQueryClient();

    const [success, setSuccess] = useState(null);

    const updateMutation = useMutation({
        mutationFn: (data) => post(endpoint, target, data), 
        onError: () => {
            console.log('error');
            setSuccess(false);
        },
        onSuccess: () => {
            console.log('success');
            setSuccess(true);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['endpoint']);
            queryClient.invalidateQueries(['options']);
        }
    });

    const onSubmit = useCallback(async (e) => {
        e.preventDefault();
        console.log(updateMutation.status)
        if (updateMutation.isLoading) {
            return;
        }
        console.log('submitting', data);
        updateMutation.mutate(data);
    }, [updateMutation, data]);

    useEffect(() => {
        setSuccess(null);
    }, [data])

    const newProps = {
        success: success,
    }

    return (
        <div className="subunit">
            {children.map((e) => {
                // return e;
                let newChild = {...e};
                if (typeof(e.type) === 'function') newChild.props = {...newProps, ...e.props};
                return newChild;
                }
            )}
            {
                updateMutation.isLoading ? 
                <div className="loading">Loading...</div> 
                : 
                <button onClick={onSubmit}>Submit</button>
            }
        </div>
    )
}