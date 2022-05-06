export function getTypeof<T>(o: T) {
    return typeof o
}

export type TypeofType = ReturnType<typeof getTypeof>