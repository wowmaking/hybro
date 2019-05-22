declare module "hybro" {

    export function invoke(pckg: string, mdl: string, method: string, params: []): Promise<any>

    export function addEventListener(pckg: string, mdl: string, evnt: string, listener: Function | EventListener): Promise<void>

    export function removeEventListener(pckg: string, mdl: string, evnt: string, listener: Function | EventListener): Promise<void>

}
