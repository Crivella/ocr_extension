import React, { useContext, useEffect, useState } from "react";

import { GlobalContext } from "./context";
import { SelectField } from "./fields";
import { SubmitUnit } from "./submitUnit";

/*
Field for the list of available box models.
*/
function BOXModelSelect({ success = null }) {
    const { boxModels, boxModel, setBoxModel } = useContext(GlobalContext);

    return <SelectField 
        label="BOX Model" 
        name="box-model" 
        options={boxModels}
        option_names={boxModels}
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
        option_names={ocrModels} 
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
        option_names={tslModels}
        value={tslModel}
        setValue={setTslModel}
        success={success} />
}

/*
React component to draw the form for the model selection.
*/
export function ModelUnit() {
    const [data, setData] = useState({}); 
    const { endpoint, boxModel, ocrModel, tslModel } = useContext(GlobalContext);
    
    useEffect(() => {
        setData({
            box_model_id: boxModel,
            ocr_model_id: ocrModel,
            tsl_model_id: tslModel,
        })
    }, [boxModel, ocrModel, tslModel])

    return (
        <SubmitUnit target="set_models" data={data} endpoint={endpoint}>
            <BOXModelSelect />
            <OCRModelSelect />
            <TSLModelSelect />
        </SubmitUnit>   
    )
}