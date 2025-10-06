import { INodeParams, INodeCredential } from '../src/Interface'

class DomoApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Domo API'
        this.name = 'domoApi'
        this.version = 1.0
        this.description =
            'You can find your Client ID and Secret in the <a target="_blank" href="https://developer.domo.com/">Domo Developer Portal</a> under "Manage Clients"'
        this.inputs = [
            {
                label: 'Client ID',
                name: 'domoClientId',
                type: 'string',
                placeholder: 'your-client-id'
            },
            {
                label: 'Client Secret',
                name: 'domoClientSecret',
                type: 'password'
            },
            {
                label: 'Scope',
                name: 'domoScope',
                type: 'string',
                default: 'data',
                description: 'OAuth scope (e.g., data, user, account)',
                optional: true
            }
        ]
    }
}

module.exports = { credClass: DomoApi }
