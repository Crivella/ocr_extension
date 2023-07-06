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

                    // browser.tabs.query({active: true, currentWindow: true})
                    // .then((tabs) => {
                    //     console.log(tabs);
                    //     const tab = tabs[0];
                    //     browser.tabs.sendMessage(tab.id, {
                    //         type: 'set-endpoint',
                    //         endpoint: endpoint,
                    //     })
                    // })
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
        setSuccess(null);
    }, [endpoint, ocrModel, tslModel])

    const newProps = {
        endpoint: endpoint,
        setEndpoint: setEndpoint,
        ocrModel: ocrModel,
        setOcrModel: setOcrModel,
        tslModel: tslModel,
        setTslModel: setTslModel,
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
            <OCRModelSelect />
            <TSLModelSelect />
            <button onClick={onSubmit}>Submit</button>
            {/* <ToggleOCR /> */}
        </GlobalContext.Provider>
    );
}

ReactDOM.render(<Popup />, document.getElementById("app"));