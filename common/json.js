export function stringify(obj) {
    return JSON.stringify(obj, function (key, value) {
        if (value === undefined) {
            return '___UNDEFINED___';
        }
        return value;
    });
}

export function parse(str) {
    return JSON.parse(str, function (key, value) {
        if (value === '___UNDEFINED___') {
            return undefined;
        }
        return value;
    });
} 