import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { parseArith } from "npm:tiny-ts-parser";
import { typecheck } from "./typecheck.ts";

describe("typecheck", () => {
  it("parses `1 + 2` correctly", () => {
    const result = typecheck(parseArith("1 + 2"));
    expect(result).toEqual({ tag: "Number" });
  });

  it("parses `1 + (2 + 3)` correctly", () => {
    const result = typecheck(parseArith("1 + (2 + 3)"));
    expect(result).toEqual({ tag: "Number" });
  });

  it("throws exception for `1 + true`", () => {
    expect(() => typecheck(parseArith("1 + true"))).toThrow("Number expected.");
  });

  it("throws exception for `false + 1`", () => {
    expect(() => typecheck(parseArith("false + 1"))).toThrow(
      "Number expected.",
    );
  });

  it("parses `true ? 1 : 2` correctly", () => {
    const result = typecheck(parseArith("true ? 1 : 2"));
    expect(result).toEqual({ tag: "Number" });
  });

  it("parses `false ? 1 : 2` correctly", () => {
    const result = typecheck(parseArith("false ? 1 : 2"));
    expect(result).toEqual({ tag: "Number" });
  });

  it("parses `true ? true : false` correctly", () => {
    const result = typecheck(parseArith("true ? true : false"));
    expect(result).toEqual({ tag: "Boolean" });
  });

  it("throws exception for `1 ? 2 : 3`", () => {
    expect(() => typecheck(parseArith("1 ? 2 : 3"))).toThrow(
      "Boolean expected.",
    );
  });

  it("throws exception for `true ? 1 : true`", () => {
    expect(() => typecheck(parseArith("true ? 1 : true"))).toThrow(
      "then and else have different types.",
    );
  });

  it("parses `true` correctly", () => {
    const result = typecheck(parseArith("true"));
    expect(result).toEqual({ tag: "Boolean" });
  });

  it("parses `false` correctly", () => {
    const result = typecheck(parseArith("false"));
    expect(result).toEqual({ tag: "Boolean" });
  });

  it("parses `1` correctly", () => {
    const result = typecheck(parseArith("1"));
    expect(result).toEqual({ tag: "Number" });
  });
});
