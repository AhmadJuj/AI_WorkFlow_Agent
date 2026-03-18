import { Bot, GitBranch, Globe, MessageSquare, Play, Square } from "lucide-react";
import { generateId } from "../helper";
import { MODELS } from "./constants";
import { executeStartNode } from "@/components/workflow/custom-nodes/start/executor";
import { executeAgentNode } from "./custom-executor/agentnode-executor";
import { executeIfElseNode } from "./custom-executor/if-else-executor";
import { executeEndNode } from "./custom-executor/end-executor";

export const NodeTypeEnum = {
  START: "start",
  AGENT: "agent",
  IF_ELSE: "if_else",
  END: "end",
  HTTP: "http",
  COMMENT: "comment",
} as const;



export const NODE_EXECUTORS = {
  [NodeTypeEnum.START]: executeStartNode,
  [NodeTypeEnum.AGENT]: executeAgentNode,
  [NodeTypeEnum.IF_ELSE]: executeIfElseNode,
  [NodeTypeEnum.END]: executeEndNode,
  
}

export type NodeType = (typeof NodeTypeEnum)[keyof typeof NodeTypeEnum];

type NodeConfigBase = {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  color: string;
  inputs: Record<string, any>;
  outputs: string[];
};


export const getNodeExecutor = (type: NodeType) => {
  const executor = NODE_EXECUTORS?.[type as keyof typeof NODE_EXECUTORS];
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }
  return executor;
};

export const NODE_CONFIG: Record<NodeType, NodeConfigBase> = {
  [NodeTypeEnum.START]: {
    type: NodeTypeEnum.START,
    label: "Start",
    icon: Play,
    color: "bg-emerald-500",
    inputs: {
      inputValue: "",
    },
    outputs: ["input"],
  },
  [NodeTypeEnum.AGENT]: {
    type: NodeTypeEnum.AGENT,
    label: "Agent",
    icon: Bot,
    color: "bg-blue-500",
    inputs: {
      label: "Agent",
      instructions:"",
      model:MODELS[0].value,
      tools:[],
      outputFormat:"text",
      responsesSchema:null,
    },
      outputs: ["output.text"],
  },
[NodeTypeEnum.IF_ELSE]: {
  type: NodeTypeEnum.IF_ELSE,
  label: "If / Else",
  color: "bg-orange-500",
  icon: GitBranch,
  inputs: {
    conditions: [
      {
        caseName: "",
        variable: "",
        operator: "",
        value: "",
      },
    ],
  },
    outputs: ["output.if_else"],
},
[NodeTypeEnum.HTTP]: {
  type: NodeTypeEnum.HTTP,
  label: "HTTP",
  color: "bg-blue-400",
  icon: Globe,
  inputs: {
    method: "GET",
    url: "",
    headers: {},
    body: {},
  },
   outputs: ["output.body"],
},
[NodeTypeEnum.END]: {
  type: NodeTypeEnum.END,
  label: "End",
  color: "bg-red-400",
  icon: Square,
  inputs: {
    value: "",
  },
   outputs: ["output.text"],
},
  [NodeTypeEnum.COMMENT]: {
    type: NodeTypeEnum.COMMENT,
    label: "Comment",
    icon: MessageSquare,
    color: "bg-slate-400",
    inputs:{
      comments:"",
    },
     outputs: [],
  },
} as const;

export const getNodeConfig = (type: NodeType) => {
  const nodetype = NODE_CONFIG?.[type];
  if (!nodetype) return null;
  return nodetype;
};

export type CreateNodeOptions = {
  type: NodeType;
  position?: { x: number; y: number };
};

export function createNode({
  type,
  position = { x: 400, y: 200 },
}: CreateNodeOptions) {
  const config = getNodeConfig(type);
  if (!config) throw new Error(`No node config found ${type}`);
  const id = generateId(type);
  return {
    id,
    type,
    position,
    deletable: type === NodeTypeEnum.START ? false : true,
    data: {
      label: config.label,
      color: config.color,
      outputs: config.outputs,
      ... config.inputs
    },
  };
}