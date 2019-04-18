export function stringify(obj) {
    if (obj === undefined) {
        return '___UNDEFINED___';
    }
    return JSON.stringify(obj, function (key, value) {
        if (value === undefined) {
            return '___UNDEFINED___';
        }
        return value;
    });
}

export function parse(str) {
    if (obj === '___UNDEFINED___') {
        return undefined;
    }
    return JSON.parse(str, function (key, value) {
        if (value === '___UNDEFINED___') {
            return undefined;
        }
        return value;
    });
} 