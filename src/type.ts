import { Param } from "./param.ts";

export type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type }
  | { tag: "Object"; props: PropertyType[] };

export const typeEq = (ty1: Type, ty2: Type): boolean => {
  switch (ty2.tag) {
    case "Boolean":
    case "Number":
      return ty1.tag === ty2.tag;
    case "Func": {
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEq(ty1.params[i].type, ty2.params[i].type)) {
          return false;
        }
      }
      return typeEq(ty1.retType, ty2.retType);
    }
    case "Object": {
      if (ty1.tag !== "Object") return false;
      if (ty1.props.length !== ty2.props.length) return false;
      const sortedTy1Props = [...ty1.props].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const sortedTy2Props = [...ty2.props].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      for (let i = 0; i < sortedTy1Props.length; i++) {
        if (
          sortedTy1Props[i].name !== sortedTy2Props[i].name ||
          !typeEq(sortedTy1Props[i].type, sortedTy2Props[i].type)
        ) {
          return false;
        }
      }
      return true;
    }
  }
};

export type TypeEnv = Record<string, Type>;

type PropertyType = { name: string; type: Type };
