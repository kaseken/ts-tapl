import { Param } from "./param.ts";

export type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "Object"; props: PropertyType[] }
  | { tag: "Rec"; name: string; type: Type }
  | { tag: "TypeVar"; name: string };

export const isEqualNaive = (ty1: Type, ty2: Type): boolean => {
  switch (ty2.tag) {
    case "Boolean":
    case "Number":
      return ty1.tag === ty2.tag;
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!isEqualNaive(ty1.params[i].type, ty2.params[i].type)) {
          return false;
        }
      }
      return isEqualNaive(ty1.retType, ty2.retType);
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      const ty1PropsMap = new Map(ty1.props.map((p) => [p.name, p.type]));
      for (const prop of ty2.props) {
        const ty = ty1PropsMap.get(prop.name);
        if (ty == null || !isEqualNaive(ty, prop.type)) {
          return false;
        }
      }
      return true;
    }
    case "Rec":
    case "TypeVar":
      return false; // TODO
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
      return false; // TODO
  }
};

export type TypeEnv = Record<string, Type>;

type PropertyType = { name: string; type: Type };
