import { extend } from "lodash";

interface ApiResponse<T> {
  success: boolean;
  message?:string;
  status?: number;
  result: T ;
}

interface ApiResponseError {
success: boolean;
status?: number;
error?: string;
message?: string;
result?: null;
}

export function successResponse<T>(statusCode=200, message: string, result: T): ApiResponse<T>{
  return {
    success: true,
    status: statusCode,
    message,
    result
  }
}

export function errorResponse(statusCode = 400, message?:string, error?: any):ApiResponseError{
  if(message){
    return {
      success: false,
      status: statusCode,
      message,
      error,
      result: null
    }
  }
    return {
      success: false,
      status: statusCode,
      error,
      result: null
  }
}