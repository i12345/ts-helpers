export type ObjKey<
        T = any,
        K extends keyof T = keyof T
    > = {
        obj: T
        key: K
    }