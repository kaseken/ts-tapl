import { subst } from "./subst.ts";
import { Type } from "./type.ts";

let freshTyVarId = 1;

export const freshTypeAbs = (
  typeParams: string[],
  ty: Type,
): { newTypeParams: string[]; newType: Type } => {
  let newType = ty;
  const newTypeParams = [];
  for (const tyVar of typeParams) {
    const newTyVar = `${tyVar}@${freshTyVarId++}`;
    newType = subst(newType, tyVar, { tag: "TypeVar", name: newTyVar });
    newTypeParams.push(newTyVar);
  }
  return { newTypeParams, newType };
};
