
import React, { useContext, useEffect, useState } from "react";

import { CollapsableForm } from './collapsableForm';
import { GlobalContext } from "./context";
import { PluginCheckField } from "./fields";
import { SubmitUnit } from "./submitUnit";

export function PluginManager() {
    const [data, setData] = useState({});
    const { plugins, endpoint } = useContext(GlobalContext);

    useEffect(() => {
        const res = {}
        for (let key in plugins) {
            res[key] = plugins[key].installed
        }
        setData({plugins: res})
    }, [plugins])

    return (
        plugins === undefined ? <></> :
        <CollapsableForm title={'Plugins'}>
            <SubmitUnit target='manage_plugins' data={data} endpoint={endpoint}>
                {Object.keys(plugins).map((e) => {
                    return (
                        <PluginCheckField
                            name={e}
                            description={plugins[e].description}
                            version={plugins[e].version}
                            homepage={plugins[e].homepage}
                            warning={plugins[e].warning}
                            installed={plugins[e].installed}
                            key={e}
                        />
                        )
                })}
            </SubmitUnit>
            <span style={{color: 'red'}}>NOTE: </span>
            <span>Installation of new plugins could take a few minutes to complete.</span>
            <br />
        </CollapsableForm>
    )
}