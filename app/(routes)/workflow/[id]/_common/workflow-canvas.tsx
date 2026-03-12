import { useState, useCallback } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Node,
  Edge,


  Background,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Controls from '@/components/workflow/controls';
import { TOOL_MODE_ENUM, ToolModeType } from '@/constant/workflow';
import { cn } from '@/lib/utils';
import NodePanel from './node-panel';
import { useWorkflow } from '@/context/workflow-context';
import { createNode, NodeType, NodeTypeEnum } from '@/lib/workflow/node-config';
import { create } from 'domain';
import StartNode from '@/components/workflow/custom-nodes/start/node';
import { X } from 'lucide-react';
import AgentNode from '@/components/workflow/custom-nodes/agent/node';
import { set } from 'zod';
import IfElseNode from '@/components/workflow/custom-nodes/if-else/node';


const start_node=createNode({type:NodeTypeEnum.START});
const initialNodes: Node[] = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges: Edge[] = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const WorkflowCanvas = () => {
  const { view,nodes,edges,setNodes,setEdges } = useWorkflow();

  const { screenToFlowPosition } = useReactFlow();
  const isPreview = view === 'preview';
 
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.HAND);
  const isSelectMode = toolMode === TOOL_MODE_ENUM.SELECT;


  const nodeTypes = {
    [NodeTypeEnum.START]: StartNode,
    [NodeTypeEnum.AGENT]: AgentNode,
    [NodeTypeEnum.IF_ELSE]: IfElseNode,
  };
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const node_type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (!node_type) return null;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createNode({
        type: node_type,
        position,
      });

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );



  return (
    <>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow

          className={cn(
            isSelectMode ? "cursor-default" : "cursor-grab active:cursor-gra..."
          )}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView

          panOnDrag={!isSelectMode}
          panOnScroll={!isSelectMode}
          zoomOnScroll={!isSelectMode}
          selectionOnDrag={isSelectMode}
          defaultViewport={{x : 0, y:0, zoom:1.2}}
        >

          <Background />
          {!isPreview && <NodePanel />}
          {!isPreview && <Controls toolMode={toolMode}
            setToolMode={setToolMode} />}
        </ReactFlow>
      </div>
    </>
  );
};

export default WorkflowCanvas;