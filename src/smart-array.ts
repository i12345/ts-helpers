export const SmartArray_Handlers_Add = Symbol()
export const SmartArray_Handlers_Remove = Symbol()

export const SmartArray_RealMethods_Push = Symbol()
export const SmartArray_RealMethods_Splice = Symbol()

export const SmartArray_Internal_Symbol = Symbol()

export interface SmartArray<T> extends Array<T> {
    [SmartArray_Handlers_Add]: ((index: number, ...items: T[]) => void)[]
    [SmartArray_Handlers_Remove]: ((index: number, ...items: T[]) => void)[]

    [SmartArray_RealMethods_Push]: Array<T>["push"]
    [SmartArray_RealMethods_Splice]: Array<T>["splice"]

    [SmartArray_Internal_Symbol]: Symbol
}

export function makeSmartArray<T>(array: T[]): SmartArray<T> {
    const smartArray = <SmartArray<T>>array
    if(smartArray[SmartArray_Internal_Symbol] === SmartArray_Internal_Symbol) {
        return smartArray
    }

    smartArray[SmartArray_Internal_Symbol] = SmartArray_Internal_Symbol

    Object.defineProperty(
            smartArray,
            SmartArray_Handlers_Add,
            {
                enumerable: false,
                value: []
            }
        )

    Object.defineProperty(
            smartArray,
            SmartArray_Handlers_Remove,
            {
                enumerable: false,
                value: []
            }
        )
    
    Object.defineProperty(
        smartArray,
        SmartArray_RealMethods_Push,
        {
            enumerable: false,
            configurable: false,
            writable: false,
            value: smartArray.push
        }
    )
    
    Object.defineProperty(
        smartArray,
        "push", {
            enumerable: false,
            writable: false,
            value: (...items: T[]) => {
                const newLength = smartArray[SmartArray_RealMethods_Push](...items)
                const index = newLength - items.length

                smartArray[SmartArray_Handlers_Add].forEach(handler => handler(index, ...items))

                return newLength
            }
        })

    Object.defineProperty(
            smartArray,
            SmartArray_RealMethods_Splice,
            {
                enumerable: false,
                configurable: false,
                writable: false,
                value: smartArray.splice
            }
        )

    Object.defineProperty(
        smartArray,
        "splice", {
            enumerable: false,
            writable: false,
            value: (start: number, deleteCount?: number, ...items: T[]) => {
                const spliced = smartArray[SmartArray_RealMethods_Splice](start, deleteCount ?? 0, ...items)

                smartArray[SmartArray_Handlers_Remove].forEach(handler => handler(start, ...items))

                return spliced
            }
        })

    Object.defineProperty(
        smartArray,
        "pop", {
            enumerable: false,
            writable: false,
            value: () => {
                return smartArray.length > 0 ?
                    smartArray.splice(0, smartArray.length - 1)[0] :
                    undefined
            }
        })

    Object.defineProperty(
        smartArray,
        "shift", {
            enumerable: false,
            writable: false,
            value: () => {
                const [firstItem] = smartArray.splice(0, 1)
                return firstItem
            }
        })

    Object.defineProperty(
        smartArray,
        "unshift", {
            enumerable: false,
            writable: false,
            value: (...items: T[]) => {
                smartArray.splice(0, 0, ...items)
                return smartArray.length
            }
        })

    return smartArray
}