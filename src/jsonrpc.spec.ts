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
 * JSON-RPC 2.0 testing file
 */

import {
  parse,
  ErrorObject,
  JsonRpc,
  JsonRpcRequest,
  JsonRpcSuccess,
  JsonRpcError,
  JsonRpcMessage,
  JsonRpcNotification,
} from './jsonrpc';

describe('jsonrpc module tests', () => {
  describe('Serializer object', () => {
    describe('Serializer.serialize function', () => {
      test('JsonRpc', () => {
        const obj = new JsonRpc();
        expect(JSON.stringify(obj)).toEqual(obj.serialize());
        expect(JSON.parse(obj.serialize())).toEqual(obj);
        expect(obj.serialize()).toStrictEqual('{"jsonrpc":"2.0"}');
      });

      test('JsonRpcRequest', () => {
        const obj = new JsonRpcRequest('id1', 'send', { amount: 10 });
        expect(JSON.stringify(obj)).toEqual(obj.serialize());
        expect(JSON.parse(obj.serialize())).toEqual(obj);
        expect(obj.serialize()).toStrictEqual('{"jsonrpc":"2.0","id":"id1","method":"send","params":{"amount":10}}');
      });
    });
  });

  describe('parse', () => {
    test('throw error if null data is received', () => {
      const obj = null;
      expect(() => {
        parse(obj);
      }).toThrow(ErrorObject);
      try {
        parse(obj);
      } catch (err) {
        expect(err.code).toStrictEqual(ErrorObject.invalidRequest().code);
      }
    });

    test('throw error if undefined data is received', () => {
      const obj = undefined;
      expect(() => {
        parse(obj);
      }).toThrow(ErrorObject);
      try {
        parse(obj);
      } catch (err) {
        expect(err.code).toStrictEqual(ErrorObject.invalidRequest().code);
      }
    });

    describe('check error is thrown when invalid json format data is received', () => {
      test('simple string', () => {
        const obj = 'param1';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.parseError().code);
        }
      });

      test('not closed brace', () => {
        const obj = '{"param1":3';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.parseError().code);
        }
      });

      test('not closed bracket', () => {
        const obj = '["param1"';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.parseError().code);
        }
      });

      test('invalid object', () => {
        const obj = '{"param1"}';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.parseError().code);
        }
      });
    });

    describe('check the payload is valid JSON-RPC 2.0 message', () => {
      test('check error is thrown if neither an object or an array', () => {
        const obj = '"param1"';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.invalidRequest().code);
        }
      });

      test('missing jsonrpc version', () => {
        const obj =
          '{"id":1, "error": {"code": -32700, "message": "Parse error", "data": "invalid request structure"}}';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.invalidRequest().code);
        }
      });

      test('unsupported jsonrpc version', () => {
        const obj =
          '{"jsonrpc":"1.0", "id":1, "error": {"code": -32700, "message": "Parse error", "data": "invalid request structure"}}';
        expect(() => {
          parse(obj);
        }).toThrow(ErrorObject);
        try {
          parse(obj);
        } catch (err) {
          expect(err.code).toStrictEqual(ErrorObject.invalidRequest().code);
          expect(err.data).toStrictEqual(`Version 1.0 not supported! Please use ${JsonRpc.VERSION} instead.`);
        }
      });

      describe('check single JSON-RPC message parsing and validation', () => {
        describe('test JsonRpcError', () => {
          test('valid error response', () => {
            const obj =
              '{"jsonrpc":"2.0","id":1,"error":{"code":-32700,"message":"Parse error","data":{"info":"invalid request structure","limit":3}}}';
            expect(() => {
              parse(obj);
            }).not.toThrow(ErrorObject);
            expect(parse(obj)).toBeInstanceOf(JsonRpcError);
            expect((parse(obj) as JsonRpcError).serialize()).toEqual(obj);
          });
        });

        describe('test JsonRpcSuccess', () => {
          test('valid success response', () => {
            const obj = '{"jsonrpc":"2.0","id":1,"result":"OK"}';
            expect(() => {
              parse(obj);
            }).not.toThrow(ErrorObject);
            expect(parse(obj)).toBeInstanceOf(JsonRpcSuccess);
            expect((parse(obj) as JsonRpcSuccess).serialize()).toEqual(obj);
          });
        });

        describe('test JsonRpcRequest', () => {
          test('valid request message', () => {
            const obj = '{"jsonrpc":"2.0","id":1,"method":"invoke","params":{"param1":3,"param2":[3,4,5]}}';
            expect(() => {
              parse(obj);
            }).not.toThrow(ErrorObject);
            expect(parse(obj)).toBeInstanceOf(JsonRpcRequest);
            expect((parse(obj) as JsonRpcRequest).serialize()).toEqual(obj);
          });
        });

        describe('test JsonRpcNotification', () => {
          test('valid notification message', () => {
            const obj = '{"jsonrpc":"2.0","method":"invoke","params":{"param1":3,"param2":[3,4,5]}}';
            expect(() => {
              parse(obj);
            }).not.toThrow(ErrorObject);
            expect(parse(obj)).toBeInstanceOf(JsonRpcNotification);
            expect((parse(obj) as JsonRpcNotification).serialize()).toEqual(obj);
          });
        });
      });

      describe('check batch of JSON-RPC objects parsing and validation', () => {});
    });
  });
});
