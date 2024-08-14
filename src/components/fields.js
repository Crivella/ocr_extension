import React, { useContext, useEffect, useState } from "react";

import { GlobalContext } from "./context";

/*
React component to draw a field for the endpoint.
The field will be highlighted in green or red depending on the success of the handshake.
*/
export function EndpointField() {
    const { endpoint, setEndpoint, successEndpoint: success } = useContext(GlobalContext);

    const [endpointInput, setEndpointInput] = useState(endpoint);
    const [myClass, setClass] = useState(''); // ['success', 'error', '']

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(endpointInput);
        setEndpoint(endpointInput);
    }

    useEffect(() => {
        setEndpointInput(endpoint);
    }, [endpoint])

    useEffect(() => {
        if (success === null) {
            setClass('');
        } else if (success) {
            setClass('success');
        } else {
            setClass('error');
        }
    }, [success])

    
    return (
        <div className="field">
            <label htmlFor="endpoint">Endpoint</label>
            <input 
                type="text" id="endpoint" name="endpoint" 
                className={myClass}
                value={endpointInput} 
                onChange={(e) => setEndpointInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSubmit(e);
                    }}
                } 
                />
            <input type="submit" value="Apply" onClick={onSubmit} />
        </div>
    )
}

/*
React component to draw a field for the font scale.
*/
export function FontScaleField() {
    const { fontScale, setFontScale } = useContext(GlobalContext);

    return (
        <div className="field">
            <label htmlFor="font-scale">Font Scale</label>
            <input
                type="number" id="font-scale" name="font-scale"
                value={fontScale}
                min="0.1" max="3" step="0.1"
                onChange={(e) => setFontScale(e.target.value)}
                onScroll={(e) => console.log(e)}
            />
        </div>
    )
}

/*
React component to draw a field/s for the font RGB color.
*/
export function RGBField() {
    const { RGB, setRGB } = useContext(GlobalContext);
    // const [hexRGB, setHexRGB] = useState();

    // useEffect(() => {
    //     if (RGB[0] !== undefined) {
    //         setHexRGB(`#${RGB.map((e) => e.toString(16).padStart(2, '0')).join('')}`);
    //     }
    // }, [RGB])

    // https://stackoverflow.com/questions/61821924/firefox-addon-input-type-color-closing-addon-popup-on-firefox
    // const onPick = (e) => {
    //     console.log(e.target.value);
    //     const hex = e.target.value.slice(1);
    //     const r = parseInt(hex.slice(0, 2), 16);
    //     const g = parseInt(hex.slice(2, 4), 16);
    //     const b = parseInt(hex.slice(4, 6), 16);
    //     setRGB([r, g, b]);
    //     // setRGB(e.target.value);
    // }

    return (
        <div className="field">
            <label htmlFor="R">R</label>
            <input
                type="number" id="R" name="R"
                value={RGB[0]}
                min="0" max="255" step="1"
                onChange={(e) => setRGB([e.target.value, RGB[1], RGB[2]])}
            />
            <label htmlFor="G">G</label>
            <input
                type="number" id="G" name="G"
                value={RGB[1]}
                min="0" max="255" step="1"
                onChange={(e) => setRGB([RGB[0], e.target.value, RGB[2]])}
            />
            <label htmlFor="B">B</label>
            <input
                type="number" id="B" name="B"
                value={RGB[2]}
                min="0" max="255" step="1"
                onChange={(e) => setRGB([RGB[0], RGB[1], e.target.value])}
            />
            {/* <input type="color" id="color" name="color" value={hexRGB} onChange={onPick} /> */}
        </div>
    )
}

/*
Generic React component to draw a field for a list of selections.
The field will be highlighted in green or red depending on the success variable.
EG. field included in a submission form, that will set success for all its child components.
*/
export function SelectField({label, name, options, option_names, value, setValue, success}) {
    const [myClass, setClass] = useState(''); // ['success', 'error', '']

    const onChange = (e) => {
        setValue(e.target.value);
    }

    useEffect(() => {
        if (success === null) {
            setClass('');
        } else if (success) {
            setClass('success');
        } else {
            setClass('error');
        }
    }, [success])

    return (
        <div className="field">
            <label htmlFor={name}>{label}</label>
            <select className={myClass} name={name} id={name} value={value} onChange={onChange}>
                <option value="">--- SELECT ---</option> 
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option_names[idx]}</option>
                ))}
            </select>
        </div>
    )
}

export function PluginCheckField({name, description, version, homepage, warning, installed}) {
    const { setPlugins } = useContext(GlobalContext);
    const onChange = (e) => {
        setPlugins((prev) => {
            let newPlugins = {...prev};
            newPlugins[name].installed = e.target.checked;
            return newPlugins;
        })
    }

    return (
        <div className="field">
            <div>
                <div className="tooltip">
                    {'❓'}
                    <div className="tooltiptext" style={{textAlign: 'left'}}>
                        <span className="tooltip-block">
                            <a href={homepage} className="tooltip-link" target="_blank" rel="noreferrer noopener">
                                HOMEPAGE
                            </a>
                        </span>
                        <span className="tooltip-block">
                            {`Version: ${version}`}
                        </span>
                        <span className="tooltip-block">
                            {description}
                        </span>
                        {
                            warning ? 
                            <span className="tooltip-block">
                                <span style={{color: 'red'}}>IMPORTANT: </span>
                                {warning}
                            </span>
                            :
                            <></>
                        }
                    </div>
                    {/* <span className="tooltiptext">{description}</span> */}
                </div>
            <label htmlFor={name}>{name}</label>
            </div>
            <input type="checkbox" id={name} name={name} checked={installed} onChange={onChange} />
        </div>
    )
}
