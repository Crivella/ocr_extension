import React, { useEffect, useState } from "react";

/*
React component to switch the theme of the popup.
*/
export function ThemeSwitch() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        browser.storage.local.get().then((res) => {
            setTheme(res.popupTheme || 'dark');
        })
    }, [])

    useEffect(() => {
        ['link', 'body-bg', 'text-bg'].forEach((prop) => {
            document.documentElement.style.setProperty(`--theme-${prop}-color`, `var(--theme-${theme}-${prop}-color)`);
        })
        document.documentElement.style.setProperty('--theme-color', `var(--theme-${theme}-color)`);
    }, [theme])

    const onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        browser.storage.local.set({popupTheme: newTheme});
        setTheme(newTheme);
    }

    return (
        <div onClick={onClick}>
            <label class="theme-switch">
                <input type="checkbox" checked={theme === 'light'} />
                <span class="slider round"></span>
            </label>
        </div>
    )
}
