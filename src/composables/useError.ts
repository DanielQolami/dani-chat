export interface ApiError {
  name: string;
  message: string;
  statusCode: number | undefined;
  body: Record<string, any>;
}

export function useError() {
  class ApiError extends Error implements ApiError {
    public statusCode;
    public body;
    public errors;

    constructor(statusCode: number | undefined, body: any, message?: string, errors?: Record<string, string[]>) {
      super(message);
      this.name = "ApiError";
      this.statusCode = statusCode;
      this.body = body;
      this.errors = errors;
    }
  }

  return {
    ApiError,
  };
}
