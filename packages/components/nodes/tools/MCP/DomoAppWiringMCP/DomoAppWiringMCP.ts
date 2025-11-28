import { Tool } from '@langchain/core/tools'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../../src/Interface'
import { getCredentialData, getCredentialParam, getNodeModulesPackagePath } from '../../../../src/utils'
import { MCPToolkit } from '../core'

class DomoAppWiringMCP implements INode {
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
        this.label = 'Domo App Wiring MCP'
        this.name = 'domoAppWiringMCP'
        this.version = 1.0
        this.type = 'DomoAppWiring MCP Tool'
        this.icon = 'domo.svg'
        this.category = 'Tools (MCP)'
        this.description =
            'MCP server that automatically generates app code interfaces and CRUD services from Domo datasets for Redux integration'
        this.documentation = 'https://github.com/your-username/domo-app-wiring-mcp'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['domoApi']
        }
        this.inputs = [
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
                console.error('Error loading Domo App Wiring MCP actions:', error)
                return [
                    {
                        label: 'No Available Actions',
                        name: 'error',
                        description: 'No available actions, please check your API credentials and refresh'
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

    async getTools(nodeData: INodeData, options: ICommonObject): Promise<Tool[]> {
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const domoClientId = getCredentialParam('domoClientId', credentialData, nodeData)
        const domoClientSecret = getCredentialParam('domoClientSecret', credentialData, nodeData)
        const domoScope = getCredentialParam('domoScope', credentialData, nodeData) ?? 'data'

        // Use the local MCP server path from the MCP directory
        const packagePath = getNodeModulesPackagePath('domo-app-wiring-mcp/dist/index.js')

        const serverParams = {
            command: 'node',
            args: [packagePath],
            env: {
                DOMO_CLIENT_ID: domoClientId,
                DOMO_CLIENT_SECRET: domoClientSecret,
                DOMO_SCOPE: domoScope
            }
        }

        const toolkit = new MCPToolkit(serverParams, 'stdio')
        await toolkit.initialize()

        const tools = toolkit.tools ?? []

        return tools
    }
}

module.exports = { nodeClass: DomoAppWiringMCP }
