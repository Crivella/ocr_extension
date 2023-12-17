import React, { useContext } from "react";

import { CollapsableForm } from './collapsableForm';
import { GlobalContext } from "./context";
import { FontScaleField, RGBField } from "./fields";

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

export function RenderOptionsForm() {
    return (
        <CollapsableForm title={'Render options'}>
            <DisplayMode />
            <FontScaleField />
            <RGBField />
        </CollapsableForm>
    )
}