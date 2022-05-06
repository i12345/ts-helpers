import { TypeofType } from "./typeof-type"

export class TypeRegistry<T> {
    private _map = new Map<Function, T>()
    /**
     * More specialized types are put later in the _searchTypes array.
     */
    private _searchTypes: Function[] = []

    private _literalMap = new Map<TypeofType, T>()

    types() {
        return [
                ...this._literalMap.keys(),
                ...this._map.keys()
            ]
    }

    values() {
        return [
                ...this._literalMap.values(),
                ...this._map.values()
            ]
    }

    entries(): [TypeofType | Function, T][] {
        return [
                ...this._literalMap.entries(),
                ...this._map.entries()
            ]
    }

    register(type: TypeofType | Function, value: T): void {
        if(typeof type == 'string') {
            this.registerLiteralType(type, value)
        }
        else {
            this.registerType(type, value)
        }
    }

    registerLiteralType(type: TypeofType, value: T): void {
        this._literalMap.set(type, value)
    }

    unregisterLiteralType(type: TypeofType): void {
        const unregistered = this._literalMap.delete(type)
        if(!unregistered) {
            throw new Error(`Literal type "${type}" was not registered.`)
        }
    }

    registerType<Type extends Function>(type: Type, value: T): void {
        this._map.set(type, value)

        // Insert right after the first already-registered type
        // that the new type is a subclass of.
        let insertIndex: number;
        for(insertIndex = this._searchTypes.length; insertIndex > 0; insertIndex--) {
            // (SubClass.prototype instanceof SuperClass) = true if those classes
            // are sub- and super- class of each other.
            
            if(type.prototype instanceof this._searchTypes[insertIndex - 1]) {
                break;
            }
        }

        this._searchTypes.splice(insertIndex, 0, type)
    }


    unregisterType<Type extends Function>(type: Type): void {
        const searchIndex = this._searchTypes.indexOf(type)
        const removed = this._map.delete(type)
        if(searchIndex < 0 || !removed) {
            throw new Error(`Type "${type}" was not registered.`)
        }

        this._searchTypes.splice(searchIndex, 1)
    }

    get(obj: any): T {
        if(typeof obj !== 'object') {
            const literalValue = this._literalMap.get(typeof obj)
            if(literalValue !== undefined) {
                return literalValue
            }

            throw new Error(`Entry for literal type "${typeof obj}" not registered.`)
        }
        else {
            for(let i = this._searchTypes.length - 1; i >= 0; i--) {
                let type = this._searchTypes[i]

                if(obj instanceof type) {
                    return this._map.get(type)!
                }
            }

            const literalValue = this._literalMap.get(typeof obj)
            if(literalValue !== undefined) {
                return literalValue
            }
            
            throw new Error(`Entry for type or supertype of ${obj} not registered.`)
        }
    }
}