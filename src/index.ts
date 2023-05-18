import { removeEmpty } from './utils/object';

export interface OAuth2ClientOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GenerateAuthUrlOptions {
  scope: string[] | string;
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

const ERROR_INVALID_AUTH_URL_OPTIONS = 'Invalid Auth URL options.';

export class OAuth2 {
  private static readonly API_URL = 'https://www.infojobs.net/api';
  private static readonly AUTH_URL = 'https://www.infojobs.net/oauth/authorize';

  private _clientId: string;
  private _clientSecret: string;
  private _redirectUri: string;

  constructor(options: OAuth2ClientOptions) {
    if (!this.#hasValidOAuth2ClientOptions(options)) {
      throw new Error(ERROR_INVALID_OAUTH2_OPTIONS);
    }

    this._clientId = options.clientId;
    this._clientSecret = options.clientSecret;
    this._redirectUri = options.redirectUri;
  }

  #hasValidOAuth2ClientOptions(options?: Partial<OAuth2ClientOptions>, needSecret = true) {
    if (options) {
      return options.clientId && (needSecret ? options.clientSecret : true) && options.redirectUri;
    }

    return this._clientId && (needSecret ? this._clientSecret : true) && this._redirectUri;
  }

  #hasValidAuthUrlOptions(options: GenerateAuthUrlOptions) {
    return options?.responseType && options?.scope;
  }

  /**
   * Request OAuth2 access token with the verification code
   */
  async getAccessToken(code: string): Promise<AccessToken | AccessTokenError> {
    if (!this.#hasValidOAuth2ClientOptions()) {
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
    if (!this.#hasValidOAuth2ClientOptions()) {
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
    if (!this.#hasValidOAuth2ClientOptions()) {
      throw new Error(ERROR_INVALID_OAUTH2_OPTIONS);
    }

    if (!this.#hasValidAuthUrlOptions(options)) {
      throw new Error(ERROR_INVALID_AUTH_URL_OPTIONS);
    }

    const parameters = {
      client_id: this._clientId,
      redirect_uri: this._redirectUri,
      response_type: options.responseType,
      scope: options.scope,
      state: options.state,
    };

    const params = new URLSearchParams(removeEmpty(parameters));

    return `${OAuth2.API_URL}/oauth/user-authorize/index.xhtml?${params.toString()}`;
  }
}
