export class TypeRegistry<T> {
    private _map = new Map<Function, T>()
    /**
     * More specialized types are put later in the _searchTypes array.
     */
    private _searchTypes: Function[] = []

    private _literalMap = new Map<string, T>()

    register(type: string | Function, value: T): void {
        if(typeof type == 'string') {
            this.registerLiteral(type, value)
        }
        else {
            this.registerType(type, value)
        }
    }

    registerLiteral(type: string, value: T): void {
        this._literalMap.set(type, value)
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

    get(obj: any): T {
        const literalValue = this._literalMap.get(typeof obj)
        if(literalValue !== undefined) {
            return literalValue
        }
        
        for(let i = this._searchTypes.length - 1; i >= 0; i--) {
            let type = this._searchTypes[i]

            if(obj instanceof type) {
                return this._map.get(type)!
            }
        }

        throw new Error("Type / suitable supertype not registered")
    }
}