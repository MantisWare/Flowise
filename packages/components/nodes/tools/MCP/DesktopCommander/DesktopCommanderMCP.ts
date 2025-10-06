import { Tool } from '@langchain/core/tools'
import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../../src/Interface'
import { getCredentialData, getCredentialParam, getNodeModulesPackagePath } from '../../../../src/utils'
import { MCPToolkit } from '../core'

class DesktopCommander_MCP implements INode {
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
        this.label = 'Desktop Commander MCP'
        this.name = 'desktopCommanderMCP'
        this.version = 1.0
        this.type = 'DesktopCommander MCP Tool'
        this.icon = 'desktop.svg'
        this.category = 'Tools (MCP)'
        this.description =
            'MCP server that provides desktop automation and control capabilities - manage windows, applications, and system interactions'
        this.documentation = 'https://github.com/wonderwhy-er/DesktopCommanderMCP'
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['desktopCommanderApi']
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
            } catch {
                return [
                    {
                        label: 'No Available Actions',
                        name: 'error',
                        description: 'No available actions, please check your configuration and refresh'
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
        const allowedDirectories = getCredentialParam('allowedDirectories', credentialData, nodeData)
        const directories = allowedDirectories
            ? allowedDirectories
                  .split(',')
                  .map((dir: string) => dir.trim())
                  .filter((dir: string) => dir.length > 0)
            : [process.cwd()]
        const packagePath = getNodeModulesPackagePath('@wonderwhy-er/desktop-commander/dist/index.js')

        const serverParams = {
            command: 'node',
            args: [packagePath, '-v', directories.join('-v')]
        }

        const toolkit = new MCPToolkit(serverParams, 'stdio')
        await toolkit.initialize()

        const tools = toolkit.tools ?? []

        return tools as Tool[]
    }
}

module.exports = { nodeClass: DesktopCommander_MCP }
