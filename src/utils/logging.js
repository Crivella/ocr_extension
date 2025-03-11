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
/*
    This file contains utility functions for logging.
*/


var LOG_LEVEL = 30;

export const DEFAULT_LOG_LEVEL = 30;

export const LOG_LEVELS = {
    'DEBUG': 10,
    'INFO': 20,
    'WARNING': 30,
    'ERROR': 40,
    'CRITICAL': 50,
    'NONE': 100,
}

export function setLogLevel(level) {
    console.log('setLogLevel', LOG_LEVEL, level);
    LOG_LEVEL = level;
}

export function getLogLevel() {
    return LOG_LEVEL;
}

function log(level, ...args) {
    console.log('log', level, getLogLevel());
    if (level >= LOG_LEVEL) {
        console.log(...args);
    }
}

export function debug(...args) {
    // Add a timestamp and LOG_LEVEL to the msg 
    var msg = `${new Date().toISOString()} [   DEBUG] ${msg}`;
    log(10, msg, ...args);
}

export function info(...args) {
    var msg = `${new Date().toISOString()} [    INFO] ${msg}`;
    log(20, msg, ...args);
}

export function warning(...args) {
    var msg = `${new Date().toISOString()} [ WARNING] ${msg}`;
    log(30, msg, ...args);
}

export function error(...args) {
    var msg = `${new Date().toISOString()} [   ERROR] ${msg}`;
    log(40, msg, ...args);
}

export function critical(...args) {
    var msg = `${new Date().toISOString()} [CRITICAL] ${msg}`;
    log(50, msg, ...args);
}

