import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  parseArith,
  parseBasic,
  parseObj,
  parsePoly,
  parseRec,
  parseRecFunc,
  parseSub,
} from "npm:tiny-ts-parser";
import { typecheck } from "./typecheck.ts";

describe("typecheck", () => {
  describe("literals", () => {
    it("parses `true` correctly", () => {
      const result = typecheck(parseArith("true"), {});
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("parses `false` correctly", () => {
      const result = typecheck(parseArith("false"), {});
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("parses `1` correctly", () => {
      const result = typecheck(parseArith("1"), {});
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("arithmetic operations", () => {
    it("parses `1 + 2` correctly", () => {
      const result = typecheck(parseArith("1 + 2"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("parses `1 + (2 + 3)` correctly", () => {
      const result = typecheck(parseArith("1 + (2 + 3)"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("throws exception for `1 + true`", () => {
      expect(() => typecheck(parseArith("1 + true"), {})).toThrow(
        "Number expected.",
      );
    });

    it("throws exception for `false + 1`", () => {
      expect(() => typecheck(parseArith("false + 1"), {})).toThrow(
        "Number expected.",
      );
    });
  });

  describe("conditional expressions", () => {
    it("parses `true ? 1 : 2` correctly", () => {
      const result = typecheck(parseArith("true ? 1 : 2"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("parses `false ? 1 : 2` correctly", () => {
      const result = typecheck(parseArith("false ? 1 : 2"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("parses `true ? true : false` correctly", () => {
      const result = typecheck(parseArith("true ? true : false"), {});
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("throws exception for `1 ? 2 : 3`", () => {
      expect(() => typecheck(parseArith("1 ? 2 : 3"), {})).toThrow(
        "Boolean expected.",
      );
    });

    it("throws exception for `true ? 1 : true`", () => {
      expect(() => typecheck(parseArith("true ? 1 : true"), {})).toThrow(
        "then and else have different types.",
      );
    });
  });

  describe("functions", () => {
    it("parses `(x: boolean) => 42` correctly", () => {
      const result = typecheck(parseBasic("(x: boolean) => 42"), {});
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Boolean" } }],
        retType: { tag: "Number" },
      });
    });

    it("parses `(x: number) => x` correctly", () => {
      const result = typecheck(parseBasic("(x: number) => x"), {});
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("parses `( (x: number) => x  )(42)` correctly", () => {
      const result = typecheck(parseBasic("( (x: number) => x  )(42)"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("throws exception for `( (x: number) => x )(true)`", () => {
      expect(() => typecheck(parseBasic("( (x: number) => x )(true)"), {}))
        .toThrow(
          "parameter type mismatch",
        );
    });

    it("throws exception for undefined variable reference `(x: number) => y`", () => {
      expect(() => typecheck(parseBasic("(x: number) => y"), {})).toThrow(
        "Unknown variable: y",
      );
    });

    it("throws exception for wrong number of arguments `( (x: number) => 42 )(1, 2, 3)`", () => {
      expect(() => typecheck(parseBasic("( (x: number) => 42 )(1, 2, 3)"), {}))
        .toThrow(
          "wrong number of argnuments.",
        );
    });

    it("parses higher-order function `(f: (x: number) => number) => 1` correctly", () => {
      const result = typecheck(
        parseBasic("(f: (x: number) => number) => 1"),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{
          name: "f",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "Number" } }],
            retType: { tag: "Number" },
          },
        }],
        retType: { tag: "Number" },
      });
    });

    it("throws exception for calling non-function `42(1)`", () => {
      expect(() => typecheck(parseBasic("42(1)"), {})).toThrow(
        "function type expected.",
      );
    });
  });

  describe("recursive functions (recFunc)", () => {
    it("parses simple recursive function", () => {
      const result = typecheck(
        parseRecFunc("function fact(n: number): number { return n; }; fact"),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "n", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("parses recursive function with multiple parameters", () => {
      const result = typecheck(
        parseRecFunc(
          "function add(x: number, y: number): number { return x + y; }; add",
        ),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: { tag: "Number" },
      });
    });

    it("parses recursive function returning boolean", () => {
      const result = typecheck(
        parseRecFunc(
          "function check(x: number): boolean { return true; }; check",
        ),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });

    it("throws exception for wrong return type", () => {
      expect(() =>
        typecheck(
          parseRecFunc("function bad(x: number): number { return true; }; bad"),
          {},
        )
      ).toThrow(
        "wrong return type",
      );
    });

    it("allows self-reference in function body", () => {
      const result = typecheck(
        parseRecFunc("function fib(n: number): number { return fib(n); }; fib"),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "n", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("parses recursive function with conditional", () => {
      const result = typecheck(
        parseRecFunc(
          "function test(n: number): number { return true ? 1 : test(n); }; test",
        ),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "n", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("parses recursive function call correctly", () => {
      const result = typecheck(
        parseRecFunc(`
          function f(x: number): number { return f(x); }
          f(0)
        `),
        {},
      );
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("const declarations", () => {
    it("parses `const x = 1` correctly", () => {
      const result = typecheck(parseBasic("const x = 1"), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("parses `const x = true` correctly", () => {
      const result = typecheck(parseBasic("const x = true"), {});
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("parses `const x = (y: number) => boolean` correctly", () => {
      const result = typecheck(parseBasic("const x = (y: number) => true"), {});
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "y", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });
  });

  describe("sequence expressions", () => {
    it("parses `true; 42` correctly", () => {
      const result = typecheck(parseBasic("true; 42"), {});
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("object creation (objectNew)", () => {
    it("creates object with multiple properties correctly", () => {
      const result = typecheck(
        parseObj(`
        const x = { foo: 1, bar: true };
      `),
        {},
      );
      expect(result).toEqual({
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      });
    });

    it("creates object with function property correctly", () => {
      const result = typecheck(
        parseObj(`
        const obj = { f: (x: number) => x + 1 };
      `),
        {},
      );
      expect(result).toEqual({
        tag: "Object",
        props: [{
          name: "f",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "Number" } }],
            retType: { tag: "Number" },
          },
        }],
      });
    });
  });

  describe("object property access (objectGet)", () => {
    it("accesses number property correctly", () => {
      const result = typecheck(
        parseObj(`
        const x = { foo: 1, bar: true };
        x.foo;
      `),
        {},
      );
      expect(result).toEqual({ tag: "Number" });
    });

    it("accesses boolean property correctly", () => {
      const result = typecheck(
        parseObj(`
        const x = { foo: 1, bar: true };
        x.bar;
      `),
        {},
      );
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("accesses function property correctly", () => {
      const result = typecheck(
        parseObj(`
        const obj = { f: (x: number) => x + 1 };
        obj.f;
      `),
        {},
      );
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("throws exception when accessing property on non-object", () => {
      expect(() =>
        typecheck(
          parseObj(`
        const x = 42;
        x.foo;
      `),
          {},
        )
      ).toThrow("object type expected");
    });

    it("throws exception for unknown property name", () => {
      expect(() =>
        typecheck(
          parseObj(`
        const x = { foo: 1 };
        x.bar;
      `),
          {},
        )
      ).toThrow("unknown property name: bar");
    });
  });

  describe("combined expressions", () => {
    it("parses complex program with functions and const declarations correctly", () => {
      const program = `
        const add = (x: number, y: number) => x + y;
        const select = (b: boolean, x: number, y: number) => b ? x : y;
        const x = add(1, add(2, 3));
        const y = select(true, x, x);
        y
      `;
      const result = typecheck(parseBasic(program), {});
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("structural subtyping", () => {
    it("allows passing object with extra properties to function", () => {
      const program = `
        const f = (x: { foo: number }) => x.foo;
        const x = { foo: 1, bar: true };
        f(x)
      `;
      const result = typecheck(parseSub(program), {});
      expect(result).toEqual({ tag: "Number" });
    });

    it("throws error when function return type is missing required properties", () => {
      const program = `
        type F = () => { foo: number; bar: boolean };
        const f = (x: F) => x().bar;
        const g = () => ({ foo: 1 });
        f(g)
      `;
      expect(() => typecheck(parseSub(program), {})).toThrow(
        "parameter type mismatch",
      );
    });
  });

  describe("recursive types", () => {
    it("handles NumStream recursive type correctly", () => {
      const program = `
        type NumStream = { num: number; rest: () => NumStream };
        
        function numbers(n: number): NumStream {
          return { num: n, rest: () => numbers(n + 1) };
        }
        
        const ns1 = numbers(1);
        const ns2 = (ns1.rest)();
        const ns3 = (ns2.rest)();
        ns3
      `;
      const result = typecheck(parseRec(program), {});
      expect(result).toEqual({
        tag: "Rec",
        name: "NumStream",
        type: {
          tag: "Object",
          props: [
            { name: "num", type: { tag: "Number" } },
            {
              name: "rest",
              type: {
                tag: "Func",
                params: [],
                retType: { tag: "TypeVar", name: "NumStream" },
              },
            },
          ],
        },
      });
    });
  });

  describe("generics", () => {
    it("handles polymorphic identity function with enableGenerics", () => {
      const program = `<T>(x: T) => x`;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "TypeAbs",
        typeParams: ["T"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "T" },
        },
      });
    });

    it("handles type application correctly", () => {
      const program = `
        const id = <T>(x: T) => x;
        id<number>
      `;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("handles polymorphic select function with type application", () => {
      const program = `
        const select = <T>(cond: boolean, a: T, b: T) => (cond ? a : b);
        const selectNumber = select<number>;
        selectNumber;
      `;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "cond", type: { tag: "Boolean" } },
          { name: "a", type: { tag: "Number" } },
          { name: "b", type: { tag: "Number" } },
        ],
        retType: { tag: "Number" },
      });
    });

    it("handles polymorphic select function with boolean type application", () => {
      const program = `
        const select = <T>(cond: boolean, a: T, b: T) => (cond ? a : b);
        const selectBoolean = select<boolean>;
        selectBoolean;
      `;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "cond", type: { tag: "Boolean" } },
          { name: "a", type: { tag: "Boolean" } },
          { name: "b", type: { tag: "Boolean" } },
        ],
        retType: { tag: "Boolean" },
      });
    });

    it("handles polymorphic function with nested type abstraction parameter", () => {
      const program = `
        const foo = <T>(arg1: T, arg2: <T>(x: T) => boolean) => true;
        foo<number>;
      `;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "arg1", type: { tag: "Number" } },
          {
            name: "arg2",
            type: {
              tag: "TypeAbs",
              typeParams: ["T"],
              type: {
                tag: "Func",
                params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
                retType: { tag: "Boolean" },
              },
            },
          },
        ],
        retType: { tag: "Boolean" },
      });
    });

    it("handles complex nested polymorphic functions", () => {
      const program = `
        const foo = <T>(arg1: T, arg2: <U>(x: T, y: U) => boolean) => true;
        const bar = <U>() => foo<U>;
        bar;
      `;

      const result = typecheck(parsePoly(program), {}, [], true);
      expect(result).toEqual({
        tag: "TypeAbs",
        typeParams: ["U"],
        type: {
          tag: "Func",
          params: [],
          retType: {
            tag: "Func",
            params: [
              { name: "arg1", type: { tag: "TypeVar", name: "U" } },
              {
                name: "arg2",
                type: {
                  tag: "TypeAbs",
                  typeParams: ["U@1"],
                  type: {
                    tag: "Func",
                    params: [
                      { name: "x", type: { tag: "TypeVar", name: "U" } },
                      { name: "y", type: { tag: "TypeVar", name: "U@1" } },
                    ],
                    retType: { tag: "Boolean" },
                  },
                },
              },
            ],
            retType: { tag: "Boolean" },
          },
        },
      });
    });
  });
});
