/**
 * * Copyright * 2019 Andrea Lamparelli
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * JSON-RPC 2.0 implementation that allows user to serialize and parse objects
 * under the JSON-RPC protocol
 * * Specification: * https://www.jsonrpc.org/specification
 * * README * https://github.com/lampajr/jsonrpc-lib/blob/master/README.md
 */

/******************************************* JSON-RPC 2.0 *****************************************/
export type Value = number | string | boolean | object | null;
export type Params = object | Value[];
export type Id = string | number;

/**
 * Generic serializer class, which simply automates
 * the stringify operation, on those classe that
 * inheriths from this one.
 */
class Serializer {
  /**
   * Serialize the instance of the object that
   * inheriths from this class
   */
  serialize(): string {
    return JSON.stringify(this);
  }
}

/**
 * Generic JSON-RPC class, it simply contains hte jsonrpc
 * version and MUST be implemented by all JSON-RPC objects
 */
export class JsonRpc extends Serializer {
  /** Current JSON-RPC version supported */
  static VERSION: string = '2.0';

  /** A String specifying the version of the JSON-RPC protocol. MUST be exactly "2.0". */
  readonly jsonrpc: string;

  constructor() {
    super();
    this.jsonrpc = '2.0';
  }
}

/**
 * JSON-RPC 2.0 request object, it represents an rpc call
 * from the client to the server
 */
export class JsonRpcRequest extends JsonRpc {
  /** An identifier established by the Client. */
  public id: Id;
  /** A String containing the name of the method to be invoked. */
  public method: string;
  /** A Structured value that holds the parameter values to be used during the invocation of the method. This member MAY be omitted. */
  public params?: Params;

  constructor(id: Id, method: string, params?: Params) {
    super();
    this.id = id;
    this.method = method;
    this.params = params;
  }
}

/**
 * JSON-RPC 2.0 notification object, it represents an rpc call
 * without the id member, this means that the client's lack of
 * interest in the corresponding Response object
 */
export class JsonRpcNotification extends JsonRpc {
  /** A String containing the name of the method to be invoked. */
  public method: string;
  /** A Structured value that holds the parameter values to be used during the invocation of the method. This member MAY be omitted. */
  public params?: Params;

  constructor(method: string, params?: Params) {
    super();
    this.method = method;
    this.params = params;
  }
}

/**
 * Generic JSON-RPC 2.0 response object, this clas MUST be
 * inherithed by all possible specific response objects:
 * Error and Success with their appropriate new members
 */
class JsonRpcResponse extends JsonRpc {
  /** An identifier established by the Client. */
  public id: Id;

  constructor(id: Id) {
    super();
    this.id = id;
  }
}

/**
 * JSON-RPC 2.0 success response object, this represents the
 * server response that MUST be replied after rpc call was made
 * by the client (except for notification, where the server
 * MUST NOT replies)
 */
export class JsonRpcSuccess extends JsonRpcResponse {
  /** The value of this member is determined by the method invoked on the Server. */
  public result: any;

  constructor(id: Id, result: any) {
    super(id);
    this.result = result;
  }
}

/**
 * JSON-RPC 2.0 success response object, this represents the
 * server response that MUST be replied after rpc call was made
 * by the client (except for notification, where the server
 * MUST NOT replies)
 */
export class JsonRpcError extends JsonRpcResponse {
  /** The value for this member MUST be an [[ErrorObject]] instance */
  public error: ErrorObject;

  constructor(id: Id, error: ErrorObject) {
    super(id);
    this.error = error;
  }
}

/**
 * JSON-RPC 2.0 error object that MUST be included
 * as member in the JSON-RPC response error
 */
export class ErrorObject extends Serializer {
  static parseError(data?: any): ErrorObject {
    return new ErrorObject(-32700, 'Parse error', data);
  }

  static invalidRequest(data?: any): ErrorObject {
    return new ErrorObject(-32600, 'Invalid request', data);
  }

  static methodNotFound(data?: any): ErrorObject {
    return new ErrorObject(-32601, 'Method not found', data);
  }

  static invalidParams(data?: any): ErrorObject {
    return new ErrorObject(-32602, 'Invalid params', data);
  }

  static internalError(data?: any): ErrorObject {
    return new ErrorObject(-32603, 'Internal error', data);
  }

  /** A Number that indicates the error type that occurred. This MUST be an integer. */
  public code: number;
  /** A String providing a short description of the error. */
  public message: string;
  /** A Primitive or Structured value that contains additional information about the error. This may be omitted. */
  public data?: any;

  constructor(code: number, message: string, data?: any) {
    super();
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

/********************************************* Utilities *******************************************/
/** Checks whether a value is an integer or not */
const isInteger = Number.isInteger;

const hasOwnProperty = Object.prototype.hasOwnProperty;

/** Check whether the value is a number or not */
function isNumber(val: any): boolean {
  return typeof val === 'number';
}

/** Check whether the value is a string or not */
function isString(val: any): boolean {
  return typeof val === 'string';
}

/** Check whether the value is an object or not */
function isObject(val: any): boolean {
  return typeof val === 'object';
}

/**
 * Checks whether the JSON-RPC identifier is a valid one,
 * hence compatible with the JSON-RPC 2.0 specification
 * @param id identifier to check
 * @throws [[ErrorObject]] if invalid
 */
function checkId(id: any): void {
  if ((!isString(id) && !isNumber(id)) || (!isString(id) && !isInteger(id as number))) {
    throw ErrorObject.parseError('The identifier MUST be a string or an integer!');
  }
}

/**
 * Checks whether the JSON-RPC method is a valid one,
 * hence compatible with the JSON-RPC 2.0 specification
 * @param method string method to check
 * @throws [[ErrorObject]] if invalid
 */
function checkMethod(method: any): void {
  if (!isString(method)) {
    throw ErrorObject.parseError('The method MUST be a string');
  }
}

/**
 * Checks whether the JSON-RPC params is a valid one,
 * hence compatible with the JSON-RPC 2.0 specification
 * @param params object to check
 * @throws [[ErrorObject]] if invalid
 */
function checkParams(params: any): void {
  if (params !== undefined) {
    if (isObject(params) || Array.isArray(params)) {
      try {
        JSON.stringify(params);
      } catch (e) {
        throw ErrorObject.parseError(params);
      }
    } else {
      throw ErrorObject.invalidParams('Params MUST be an object or an ordered array of values');
    }
  }
}

/**
 * Checks whether the JSON-RPC error is a valid one,
 * hence compatible with the JSON-RPC 2.0 specification
 * @param error object to check
 * @throws [[ErrorObject]] if invalid
 */
function checkError(error: any): void {
  if (!isObject(error)) {
    throw ErrorObject.internalError('This error is not compatible with JSON-RPC 2.0 spec!');
  }

  if (!(error instanceof ErrorObject)) {
    const err = error as ErrorObject;
    if (!isInteger(err.code)) {
      throw ErrorObject.internalError('The error code MUST be an integer!');
    }
    if (!isString(err.message)) {
      throw ErrorObject.internalError('The error message MUST be a string!');
    }
  }
}

/**************************************** Messages Generation **************************************/

/**
 * Generates a new [[JsonRpcRequest]] message
 * @param id request identifier
 * @param method name of the method to invoke
 * @param params parameters needed for method invocation
 * @returns new [[JsonRpcRequest]] instance
 */
export function generateRequest(id: Id, method: string, params: Params): JsonRpcRequest {
  return new JsonRpcRequest(id, method, params);
}

/**
 * Generates a new [[JsonRpcNotification]] message
 * @param method name of the method to invoke
 * @param params parameters needed for method invocation
 * @returns new [[JsonRpcNotification]] instance
 */
export function generateNotification(method: string, params: Params): JsonRpcNotification {
  return new JsonRpcNotification(method, params);
}

/**
 * Generates a new [[JsonRpcSuccess]] message
 * @param id success response identifier
 * @param result result of a previous jsonrpc invocation
 * @returns new [[JsonRpcSuccess]] instance
 */
export function generateSuccess(id: Id, result: any): JsonRpcSuccess {
  return new JsonRpcSuccess(id, result);
}

/**
 * Generates a new [[JsonRpcError]] message
 * @param id error response identifier
 * @param err [[ErrorObject]] instance which includes details about the error
 * @returns new [[JsonRpcError]] instance
 */
export function generateError(id: Id, err: ErrorObject): JsonRpcError {
  return new JsonRpcError(id, err);
}

/********************************************* Parsing *********************************************/

export type JsonRpcMessage = JsonRpcRequest | JsonRpcNotification | JsonRpcSuccess | JsonRpcError;

/**
 * Try to parse an object into a JsonRpc object, if valid
 * @param data object to parse
 * @returns the specific JSON-RPC message object
 */
export function parse(data: any): JsonRpcMessage | JsonRpcMessage[] {
  if (data == null || !isString(data)) {
    throw ErrorObject.invalidRequest('Message MUST be not null and in string format!');
  }

  try {
    const obj: JsonRpc | JsonRpc[] = JSON.parse(data);
    if (isObject(obj)) {
      return parseJsonRpcMessage(obj as JsonRpc);
    } else if (Array.isArray(obj)) {
      return parseJsonRpcMessageBatch(obj as JsonRpc[]);
    } else {
      throw ErrorObject.invalidRequest('Message MUST be an object or an array of objects!');
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      // error thrown by the JSON.parse function
      throw ErrorObject.parseError('Invalid JSON format');
    } else {
      throw err;
    }
  }
}

/**
 * Computes the specific JSON-RPC batch message object, given a generic one
 * @param objs not-null valid list of JSON-RPC objects
 * @returns [[JsonRpcMessage]] array of specific JSON-RPC objects
 * @throws [[ErrorObject]] if the parsing fails
 */
function parseJsonRpcMessageBatch(objs: JsonRpc[]): JsonRpcMessage[] {
  const batch: JsonRpcMessage[] = [];
  for (const obj of objs) {
    batch.push(parseJsonRpcMessage(obj));
  }
  return batch;
}

/**
 * Computes the specific single JSON-RPC message object, given a generic one
 * @param obj not-null valid JSON-RPC object
 * @returns [[JsonRpcMessage]] the specific JSON-RPC message object
 * @throws [[ErrorObject]] if the parsing fails
 */
function parseJsonRpcMessage(obj: JsonRpc): JsonRpcMessage {
  let res: JsonRpcMessage;

  if (obj.jsonrpc !== JsonRpc.VERSION) {
    throw ErrorObject.invalidRequest(`Version ${obj.jsonrpc} not supported! Please use ${JsonRpc.VERSION} instead.`);
  }

  if (!hasOwnProperty.call(obj, 'id')) {
    // the only message that has no id member is the [[JsonRpcNotification]] one
    const notification = obj as JsonRpcNotification;
    validateNotification(notification);
    res = new JsonRpcNotification(notification.method, notification.params);
  } else if (hasOwnProperty.call(obj, 'method')) {
    // then only message that has both id and method members is the [[JsonRpcRequest]] one
    const request = obj as JsonRpcRequest;
    validateRequest(request);
    res = new JsonRpcRequest(request.id, request.method, request.params);
  } else if (hasOwnProperty.call(obj, 'result')) {
    const success = obj as JsonRpcSuccess;
    validateSuccess(success);
    res = new JsonRpcSuccess(success.id, success.result);
  } else if (hasOwnProperty.call(obj, 'error')) {
    const error = obj as JsonRpcError;
    if (error.error == null) {
      throw ErrorObject.internalError('Error object MUST be not null!');
    }
    validateError(error);
    const err: ErrorObject = error.error as ErrorObject;
    res = new JsonRpcError(error.id, new ErrorObject(err.code, err.message, err.data));
  } else {
    // this is an invalid object
    throw ErrorObject.invalidRequest(obj);
  }

  return res;
}

/**
 * Validate a JSON-RPC Request object
 * @param request [[JsonRpcRequest]] object
 * @throws [[ErrorObject]] if the parsing fails
 */
function validateRequest(request: JsonRpcRequest): void {
  checkId(request.id);
  checkMethod(request.method);
  checkParams(request.params);
}

/**
 * Validate a JSON-RPC Notification object
 * @param notification [[JsonRpcNotification]] object
 * @throws [[ErrorObject]] if the parsing fails
 */
function validateNotification(notification: JsonRpcNotification): void {
  checkMethod(notification.method);
  checkParams(notification.params);
}

/**
 * Validate a JSON-RPC Success response object
 * @param request [[JsonRpcSuccess]] object
 * @throws [[ErrorObject]] if the parsing fails
 */
function validateSuccess(success: JsonRpcSuccess): void {
  checkId(success.id);
}

/**
 * Validate a JSON-RPC Error response object
 * @param request [[JsonRpcError]] object
 * @throws [[ErrorObject]] if the parsing fails
 */
function validateError(error: JsonRpcError): void {
  checkId(error.id);
  checkError(error.error);
}

/********************************************* Exports *********************************************/

const jsonrpc = {
  JsonRpc,
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcSuccess,
  JsonRpcError,
  request: generateRequest,
  notification: generateNotification,
  success: generateSuccess,
  error: generateError,
  parse,
  parseJsonRpcMessage,
  parseJsonRpcMessageBatch,
};

export default jsonrpc;
export { jsonrpc };
