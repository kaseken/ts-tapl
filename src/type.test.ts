import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { isEqual, isSubTypeOf, Type } from "./type.ts";

describe("typeEq", () => {
  describe("Boolean types", () => {
    it("returns true for same Boolean types", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Boolean" };
      expect(isEqual(ty1, ty2)).toBe(true);
    });

    it("returns false for Boolean vs Number", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Number" };
      expect(isEqual(ty1, ty2)).toBe(false);
    });

    it("returns false for Boolean vs Func", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      expect(isEqual(ty1, ty2)).toBe(false);
    });
  });

  describe("Number types", () => {
    it("returns true for same Number types", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Number" };
      expect(isEqual(ty1, ty2)).toBe(true);
    });

    it("returns false for Number vs Boolean", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Boolean" };
      expect(isEqual(ty1, ty2)).toBe(false);
    });

    it("returns false for Number vs Func", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
    });

    it("returns false for function types with different return types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
    });

    it("returns false for non-Func vs Func", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Func", params: [], retType: { tag: "Number" } };
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
    });
  });

  describe("Object types", () => {
    it("returns true for empty Object types", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Object", props: [] };
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(false);
    });

    it("returns false for Object vs non-Object types", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Number" };
      expect(isEqual(ty1, ty2)).toBe(false);
    });

    it("returns false for non-Object vs Object types", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Object", props: [] };
      expect(isEqual(ty1, ty2)).toBe(false);
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
      expect(isEqual(ty1, ty2)).toBe(true);
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
      expect(isEqual(ty1, ty2)).toBe(true);
    });
  });
});

describe("isSubTypeOf", () => {
  describe("primitive types", () => {
    it("returns true for Boolean subtype of Boolean", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Boolean" };
      expect(isSubTypeOf(ty1, ty2)).toBe(true);
    });

    it("returns true for Number subtype of Number", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Number" };
      expect(isSubTypeOf(ty1, ty2)).toBe(true);
    });

    it("returns false for Boolean subtype of Number", () => {
      const ty1: Type = { tag: "Boolean" };
      const ty2: Type = { tag: "Number" };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });

    it("returns false for Number subtype of Boolean", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Boolean" };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });
  });

  describe("function types", () => {
    it("returns true for identical function types", () => {
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
      expect(isSubTypeOf(ty1, ty2)).toBe(true);
    });

    it("returns false for different parameter counts", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Boolean" },
      };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });

    it("returns false for different return types", () => {
      const ty1: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const ty2: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });

    it("demonstrates contravariance in parameter types", () => {
      // (Animal => T) is subtype of (Dog => T) if Animal is supertype of Dog
      const animalType: Type = {
        tag: "Object",
        props: [{ name: "name", type: { tag: "Number" } }],
      };
      const dogType: Type = {
        tag: "Object",
        props: [
          { name: "name", type: { tag: "Number" } },
          { name: "breed", type: { tag: "Boolean" } },
        ],
      };

      const animalFunc: Type = {
        tag: "Func",
        params: [{ name: "x", type: animalType }],
        retType: { tag: "Number" },
      };
      const dogFunc: Type = {
        tag: "Func",
        params: [{ name: "x", type: dogType }],
        retType: { tag: "Number" },
      };

      // animalFunc should be subtype of dogFunc (contravariance)
      expect(isSubTypeOf(animalFunc, dogFunc)).toBe(true);
      expect(isSubTypeOf(dogFunc, animalFunc)).toBe(false);
    });

    it("returns false for non-function subtype of function", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Number" },
      };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });
  });

  describe("object types", () => {
    it("returns true for identical object types", () => {
      const ty1: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      const ty2: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      expect(isSubTypeOf(ty1, ty2)).toBe(true);
    });

    it("returns true when subtype has extra properties (structural subtyping)", () => {
      const subtype: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
          { name: "extra", type: { tag: "Number" } },
        ],
      };
      const supertype: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      expect(isSubTypeOf(subtype, supertype)).toBe(true);
    });

    it("returns false when subtype is missing required properties", () => {
      const subtype: Type = {
        tag: "Object",
        props: [{ name: "foo", type: { tag: "Number" } }],
      };
      const supertype: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      expect(isSubTypeOf(subtype, supertype)).toBe(false);
    });

    it("returns true for empty object subtype of empty object", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Object", props: [] };
      expect(isSubTypeOf(ty1, ty2)).toBe(true);
    });

    it("returns true for any object subtype of empty object", () => {
      const subtype: Type = {
        tag: "Object",
        props: [{ name: "foo", type: { tag: "Number" } }],
      };
      const supertype: Type = { tag: "Object", props: [] };
      expect(isSubTypeOf(subtype, supertype)).toBe(true);
    });

    it("returns false for non-object subtype of object", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Object", props: [] };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });
  });

  describe("mixed types", () => {
    it("returns false for object subtype of primitive", () => {
      const ty1: Type = { tag: "Object", props: [] };
      const ty2: Type = { tag: "Number" };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });

    it("returns false for function subtype of primitive", () => {
      const ty1: Type = {
        tag: "Func",
        params: [],
        retType: { tag: "Number" },
      };
      const ty2: Type = { tag: "Number" };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });

    it("returns false for primitive subtype of object", () => {
      const ty1: Type = { tag: "Number" };
      const ty2: Type = { tag: "Object", props: [] };
      expect(isSubTypeOf(ty1, ty2)).toBe(false);
    });
  });
});
