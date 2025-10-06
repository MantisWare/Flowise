import { INodeParams, INodeCredential } from '../src/Interface'

class DesktopCommanderApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Desktop Commander API'
        this.name = 'desktopCommanderApi'
        this.version = 1.0
        this.description = 'Configuration for desktop commander MCP server access'
        this.inputs = [
            {
                label: 'Allowed Directories',
                name: 'allowedDirectories',
                type: 'string',
                placeholder: '/path/to/allowed/directory,/another/path',
                description:
                    'Comma-separated list of directories that the desktop commander MCP server can access. Leave empty to use current working directory.',
                optional: true
            }
        ]
    }
}

module.exports = { credClass: DesktopCommanderApi }
