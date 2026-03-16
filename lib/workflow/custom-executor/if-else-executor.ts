import { ExecutorContextType } from "@/types/workflow";
import { Node } from "@xyflow/react";
import { replaceVariables } from "@/lib/helper";
import { Parser } from "expr-eval";
type Condition = {
  caseName?: string;
  variable?: string;
  operator?: string;
  value?: string;
};

export async function executeIfElseNode(
  node: Node,
  context: ExecutorContextType
) {
  const { outputs } = context;
  const conditions = (node.data.conditions as Condition[]) || [];

  if (!Array.isArray(conditions)) {
    throw new Error("Conditions must be an array");
  }

  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    if (
      !condition.variable ||
      !condition.operator ||
      condition.value === undefined
    )
      continue;

    const variable = replaceVariables(condition.variable, outputs);
    const value = condition.value;

    const variableExp = needsQuoting(variable)
      ? JSON.stringify(variable)
      : variable;
    const valueExp = needsQuoting(value) 
      ? JSON.stringify(value) 
      : value;

    const exp = `${variableExp} ${condition.operator} ${valueExp}`;

    try {
      const parser = new Parser();
      const result = parser.evaluate(exp);
      if (result) {
        return {
          output: {
            result: true,
            selectedBranch: `condition-${i}`,
          },
        };
      }
    } catch (error) {
      console.log("Condition evaluation error:", error);
      throw new Error(`Error evaluating condition: ${error}`);
    }
  }



  return { 
    output: {
      result: false,
      selectedBranch: "else",
    },
  };
}

function needsQuoting(val: string): boolean {
  // Check if val does not already start and end with a quote
  return !/^["'].*["']$/.test(val) && isNaN(Number(val));
}