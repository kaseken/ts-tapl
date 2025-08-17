import { Type } from "./type.ts";

export const simplifyType = (ty: Type): Type => {
  switch (ty.tag) {
    case "Rec": {
      return simplifyType(expandType(ty.type, ty.name, ty));
    }
    case "Boolean":
    case "Number":
    case "Func":
    case "Object":
    case "TypeVar": {
      return ty;
    }
  }
}

export const expandType = (ty: Type, tyVarName: string, repTy: Type): Type => {
  switch (ty.tag) {
    case "Boolean":
    case "Number":
      return ty;
    case "Func": {
      const params = ty.params.map(({ name, type }) => ({
        name,
        type: expandType(type, tyVarName, repTy),
      }));
      const retType = expandType(ty.retType, tyVarName, repTy);
      return { tag: "Func", params, retType };
    }
    case "Object": {
      const props = ty.props.map(({ name, type }) => ({
        name,
        type: expandType(type, tyVarName, repTy),
      }));
      return { tag: "Object", props };
    }
    case "Rec": {
      if (ty.name === tyVarName) return ty;
      const newType = expandType(ty.type, tyVarName, repTy);
      return { tag: "Rec", name: ty.name, type: newType };
    }
    case "TypeVar": {
      return ty.name === tyVarName ? repTy : ty;
    }
  }
};
