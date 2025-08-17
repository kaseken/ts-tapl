import { error } from "npm:tiny-ts-parser";
import { Term } from "./term.ts";
import { isSubTypeOf, Type, TypeEnv, isEqualNaive } from "./type.ts";

export const typecheck = (t: Term, tyEnv: TypeEnv): Type => {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = typecheck(t.cond, tyEnv);
      if (condTy.tag !== "Boolean") {
        error("Boolean expected.", t);
      }
      const thnTy = typecheck(t.thn, tyEnv);
      const elsTy = typecheck(t.els, tyEnv);
      if (thnTy.tag !== elsTy.tag) {
        error("then and else have different types.", t);
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = typecheck(t.left, tyEnv);
      if (leftTy.tag !== "Number") {
        error("Number expected.", t);
      }
      const rightTy = typecheck(t.right, tyEnv);
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
      const retType = typecheck(t.body, newTyEnv);
      return { tag: "Func", params: t.params, retType };
    }
    case "call": {
      const funcTy = typecheck(t.func, tyEnv);
      if (funcTy.tag !== "Func") {
        error("function type expected.", t);
      }
      if (funcTy.params.length !== t.args.length) {
        error("wrong number of argnuments.", t);
      }
      for (let i = 0; i < t.args.length; i++) {
        const argTy = typecheck(t.args[i], tyEnv);
        if (!isSubTypeOf(argTy, funcTy.params[i].type)) {
          error("parameter type mismatch", t);
        }
      }
      return funcTy.retType;
    }
    case "seq": {
      typecheck(t.body, tyEnv);
      return typecheck(t.rest, tyEnv);
    }
    case "const": {
      const ty = typecheck(t.init, tyEnv);
      const newTyEnv = { ...tyEnv, [t.name]: ty };
      return typecheck(t.rest, newTyEnv);
    }
    case "objectNew": {
      const props = t.props.map(({ name, term }) => ({
        name,
        type: typecheck(term, tyEnv),
      }));
      return { tag: "Object", props };
    }
    case "objectGet": {
      const objectTy = typecheck(t.obj, tyEnv);
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
      const retType = typecheck(t.body, newTyEnv);
      if (!isEqualNaive(t.retType, retType)) {
        error("wrong return type", t);
      }
      return typecheck(t.rest, { ...tyEnv, [t.funcName]: funcTy });
    }
  }
};
