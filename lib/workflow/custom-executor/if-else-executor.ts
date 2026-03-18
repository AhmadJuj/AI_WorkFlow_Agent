import { ExecutorContextType } from "@/types/workflow";
import { Node } from "@xyflow/react";
import { replaceVariables } from "@/lib/helper";

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

    const variable = replaceVariables(condition.variable, outputs).trim();
    const value = condition.value.trim();

    console.log(`[IF_ELSE] Evaluating: "${variable}" ${condition.operator} "${value}"`);

    let result = false;

    // Try numeric comparison if both sides are numbers
    const numVariable = Number(variable);
    const numValue = Number(value);
    const bothNumeric = !isNaN(numVariable) && !isNaN(numValue) && variable.trim() !== "" && value.trim() !== "";

    switch (condition.operator) {
      case "==":
        result = bothNumeric ? numVariable === numValue : variable === value;
        break;
      case "!=":
        result = bothNumeric ? numVariable !== numValue : variable !== value;
        break;
      case ">":
        result = bothNumeric ? numVariable > numValue : variable > value;
        break;
      case "<":
        result = bothNumeric ? numVariable < numValue : variable < value;
        break;
      case ">=":
        result = bothNumeric ? numVariable >= numValue : variable >= value;
        break;
      case "<=":
        result = bothNumeric ? numVariable <= numValue : variable <= value;
        break;
      default:
        console.log(`[IF_ELSE] Unknown operator: ${condition.operator}`);
        break;
    }

    console.log(`[IF_ELSE] Result: ${result}`);

    if (result) {
      return {
        output: {
          result: true,
          selectedBranch: `condition-${i}`,
        },
      };
    }
  }

  return { 
    output: {
      result: false,
      selectedBranch: "else",
    },
  };
}