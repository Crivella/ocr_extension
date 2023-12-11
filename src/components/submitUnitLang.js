import React, { useContext, useEffect, useState } from "react";

import { GlobalContext } from "./context";
import { SelectField } from "./fields";
import { SubmitUnit } from "./submitUnit";

const MaxLangField = 25;

/*
Field for the list of available source languages.
*/
function LanguageSrcSelect({ success = null }) {
    const { langChoices, langSrc, setLangSrc, langChoicesHR } = useContext(GlobalContext);

    return <SelectField
        label="Source Language"
        name="lang-src"
        options={langChoices}
        option_names={langChoicesHR.map((e) => e.length > MaxLangField ? e.slice(0, MaxLangField-3) + '...' : e)}
        value={langSrc}
        setValue={setLangSrc}
        success={success} />
}

/*
Field for the list of available destination languages.
*/
function LanguageDstSelect({ success = null }) {
    const { langChoices, langDst, setLangDst, langChoicesHR } = useContext(GlobalContext);
    
    return <SelectField
        label="Destination Language"
        name="lang-dst"
        options={langChoices}
        option_names={langChoicesHR.map((e) => e.length > MaxLangField ? e.slice(0, MaxLangField-3) + '...' : e)}
        value={langDst}
        setValue={setLangDst}
        success={success} />
}


/*
React component to draw the form for the language selection.
*/
export function LangUnit() {
    const [data, setData] = useState({});
    const { endpoint, langSrc, langDst } = useContext(GlobalContext);

    useEffect(() => {
        setData({
            lang_src: langSrc,
            lang_dst: langDst,
        })
    }, [langSrc, langDst])

    return (
        <SubmitUnit target="set_lang" data={data} endpoint={endpoint}>
            <LanguageSrcSelect />
            <LanguageDstSelect />
        </SubmitUnit>
    )
}