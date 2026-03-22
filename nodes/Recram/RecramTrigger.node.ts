import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class RecramTrigger implements INodeType {
	description: INodeTypeDescription = {
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
						description:
							'When a form response is fully processed (including video encoding & AI analysis)',
					},
					{
						name: 'Form Response Submitted',
						value: 'form.response.submitted',
						description:
							'When a form response is submitted (immediate, before media/AI processing)',
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
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const credentials = await this.getCredentials('recramApi');
				const baseUrl = credentials.baseUrl as string;
				if (webhookData.webhookId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(
							this,
							'recramApi',
							{
								method: 'GET',
								url: `${baseUrl}/v1/webhooks/${webhookData.webhookId}`,
							},
						);
						return true;
					} catch {
						return false;
					}
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('recramApi');
				const baseUrl = credentials.baseUrl as string;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				const body = {
					target_url: webhookUrl,
					events: [event],
					description: `n8n workflow: ${this.getWorkflow().name || 'Unnamed'}`,
					metadata: {
						source: 'n8n',
						workflowId: this.getWorkflow().id,
					},
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'recramApi',
					{
						method: 'POST',
						url: `${baseUrl}/v1/webhooks`,
						body,
						headers: { 'Content-Type': 'application/json' },
					},
				);

				if (response?.data?.id) {
					const webhookData = this.getWorkflowStaticData('node');
					webhookData.webhookId = response.data.id;
					webhookData.webhookSecret = response.data.secret;
					return true;
				}

				return false;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('recramApi');
				const baseUrl = credentials.baseUrl as string;
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) return true;

				try {
					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'recramApi',
						{
							method: 'DELETE',
							url: `${baseUrl}/v1/webhooks/${webhookData.webhookId}`,
						},
					);
				} catch {
					// Webhook may already be deleted
				}

				delete webhookData.webhookId;
				delete webhookData.webhookSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
