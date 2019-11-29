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

import { parse, ErrorObject, JsonRpc, JsonRpcRequest } from './jsonrpc';

describe('jsonrpc module tests', () => {

  describe('Serializer object', () => {
    describe('Serializer.serialize function', () => {
      test('JsonRpc', () => {
        const obj = new JsonRpc();
        expect(JSON.stringify(obj)).toEqual(obj.serialize());
        expect(JSON.parse(obj.serialize())).toEqual(obj);
        expect(obj.serialize()).toStrictEqual('{"jsonrpc":"2.0"}');
      })

      test('JsonRpcRequest', () => {
        const obj = new JsonRpcRequest('id1', 'send', {'amount': 10});
        expect(JSON.stringify(obj)).toEqual(obj.serialize());
        expect(JSON.parse(obj.serialize())).toEqual(obj);
        expect(obj.serialize()).toStrictEqual('{"jsonrpc":"2.0","id":"id1","method":"send","params":{"amount":10}}');
      })
    })
  })

  describe('parse', () => {
    test('throw error if null data is received', () => {
      expect(() => {
        parse(null);
      }).toThrow(ErrorObject.invalidRequest());
    });

    test('throw error if undefined data is received', () => {
      expect(() => {
        parse(null);
      }).toThrow(ErrorObject.invalidRequest());
    });

    describe('check error is thrown when invalid json format data is received', () => {
      test('simple string', () => {
        expect(() => {
          parse('param1');
        }).toThrow(ErrorObject.parseError());
      });

      test('not closed brace', () => {
        expect(() => {
          parse('{"param1":3');
        }).toThrow(ErrorObject.parseError());
      });

      test('not closed bracket', () => {
        expect(() => {
          parse('["param1"');
        }).toThrow(ErrorObject.parseError());
      });

      test('invalid object', () => {
        expect(() => {
          parse('{"param1"}');
        }).toThrow(ErrorObject.parseError());
      });
    });

    describe('check the payload is valid JSON-RPC 2.0 message', () => {
      test('check error is thrown if neither an object or an array', () => {
        expect(() => {
          parse('"param1"');
        }).toThrow(ErrorObject.invalidRequest());
        expect(() => {
          parse('3');
        }).toThrow(ErrorObject.invalidRequest());
      });

      describe('check single JSON-RPC object parsing and validation', () => {
        describe('check JsonRpcError', () => {
          
        })
      })

      describe('check batch of JSON-RPC objects parsing and validation', () => {
        
      })
    });
  });
});
