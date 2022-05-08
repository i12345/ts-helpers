
export type IncludeExcludeListOrNone<T> = (
        { include: T[] } |
        { exclude: T[] } |
        T[] |
        {}
    )

export function filterItems_IncludeExcludeListOrNone<T>(
        source: Iterable<T>,
        filter: IncludeExcludeListOrNone<T>
    ) {
    if(filter instanceof Array) {
        return filter
    }
    else if('include' in filter) {
        const sourceArray =
            (source instanceof Array) ?
                source : 
                Array.from(source)

        return sourceArray.filter(item => filter.include.includes(item))
    }
    else if('exclude' in filter) {
        const sourceArray =
            (source instanceof Array) ?
                source : 
                Array.from(source)

        return sourceArray.filter(item => !filter.exclude.includes(item))
    }
    else {
        return []
    }
}