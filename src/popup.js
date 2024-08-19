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

import { AdvancedOptions } from "./components/collapsableForm";
import { GlobalContext } from "./components/context";
import { EndpointField } from "./components/fields";
import { PluginManager } from "./components/pluginManager";
import { RenderOptionsForm } from "./components/renderOptions";
import { LangUnit } from "./components/submitUnitLang";
import { ModelUnit } from "./components/submitUnitModel";
import { ThemeSwitch } from "./components/themeSwitch";
import { get, handshake } from "./utils/API";

const queryClient = new QueryClient();


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
        setAllowedOptions,
        setServerVersion,
        setPlugins,
    } = useContext(GlobalContext);


    const query = useQuery({
        queryKey: ['endpoint', endpoint],
        queryFn: ({ signal }) => handshake({ endpoint, signal }),
        enabled: endpoint !== '',
        staleTime: 1000 * 60 * 5
    });

    const queryOptions = useQuery({
        queryKey: ['options', endpoint],
        queryFn: ({ signal }) => get(endpoint, 'get_active_options',{}, signal),
        enabled: endpoint !== '',
        staleTime: 1000 * 60 * 5
    });

    const queryPlugins = useQuery({
        queryKey: ['plugins', endpoint],
        queryFn: ({ signal }) => get(endpoint, 'get_plugin_data',{}, signal),
        enabled: endpoint !== '',
        staleTime: 1000 * 60 * 5
    });


    useEffect(() => {
        console.log('QUERY handshake', query);
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
            setServerVersion(query.data.version || []);

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

    useEffect(() => {
        console.log('QUERY OPTIONS', queryOptions);
        if (queryOptions.data) {
            console.log('QUERY OPTIONS - success');
            console.log(queryOptions.data);
            setAllowedOptions(queryOptions.data.options);
        }
    }, [queryOptions.data])

    useEffect(() => {
        console.log('QUERY Plugins', queryPlugins);
        if (queryPlugins.isSuccess) {
            console.log('QUERY Plugins - success');
            if (queryPlugins.data) {
                console.log(queryPlugins.data);
                setPlugins(queryPlugins.data);
            }
        } else {
            setPlugins(undefined);
        }
    }, [queryPlugins.data])
 
    return (
        <>
            <ThemeSwitch />
            <EndpointField />
            <LangUnit />
            <ModelUnit />
            <PluginManager />
            <RenderOptionsForm />
            <AdvancedOptions />
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
    const [serverVersion, setServerVersion] = useState([]);
    const [boxModel, setBoxModel] = useState('');
    const [ocrModel, setOcrModel] = useState('');
    const [tslModel, setTslModel] = useState('');
    const [boxModels, setBoxModels] = useState([]);
    const [ocrModels, setOcrModels] = useState([]);
    const [tslModels, setTslModels] = useState([]);
    const [successEndpoint, setSuccessEndpoint] = useState(null);
    const [showTranslated, setShowTranslated] = useState();
    const [orientation, setOrientation] = useState();
    const [allowedOptions, setAllowedOptions] = useState(undefined);
    const [selectedOptions, setSelectedOptions] = useState(undefined);
    const [plugins, setPlugins] = useState({});

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
        browser.storage.local.get('selectedOptions').then((response) => {
            setSelectedOptions(response.selectedOptions || {});
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
        if (selectedOptions !== undefined) {
            browser.runtime.sendMessage({
                type: 'set-selected-options',
                options: selectedOptions
            })
        }
    }, [selectedOptions])

    useEffect(() => {
        if (showTranslated !== undefined) {
            browser.runtime.sendMessage({
                type: 'set-show-text',
                active: showTranslated,
                orientation: orientation,
            })
        }
    }, [showTranslated, orientation])

    useEffect(() => {
        console.log('useEffect - selectedOptions');
        console.log(selectedOptions);
    }, [selectedOptions])

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
        allowedOptions: allowedOptions, setAllowedOptions: setAllowedOptions,
        selectedOptions: selectedOptions, setSelectedOptions: setSelectedOptions,
        plugins: plugins, setPlugins: setPlugins,
        serverVersion: serverVersion, setServerVersion: setServerVersion,
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
