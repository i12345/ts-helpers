import { filterItems_IncludeExcludeListOrNone, IncludeExcludeListOrNone } from "./include-exclude-list-or-none"

export namespace GenericObjects {
    export function fromEntries<K, V>(
            entries: [keyof K, V][]
        ): { [key in keyof K]: V } {
        return <{ [key in keyof K]: V }>Object.fromEntries(entries)
    }

    export function getEntryOrDefaultAll<K, V>(
            objOrAll: { [key in keyof K]: V } | V,
            key: keyof K,
            all?: any
        ): V {
        if(key === all) {
            return <V>objOrAll
        }

        const obj = <{ [key in keyof K]: V }>objOrAll

        return obj[key] ?? <V>objOrAll
    }

    export function filterFromObject<
            FilterType extends { [K in keyof FilterType]: ObjType[K] },
            ObjType extends FilterType
        >(
            obj: ObjType,
            filterKeys: (keyof FilterType)[]
        ): FilterType {
        return <FilterType>
            GenericObjects.fromEntries(
                    filterKeys.map(
                            subProp =>
                                [subProp, obj[subProp]]
                        )
                )
    }

    export function getKeys<T>(
            obj: T,
            filter?: IncludeExcludeListOrNone<keyof T>
        ): (keyof T)[] {
        const keys = <(keyof T)[]>[
                ...Object.getOwnPropertyNames(obj),
                ...Object.getOwnPropertySymbols(obj)
            ]

        return filter ?
            filterItems_IncludeExcludeListOrNone(keys, filter) :
            keys
    }
}