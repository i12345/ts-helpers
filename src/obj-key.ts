export type ObjKey<
        T extends object = { [key: PropertyKey]: any },
        K extends keyof T = keyof T
    > = {
        obj: T
        key: K
    }