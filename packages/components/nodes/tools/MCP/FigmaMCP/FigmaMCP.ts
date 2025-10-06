import { Tool } from '@langchain/core/tools'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../../src/Interface'
import { MCPToolkit } from '../core'

class FigmaMCP implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    documentation: string
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'Figma MCP'
        this.name = 'figmaMCP'
        this.version = 1.0
        this.type = 'Figma MCP Tool'
        this.icon = 'figma.svg'
        this.category = 'Tools (MCP)'
        this.description =
            'MCP server that connects to a local Figma MCP service - access and manipulate Figma files, components, and design assets'
        this.documentation = 'https://github.com/modelcontextprotocol/servers/tree/main/src/figma'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['figmaApi'],
            optional: true,
            description: 'Optional Figma API credentials (not required for local service)'
        }
        this.inputs = [
            {
                label: 'Service URL',
                name: 'serviceUrl',
                type: 'string',
                placeholder: 'http://127.0.0.1:3845/mcp',
                default: 'http://127.0.0.1:3845/mcp',
                description: 'URL of the local Figma MCP service'
            },
            {
                label: 'Transport Type',
                name: 'transportType',
                type: 'options',
                options: [
                    {
                        label: 'HTTP',
                        name: 'http'
                    },
                    {
                        label: 'SSE',
                        name: 'sse'
                    }
                ],
                default: 'http',
                description: 'Transport method for MCP communication'
            },
            {
                label: 'Available Actions',
                name: 'mcpActions',
                type: 'asyncMultiOptions',
                loadMethod: 'listActions',
                refresh: true
            }
        ]
        this.baseClasses = ['Tool']
    }

    //@ts-ignore
    loadMethods = {
        listActions: async (nodeData: INodeData, options: ICommonObject): Promise<INodeOptionsValue[]> => {
            try {
                const toolset = await this.getTools(nodeData, options)
                toolset.sort((a: any, b: any) => a.name.localeCompare(b.name))

                return toolset.map(({ name, ...rest }) => ({
                    label: name.toUpperCase(),
                    name: name,
                    description: rest.description ?? name
                }))
            } catch (error) {
                console.error('Error loading Figma MCP actions:', error)
                return [
                    {
                        label: 'No Available Actions',
                        name: 'error',
                        description: 'No available actions, please check your API key and refresh'
                    }
                ]
            }
        }
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const tools = await this.getTools(nodeData, options)

        const _mcpActions = nodeData.inputs?.mcpActions
        let mcpActions = []
        if (_mcpActions) {
            try {
                mcpActions = typeof _mcpActions === 'string' ? JSON.parse(_mcpActions) : _mcpActions
            } catch (error) {
                console.error('Error parsing mcp actions:', error)
            }
        }

        return tools.filter((tool: any) => mcpActions.includes(tool.name))
    }

    async getTools(nodeData: INodeData, _: ICommonObject): Promise<Tool[]> {
        const serviceUrl = nodeData.inputs?.serviceUrl as string
        const transportType = (nodeData.inputs?.transportType as string) ?? 'http'

        if (!serviceUrl) {
            throw new Error('Service URL is required for Figma MCP')
        }

        const serverParams = {
            url: serviceUrl
        }

        const toolkit = new MCPToolkit(serverParams, transportType as 'sse')
        await toolkit.initialize()

        const tools = toolkit.tools ?? []

        return tools as Tool[]
    }
}

module.exports = { nodeClass: FigmaMCP }
