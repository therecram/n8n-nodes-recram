"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecramTrigger = void 0;
class RecramTrigger {
    description = {
        displayName: 'RecRam Trigger',
        name: 'recramTrigger',
        icon: 'file:recram.svg',
        group: ['trigger'],
        version: 1,
        subtitle: '={{$parameter["event"]}}',
        description: 'Starts workflow when a RecRam event occurs',
        defaults: {
            name: 'RecRam Trigger',
        },
        inputs: [],
        outputs: ['main'],
        credentials: [
            {
                name: 'recramApi',
                required: true,
            },
        ],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'webhook',
            },
        ],
        properties: [
            {
                displayName: 'Event',
                name: 'event',
                type: 'options',
                options: [
                    {
                        name: 'Form Response Completed',
                        value: 'form.response.completed',
                        description: 'When a form response is fully processed (including video encoding & AI analysis)',
                    },
                    {
                        name: 'Form Response Submitted',
                        value: 'form.response.submitted',
                        description: 'When a form response is submitted (immediate, before media/AI processing)',
                    },
                ],
                default: 'form.response.completed',
                required: true,
                description: 'The event that triggers this workflow',
            },
        ],
    };
    webhookMethods = {
        default: {
            async checkExists() {
                const webhookData = this.getWorkflowStaticData('node');
                if (webhookData.webhookId) {
                    const credentials = await this.getCredentials('recramApi');
                    const baseUrl = credentials.baseUrl;
                    try {
                        await this.helpers.httpRequest({
                            method: 'GET',
                            url: `${baseUrl}/v1/webhooks/${webhookData.webhookId}`,
                            headers: {
                                'X-API-Key': credentials.apiKey,
                            },
                        });
                        return true;
                    }
                    catch {
                        return false;
                    }
                }
                return false;
            },
            async create() {
                const webhookUrl = this.getNodeWebhookUrl('default');
                const event = this.getNodeParameter('event');
                const credentials = await this.getCredentials('recramApi');
                const baseUrl = credentials.baseUrl;
                const body = {
                    target_url: webhookUrl,
                    events: [event],
                    description: `n8n workflow: ${this.getWorkflow().name || 'Unnamed'}`,
                    metadata: {
                        source: 'n8n',
                        workflowId: this.getWorkflow().id,
                    },
                };
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `${baseUrl}/v1/webhooks`,
                    headers: {
                        'X-API-Key': credentials.apiKey,
                        'Content-Type': 'application/json',
                    },
                    body,
                });
                if (response?.data?.id) {
                    const webhookData = this.getWorkflowStaticData('node');
                    webhookData.webhookId = response.data.id;
                    webhookData.webhookSecret = response.data.secret;
                    return true;
                }
                return false;
            },
            async delete() {
                const webhookData = this.getWorkflowStaticData('node');
                if (!webhookData.webhookId)
                    return true;
                const credentials = await this.getCredentials('recramApi');
                const baseUrl = credentials.baseUrl;
                try {
                    await this.helpers.httpRequest({
                        method: 'DELETE',
                        url: `${baseUrl}/v1/webhooks/${webhookData.webhookId}`,
                        headers: {
                            'X-API-Key': credentials.apiKey,
                        },
                    });
                }
                catch {
                    // Webhook may already be deleted
                }
                delete webhookData.webhookId;
                delete webhookData.webhookSecret;
                return true;
            },
        },
    };
    async webhook() {
        const bodyData = this.getBodyData();
        return {
            workflowData: [this.helpers.returnJsonArray(bodyData)],
        };
    }
}
exports.RecramTrigger = RecramTrigger;
//# sourceMappingURL=RecramTrigger.node.js.map