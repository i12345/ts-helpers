import { ObjKey } from "./obj-key"
import { ObjectGraphMap } from "./object-graph-map"
import { PropertyPathTreeNode, ReferencePathTreeNode } from "./reference-paths"

export class ObjectGraphUtils {
    /**
     * Converts an object graph into a JSON object that can be converted back
     * into an object graph by `ObjectGraphUtils.graphify()`. The object graph
     * is possibly mutated in the process.
     * @param graph the graph to convert into a json object
     * @returns the JSON object
     */
    public static jsonify(graph: object): object {
        let objMap = new Map<object, {
                id: number,
                refCount: number,
                primaryPath: ReferencePathTreeNode,
            }>()
            
        let graphContainer = { graph }

        // change structure
        ObjectGraphUtils.jsonify_recurse(
                'root',
                {
                    obj: graphContainer,
                    key: 'graph'
                },
                objMap
            )

        // render json objects
        for(const [obj, referenceProperties] of objMap.entries()) {
            if(referenceProperties.refCount == 1) {
                objMap.delete(obj)
            }
        }

        {
            let unescapedPathNodes = new Set<ReferencePathTreeNode>()
            unescapedPathNodes.add('root')

            let pathNodesToCheckUnescaping = new Set<PropertyPathTreeNode>()
            for(const { primaryPath } of objMap.values()) {
                if(primaryPath instanceof PropertyPathTreeNode) {
                    pathNodesToCheckUnescaping.add(primaryPath)
                }
            }

            for(const pathNode of pathNodesToCheckUnescaping) {
                if(!unescapedPathNodes.has(pathNode)) {
                    if(pathNode.property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX_ESCAPE)) {
                        pathNode.property = this.JSON_CONSTANTS_KEYS_PREFIX + pathNode.property.substring(this.JSON_CONSTANTS_KEYS_PREFIX_ESCAPE.length)
                    }

                    if(pathNode.parent != 'root') {
                        pathNodesToCheckUnescaping.add(pathNode.parent)
                    }

                    unescapedPathNodes.add(pathNode)
                }
            }
        }

        let objMap_json: { [id: number]: string } = {}
        for(const referenceObj of objMap.values()) {
            objMap_json[referenceObj.id] = referenceObj.primaryPath.toString()
        }

        return ({
                [ObjectGraphUtils.JSON_CONSTANTS_KEYS_ROOT]: graphContainer.graph,
                [ObjectGraphUtils.JSON_CONSTANTS_KEYS_OBJMAP]: objMap_json
            })
    }

    private static jsonify_recurse(
            objPath: ReferencePathTreeNode,
            node: ObjKey,
            objMap: ObjectGraphMap<{
                    id: number,
                    refCount: number,
                    primaryPath: ReferencePathTreeNode,
                }>
        ): void {
        let obj = node.obj[node.key]

        if(obj === null ||
            obj === undefined) {
            return
        }

        objMap.set(obj, {
                id: objMap.size,
                primaryPath: objPath,
                refCount: 1
            })

        if(obj instanceof Array) {
            let arr = obj
            obj = {}

            obj[this.JSON_CONSTANTS_KEYS_OBJTYPE] = this.JSON_CONSTANTS_OBJTYPE_ARRAY
            for(let i = 0; i < arr.length; i++) {
                obj[i.toString()] = arr[i]
            }

            obj[this.JSON_CONSTANTS_KEYS_LENGTH] = arr.length

            node.obj[node.key] = obj
        }
        else {
            let redeclaredObj: any = null
            for(const property of Object.keys(obj)) {
                if(property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX)) {
                    if(!redeclaredObj) { redeclaredObj = {} }

                    redeclaredObj[this.JSON_CONSTANTS_PREFIXES_ESCAPE + property.substring(this.JSON_CONSTANTS_KEYS_PREFIX.length)] = obj[property]
                }
            }

            if(redeclaredObj) {
                redeclaredObj = {
                    ...redeclaredObj,
                    ...Object.fromEntries(
                            Object.entries(obj)
                            .filter(
                                    ([property, value]) =>
                                        !property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX)
                                )
                        )
                }

                obj = redeclaredObj
                node.obj[node.key] = obj
            }
        }

        for(const property of Object.getOwnPropertyNames(obj)) {
            if(property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX)) {
                continue;
            }

            const propertyValue = obj[property]
            
            if(typeof propertyValue == 'string') {
                if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_ESCAPE)) {
                    obj[property] = this.JSON_CONSTANTS_PREFIXES_STRING + propertyValue
                }
            }
            else if(typeof propertyValue == 'symbol') {
                const symbolKey = Symbol.keyFor(propertyValue)
                if(symbolKey === undefined) {
                    throw new Error("cannot currently jsonify symbols not registered with global symbol registry")
                }

                obj[property] = this.JSON_CONSTANTS_PREFIXES_SYMBOL + symbolKey
            }
            else if(typeof propertyValue == 'undefined') {
                obj[property] = this.JSON_CONSTANTS_PREFIXES_UNDEFINED
            }
            else if(typeof propertyValue == 'object') {
                if(propertyValue instanceof Date) {
                    obj[property] = this.JSON_CONSTANTS_PREFIXES_DATE + propertyValue.getTime().toString()
                }
                else {
                    let transformedObj = objMap.get(propertyValue)
                    if(transformedObj !== undefined) {
                        obj[property] = this.JSON_CONSTANTS_PREFIXES_ID + (transformedObj.id)
                        transformedObj.refCount++
                    }
                    else {
                        this.jsonify_recurse(
                                new PropertyPathTreeNode(
                                        objPath,
                                        property
                                    ),
                                {
                                    obj: obj,
                                    key: property
                                },
                                objMap
                            )
                    }
                }
            }
        }
    }

    /**
     * Converts a JSON object into an object graph, possibly mutating it in the
     * process.
     * @param json the json object to convert into an object graph
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

        let rootGraphContainer = { graph: root }

        this.graphify_recurse(
                {
                    obj: rootGraphContainer,
                    key: 'graph'
                },
                'root',
                finalFillIn
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

        return rootGraphContainer.graph
    }

    private static graphify_recurse(
            node: ObjKey,
            currentPath: ReferencePathTreeNode,
            finalFillIn: {
                pathToFillIn: PropertyPathTreeNode,
                value_referencedObjID: number
            }[]
        ): void {
        let obj = node.obj[node.key]
        
        if(obj === null ||
            obj === undefined) {
            return
        }

        const type = obj[this.JSON_CONSTANTS_KEYS_OBJTYPE]
        if(type !== undefined) {
            switch(type) {
                case this.JSON_CONSTANTS_OBJTYPE_ARRAY:
                    {
                        let arr = new Array(+obj[this.JSON_CONSTANTS_KEYS_LENGTH])
                        for(let i = 0; i < arr.length; i++) {
                            arr[i] = obj[i]
                        }
                        obj = arr
                        node.obj[node.key] = arr
                    }
                    break;

                default:
                    throw new Error("unrecognized object type")
            }
        }

        let redeclaredObj: any = null
        for(const property of Object.keys(obj)) {
            if(property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX_ESCAPE)) {
                if(!redeclaredObj) { redeclaredObj = {} }

                redeclaredObj[property.substring(this.JSON_CONSTANTS_KEYS_PREFIX_ESCAPE.length)] = obj[property]
            }
        }

        if(redeclaredObj) {
            redeclaredObj = {
                ...redeclaredObj,
                ...Object.fromEntries(
                        Object.entries(obj)
                        .filter(
                                ([property, value]) =>
                                    !property.startsWith(this.JSON_CONSTANTS_KEYS_PREFIX)
                            )
                    )
            }

            obj = redeclaredObj
            node.obj[node.key] = obj
        }

        for(const property of Object.keys(obj)) {
            let propertyValue = obj[property]
            let propertyPath = new PropertyPathTreeNode(currentPath, property)

            if(typeof propertyValue == 'string') {
                if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_STRING)) {
                    obj[property] = propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_STRING.length)
                }
                else if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_SYMBOL)) {
                    obj[property] = Symbol.for(propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_SYMBOL.length))
                }
                else if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_UNDEFINED)) {
                    obj[property] = undefined
                }
                else if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_ID)) {
                    const referencedID = +(propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_ID.length))
                    
                    finalFillIn.push({
                            pathToFillIn: propertyPath,
                            value_referencedObjID: referencedID
                        })
                }
                else if(propertyValue.startsWith(this.JSON_CONSTANTS_PREFIXES_DATE)) {
                    obj[property] = new Date(+(propertyValue.substring(this.JSON_CONSTANTS_PREFIXES_DATE.length)))
                }
            }
            else if(typeof propertyValue == 'object') {
                this.graphify_recurse(
                        {
                            obj: obj,
                            key: property
                        },
                        propertyPath,
                        finalFillIn
                    )
            }
        }
    }

    private static readonly JSON_CONSTANTS_KEYS_ROOT = '_root'
    private static readonly JSON_CONSTANTS_KEYS_OBJMAP = '_objects'
    private static readonly JSON_CONSTANTS_KEYS_PREFIX = '_'
    private static readonly JSON_CONSTANTS_KEYS_PREFIX_ESCAPE = '__'
    private static readonly JSON_CONSTANTS_KEYS_OBJTYPE = '_type'
    private static readonly JSON_CONSTANTS_KEYS_LENGTH = '_length'
    private static readonly JSON_CONSTANTS_OBJTYPE_ARRAY = 'array'
    private static readonly JSON_CONSTANTS_OBJTYPE_SET = 'set'
    private static readonly JSON_CONSTANTS_OBJTYPE_MAP = 'map'
    private static readonly JSON_CONSTANTS_PREFIXES_ESCAPE = '#'
    private static readonly JSON_CONSTANTS_PREFIXES_ID = '#id:'
    private static readonly JSON_CONSTANTS_PREFIXES_STRING = '#str:'
    private static readonly JSON_CONSTANTS_PREFIXES_SYMBOL = '#sym:'
    private static readonly JSON_CONSTANTS_PREFIXES_UNDEFINED = '#undefined'
    private static readonly JSON_CONSTANTS_PREFIXES_DATE = '#date:'
}