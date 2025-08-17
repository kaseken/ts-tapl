import { freshTypeAbs } from "./freshTypeAbs.ts";
import { Type } from "./type.ts";

export const subst = (ty: Type, tyVarName: string, repTy: Type): Type => {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
      return ty;
    case "Func": {
      const params = ty.params.map(({ name, type }) => ({
        name,
        type: subst(type, tyVarName, repTy),
      }));
      const retType = subst(ty.retType, tyVarName, repTy);
      return { tag: "Func", params, retType };
    }
    case "Object": {
      throw new Error("unimplemented.");
    }
    case "Rec": {
      throw new Error("unimplemented.");
    }
    case "TypeVar": {
      return ty.name === tyVarName ? repTy : ty;
    }
    case "TypeAbs": {
      if (ty.typeParams.includes(tyVarName)) {
        return ty;
      }
      const { newTypeParams, newType } = freshTypeAbs(ty.typeParams, ty.type);
      return {
        tag: "TypeAbs",
        typeParams: newTypeParams,
        type: subst(newType, tyVarName, repTy),
      };
    }
  }
};
