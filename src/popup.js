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
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { GlobalContext } from "./components/context";
import { EndpointField, FontScaleField, RGBField } from "./components/fields";
import { LangUnit } from "./components/submitUnitLang";
import { ModelUnit } from "./components/submitUnitModel";
import { ThemeSwitch } from "./components/themeSwitch";
import { handshake } from "./utils/API";

const queryClient = new QueryClient();


function Checkbox({label, name, value, setValue}) {
    return (
        <div className="field">
            <label htmlFor={name}>{label}</label>
            <input
                type="checkbox" id={name} name={name}
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
            />
        </div>
    )
}

function DisplayMode() {
    const { showTranslated, setShowTranslated, orientation, setOrientation } = useContext(GlobalContext);

    return (
        <div className="field">
            <Checkbox label="Show Translated" name="show-translated" value={showTranslated} setValue={setShowTranslated} />
            <label htmlFor="orientation">Display Mode</label>
            <select name="orientation" id="orientation" value={orientation} onChange={(e) => {setOrientation(e.target.value)}}>
                <option value="horizontal-tb">Horiz-tb</option>
                <option value="vertical-rl">Vert-rl</option>
                <option value="vertical-lr">Vert-lr</option>
            </select>
        </div>
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
        setLangChoices, setLangChoicesHR, setLangSrc, setLangDst,
    } = useContext(GlobalContext);


    const query = useQuery({
        queryKey: ['endpoint', endpoint],
        queryFn: ({ signal }) => handshake({ endpoint, signal }),
        enabled: endpoint !== '',
        staleTime: 1000 * 60 * 5
    });

    useEffect(() => {
        console.log('QUERY', query);
        if (query.data) {
            setBoxModels(query.data.BOXModels || []);
            setOcrModels(query.data.OCRModels || []);
            setTslModels(query.data.TSLModels || []);
            setLangChoices(query.data.Languages || []);
            setLangChoicesHR(query.data.Languages_hr || []);
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
            <ThemeSwitch />
            <EndpointField />
            <DisplayMode />
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
export function Hub() {
    const [fontScale, setFontScale] = useState();
    const [RGB, setRGB] = useState([undefined, undefined, undefined]);
    const [langSrc, setLangSrc] = useState('');
    const [langDst, setLangDst] = useState('');
    const [langChoices, setLangChoices] = useState([]);
    const [langChoicesHR, setLangChoicesHR] = useState([]);
    const [endpoint, setEndpoint] = useState('');
    const [boxModel, setBoxModel] = useState('');
    const [ocrModel, setOcrModel] = useState('');
    const [tslModel, setTslModel] = useState('');
    const [boxModels, setBoxModels] = useState([]);
    const [ocrModels, setOcrModels] = useState([]);
    const [tslModels, setTslModels] = useState([]);
    const [successEndpoint, setSuccessEndpoint] = useState(null);
    const [showTranslated, setShowTranslated] = useState();
    const [orientation, setOrientation] = useState();
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

        browser.runtime.sendMessage({
            type: 'get-show-text',
        }).then((response) => {
            setShowTranslated(response.showTranslated);
            setOrientation(response.orientation);
        })

    }, [])

    useEffect(() => {
        if (langSrc) {
            browser.runtime.sendMessage({
                type: 'set-lang-src',
                lang: langSrc,
            })
        }
    }, [langSrc])

    useEffect(() => {
        if (langDst) {
            browser.runtime.sendMessage({
                type: 'set-lang-dst',
                lang: langDst,
            })
        }
    }, [langDst])

    useEffect(() => {
        if (fontScale !== undefined){
            browser.runtime.sendMessage({
                type: 'set-font-scale',
                fontScale: fontScale,
            })
        }
    }, [fontScale])

    useEffect(() => {
        if (RGB[0] !== undefined) {
            browser.runtime.sendMessage({
                type: 'set-color',
                color: RGB,
            })
        }
    }, [RGB])

    useEffect(() => {
        if (showTranslated !== undefined) {
            browser.runtime.sendMessage({
                type: 'set-show-text',
                active: showTranslated,
                orientation: orientation,
            })
        }
    }, [showTranslated, orientation])

    const newProps = {
        endpoint: endpoint, setEndpoint: setEndpoint,
        boxModel: boxModel, setBoxModel: setBoxModel,
        ocrModel: ocrModel, setOcrModel: setOcrModel,
        tslModel: tslModel, setTslModel: setTslModel,
        fontScale: fontScale, setFontScale: setFontScale,
        RGB: RGB, setRGB: setRGB,
        langSrc: langSrc, setLangSrc: setLangSrc,
        langDst: langDst, setLangDst: setLangDst,
        // ocrEnabled: ocrEnabled,
        // setOcrEnabled: setOcrEnabled,
        boxModels: boxModels, setBoxModels: setBoxModels,
        ocrModels: ocrModels, setOcrModels: setOcrModels,
        tslModels: tslModels, setTslModels: setTslModels,
        langChoices: langChoices, setLangChoices: setLangChoices,
        langChoicesHR: langChoicesHR, setLangChoicesHR: setLangChoicesHR,
        successEndpoint: successEndpoint, setSuccessEndpoint: setSuccessEndpoint,
        showTranslated: showTranslated, setShowTranslated: setShowTranslated,
        orientation: orientation, setOrientation: setOrientation,
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
