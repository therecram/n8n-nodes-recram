import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Recram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RecRam',
		name: 'recram',
		icon: 'file:recram.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the RecRam API',
		defaults: {
			name: 'RecRam',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'recramApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Form', value: 'form' },
					{ name: 'Response', value: 'response' },
				],
				default: 'form',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['form'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'List all forms',
						action: 'Get all forms',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a form by ID',
						action: 'Get a form',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['response'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'List all responses',
						action: 'Get all responses',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a response by ID',
						action: 'Get a response',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['form'], operation: ['get'] } },
				description: 'The ID of the form',
			},
			{
				displayName: 'Response ID',
				name: 'responseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['response'], operation: ['get'] } },
				description: 'The ID of the response',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				displayOptions: { show: { operation: ['getAll'] } },
				description: 'Max number of results to return',
				typeOptions: { minValue: 1, maxValue: 100 },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('recramApi');
		const baseUrl = credentials.baseUrl as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: unknown;

				if (resource === 'form') {
					if (operation === 'getAll') {
						const limit = this.getNodeParameter('limit', i) as number;
						response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/v1/forms?limit=${limit}`,
							headers: { 'X-API-Key': credentials.apiKey as string },
						});
					} else if (operation === 'get') {
						const formId = this.getNodeParameter('formId', i) as string;
						response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/v1/forms/${formId}`,
							headers: { 'X-API-Key': credentials.apiKey as string },
						});
					}
				} else if (resource === 'response') {
					if (operation === 'getAll') {
						const limit = this.getNodeParameter('limit', i) as number;
						response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/v1/answers?limit=${limit}`,
							headers: { 'X-API-Key': credentials.apiKey as string },
						});
					} else if (operation === 'get') {
						const responseId = this.getNodeParameter('responseId', i) as string;
						response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/v1/answers/${responseId}`,
							headers: { 'X-API-Key': credentials.apiKey as string },
						});
					}
				}

				const responseData = response as Record<string, unknown>;
				if (responseData?.data) {
					const data = responseData.data;
					if (Array.isArray(data)) {
						returnData.push(
							...data.map((item: unknown) => ({
								json: item as Record<string, unknown>,
							})),
						);
					} else {
						returnData.push({ json: data as Record<string, unknown> });
					}
				} else {
					returnData.push({ json: responseData || {} });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
