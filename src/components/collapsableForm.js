import React, { useContext, useEffect, useState } from "react";

import { GlobalContext } from "./context";
import { LogLevelField } from "./fields";



export function AdvancedOptions() {
    const { allowedOptions } = useContext(GlobalContext);

    return (
        <CollapsableForm title={'Advanced options'}>
            {Object.keys(allowedOptions || []).map((e) => {
                return (
                    <CollapsableForm title={e}>
                        {Object.keys(allowedOptions[e]).map((f) => {
                            return (
                                <OptionField 
                                key={f}
                                name={f}
                                modelType={e}
                                type={allowedOptions[e][f].type}
                                def={allowedOptions[e][f].default}
                                description={allowedOptions[e][f].description}
                                />
                            )
                        })}
                    </CollapsableForm>
                    )
            })}
            {allowedOptions === undefined ? <></> : <OptionsResetButton />}
            <LogLevelField />
        </CollapsableForm>
    )
}

function OptionsResetButton() {
    const { setSelectedOptions } = useContext(GlobalContext);
    const [firstClick, setFirstClick] = useState(false);
    const [text, setText] = useState('Reset');
    const [className, setClassName] = useState('');

    const onClick = () => {
        if (!firstClick) {
            setFirstClick(true);
            setText('Are you sure?');
            setClassName('error');
        } else {
            setFirstClick(false);
            setText('Reset');
            setClassName('');
            setSelectedOptions({});
        }
    }

    return (
        <button onClick={onClick} className={className}>{text}</button>
    )
}

function OptionField({ name, modelType, type, def, description}) {
    const { selectedOptions, setSelectedOptions, boxModel, ocrModel, tslModel } = useContext(GlobalContext);
    const [value, setValue] = useState();
    const [model, setModel] = useState();

    useEffect(() => {
        let model = modelType === 'box_model' ? boxModel : modelType === 'ocr_model' ? ocrModel : modelType === 'tsl_model' ? tslModel : undefined;
        setModel(model);
    }, [boxModel, ocrModel, tslModel, selectedOptions])

    useEffect(() => {
        let val = Object(selectedOptions[model])[name];
        setValue(val === undefined ? def : val);
    }, [model, name, selectedOptions])


    const onChange = (e) => {
        let val = type === 'bool' ? e.target.checked : e.target.value;
        setValue(val);
        setSelectedOptions((prev) => {
            let newSelectedOptions = {...prev};
            newSelectedOptions[model] = Object(newSelectedOptions[model]);
            newSelectedOptions[model][name] = val;
            return newSelectedOptions;
        })
    }

    const getTypeField = (type) => {
        switch (type) {
            case 'bool':
                return <input type="checkbox" id={name} name={name} checked={value} onChange={onChange} />
            case 'int':
                return <input type="number" id={name} name={name} value={value} onChange={onChange} />
            case 'float':
                return <input type="number" id={name} name={name} step="0.1" value={value} onChange={onChange} />
            case 'str':
                return <input type="text" id={name} name={name} value={value} onChange={onChange} />
            default:
                return <></>
        }
    }

    return (
        <div className="option-field">
            <div>
                <div className="tooltip">
                    {'❓'}
                    <span className="tooltiptext">{description}</span>
                </div>
                <label htmlFor={name}>{name}</label>
            </div>
            {getTypeField(type)}
        </div>
    )
}

export function CollapsableForm({children, title}) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="collapsable">
            <div className="collapsable-title" onClick={() => setOpen(!open)}>{open ? '▼' : '▶'} {title}</div>
            <div className={`collapsable-content ${open ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    )
}