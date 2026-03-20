"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecramApi = void 0;
class RecramApi {
    name = 'recramApi';
    displayName = 'RecRam API';
    documentationUrl = 'https://recram.com/help';
    properties = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            description: 'Your RecRam API key. Found in Settings → API Keys.',
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.recram.com',
            description: 'RecRam API base URL. Change only if using a custom deployment.',
        },
    ];
    authenticate = {
        type: 'generic',
        properties: {
            headers: {
                'X-API-Key': '={{$credentials.apiKey}}',
            },
        },
    };
    test = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/v1/health',
        },
    };
}
exports.RecramApi = RecramApi;
//# sourceMappingURL=RecramApi.credentials.js.map