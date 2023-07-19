/**********************************************************************************
* ocr_extension - a browser extension to perform OCR and translation of images.   *
* Copyright (C) 2023-present Davide Grassano                                      *
*                                                                                 *
* This program is free software: you can redistribute it and/or modify            *
* it under the terms of the GNU General Public License as published by            *
* the Free Software Foundation, either version 3 of the License.                  *
*                                                                                 *
* This program is distributed in the hope that it will be useful,                 *
* but WITHOUT ANY WARRANTY; without even the implied warranty of                  *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                   *
* GNU General Public License for more details.                                    *
*                                                                                 *
* You should have received a copy of the GNU General Public License               *
* along with this program.  If not, see {http://www.gnu.org/licenses/}.           *
*                                                                                 *
* Home: https://github.com/Crivella/ocr_extension                                 *
**********************************************************************************/
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { handshake, post } from "./utils/API";

const GlobalContext = createContext();
const queryClient = new QueryClient();

/*
React component to draw a field for the endpoint.
The field will be highlighted in green or red depending on the success of the handshake.
*/
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

/*
React component to draw a field for the font scale.
*/
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

/*
React component to draw a field/s for the font RGB color.
*/
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


/*
Generic React component to draw a field for a list of selections.
The field will be highlighted in green or red depending on the success variable.
EG. field included in a submission form, that will set success for all its child components.
*/
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
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

/*
Field for the list of available box models.
*/
function BOXModelSelect({ success = null }) {
    const { boxModels, boxModel, setBoxModel } = useContext(GlobalContext);

    return <SelectField 
        label="BOX Model" 
        name="box-model" 
        options={boxModels} 
        value={boxModel} 
        setValue={setBoxModel} 
        success={success} />
}

/*
Field for the list of available OCR models.
*/
function OCRModelSelect({ success = null }) {
    const { ocrModels, ocrModel, setOcrModel } = useContext(GlobalContext);

    return <SelectField 
        label="OCR Model" 
        name="ocr-model" 
        options={ocrModels} 
        value={ocrModel} 
        setValue={setOcrModel} 
        success={success} />
}

/*
Field for the list of available TSL models.
*/
function TSLModelSelect({ success = null }) {
    const { tslModels, tslModel, setTslModel } = useContext(GlobalContext);

    return <SelectField
        label="Translation Model"
        name="tsl-model"
        options={tslModels}
        value={tslModel}
        setValue={setTslModel}
        success={success} />
}

/*
Field for the list of available source languages.
*/
function LanguageSrcSelect({ success = null }) {
    const { langChoices, langSrc, setLangSrc } = useContext(GlobalContext);

    return <SelectField
        label="Source Language"
        name="lang-src"
        options={langChoices}
        value={langSrc}
        setValue={setLangSrc}
        success={success} />
}

/*
Field for the list of available destination languages.
*/
function LanguageDstSelect({ success = null }) {
    const { langChoices, langDst, setLangDst } = useContext(GlobalContext);
    
    return <SelectField
        label="Destination Language"
        name="lang-dst"
        options={langChoices}
        value={langDst}
        setValue={setLangDst}
        success={success} />
}

/*
Generic React component to draw a submission form.
The props `target` and `data` should be given by the parent component.
This abstract the creation of a form, and handling data submission and success/failure.
*/
function SubmitUnit({children, target, data}) {
    const queryClient = useQueryClient();

    const [success, setSuccess] = useState(null);

    const updateMutation = useMutation({
        mutationFn: (data) => post(target, data), 
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

/*
React component to draw the form for the model selection.
*/
function ModelUnit() {
    const [data, setData] = useState({}); 
    const { boxModel, ocrModel, tslModel } = useContext(GlobalContext);
    
    useEffect(() => {
        setData({
            box_model_id: boxModel,
            ocr_model_id: ocrModel,
            tsl_model_id: tslModel,
        })
    }, [boxModel, ocrModel, tslModel])

    return (
        <SubmitUnit target="set_models" data={data}>
            <BOXModelSelect />
            <OCRModelSelect />
            <TSLModelSelect />
        </SubmitUnit>   
    )
}

/*
React component to draw the form for the language selection.
*/
function LangUnit() {
    const [data, setData] = useState({});
    const { langSrc, langDst } = useContext(GlobalContext);

    useEffect(() => {
        setData({
            lang_src: langSrc,
            lang_dst: langDst,
        })
    }, [langSrc, langDst])

    return (
        <SubmitUnit target="set_lang" data={data}>
            <LanguageSrcSelect />
            <LanguageDstSelect />
        </SubmitUnit>
    )
}

/*
React component to draw the poup.
*/
function PopUp() {
    const { 
        endpoint, setSuccessEndpoint,
        setBoxModels, setBoxModel,
        setOcrModels, setOcrModel, 
        setTslModels, setTslModel,
        setLangChoices, setLangSrc, setLangDst,
    } = useContext(GlobalContext);


    const query = useQuery({
        queryKey: ['endpoint', endpoint],
        queryFn: ({ signal }) => handshake({ endpoint, signal }),
        enabled: endpoint !== '',
        staleTime: 1000 * 60 * 5
    });

    useEffect(() => {
        console.log('ENDPOINT', endpoint);
    }, [endpoint])

    useEffect(() => {
        console.log('QUERY', query);
        if (query.data) {
            setBoxModels(query.data.BOXModels || []);
            setOcrModels(query.data.OCRModels || []);
            setTslModels(query.data.TSLModels || []);
            setLangChoices(query.data.Languages || []);
            setBoxModel(query.data.box_selected || '');
            setOcrModel(query.data.ocr_selected || '');
            setTslModel(query.data.tsl_selected || '');
            setLangSrc(query.data.lang_src || '');
            setLangDst(query.data.lang_dst || '');

            browser.runtime.sendMessage({
                type: 'set-endpoint',
                endpoint: endpoint,
            })
        }
    }, [query.data])

    useEffect(() => {
        if (query.isSuccess) {
            console.log('QUERY - success');
            setSuccessEndpoint(true);
        } else {
            setSuccessEndpoint(false);
        }
    }, [query.isSuccess])

    return (
        <>
            <EndpointField />
            <LangUnit />
            <ModelUnit />
            <FontScaleField />
            <RGBField />
        </>
    )
}

/*
React component to handle the context and messaging with the background script.
*/
function Hub() {
    const [fontScale, setFontScale] = useState(1.0);
    const [RGB, setRGB] = useState([0, 0, 0]);
    const [langSrc, setLangSrc] = useState('');
    const [langDst, setLangDst] = useState('');
    const [langChoices, setLangChoices] = useState([]);
    const [endpoint, setEndpoint] = useState('');
    const [boxModel, setBoxModel] = useState('');
    const [ocrModel, setOcrModel] = useState('');
    const [tslModel, setTslModel] = useState('');
    const [boxModels, setBoxModels] = useState([]);
    const [ocrModels, setOcrModels] = useState([]);
    const [tslModels, setTslModels] = useState([]);
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



    const newProps = {
        endpoint: endpoint,
        setEndpoint: setEndpoint,
        boxModel: boxModel,
        setBoxModel: setBoxModel,
        ocrModel: ocrModel,
        setOcrModel: setOcrModel,
        tslModel: tslModel,
        setTslModel: setTslModel,
        fontScale: fontScale,
        setFontScale: setFontScale,
        RGB: RGB,
        setRGB: setRGB,
        langSrc: langSrc,
        setLangSrc: setLangSrc,
        langDst: langDst,
        setLangDst: setLangDst,
        // ocrEnabled: ocrEnabled,
        // setOcrEnabled: setOcrEnabled,
        boxModels: boxModels,
        setBoxModels: setBoxModels,
        ocrModels: ocrModels,
        setOcrModels: setOcrModels,
        tslModels: tslModels,
        setTslModels: setTslModels,
        langChoices: langChoices,
        setLangChoices: setLangChoices,
        successEndpoint: successEndpoint,
        setSuccessEndpoint: setSuccessEndpoint,
    }

    return (
        <QueryClientProvider client={queryClient}>
        <GlobalContext.Provider value={newProps}>
            <PopUp />
        </GlobalContext.Provider>
        </QueryClientProvider>
    );
}

// Render the popup
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<Hub />);
