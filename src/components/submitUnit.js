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
    const [errorMsg, setErrorMsg] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);

    const updateMutation = useMutation({
        mutationFn: (data) => post(endpoint, target, data), 
        onError: (err, data, context) => {
            setSuccess(false);
            setErrorStatus(err.response.status);
            setErrorMsg(err.response.data.error);
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

    const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSuccess(null);
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
            {
                success === false ? 
                <div className="submit-error">
                    <span>{`ERROR (${errorStatus}): `}</span>
                    <span>{errorMsg}</span>
                    <div style={{float: "right"}}>
                        <a href="#" className="tooltip-link" onClick={clickHandler}>X</a>
                    </div>
                </div>
                :
                null
            }
        </div>
    )
}