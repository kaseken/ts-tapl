import { error } from "npm:tiny-ts-parser";
import { Term } from "./term.ts";
import { isEqual, isSubTypeOf, Type, TypeEnv } from "./type.ts";
import { simplifyType } from "./expandType.ts";
import { isEqualGenerics } from "./isEqualGenerics.ts";
import { subst } from "./subst.ts";

const toMap = (tyVars: string[]): Record<string, string> =>
  Object.fromEntries(tyVars.map((tyVar) => [tyVar, tyVar]));

export const typecheck = (
  t: Term,
  tyEnv: TypeEnv,
  tyVars: string[] = [],
  enableGenerics: boolean = false,
): Type => {
  const typesEqual = (ty1: Type, ty2: Type): boolean =>
    enableGenerics
      ? isEqualGenerics(ty1, ty2, toMap(tyVars))
      : isEqual(ty1, ty2);
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = simplifyType(
        typecheck(t.cond, tyEnv, tyVars, enableGenerics),
      );
      if (condTy.tag !== "Boolean") {
        error("Boolean expected.", t);
      }
      const thnTy = typecheck(t.thn, tyEnv, tyVars, enableGenerics);
      const elsTy = typecheck(t.els, tyEnv, tyVars, enableGenerics);
      if (!typesEqual(thnTy, elsTy)) {
        error("then and else have different types.", t);
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = simplifyType(
        typecheck(t.left, tyEnv, tyVars, enableGenerics),
      );
      if (leftTy.tag !== "Number") {
        error("Number expected.", t);
      }
      const rightTy = simplifyType(
        typecheck(t.right, tyEnv, tyVars, enableGenerics),
      );
      if (rightTy.tag !== "Number") {
        error("Number expected.", t);
      }
      return { tag: "Number" };
    }
    case "var":
      if (tyEnv[t.name] === undefined) {
        error(`Unknown variable: ${t.name}`, t);
      }
      return tyEnv[t.name];
    case "func": {
      const newTyEnv = {
        ...tyEnv,
        ...Object.fromEntries(t.params.map(({ name, type }) => [name, type])),
      };
      const retType = typecheck(t.body, newTyEnv, tyVars, enableGenerics);
      return { tag: "Func", params: t.params, retType };
    }
    case "call": {
      const funcTy = simplifyType(
        typecheck(t.func, tyEnv, tyVars, enableGenerics),
      );
      if (funcTy.tag !== "Func") {
        error("function type expected.", t);
      }
      if (funcTy.params.length !== t.args.length) {
        error("wrong number of argnuments.", t);
      }
      for (let i = 0; i < t.args.length; i++) {
        const argTy = typecheck(t.args[i], tyEnv, tyVars, enableGenerics);
        if (!isSubTypeOf(argTy, funcTy.params[i].type)) {
          error("parameter type mismatch", t);
        }
      }
      return funcTy.retType;
    }
    case "seq": {
      typecheck(t.body, tyEnv, tyVars, enableGenerics);
      return typecheck(t.rest, tyEnv, tyVars, enableGenerics);
    }
    case "const": {
      const ty = typecheck(t.init, tyEnv, tyVars, enableGenerics);
      const newTyEnv = { ...tyEnv, [t.name]: ty };
      return typecheck(t.rest, newTyEnv, tyVars, enableGenerics);
    }
    case "objectNew": {
      const props = t.props.map(({ name, term }) => ({
        name,
        type: typecheck(term, tyEnv, tyVars, enableGenerics),
      }));
      return { tag: "Object", props };
    }
    case "objectGet": {
      const objectTy = simplifyType(
        typecheck(t.obj, tyEnv, tyVars, enableGenerics),
      );
      if (objectTy.tag !== "Object") {
        error("object type expected", t.obj);
      }
      const prop = objectTy.props.find((p) => p.name === t.propName);
      if (!prop) {
        error(`unknown property name: ${t.propName}`, t);
      }
      return prop.type;
    }
    case "recFunc": {
      const funcTy: Type = {
        tag: "Func",
        params: t.params,
        retType: t.retType,
      };
      const newTyEnv = {
        [t.funcName]: funcTy,
        ...tyEnv,
        ...Object.fromEntries(t.params.map(({ name, type }) => [name, type])),
      };
      const retType = typecheck(t.body, newTyEnv, tyVars, enableGenerics);
      if (!typesEqual(t.retType, retType)) {
        error("wrong return type", t);
      }
      return typecheck(
        t.rest,
        { ...tyEnv, [t.funcName]: funcTy },
        tyVars,
        enableGenerics,
      );
    }
    case "typeAbs": {
      const bodyTy = typecheck(
        t.body,
        tyEnv,
        [...tyVars, ...t.typeParams],
        enableGenerics,
      );
      return { tag: "TypeAbs", typeParams: t.typeParams, type: bodyTy };
    }
    case "typeApp": {
      const bodyTy = typecheck(t.typeAbs, tyEnv, tyVars, enableGenerics);
      if (bodyTy.tag !== "TypeAbs") {
        error("type abstraction expected", t.typeAbs);
      }
      if (bodyTy.typeParams.length !== t.typeArgs.length) {
        error("wrong number of type arguments", t);
      }
      let newTy = bodyTy.type;
      for (let i = 0; i < bodyTy.typeParams.length; i++) {
        newTy = subst(newTy, bodyTy.typeParams[i], t.typeArgs[i]);
      }
      return newTy;
    }
  }
};
