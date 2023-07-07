import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";

const GlobalContext = createContext();

function EndpointField() {
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

function FontScaleField() {
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

function RGBField() {
    const { RGB, setRGB } = useContext(GlobalContext);

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
        </div>
    )
}



function SelectField({label, name, options, value, setValue, success}) {
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
                {options.map((option) => (
                    <option value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

function OCRModelSelect() {
    const { success, ocrModels, ocrModel, setOcrModel } = useContext(GlobalContext);

    return <SelectField 
        label="OCR Model" 
        name="ocr-model" 
        options={ocrModels} 
        value={ocrModel} 
        setValue={setOcrModel} 
        success={success} />
}

function TSLModelSelect() {
    const { success, tslModels, tslModel, setTslModel } = useContext(GlobalContext);

    return <SelectField
        label="Translation Model"
        name="tsl-model"
        options={tslModels}
        value={tslModel}
        setValue={setTslModel}
        success={success} />
}

function Popup() {
    const [fontScale, setFontScale] = useState(1.0);
    const [RGB, setRGB] = useState([0, 0, 0]);
    const [endpoint, setEndpoint] = useState('');
    const [ocrModel, setOcrModel] = useState('');
    const [tslModel, setTslModel] = useState('');
    const [ocrModels, setOcrModels] = useState([]);
    const [tslModels, setTslModels] = useState([]);
    const [success, setSuccess] = useState(null);
    const [successEndpoint, setSuccessEndpoint] = useState(null);

    useEffect(() => {
        console.log('useEffect - init');
        browser.runtime.sendMessage({
            type: 'get-endpoint',
        }).then((response) => {
            setEndpoint(response.endpoint);
        })

        browser.runtime.sendMessage({
            type: 'get-font-scale',
        }).then((response) => {
            setFontScale(response.fontScale);
        })

        browser.runtime.sendMessage({
            type: 'get-color',
        }).then((response) => {
            setRGB(response.color);
        })

    }, [])

    useEffect(() => {
        console.log('useEffect - endpoint: ' + `'${endpoint}'`);
        if ( ! (endpoint === '') ) {
            console.log(`GET ${endpoint}/`);
            axios.get(`${endpoint}/`)
                .then(res => {
                    console.log(res.data);
                    setSuccessEndpoint(true);
                    setOcrModels(res.data.OCRModels);
                    setTslModels(res.data.TSLModels);
                    setOcrModel(res.data.ocr_selected || '');
                    setTslModel(res.data.tsl_selected || '');

                    browser.runtime.sendMessage({
                        type: 'set-endpoint',
                        endpoint: endpoint,
                    })
        
                })
                .catch(err => {
                    console.log(err);
                    setSuccessEndpoint(false);
                })
        }
    }, [endpoint])

    useEffect(() => {
        browser.runtime.sendMessage({
            type: 'set-font-scale',
            fontScale: fontScale,
        })
    }, [fontScale])

    useEffect(() => {
        browser.runtime.sendMessage({
            type: 'set-color',
            color: RGB,
        })
    }, [RGB])

    useEffect(() => {
        setSuccess(null);
    }, [endpoint, ocrModel, tslModel])

    const newProps = {
        endpoint: endpoint,
        setEndpoint: setEndpoint,
        ocrModel: ocrModel,
        setOcrModel: setOcrModel,
        tslModel: tslModel,
        setTslModel: setTslModel,
        fontScale: fontScale,
        setFontScale: setFontScale,
        RGB: RGB,
        setRGB: setRGB,
        // ocrEnabled: ocrEnabled,
        // setOcrEnabled: setOcrEnabled,
        ocrModels: ocrModels,
        tslModels: tslModels,
        success: success,
        successEndpoint: successEndpoint,
    }


    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${endpoint}/load/`, {
                ocr_model_id: ocrModel,
                tsl_model_id: tslModel,
            })
            setSuccess(true);
            console.log('success');
        } catch (err) {
            console.log(err);
            setSuccess(false);
        }
    }

    return (
        <GlobalContext.Provider value={newProps}>
            <EndpointField />
            <div style={{
                border: "1px solid red", 
                // padding: "5px", 
                marginTop: "5px",
                marginBottom: "5px",
                }}>
                <OCRModelSelect />
                <TSLModelSelect />
                <button onClick={onSubmit}>Submit</button>
            </div>
            {/* <ToggleOCR /> */}
            <FontScaleField />
            <RGBField />
        </GlobalContext.Provider>
    );
}

ReactDOM.render(<Popup />, document.getElementById("app"));