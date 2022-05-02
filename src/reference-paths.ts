export type ReferencePathTreeNode = PropertyPathTreeNode | 'root'

export class PropertyPathTreeNode {
    constructor(
            public parent: ReferencePathTreeNode,
            public property: string
        ){}

    static getValue(root: any, path: ReferencePathTreeNode): any {
        let properties: string[] = []
        while(path !== 'root') {
            const propertyPathTreeNode = <PropertyPathTreeNode>path
            properties.push(propertyPathTreeNode.property)
            path = propertyPathTreeNode.parent
        }

        let value = root
        let property: string | undefined
        while((property = properties.pop()) !== undefined) {
            value = value[property]
        }
        
        return value
    }

    static setValue(root: any, path: PropertyPathTreeNode, value: any): void {
        let properties: string[] = []
        
        let reference = <ReferencePathTreeNode>path
        while(reference !== 'root') {
            const propertyPathTreeNode = <PropertyPathTreeNode>reference
            properties.push(propertyPathTreeNode.property)
            reference = propertyPathTreeNode.parent
        }

        let obj = root
        let property: string | undefined
        while((property = properties.pop()) !== undefined &&
            properties.length > 0) {
            obj = obj[property]
        }
        
        obj[property!] = value
    }

    static parse(path: string): ReferencePathTreeNode {
        const trimmed = path.trim()
        if(trimmed.length == 0) {
            return 'root'
        }
        else {
            return (
                trimmed
                    .split('.')
                    .reduce<ReferencePathTreeNode>(
                            (path, property) =>
                                new PropertyPathTreeNode(path, property),
                            'root'
                        )
                )
        }
    }

    toString() {
        return this.parent == 'root' ?
            this.property :
            `${this.parent}.${this.property}`
    }
}