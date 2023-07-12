import axios from "axios";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const GlobalContext = createContext();
const queryClient = new QueryClient();

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
                {options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

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

function SubmitUnit({children, target, data}) {
    const { endpoint } = useContext(GlobalContext);
    const queryClient = useQueryClient();

    const [success, setSuccess] = useState(null);

    const updateMutation = useMutation({
        mutationFn: (data) => axios.post(`${endpoint}/${target}/`, data), 
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

function ModelUnit() {
    const [data, setData] = useState({}); 
    const { boxModel, ocrModel, tslModel } = useContext(GlobalContext);

    useEffect(() => {
        setData({
            box_model_id: boxModel,
            ocr_model_id: ocrModel,
            tsl_model_id: tslModel,
        })
    }, [ocrModel, tslModel])

    return (
        <SubmitUnit target="load" data={data}>
            <BOXModelSelect />
            <OCRModelSelect />
            <TSLModelSelect />
        </SubmitUnit>   
    )
}

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

async function handshake({ endpoint, signal}) {
    console.log(`GET ${endpoint}/`);
    const res = await axios.get(`${endpoint}/`, {}, signal);

    return res.data;
}

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
        // query.refetch();
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

    // useEffect(() => {
    //     // browser.runtime.sendMessage({
    //     //     type: 'set-lang-src',
    //     //     lang: langSrc,
    //     // })
    //     queryClient.invalidateQueries(['endpoint']);
    // }, [langSrc])

    // useEffect(() => {
    //     // browser.runtime.sendMessage({
    //     //     type: 'set-lang-dst',
    //     //     lang: langDst,
    //     // })
    //     queryClient.invalidateQueries(['endpoint']);
    // }, [langDst])

    return (
        <>
            <EndpointField />
            <LangUnit />
            <ModelUnit />
            {/* <ToggleOCR /> */}
            <FontScaleField />
            <RGBField />
        </>
    )
}


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

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<Hub />);
