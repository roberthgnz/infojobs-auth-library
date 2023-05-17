import querystring from 'querystring'

export interface OAuth2ClientOptions {
    clientId: string;
    clientSecret: string;
    redirectUri: string
}

export interface GenerateAuthUrlOptions {
    scope: string[] | string
    clientId: string
    redirectUri: string,
    responseType: string
    state?: string
}

export class OAuth2 {
    private static readonly API_URL = 'https://www.infojobs.net/api'

    private _clientId: string
    private _clientSecret: string
    private _redirectUri: string

    constructor(options: OAuth2ClientOptions) { 
        this._clientId = options.clientId
        this._clientSecret = options.clientSecret
        this._redirectUri = options.redirectUri
    }

    generateAuthUrl(options: GenerateAuthUrlOptions) {
        options.clientId = options.clientId || this._clientId
        options.redirectUri = options.redirectUri || this._redirectUri

        if(Array.isArray(options.scope)) {
            options.scope = options.scope.join(',')
        }

        return `${OAuth2.API_URL}/${querystring.stringify(options as any)}`
    }
}
