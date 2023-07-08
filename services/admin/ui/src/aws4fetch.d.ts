declare module 'aws4fetch' {
    export interface AwsClientOptions {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken?: string;
      service?: string;
      region?: string;
      cache?: Map<any, any>;
      retries?: number;
      initRetryMs?: number;
    }
  
    export interface FetchOptions {
      method?: string;
      headers?: HeadersInit;
      body?: BodyInit;
      aws?: AwsRequestOptions;
    }
  
    export interface AwsRequestOptions {
      signQuery?: boolean;
      accessKeyId?: string;
      secretAccessKey?: string;
      sessionToken?: string;
      service?: string;
      region?: string;
      cache?: Map<any, any>;
      datetime?: string;
      appendSessionToken?: boolean;
      allHeaders?: boolean;
      singleEncode?: boolean;
    }
  
    export class AwsClient {
      constructor(options: AwsClientOptions);
      fetch(url: RequestInfo, options?: FetchOptions): Promise<Response>;
    }
  }