import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { Type } from "./type.ts";
import { expandType } from "./expandType.ts";

describe("expandType", () => {
  describe("primitive types", () => {
    it("returns Boolean unchanged", () => {
      const ty: Type = { tag: "Boolean" };
      const result = expandType(ty, "T", { tag: "Number" });
      expect(result).toEqual({ tag: "Boolean" });
    });

    it("returns Number unchanged", () => {
      const ty: Type = { tag: "Number" };
      const result = expandType(ty, "T", { tag: "Boolean" });
      expect(result).toEqual({ tag: "Number" });
    });
  });

  describe("TypeVar expansion", () => {
    it("replaces matching TypeVar with replacement type", () => {
      const ty: Type = { tag: "TypeVar", name: "T" };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({ tag: "Number" });
    });

    it("leaves non-matching TypeVar unchanged", () => {
      const ty: Type = { tag: "TypeVar", name: "U" };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({ tag: "TypeVar", name: "U" });
    });
  });

  describe("function types", () => {
    it("expands TypeVar in function parameter types", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
        retType: { tag: "Boolean" },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });

    it("expands TypeVar in function return type", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "TypeVar", name: "T" },
      };
      const repTy: Type = { tag: "Boolean" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "Number" } }],
        retType: { tag: "Boolean" },
      });
    });

    it("expands TypeVar in both parameters and return type", () => {
      const ty: Type = {
        tag: "Func",
        params: [
          { name: "x", type: { tag: "TypeVar", name: "T" } },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: { tag: "TypeVar", name: "T" },
      };
      const repTy: Type = { tag: "Boolean" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Func",
        params: [
          { name: "x", type: { tag: "Boolean" } },
          { name: "y", type: { tag: "Number" } },
        ],
        retType: { tag: "Boolean" },
      });
    });

    it("leaves function unchanged when no TypeVar matches", () => {
      const ty: Type = {
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "U" } }],
        retType: { tag: "Boolean" },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Func",
        params: [{ name: "x", type: { tag: "TypeVar", name: "U" } }],
        retType: { tag: "Boolean" },
      });
    });
  });

  describe("object types", () => {
    it("expands TypeVar in object property types", () => {
      const ty: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "TypeVar", name: "T" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "Number" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      });
    });

    it("leaves object unchanged when no TypeVar matches", () => {
      const ty: Type = {
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "TypeVar", name: "U" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Object",
        props: [
          { name: "foo", type: { tag: "TypeVar", name: "U" } },
          { name: "bar", type: { tag: "Boolean" } },
        ],
      });
    });
  });

  describe("recursive types", () => {
    it("returns Rec type unchanged when name matches target variable", () => {
      const ty: Type = {
        tag: "Rec",
        name: "T",
        type: { tag: "TypeVar", name: "T" },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Rec",
        name: "T",
        type: { tag: "TypeVar", name: "T" },
      });
    });

    it("expands inner type when Rec name doesn't match target variable", () => {
      const ty: Type = {
        tag: "Rec",
        name: "U",
        type: { tag: "TypeVar", name: "T" },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Rec",
        name: "U",
        type: { tag: "Number" },
      });
    });

    it("expands complex nested type within Rec", () => {
      const ty: Type = {
        tag: "Rec",
        name: "U",
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Rec",
        name: "U",
        type: {
          tag: "Func",
          params: [{ name: "x", type: { tag: "Number" } }],
          retType: { tag: "TypeVar", name: "U" },
        },
      });
    });
  });

  describe("complex nested expansions", () => {
    it("expands TypeVar in deeply nested function types", () => {
      const ty: Type = {
        tag: "Func",
        params: [{
          name: "f",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
            retType: { tag: "Boolean" },
          },
        }],
        retType: { tag: "TypeVar", name: "T" },
      };
      const repTy: Type = { tag: "Number" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Func",
        params: [{
          name: "f",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "Number" } }],
            retType: { tag: "Boolean" },
          },
        }],
        retType: { tag: "Number" },
      });
    });

    it("expands TypeVar in object with function properties", () => {
      const ty: Type = {
        tag: "Object",
        props: [{
          name: "method",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "TypeVar", name: "T" } }],
            retType: { tag: "TypeVar", name: "T" },
          },
        }],
      };
      const repTy: Type = { tag: "Boolean" };
      const result = expandType(ty, "T", repTy);
      expect(result).toEqual({
        tag: "Object",
        props: [{
          name: "method",
          type: {
            tag: "Func",
            params: [{ name: "x", type: { tag: "Boolean" } }],
            retType: { tag: "Boolean" },
          },
        }],
      });
    });
  });
});
