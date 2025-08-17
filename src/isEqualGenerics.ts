import { Type } from "./type.ts";

export const isEqualGenerics = (
  ty: Type,
  otherTy: Type,
  map: Record<string, string>,
): boolean => {
  switch (otherTy.tag) {
    case "Boolean":
    case "Number":
      return ty.tag === otherTy.tag;
    case "Func": {
      if (ty.tag !== otherTy.tag) return false;
      if (ty.params.length !== otherTy.params.length) return false;
      for (let i = 0; i < ty.params.length; i++) {
        if (!isEqualGenerics(ty.params[i].type, otherTy.params[i].type, map)) {
          return false;
        }
      }
      return isEqualGenerics(ty.retType, otherTy.retType, map);
    }
    case "Object":
    case "Rec": {
      throw new Error("unimplemented.");
    }
    case "TypeVar": {
      if (ty.tag !== otherTy.tag) return false;
      const tyName = map[ty.name];
      if (tyName === undefined) {
        throw new Error(`unknown type variable: ${ty.name}`);
      }
      return tyName === otherTy.name;
    }
    case "TypeAbs": {
      if (ty.tag !== otherTy.tag) return false;
      if (ty.typeParams.length !== otherTy.typeParams.length) return false;
      const newMap = { ...map };
      for (let i = 0; i < ty.typeParams.length; i++) {
        newMap[ty.typeParams[i]] = otherTy.typeParams[i];
      }
      return isEqualGenerics(ty.type, otherTy.type, newMap);
    }
  }
};
