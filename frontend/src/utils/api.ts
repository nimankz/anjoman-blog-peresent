import getConfig from 'next/config';
import fetch, { Response } from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';

const ApplicationErrorSchema = z.object({
  id: z.enum([
    'ValidationError',
    'AuthenticationFailedError',
    'InvalidRequest',
    'RouteNotFoundError',
    'ResourceNotFoundError',
    'InvalidLinkError',
  ]),
  params: z.record(z.any()),
});

type ApplicationError = z.infer<typeof ApplicationErrorSchema>;

type ServiceName = 'IDENTITY';
type HostName = 'API_GATEWAY' | ServiceName;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const baseUrls = {
  API_GATEWAY: "http://localhost:3000",
  IDENTITY: "http://localhost:4000",
};

export class ApiError extends Error {
  type: 'NETWORK' | 'APPLICATION' | 'UNKNOWN';
  applicationError?: ApplicationError;
  status?: number;
  causedBy?: unknown;

  constructor(attrs: {
    type: 'NETWORK' | 'APPLICATION' | 'UNKNOWN',
    causedBy?: unknown,
    applicationError?: ApplicationError,
    status?: number,
  }) {
    super(`ApiError of type ${attrs.type} occured`);
    this.type = attrs.type;
    this.applicationError = attrs.applicationError;
    this.causedBy = attrs.causedBy;
    this.status = attrs.status;
  }

  public userFriendlyMessage(): string {
    if (this.type === 'APPLICATION' && this.applicationError) {
      if (this.applicationError.id === 'InvalidRequest') {
        return 'Invalid request';
      }
      if (this.applicationError.id === 'ResourceNotFoundError') {
        return `${this.applicationError.params.resource} not found`;
      }
      if (this.applicationError.id === 'InvalidLinkError') {
        return this.applicationError.params.message;
      }
      if (this.applicationError.id === 'AuthenticationFailedError') {
        return this.applicationError.params.message;
      }
      return `An application error occured: ${this.applicationError.id}`;
    }
    if (this.type === 'NETWORK') {
      return 'A network error occured';
    }

    return 'An unknown error occured';
  }

  public isValidationError(): boolean {
    return this.type === 'APPLICATION' && this.applicationError?.id === 'ValidationError';
  }
}

type Handler = (req: NextApiRequest, res: NextApiResponse) => void;
type MethodHandlers = {
  get?: Handler;
  post?: Handler;
  put?: Handler;
  delete?: Handler;
};

export async function httpMethodRouter(
  req: NextApiRequest,
  res: NextApiResponse,
  handlers: MethodHandlers,
) {
  let handler;
  if (req.method === 'GET') {
    handler = handlers.get;
  } else if (req.method === 'POST') {
    handler = handlers.post;
  } else if (req.method === 'PUT') {
    handler = handlers.put;
  } else if (req.method === 'DELETE') {
    handler = handlers.delete;
  }

  if (!handler) {
    res.status(404).json({
      id: 'RouteNotFoundError',
      params: {
        message: `The ${req.method} method is not supported for the route ${req.url}`,
      },
    });
  } else {
    await handler(req, res);
  }
}

async function callFetch(
  host: HostName,
  method: HttpMethod,
  url: string,
  requestBody: Record<string, any>,
  headers?: Record<string, string>,
): Promise<Response> {
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  console.log(`Calling ${method} ${baseUrls[host] + url}`);
  return fetch(baseUrls[host] + url, {
    method,
    body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(requestBody),
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });
}

// Only used within the API Gateway
export async function forwardToBackend(
  serviceName: ServiceName,
  method: HttpMethod,
  url: string,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const headers: Record<string, string> = {};
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  const response = await callFetch(serviceName, method, url, req.body, headers);
  res.status(response.status).json(await response.json());
}

// Todo: handle FetchError
export async function callApi<ResponseType>(
  host: HostName,
  method: HttpMethod,
  url: string,
  requestBody: Record<string, any>,
  responseSchema: ZodSchema<ResponseType>,
  accessToken?: string,
): Promise<ResponseType> {
  let response: Response;
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  try {
    response = await callFetch(host, method, url, requestBody, headers);
  } catch (error) {
    const errorType = error instanceof TypeError ? 'NETWORK' : 'UNKNOWN';
    throw new ApiError({ type: errorType, causedBy: error });
  }
  let responseBody;
  try {
    responseBody = await response.json();
  } catch (error) {
    throw new ApiError({ type: 'UNKNOWN', causedBy: error });
  }

  if (!response.ok) {
    let applicationError;
    try {
      applicationError = ApplicationErrorSchema.parse(responseBody);
    } catch (error) {
      throw new ApiError({ type: 'UNKNOWN', causedBy: error });
    }
    throw new ApiError({
      type: 'APPLICATION',
      applicationError,
      status: response.status,
    });
  }
  try {
    return responseSchema.parse(responseBody);
  } catch (error) {
    throw new ApiError({ type: 'UNKNOWN', causedBy: error });
  }
}
