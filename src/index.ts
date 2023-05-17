import { removeEmpty } from './utils/object';

export interface OAuth2ClientOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GenerateAuthUrlOptions {
  scope: string[] | string;
  clientId?: string;
  redirectUri?: string;
  responseType: string;
  state?: string;
}

export interface AccessToken {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface AccessTokenError {
  error: string;
  error_description: string;
  timestamp: string;
}

const ERROR_INVALID_OAUTH2_OPTIONS =
  'Invalid OAuth2 options. Please provide a valid clientId, clientSecret and redirectUri';

export class OAuth2 {
  private static readonly API_URL = 'https://www.infojobs.net/api';
  private static readonly AUTH_URL = 'https://www.infojobs.net/oauth/authorize';

  private _clientId: string;
  private _clientSecret: string;
  private _redirectUri: string;

  constructor(options: OAuth2ClientOptions) {
    this._clientId = options.clientId;
    this._clientSecret = options.clientSecret;
    this._redirectUri = options.redirectUri;
  }

  #hasValidOptions(options?: any, needSecret = true) {
    if (options) {
      return options.client_id && (needSecret ? options.client_secret : true) && options.redirect_uri;
    }

    return this._clientId && (needSecret ? this._clientSecret : true) && this._redirectUri;
  }

  /**
   * Request OAuth2 access token with the verification code
   */
  async getAccessToken(code: string): Promise<AccessToken | AccessTokenError> {
    if (!this.#hasValidOptions()) {
      throw new Error(ERROR_INVALID_OAUTH2_OPTIONS);
    }

    const parameters = {
      code,
      grant_type: 'authorization_code',
      client_id: this._clientId,
      client_secret: this._clientSecret,
      redirect_uri: this._redirectUri,
    };

    const response = await fetch(OAuth2.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(parameters),
    });

    return response.json();
  }

  /**
   * Request OAuth2 access token with the refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AccessToken | AccessTokenError> {
    if (!this.#hasValidOptions()) {
      throw new Error(ERROR_INVALID_OAUTH2_OPTIONS);
    }

    const parameters = {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: this._clientId,
      client_secret: this._clientSecret,
      redirect_uri: this._redirectUri,
    };

    const response = await fetch(OAuth2.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(parameters),
    });

    return response.json();
  }

  /**
   * Generates the URL for the user to authorize the application
   */
  generateAuthUrl(options: GenerateAuthUrlOptions) {
    const parameters = {
      client_id: options.clientId || this._clientId,
      redirect_uri: options.redirectUri || this._redirectUri,
      response_type: options.responseType,
      state: options.state,
      scope: options.scope,
    };

    if (!this.#hasValidOptions(parameters, false)) {
      throw new Error(ERROR_INVALID_OAUTH2_OPTIONS);
    }

    const params = new URLSearchParams(removeEmpty(parameters));

    let url = params.toString();

    url += Array.isArray(parameters.scope) ? `&scope=${parameters.scope.join(',')}` : `&scope=${parameters.scope}`;

    return `${OAuth2.API_URL}/oauth/user-authorize/index.xhtml?${url}`;
  }
}
