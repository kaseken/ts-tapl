import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Type } from "./type.ts";
import { isEqualGenerics } from "./isEqualGenerics.ts";

describe("isEqualGenerics", () => {
  describe("primitive types", () => {
    it("returns true for same Boolean types", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Boolean" };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns true for same Number types", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Number" };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for Boolean vs Number", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Number" };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns false for Number vs Boolean", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Boolean" };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });
  });

  describe("function types", () => {
    it("returns true for identical function types with no parameters", () => {
      const ty1: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for function types with different return types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Number" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns true for function types with same single parameter", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{ name: "y", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for function types with different parameter types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Boolean" } }],
        retType: { tag: "Boolean" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns false for function types with different parameter counts", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
        retType: { tag: "Boolean" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns true for function types with multiple same parameters", () => {
      const ty1: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
        retType: { tag: "Number" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [
          { name: "a", type: { tag: "Number" } },
          { name: "b", type: { tag: "Boolean" } },
        ],
        retType: { tag: "Number" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for non-Func vs Func", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Number" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });
  });

  describe("type variables", () => {
    it("returns true for mapped type variables", () => {
      const ty1: Type = { tag: "TypeVar", name: "A" };
      const ty2: Type = { tag: "TypeVar", name: "B" };
      const map = { A: "B" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(true);
    });

    it("returns false for incorrectly mapped type variables", () => {
      const ty1: Type = { tag: "TypeVar", name: "A" };
      const ty2: Type = { tag: "TypeVar", name: "C" };
      const map = { A: "B" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(false);
    });

    it("throws error for unknown type variable", () => {
      const ty1: Type = { tag: "TypeVar", name: "A" };
      const ty2: Type = { tag: "TypeVar", name: "B" };
      const map = {};
      expect(() => isEqualGenerics(ty1, ty2, map)).toThrow(
        "unknown type variable: A",
      );
    });

    it("returns false when first type is not TypeVar but second is", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "TypeVar", name: "A" };
      const map = { A: "A" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(false);
    });

    it("works with type variables in function parameters", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
        retType: { tag: "TypeVar", name: "U" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
        retType: { tag: "TypeVar", name: "B" },
      };
      const map = { T: "A", U: "B" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(true);
    });

    it("returns false when type variables in functions don't match mapping", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
        retType: { tag: "TypeVar", name: "U" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
        retType: { tag: "TypeVar", name: "C" },
      };
      const map = { T: "A", U: "B" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(false);
    });
  });

  describe("type abstractions", () => {
    it("returns true for identical type abstractions with single parameter", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "TypeVar", name: "T" },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: { tag: "TypeVar", name: "U" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns true for type abstractions with multiple parameters", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T", "U"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["A", "B"],
        type: {
          tag: "Func",
          params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
          retType: { tag: "TypeVar", name: "B" },
        },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for type abstractions with different parameter counts", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "TypeVar", name: "T" },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["A", "B"],
        type: { tag: "TypeVar", name: "A" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns false for type abstractions with different body types", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "TypeVar", name: "T" },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: { tag: "Number" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("returns false when first type is not TypeAbs but second is", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "TypeVar", name: "T" },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });

    it("handles nested type abstractions", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: {
          tag: "TypeAbs",
          typeParams: ["U"],
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
            retType: { tag: "TypeVar", name: "U" },
          },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["A"],
        type: {
          tag: "TypeAbs",
          typeParams: ["B"],
          type: {
            tag: "Func",
            params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
            retType: { tag: "TypeVar", name: "B" },
          },
        },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("preserves existing mappings when creating new scope", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["A"],
        type: {
          tag: "Func",
          params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
          retType: { tag: "TypeVar", name: "B" },
        },
      };
      const map = { U: "B" };
      expect(isEqualGenerics(ty1, ty2, map)).toBe(true);
    });
  });

  describe("unimplemented cases", () => {
    it("throws error for Object types", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Object", props: [] };
      expect(() => isEqualGenerics(ty1, ty2, {})).toThrow("unimplemented.");
    });

    it("throws error for Rec types", () => {
      const ty1: Type = { tag: "Rec", name: "R", type: { tag: "Number" } };
      const ty2: Type = { tag: "Rec", name: "S", type: { tag: "Number" } };
      expect(() => isEqualGenerics(ty1, ty2, {})).toThrow("unimplemented.");
    });
  });

  describe("complex scenarios", () => {
    it("handles polymorphic identity function", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "T" },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: {
          tag: "Func",
          params: [{ name: "y", type: { tag: "TypeVar", name: "U" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("handles polymorphic composition function", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["A", "B", "C"],
        type: {
          tag: "Func",
          params: [
            {
              name: "f",
              type: {
                tag: "Func",
                params: [{ name: "x", type: { tag: "TypeVar", name: "B" } }],
                retType: { tag: "TypeVar", name: "C" },
              },
            },
            {
              name: "g",
              type: {
                tag: "Func",
                params: [{ name: "y", type: { tag: "TypeVar", name: "A" } }],
                retType: { tag: "TypeVar", name: "B" },
              },
            },
          ],
          retType: {
            tag: "Func",
            params: [{ name: "z", type: { tag: "TypeVar", name: "A" } }],
            retType: { tag: "TypeVar", name: "C" },
          },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["X", "Y", "Z"],
        type: {
          tag: "Func",
          params: [
            {
              name: "h",
              type: {
                tag: "Func",
                params: [{ name: "p", type: { tag: "TypeVar", name: "Y" } }],
                retType: { tag: "TypeVar", name: "Z" },
              },
            },
            {
              name: "i",
              type: {
                tag: "Func",
                params: [{ name: "q", type: { tag: "TypeVar", name: "X" } }],
                retType: { tag: "TypeVar", name: "Y" },
              },
            },
          ],
          retType: {
            tag: "Func",
            params: [{ name: "r", type: { tag: "TypeVar", name: "X" } }],
            retType: { tag: "TypeVar", name: "Z" },
          },
        },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(true);
    });

    it("returns false for polymorphic functions with different structures", () => {
      const ty1: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "T" },
        },
      };
      const ty2: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: {
          tag: "Func",
          params: [{ name: "y", type: { tag: "TypeVar", name: "U" } }],
          retType: { tag: "Number" },
        },
      };
      expect(isEqualGenerics(ty1, ty2, {})).toBe(false);
    });
  });
});
