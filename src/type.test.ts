import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Type, typeEq } from "./type.ts";

describe("typeEq", () => {
  describe("Boolean types", () => {
    it("returns true for same Boolean types", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Boolean" };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for Boolean vs Number", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Number" };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for Boolean vs Func", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      expect(typeEq(ty1, ty2)).toBe(false);
    });
  });

  describe("Number types", () => {
    it("returns true for same Number types", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Number" };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for Number vs Boolean", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Boolean" };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for Number vs Func", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(typeEq(ty1, ty2)).toBe(false);
    });
  });

  describe("Function types", () => {
    it("returns true for same function types with no parameters", () => {
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
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for function types with different return types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(typeEq(ty1, ty2)).toBe(false);
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
      expect(typeEq(ty1, ty2)).toBe(true);
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
      expect(typeEq(ty1, ty2)).toBe(false);
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
      expect(typeEq(ty1, ty2)).toBe(false);
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
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for non-Func vs Func", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns true for nested function types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{
          name: "f",
          type: { tag: "Func", params: [], retType: { tag: "Number" } },
        }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{
          name: "g",
          type: { tag: "Func", params: [], retType: { tag: "Number" } },
        }],
        retType: { tag: "Boolean" },
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for nested function types with different inner return types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{
          name: "f",
          type: { tag: "Func", params: [], retType: { tag: "Number" } },
        }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{
          name: "f",
          type: { tag: "Func", params: [], retType: { tag: "Boolean" } },
        }],
        retType: { tag: "Boolean" },
      };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns true for complex nested function types", () => {
      const innerFunc: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty1: Type = {
        tag: "Func",
        params: [
          { name: "f", type: innerFunc },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: innerFunc,
      };
      const ty2: Type = {
        tag: "Func",
        params: [
          { name: "g", type: innerFunc },
          { name: "z", type: { tag: "Number" } },
        ],
        retType: innerFunc,
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });
  });

  describe("Object types", () => {
    it("returns true for empty Object types", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Object", props: [] };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns true for Object types with same properties in same order", () => {
      const ty1: Type = {
        tag: "Object",
        props: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
      };
      const ty2: Type = {
        tag: "Object",
        props: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns true for Object types with same properties in different order", () => {
      const ty1: Type = {
        tag: "Object",
        props: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
      };
      const ty2: Type = {
        tag: "Object",
        props: [
          { name: "y", type: { tag: "Boolean" } },
          { name: "x", type: { tag: "Number" } },
        ],
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns false for Object types with different property counts", () => {
      const ty1: Type = {
        tag: "Object",
        props: [{ name: "x", type: { tag: "Number" } }],
      };
      const ty2: Type = {
        tag: "Object",
        props: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
      };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for Object types with different property names", () => {
      const ty1: Type = {
        tag: "Object",
        props: [{ name: "x", type: { tag: "Number" } }],
      };
      const ty2: Type = {
        tag: "Object",
        props: [{ name: "y", type: { tag: "Number" } }],
      };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for Object types with different property types", () => {
      const ty1: Type = {
        tag: "Object",
        props: [{ name: "x", type: { tag: "Number" } }],
      };
      const ty2: Type = {
        tag: "Object",
        props: [{ name: "x", type: { tag: "Boolean" } }],
      };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for Object vs non-Object types", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Number" };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns false for non-Object vs Object types", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Object", props: [] };
      expect(typeEq(ty1, ty2)).toBe(false);
    });

    it("returns true for Object types with function properties", () => {
      const funcType: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty1: Type = {
        tag: "Object",
        props: [{ name: "method", type: funcType }],
      };
      const ty2: Type = {
        tag: "Object",
        props: [{ name: "method", type: funcType }],
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });

    it("returns true for nested Object types", () => {
      const innerObj: Type = {
        tag: "Object",
        props: [{ name: "value", type: { tag: "Number" } }],
      };
      const ty1: Type = {
        tag: "Object",
        props: [{ name: "nested", type: innerObj }],
      };
      const ty2: Type = {
        tag: "Object",
        props: [{ name: "nested", type: innerObj }],
      };
      expect(typeEq(ty1, ty2)).toBe(true);
    });
  });
});
