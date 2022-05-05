export namespace GenericObjects {
    export function fromEntries<K, V>(entries: [keyof K, V][]): { [key in keyof K]: V } {
        return <{ [key in keyof K]: V }>Object.fromEntries(entries)
    }

    export function getEntryOrDefaultAll<K, V>(objOrAll: { [key in keyof K]: V } | V, key: keyof K, all?: any): V {
        if(key === all) {
            return <V>objOrAll
        }

        const obj = <{ [key in keyof K]: V }>objOrAll

        return obj[key] ?? <V>objOrAll
    }
}