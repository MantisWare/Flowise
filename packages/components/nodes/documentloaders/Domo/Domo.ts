import axios from 'axios'
import { omit } from 'lodash'
import { Document } from '@langchain/core/documents'
import { TextSplitter } from 'langchain/text_splitter'
import { BaseDocumentLoader } from 'langchain/document_loaders/base'
import { getCredentialData, getCredentialParam } from '../../../src/utils'
import { IDocument, ICommonObject, INode, INodeData, INodeParams, INodeOutputsValue } from '../../../src/Interface'
import { handleEscapeCharacters } from '../../../src'

class DomoDocumentLoaders implements INode {
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
        this.label = 'Domo Dataset'
        this.name = 'domo'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'domo.svg'
        this.category = 'Document Loaders'
        this.description = 'Load data from Domo datasets using SQL queries or direct dataset access'
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
                label: 'Query Type',
                name: 'queryType',
                type: 'options',
                options: [
                    { label: 'Direct Dataset', name: 'dataset' },
                    { label: 'SQL Query', name: 'sql' }
                ],
                default: 'dataset'
            },
            {
                label: 'Dataset ID',
                name: 'datasetId',
                type: 'string',
                placeholder: 'dataset-id-or-name',
                description: 'The ID or name of the Domo dataset to query'
            },
            {
                label: 'SQL Query',
                name: 'sqlQuery',
                type: 'string',
                rows: 4,
                placeholder: 'SELECT * FROM table LIMIT 100',
                description: 'SQL query to execute against the dataset',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Limit',
                name: 'limit',
                type: 'number',
                default: 100,
                optional: true,
                additionalParams: true,
                description: 'Maximum number of records to return'
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
        const queryType = nodeData.inputs?.queryType as string
        const datasetId = nodeData.inputs?.datasetId as string
        const sqlQuery = nodeData.inputs?.sqlQuery as string
        const limit = nodeData.inputs?.limit as number
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

        if (!datasetId) {
            throw new Error('Dataset ID must be provided.')
        }

        const domoOptions: DomoLoaderParams = {
            datasetId,
            queryType,
            sqlQuery,
            limit: limit ?? 100,
            clientId,
            clientSecret,
            scope
        }

        const loader = new DomoLoader(domoOptions)

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

interface DomoLoaderParams {
    datasetId: string
    queryType: string
    sqlQuery?: string
    limit: number
    clientId: string
    clientSecret: string
    scope: string
}

interface DomoTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
}

interface DomoDatasetResponse {
    rows: any[][]
    columns: string[]
}

class DomoLoader extends BaseDocumentLoader {
    public readonly datasetId: string
    public readonly queryType: string
    public readonly sqlQuery?: string
    public readonly limit: number
    public readonly clientId: string
    public readonly clientSecret: string
    public readonly scope: string
    private accessToken?: string

    constructor({ datasetId, queryType, sqlQuery, limit, clientId, clientSecret, scope }: DomoLoaderParams) {
        super()
        this.datasetId = datasetId
        this.queryType = queryType
        this.sqlQuery = sqlQuery
        this.limit = limit
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.scope = scope
    }

    public async load(): Promise<IDocument[]> {
        await this.authenticate()
        return this.queryData()
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

            const tokenData: DomoTokenResponse = response.data
            this.accessToken = tokenData.access_token
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to authenticate with Domo API: ${error.message}, status: ${error.response?.status}`)
            } else {
                throw new Error(`Failed to authenticate with Domo API: ${error}`)
            }
        }
    }

    private async queryData(): Promise<IDocument[]> {
        if (!this.accessToken) {
            throw new Error('Access token not available. Authentication may have failed.')
        }

        try {
            let response: any

            if (this.queryType === 'sql' && this.sqlQuery) {
                // Execute SQL query
                response = await axios.post(
                    'https://api.domo.com/v1/datasets/query/execute',
                    {
                        sql: this.sqlQuery,
                        limit: this.limit
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            } else {
                // Direct dataset access
                response = await axios.get(`https://api.domo.com/v1/datasets/${this.datasetId}/data?limit=${this.limit}`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            }

            const data: DomoDatasetResponse = response.data
            return this.createDocumentsFromData(data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to query Domo dataset: ${error.message}, status: ${error.response?.status}`)
            } else {
                throw new Error(`Failed to query Domo dataset: ${error}`)
            }
        }
    }

    private createDocumentsFromData(data: DomoDatasetResponse): IDocument[] {
        const documents: IDocument[] = []

        if (data.rows && data.rows.length > 0) {
            // Create a document for each row
            data.rows.forEach((row, index) => {
                const rowData: any = {}
                data.columns.forEach((column, colIndex) => {
                    rowData[column] = row[colIndex]
                })

                const document = new Document({
                    pageContent: JSON.stringify(rowData, null, 2),
                    metadata: {
                        datasetId: this.datasetId,
                        rowIndex: index,
                        columns: data.columns,
                        queryType: this.queryType,
                        timestamp: new Date().toISOString()
                    }
                })

                documents.push(document)
            })
        } else {
            // If no rows, create a single document with the dataset info
            const document = new Document({
                pageContent: `Dataset ${this.datasetId} is empty or no data found.`,
                metadata: {
                    datasetId: this.datasetId,
                    queryType: this.queryType,
                    timestamp: new Date().toISOString()
                }
            })

            documents.push(document)
        }

        return documents
    }
}

module.exports = {
    nodeClass: DomoDocumentLoaders
}
