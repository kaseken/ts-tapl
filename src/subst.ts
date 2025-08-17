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
      const newType = subst(ty.type, tyVarName, repTy);
      return { tag: "TypeAbs", typeParams: ty.typeParams, type: newType };
    }
  }
};
