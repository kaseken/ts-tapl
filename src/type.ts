import { simplifyType } from "./expandType.ts";
import { Param } from "./param.ts";

export type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "Object"; props: PropertyType[] }
  | { tag: "Rec"; name: string; type: Type }
  | { tag: "TypeVar"; name: string }
  | { tag: "TypeAbs"; typeParams: string[]; type: Type };

const isEqualSub = (ty: Type, otherTy: Type, seen: [Type, Type][]): boolean => {
  for (const [ty1, ty2] of seen) {
    if (isEqualNaive(ty1, ty, {}) && isEqualNaive(ty2, otherTy, {})) {
      return true;
    }
  }
  if (ty.tag === "Rec") {
    return isEqualSub(simplifyType(ty), otherTy, [...seen, [ty, otherTy]]);
  }
  if (otherTy.tag === "Rec") {
    return isEqualSub(ty, simplifyType(otherTy), [...seen, [ty, otherTy]]);
  }
  switch (otherTy.tag) {
    case "Boolean":
    case "Number":
      return ty.tag === otherTy.tag;
    case "Func": {
      if (ty.tag !== "Func") return false;
      if (ty.params.length !== otherTy.params.length) return false;
      for (let i = 0; i < ty.params.length; i++) {
        if (!isEqualSub(ty.params[i].type, otherTy.params[i].type, seen)) {
          return false;
        }
      }
      return isEqualSub(ty.retType, otherTy.retType, seen);
    }
    case "Object": {
      if (ty.tag !== "Object") return false;
      if (ty.props.length !== otherTy.props.length) return false;
      const tyPropsMap = new Map(ty.props.map((p) => [p.name, p.type]));
      for (const prop of otherTy.props) {
        const ty = tyPropsMap.get(prop.name);
        if (ty == null || !isEqualSub(ty, prop.type, seen)) {
          return false;
        }
      }
      return true;
    }
    case "TypeVar": {
      throw new Error("unreachable.");
    }
    case "TypeAbs": {
      throw new Error("unimplemented.");
    }
  }
};

export const isEqual = (ty: Type, otherTy: Type): boolean => {
  return isEqualSub(ty, otherTy, []);
};

const isEqualNaive = (
  ty1: Type,
  ty2: Type,
  tyVarMap: Record<string, string>,
): boolean => {
  switch (ty2.tag) {
    case "Boolean":
    case "Number":
      return ty1.tag === ty2.tag;
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!isEqualNaive(ty1.params[i].type, ty2.params[i].type, tyVarMap)) {
          return false;
        }
      }
      return isEqualNaive(ty1.retType, ty2.retType, tyVarMap);
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      const ty1PropsMap = new Map(ty1.props.map((p) => [p.name, p.type]));
      for (const prop of ty2.props) {
        const ty = ty1PropsMap.get(prop.name);
        if (ty == null || !isEqualNaive(ty, prop.type, tyVarMap)) {
          return false;
        }
      }
      return true;
    }
    case "Rec": {
      if (ty1.tag !== ty2.tag) {
        return false;
      }
      return isEqualNaive(ty1.type, ty2.type, {
        ...tyVarMap,
        [ty1.name]: ty2.name,
      });
    }
    case "TypeVar": {
      if (ty1.tag !== "TypeVar") {
        return false;
      }
      if (tyVarMap[ty1.name] == null) {
        throw new Error(`unknown type variable: ${ty1.name}`);
      }
      return tyVarMap[ty1.name] === ty2.name;
    }
    case "TypeAbs": {
      throw new Error("unimplemented.");
    }
  }
};

export const isSubTypeOf = (ty: Type, otherTy: Type): boolean => {
  switch (otherTy.tag) {
    case "Boolean":
    case "Number":
      return ty.tag === otherTy.tag;
    case "Func": {
      if (ty.tag !== otherTy.tag) {
        return false;
      }
      if (!isSubTypeOf(ty.retType, otherTy.retType)) {
        return false;
      }
      if (ty.params.length !== otherTy.params.length) {
        return false;
      }
      for (let i = 0; i < ty.params.length; i++) {
        // NOTE: Contravariant
        if (!isSubTypeOf(otherTy.params[i].type, ty.params[i].type)) {
          return false;
        }
      }
      return true;
    }
    case "Object": {
      if (ty.tag !== otherTy.tag) {
        return false;
      }
      const tyProps = new Set([...ty.props.map((p) => p.name)]);
      return otherTy.props.every((p) => tyProps.has(p.name));
    }
    case "Rec":
    case "TypeVar":
      throw new Error("unimplemented");
    case "TypeAbs": {
      throw new Error("unimplemented.");
    }
  }
};

export type TypeEnv = Record<string, Type>;

type PropertyType = { name: string; type: Type };
