import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { subst } from "./subst.ts";
import { Type } from "./type.ts";

describe("subst", () => {
  describe("primitive types", () => {
    it("returns Boolean unchanged", () => {
      const ty: Type = { tag: "Boolean" };
      const result = subst(ty, "T", { tag: "Number" });
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("returns Number unchanged", () => {
      const ty: Type = { tag: "Number" };
      const result = subst(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("TypeVar substitution", () => {
    it("replaces matching TypeVar with replacement type", () => {
      const ty: Type = { tag: "TypeVar", name: "T" };
      const repTy: Type = { tag: "Number" };
      const result = subst(ty, "T", repTy);
      expect(result).toEqual({ tag: "Number" });
    });

    it("leaves non-matching TypeVar unchanged", () => {
      const ty: Type = { tag: "TypeVar", name: "T" };
      const repTy: Type = { tag: "Number" };
      const result = subst(ty, "U", repTy);
      expect(result).toEqual({ tag: "TypeVar", name: "T" });
    });
  });

  describe("function types", () => {
    it("substitutes TypeVar in function parameter types", () => {
      const ty: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "TypeVar", name: "T" } },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: { tag: "Boolean" },
      };
      const result = subst(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Boolean" } },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: { tag: "Boolean" },
      });
    });

    it("substitutes TypeVar in function return type", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "TypeVar", name: "T" },
      };
      const result = subst(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });

    it("substitutes TypeVar in both parameters and return type", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
        retType: { tag: "TypeVar", name: "T" },
      };
      const result = subst(ty, "T", { tag: "Number" });
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Number" },
      });
    });

    it("leaves function unchanged when no TypeVar matches", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      };
      const result = subst(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });
  });

  describe("TypeAbs types", () => {
    it("substitutes TypeVar in TypeAbs inner type", () => {
      const ty: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: { tag: "TypeVar", name: "T" },
      };
      const result = subst(ty, "T", { tag: "Number" });
      expect(result).toEqual({
        tag: "TypeAbs",
        typeParams: ["U"],
        type: { tag: "Number" },
      });
    });

    it("leaves TypeAbs unchanged when no TypeVar matches", () => {
      const ty: Type = {
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "Number" },
      };
      const result = subst(ty, "U", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "TypeAbs",
        typeParams: ["T"],
        type: { tag: "Number" },
      });
    });

    it("substitutes in nested TypeAbs", () => {
      const ty: Type = {
        tag: "TypeAbs",
        typeParams: ["U"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      };
      const result = subst(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "TypeAbs",
        typeParams: ["U"],
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "Boolean" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      });
    });
  });

  describe("Object types (unimplemented)", () => {
    it("throws error for Object types", () => {
      const ty: Type = {
        tag: "Object",
        props: [{ name: "x", type: { tag: "Number" } }],
      };
      expect(() => subst(ty, "T", { tag: "Number" })).toThrow("unimplemented.");
    });
  });

  describe("Rec types (unimplemented)", () => {
    it("throws error for Rec types", () => {
      const ty: Type = {
        tag: "Rec",
        name: "List",
        type: { tag: "TypeVar", name: "List" },
      };
      expect(() => subst(ty, "T", { tag: "Number" })).toThrow("unimplemented.");
    });
  });

  describe("complex nested substitutions", () => {
    it("substitutes TypeVar in deeply nested function types", () => {
      const ty: Type = {
        tag: "Func",
        params: [{
          name: "f",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
            retType: { tag: "TypeVar", name: "T" },
          },
        }],
        retType: { tag: "TypeVar", name: "T" },
      };
      const result = subst(ty, "T", { tag: "Number" });
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

    it("substitutes multiple different TypeVars", () => {
      const ty: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "TypeVar", name: "T" } },
          { name: "y", type: { tag: "TypeVar", name: "U" } },
        ],
        retType: { tag: "TypeVar", name: "T" },
      };

      // First substitute T with Number
      let result = subst(ty, "T", { tag: "Number" });
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "TypeVar", name: "U" } },
        ],
        retType: { tag: "Number" },
      });

      // Then substitute U with Boolean
      result = subst(result, "U", { tag: "Boolean" });
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Number" } },
          { name: "y", type: { tag: "Boolean" } },
        ],
        retType: { tag: "Number" },
      });
    });
  });
});
