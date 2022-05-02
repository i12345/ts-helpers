export type ObjKey<
        T extends Object = { [key: PropertyKey]: any },
        K extends keyof T = keyof T
    > = {
        obj: T
        key: K
    }