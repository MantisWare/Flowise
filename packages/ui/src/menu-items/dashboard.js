// assets
import {
    IconList,
    IconUsersGroup,
    IconHierarchy,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconTestPipe,
    IconMicroscope,
    IconDatabase,
    IconChartHistogram,
    IconListCheck
} from '@tabler/icons-react'

// constant
const icons = {
    IconHierarchy,
    IconUsersGroup,
    IconList,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconTestPipe,
    IconMicroscope,
    IconDatabase,
    IconChartHistogram,
    IconListCheck
}

// ==============================|| DASHBOARD MENU ITEMS ||============================== //
// VibeForge Embedded: Simplified menu for embedded mode

const primaryChildren = [
    {
        id: 'chatflows',
        title: 'Chatflows',
        type: 'item',
        url: '/chatflows',
        icon: icons.IconHierarchy,
        breadcrumbs: true,
        permission: 'chatflows:view'
    },
    {
        id: 'agentflows',
        title: 'Agentflows',
        type: 'item',
        url: '/agentflows',
        icon: icons.IconUsersGroup,
        breadcrumbs: true,
        permission: 'agentflows:view'
    },
    {
        id: 'executions',
        title: 'Executions',
        type: 'item',
        url: '/executions',
        icon: icons.IconListCheck,
        breadcrumbs: true,
        permission: 'executions:view'
    },
    {
        id: 'assistants',
        title: 'Assistants',
        type: 'item',
        url: '/assistants',
        icon: icons.IconRobot,
        breadcrumbs: true,
        permission: 'assistants:view'
    },
    {
        id: 'tools',
        title: 'Tools',
        type: 'item',
        url: '/tools',
        icon: icons.IconTool,
        breadcrumbs: true,
        permission: 'tools:view'
    },
    {
        id: 'credentials',
        title: 'Credentials',
        type: 'item',
        url: '/credentials',
        icon: icons.IconLock,
        breadcrumbs: true,
        permission: 'credentials:view'
    },
    {
        id: 'variables',
        title: 'Variables',
        type: 'item',
        url: '/variables',
        icon: icons.IconVariable,
        breadcrumbs: true,
        permission: 'variables:view'
    },
    {
        id: 'document-stores',
        title: 'Document Stores',
        type: 'item',
        url: '/document-stores',
        icon: icons.IconFiles,
        breadcrumbs: true,
        permission: 'documentStores:view'
    }
]

const dashboard = {
    id: 'dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'primary',
            title: '',
            type: 'group',
            children: primaryChildren
        },
        {
            id: 'evaluations',
            title: 'Evaluations',
            type: 'group',
            children: [
                {
                    id: 'datasets',
                    title: 'Datasets',
                    type: 'item',
                    url: '/datasets',
                    icon: icons.IconDatabase,
                    breadcrumbs: true,
                    display: 'feat:datasets',
                    permission: 'datasets:view'
                },
                {
                    id: 'evaluators',
                    title: 'Evaluators',
                    type: 'item',
                    url: '/evaluators',
                    icon: icons.IconTestPipe,
                    breadcrumbs: true,
                    display: 'feat:evaluators',
                    permission: 'evaluators:view'
                },
                {
                    id: 'evaluations',
                    title: 'Evaluations',
                    type: 'item',
                    url: '/evaluations',
                    icon: icons.IconChartHistogram,
                    breadcrumbs: true,
                    display: 'feat:evaluations',
                    permission: 'evaluations:view'
                }
            ]
        }
    ]
}

export default dashboard
