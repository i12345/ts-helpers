import { PropertyPathTreeNode, ReferencePathTreeNode } from "./reference-paths"

export class ObjectGraphUtils {
    /**
     * Mutates an object graph into a JSON object that can be converted back
     * into an object graph by `ObjectGraphUtils.graphify()`.
     * @param graph the graph to mutate into a json object
     * @returns the JSON object
     */
    public static jsonify(graph: object): object {
        let objMap = new Map<object, {
                id: number,
                refCount: number,
                primaryPath: ReferencePathTreeNode,
            }>()

        // change structure
        ObjectGraphUtils.jsonify_recurse('root', graph, objMap)

        // render json objects
        for(const [obj, referenceProperties] of objMap.entries()) {
            if(referenceProperties.refCount == 1) {
                objMap.delete(obj)
            }
        }

        let objMap_json: { [id: number]: string } = {}
        for(const referenceObj of objMap.values()) {
            objMap_json[referenceObj.id] = referenceObj.primaryPath.toString()
        }

        return ({
                [ObjectGraphUtils.JSON_CONSTANTS_KEYS_ROOT]: graph,
                [ObjectGraphUtils.JSON_CONSTANTS_KEYS_OBJMAP]: objMap_json
            })
    }

    static jsonify_recurse(
            objPath: ReferencePathTreeNode,
            obj: any,
            objMap: Map<object, {
                    id: number,
                    refCount: number,
                    primaryPath: ReferencePathTreeNode,
                }>
        ): void {
        objMap.set(obj, {
            id: objMap.size,
            primaryPath: objPath,
            refCount: 1
        })

        for(const property of Object.getOwnPropertyNames(obj)) {
            const propertyValue = obj[property]
            
            if(typeof propertyValue == 'string') {
                if(propertyValue.startsWith(ObjectGraphUtils.JSON_CONSTANTS_PREFIXES_ID)) {
                    obj[property] = ObjectGraphUtils.JSON_CONSTANTS_PREFIXES_STRING_NOT_ID + propertyValue
                }
            }
            else if(typeof propertyValue == 'object') {
                let transformedObj = objMap.get(propertyValue)
                if(transformedObj !== undefined) {
                    obj[property] = ObjectGraphUtils.JSON_CONSTANTS_PREFIXES_ID + (transformedObj.id)
                    transformedObj.refCount++
                }
                else {
                    this.jsonify_recurse(
                            new PropertyPathTreeNode(
                                    objPath,
                                    property
                                ),
                            propertyValue,
                            objMap
                        )
                }
            }
        }
    }

    /**
     * Mutates a JSON object into an object graph.
     * @param json the json object to mutate into a graph
     */
    public static graphify(json: any): object {
        let {
            [ObjectGraphUtils.JSON_CONSTANTS_KEYS_ROOT]: root,
            [ObjectGraphUtils.JSON_CONSTANTS_KEYS_OBJMAP]: objMap_json
        }: {
            [ObjectGraphUtils.JSON_CONSTANTS_KEYS_ROOT]: any,
            [ObjectGraphUtils.JSON_CONSTANTS_KEYS_OBJMAP]: { [id: number]: string }
        } = json

        let finalFillIn: {
                pathToFillIn: PropertyPathTreeNode,
                value_referencedObjID: number
            }[] = []

        this.graphify_recurse(
                root,
                'root',
                finalFillIn,
                new Set()
            )

        const objMap = new Map<number, object>()
        for(const { pathToFillIn, value_referencedObjID } of finalFillIn) {
            let value_referencedObj = objMap.get(value_referencedObjID)
            if(value_referencedObj === undefined) {
                const value_path = PropertyPathTreeNode.parse(objMap_json[value_referencedObjID])
                value_referencedObj = PropertyPathTreeNode.getValue(root, value_path)
                objMap.set(value_referencedObjID, value_referencedObj!)
            }

            PropertyPathTreeNode.setValue(
                    root,
                    pathToFillIn,
                    value_referencedObj!
                )
        }

        return root
    }

    private static graphify_recurse(
            obj: any,
            currentPath: ReferencePathTreeNode,
            finalFillIn: {
                pathToFillIn: PropertyPathTreeNode,
                value_referencedObjID: number
            }[],
            alreadyChecked: Set<object>
        ): void {
        if(alreadyChecked.has(obj)) {
            return
        }

        alreadyChecked.add(obj)

        for(const property of Object.keys(obj)) {
            let propertyValue = obj[property]
            let propertyPath = new PropertyPathTreeNode(currentPath, property)

            if(typeof propertyValue == 'string') {
                if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_STRING_NOT_ID)) {
                    obj[property] = propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_STRING_NOT_ID.length)
                }
                else if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_ID)) {
                    const referencedID = +(propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_ID.length))
                    
                    finalFillIn.push({
                            pathToFillIn: propertyPath,
                            value_referencedObjID: referencedID
                        })
                }
            }
            else if(typeof propertyValue == 'object') {
                this.graphify_recurse(
                        propertyValue,
                        propertyPath,
                        finalFillIn,
                        alreadyChecked
                    )
            }
        }
    }

    private static readonly JSON_CONSTANTS_KEYS_ROOT = 'root'
    private static readonly JSON_CONSTANTS_KEYS_OBJMAP = 'objects'
    private static readonly JSON_CONSTANTS_PREFIXES_ID = '#'
    private static readonly JSON_CONSTANTS_PREFIXES_STRING_NOT_ID = '##'
}