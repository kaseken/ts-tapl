import { Term } from "./term.ts";
import { Type } from "./type.ts";

export const typecheck = (t: Term): Type => {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = typecheck(t.cond);
      if (condTy.tag !== "Boolean") {
        throw Error("Boolean expected.");
      }
      const thnTy = typecheck(t.thn);
      const elsTy = typecheck(t.els);
      if (thnTy.tag !== elsTy.tag) {
        throw Error("then and else have different types.");
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = typecheck(t.left);
      if (leftTy.tag !== "Number") {
        throw Error("Number expected.");
      }
      const rightTy = typecheck(t.right);
      if (rightTy.tag !== "Number") {
        throw Error("Number expected.");
      }
      return { tag: "Number" };
    }
  }
};
