import axios from 'axios'
import { omit } from 'lodash'
import { Document } from '@langchain/core/documents'
import { TextSplitter } from 'langchain/text_splitter'
import { BaseDocumentLoader } from 'langchain/document_loaders/base'
import { getCredentialData, getCredentialParam } from '../../../src/utils'
import { IDocument, ICommonObject, INode, INodeData, INodeParams, INodeOutputsValue } from '../../../src/Interface'
import { handleEscapeCharacters } from '../../../src'

class AppDBDocumentLoaders implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'AppDB Collection'
        this.name = 'appdb'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'appdb.svg'
        this.category = 'Document Loaders'
        this.description = "Load data from AppDB collections (Domo's NoSQL database)"
        this.baseClasses = [this.type]
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['domoApi']
        }
        this.inputs = [
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: 'Collection Name',
                name: 'collectionName',
                type: 'string',
                placeholder: 'my-collection',
                description: 'Name of the AppDB collection to query'
            },
            {
                label: 'Query Filter',
                name: 'queryFilter',
                type: 'json',
                optional: true,
                placeholder: '{"status": "active", "category": "important"}',
                description: 'JSON filter to apply to the collection query'
            },
            {
                label: 'Limit',
                name: 'limit',
                type: 'number',
                default: 100,
                optional: true,
                description: 'Maximum number of documents to return'
            },
            {
                label: 'Sort Field',
                name: 'sortField',
                type: 'string',
                optional: true,
                placeholder: 'createdAt',
                description: 'Field to sort by (optional)'
            },
            {
                label: 'Sort Order',
                name: 'sortOrder',
                type: 'options',
                options: [
                    { label: 'Ascending', name: 'asc' },
                    { label: 'Descending', name: 'desc' }
                ],
                default: 'desc',
                optional: true,
                description: 'Sort order for the results'
            },
            {
                label: 'Additional Metadata',
                name: 'metadata',
                type: 'json',
                description: 'Additional metadata to be added to the extracted documents',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Omit Metadata Keys',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 4,
                description:
                    'Each document loader comes with a default set of metadata keys that are extracted from the document. You can use this field to omit some of the default metadata keys. The value should be a list of keys, seperated by comma. Use * to omit all metadata keys execept the ones you specify in the Additional Metadata field',
                placeholder: 'key1, key2, key3.nestedKey1',
                optional: true,
                additionalParams: true
            }
        ]
        this.outputs = [
            {
                label: 'Document',
                name: 'document',
                description: 'Array of document objects containing metadata and pageContent',
                baseClasses: [...this.baseClasses, 'json']
            },
            {
                label: 'Text',
                name: 'text',
                description: 'Concatenated string from pageContent of documents',
                baseClasses: ['string', 'json']
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const collectionName = nodeData.inputs?.collectionName as string
        const queryFilter = nodeData.inputs?.queryFilter as string
        const limit = nodeData.inputs?.limit as number
        const sortField = nodeData.inputs?.sortField as string
        const sortOrder = nodeData.inputs?.sortOrder as string
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata
        const _omitMetadataKeys = nodeData.inputs?.omitMetadataKeys as string

        let omitMetadataKeys: string[] = []
        if (_omitMetadataKeys) {
            omitMetadataKeys = _omitMetadataKeys.split(',').map((key) => key.trim())
        }

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const clientId = getCredentialParam('domoClientId', credentialData, nodeData)
        const clientSecret = getCredentialParam('domoClientSecret', credentialData, nodeData)
        const scope = getCredentialParam('domoScope', credentialData, nodeData) ?? 'data'

        if (!collectionName) {
            throw new Error('Collection name must be provided.')
        }

        const appdbOptions: AppDBLoaderParams = {
            collectionName,
            queryFilter: queryFilter ? JSON.parse(queryFilter) : undefined,
            limit: limit ?? 100,
            sortField,
            sortOrder: sortOrder ?? 'desc',
            clientId,
            clientSecret,
            scope
        }

        const loader = new AppDBLoader(appdbOptions)

        let docs: IDocument[] = []

        if (textSplitter) {
            docs = await loader.load()
            docs = await textSplitter.splitDocuments(docs)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {
                              ...parsedMetadata
                          }
                        : omit(
                              {
                                  ...doc.metadata,
                                  ...parsedMetadata
                              },
                              omitMetadataKeys
                          )
            }))
        } else {
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {}
                        : omit(
                              {
                                  ...doc.metadata
                              },
                              omitMetadataKeys
                          )
            }))
        }

        const output = nodeData.outputs?.output as string

        if (output === 'text') {
            let finalText = ''
            for (const doc of docs) {
                finalText += `${doc.pageContent}\n`
            }
            return handleEscapeCharacters(finalText, false)
        }

        return docs
    }
}

interface AppDBLoaderParams {
    collectionName: string
    queryFilter?: any
    limit: number
    sortField?: string
    sortOrder: string
    clientId: string
    clientSecret: string
    scope: string
}

interface AppDBTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
}

interface AppDBDocument {
    _id: string
    [key: string]: any
}

interface AppDBResponse {
    documents: AppDBDocument[]
    total: number
    hasMore: boolean
}

class AppDBLoader extends BaseDocumentLoader {
    public readonly collectionName: string
    public readonly queryFilter?: any
    public readonly limit: number
    public readonly sortField?: string
    public readonly sortOrder: string
    public readonly clientId: string
    public readonly clientSecret: string
    public readonly scope: string
    private accessToken?: string

    constructor({ collectionName, queryFilter, limit, sortField, sortOrder, clientId, clientSecret, scope }: AppDBLoaderParams) {
        super()
        this.collectionName = collectionName
        this.queryFilter = queryFilter
        this.limit = limit
        this.sortField = sortField
        this.sortOrder = sortOrder
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.scope = scope
    }

    public async load(): Promise<IDocument[]> {
        await this.authenticate()
        return this.queryCollection()
    }

    private async authenticate(): Promise<void> {
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
            const response = await axios.post('https://api.domo.com/oauth/token', `grant_type=client_credentials&scope=${this.scope}`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const tokenData: AppDBTokenResponse = response.data
            this.accessToken = tokenData.access_token
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to authenticate with Domo API: ${error.message}, status: ${error.response?.status}`)
            } else {
                throw new Error(`Failed to authenticate with Domo API: ${error}`)
            }
        }
    }

    private async queryCollection(): Promise<IDocument[]> {
        if (!this.accessToken) {
            throw new Error('Access token not available. Authentication may have failed.')
        }

        try {
            // Build query parameters
            const queryParams: any = {
                limit: this.limit
            }

            if (this.queryFilter) {
                queryParams.filter = JSON.stringify(this.queryFilter)
            }

            if (this.sortField) {
                queryParams.sort = `${this.sortField}:${this.sortOrder}`
            }

            const response = await axios.get(`https://api.domo.com/v1/appdb/collections/${this.collectionName}/documents`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: queryParams
            })

            const data: AppDBResponse = response.data
            return this.createDocumentsFromData(data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to query AppDB collection: ${error.message}, status: ${error.response?.status}`)
            } else {
                throw new Error(`Failed to query AppDB collection: ${error}`)
            }
        }
    }

    private createDocumentsFromData(data: AppDBResponse): IDocument[] {
        const documents: IDocument[] = []

        if (data.documents && data.documents.length > 0) {
            data.documents.forEach((doc, index) => {
                // Remove the _id field from the document content for cleaner output
                const { _id, ...documentContent } = doc

                const document = new Document({
                    pageContent: JSON.stringify(documentContent, null, 2),
                    metadata: {
                        collectionName: this.collectionName,
                        documentId: _id,
                        documentIndex: index,
                        totalDocuments: data.total,
                        hasMore: data.hasMore,
                        timestamp: new Date().toISOString()
                    }
                })

                documents.push(document)
            })
        } else {
            // If no documents, create a single document with collection info
            const document = new Document({
                pageContent: `Collection '${this.collectionName}' is empty or no documents found.`,
                metadata: {
                    collectionName: this.collectionName,
                    totalDocuments: 0,
                    timestamp: new Date().toISOString()
                }
            })

            documents.push(document)
        }

        return documents
    }
}

module.exports = {
    nodeClass: AppDBDocumentLoaders
}
