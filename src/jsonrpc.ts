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
 * TODO: complete description
 */

/************************* JSON-RPC 2.0 *************************/

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

/************************* Utilities *************************/
/** Checks whether a value is an integer or not */
const isInteger = Number.isInteger;

/** Check whether the value is a string or not */
function isString(val: any) {
  return typeof val === 'string';
}
