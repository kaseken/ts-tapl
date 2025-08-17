import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { freshTypeAbs } from "./freshTypeAbs.ts";
import { Type } from "./type.ts";

describe("freshTypeAbs", () => {
  describe("single type parameter", () => {
    it("generates fresh type variable for simple TypeVar", () => {
      const typeParams = ["T"];
      const ty: Type = { tag: "TypeVar", name: "T" };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(1);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newType).toEqual({
        tag: "TypeVar",
        name: result.newTypeParams[0],
      });
    });

    it("substitutes type variable in function type", () => {
      const typeParams = ["T"];
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
        retType: { tag: "TypeVar", name: "T" },
      };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(1);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newType).toEqual({
        tag: "Func",
        params: [{
          name: "x",
          type: { tag: "TypeVar", name: result.newTypeParams[0] },
        }],
        retType: { tag: "TypeVar", name: result.newTypeParams[0] },
      });
    });

    it("leaves unrelated type variables unchanged", () => {
      const typeParams = ["T"];
      const ty: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "TypeVar", name: "T" } },
          { name: "y", type: { tag: "TypeVar", name: "U" } },
        ],
        retType: { tag: "Boolean" },
      };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(1);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newType).toEqual({
        tag: "Func",
        params: [
          {
            name: "x",
            type: { tag: "TypeVar", name: result.newTypeParams[0] },
          },
          { name: "y", type: { tag: "TypeVar", name: "U" } },
        ],
        retType: { tag: "Boolean" },
      });
    });
  });

  describe("multiple type parameters", () => {
    it("generates fresh variables for all type parameters", () => {
      const typeParams = ["T", "U"];
      const ty: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "TypeVar", name: "T" } },
          { name: "y", type: { tag: "TypeVar", name: "U" } },
        ],
        retType: { tag: "TypeVar", name: "T" },
      };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(2);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newTypeParams[1]).toMatch(/^U@\d+$/);
      expect(result.newType).toEqual({
        tag: "Func",
        params: [
          {
            name: "x",
            type: { tag: "TypeVar", name: result.newTypeParams[0] },
          },
          {
            name: "y",
            type: { tag: "TypeVar", name: result.newTypeParams[1] },
          },
        ],
        retType: { tag: "TypeVar", name: result.newTypeParams[0] },
      });
    });

    it("handles complex nested types", () => {
      const typeParams = ["T", "U"];
      const ty: Type = {
        tag: "TypeAbs",
        typeParams: ["V"],
        type: {
          tag: "Func",
          params: [
            { name: "x", type: { tag: "TypeVar", name: "T" } },
            { name: "y", type: { tag: "TypeVar", name: "U" } },
            { name: "z", type: { tag: "TypeVar", name: "V" } },
          ],
          retType: { tag: "TypeVar", name: "T" },
        },
      };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(2);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newTypeParams[1]).toMatch(/^U@\d+$/);
      expect(result.newType).toEqual({
        tag: "TypeAbs",
        typeParams: ["V@7@9"],
        type: {
          tag: "Func",
          params: [
            {
              name: "x",
              type: { tag: "TypeVar", name: result.newTypeParams[0] },
            },
            {
              name: "y",
              type: { tag: "TypeVar", name: result.newTypeParams[1] },
            },
            { name: "z", type: { tag: "TypeVar", name: "V@7@9" } },
          ],
          retType: { tag: "TypeVar", name: result.newTypeParams[0] },
        },
      });
    });
  });

  describe("empty type parameters", () => {
    it("returns type unchanged when no type parameters", () => {
      const typeParams: string[] = [];
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(0);
      expect(result.newType).toEqual(ty);
    });
  });

  describe("primitive types", () => {
    it("handles primitive types with type parameters", () => {
      const typeParams = ["T"];
      const ty: Type = { tag: "Number" };

      const result = freshTypeAbs(typeParams, ty);

      expect(result.newTypeParams).toHaveLength(1);
      expect(result.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result.newType).toEqual({ tag: "Number" });
    });
  });

  describe("unique fresh variables", () => {
    it("generates unique fresh variables across multiple calls", () => {
      const typeParams = ["T"];
      const ty: Type = { tag: "TypeVar", name: "T" };

      const result1 = freshTypeAbs(typeParams, ty);
      const result2 = freshTypeAbs(typeParams, ty);

      expect(result1.newTypeParams[0]).not.toBe(result2.newTypeParams[0]);
      expect(result1.newTypeParams[0]).toMatch(/^T@\d+$/);
      expect(result2.newTypeParams[0]).toMatch(/^T@\d+$/);
    });
  });
});
