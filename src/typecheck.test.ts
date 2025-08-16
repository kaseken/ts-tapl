import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { parseArith, parseBasic, parseObj } from "npm:tiny-ts-parser";
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
});
