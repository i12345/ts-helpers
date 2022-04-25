import { makeSmartArray, SmartArray, SmartArray_Handlers_Add, SmartArray_Handlers_Remove, SmartArray_RealMethods_Push, SmartArray_RealMethods_Splice } from "./smart-array"

export const FilterableArray_filters = Symbol()
export const FilterableArray_makeFilter = Symbol()
export const FilteredArray_filterType = Symbol()

export type FilteredArray_FilterType<R = any> = Function & { new(): R }

export interface FilterableArray<T> extends SmartArray<T> {
    [FilterableArray_filters]: FilteredArray<T, any>[]
    [FilterableArray_makeFilter]<R extends T>(filter: Object): FilteredArray<T, R>
}

export interface FilteredArray<T, R extends T> extends SmartArray<R> {
    [FilteredArray_filterType]: FilteredArray_FilterType<R>
}

function filterArrayByType<T, R extends T>(array: T[], type: FilteredArray_FilterType<R>): R[] {
    return <R[]>array.filter(item => item instanceof type)
}

/**
 * Converts an array into a filterable array if it wasn't already one.
 * @param array the array to convert into a filterable array
 */
 export function makeFilterableArray<T>(array: T[]): FilterableArray<T> {
    let filterable = <FilterableArray<T>>array
    
    if(filterable[FilterableArray_makeFilter]) {
        return filterable
    }

    Object.defineProperty(
        filterable,
        FilterableArray_makeFilter, {
            enumerable: false,
            writable: false,
            configurable: false,
            value: (filterType: FilteredArray_FilterType) => makeFilter(filterable, filterType)
        })

    Object.defineProperty(
        filterable,
        FilterableArray_filters, {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
        })

    filterable[SmartArray_Handlers_Add].push((index, ...items) => {
            filterable[FilterableArray_filters].forEach(filteredArray =>
                    filteredArray[SmartArray_RealMethods_Push](
                            ...filterArrayByType(items, filteredArray[FilteredArray_filterType])
                        )
                )
        })

    filterable[SmartArray_Handlers_Remove].push((index, ...items) => {
            filterable[FilterableArray_filters].forEach(filteredArray => {
                    for(let i = filteredArray.length; i >= 0; i--) {
                        if(items.includes(filteredArray[i])) {
                            filteredArray[SmartArray_RealMethods_Splice](i, 1)
                        }
                    }
                })
        })

    return filterable
}

export function makeFilter<T, R extends T>(
        array: T[],
        filterType: FilteredArray_FilterType<R>
    ): FilteredArray<T, R> {
    const filterable = makeFilterableArray(array)

    const filteredArray = <FilteredArray<T, R>>makeSmartArray(filterArrayByType(array, filterType))

    Object.defineProperty(
        filteredArray,
        FilteredArray_filterType, {
            enumerable: false,
            writable: false,
            value: filterType
        })

    filteredArray[SmartArray_Handlers_Add].push((index, ...items) => {
        const bestInsertIndex =
            (index == 0) ? 0 :
            (filterable.indexOf(filteredArray[index]) + 1)

        filterable[SmartArray_RealMethods_Splice](bestInsertIndex, 0, ...items)
    })

    filteredArray[SmartArray_Handlers_Remove].push((index, ...items) => {
            let earliestFilterableIndex = 0
            for(let i = 0; i < items.length; i++) {
                let filterableIndex = filterable.indexOf(items[i], earliestFilterableIndex)

                filterable[SmartArray_RealMethods_Splice](filterableIndex, 1)

                earliestFilterableIndex = filterableIndex
            }
        })

    filterable[FilterableArray_filters].push(filteredArray)

    return filteredArray
}