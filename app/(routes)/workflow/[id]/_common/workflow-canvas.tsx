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
import StartNode from '@/components/workflow/custom-nodes/start/node';
import AgentNode from '@/components/workflow/custom-nodes/agent/node';
import IfElseNode from '@/components/workflow/custom-nodes/if-else/node';
import CommentNode from '@/components/workflow/custom-nodes/comment/node';
import EndNode from '@/components/workflow/custom-nodes/end/node';
import { useUpdateWorkflow } from '@/features/use-workflow';
import { ActionBar, ActionBarGroup, ActionBarItem } from '@/components/ui/action-bar';
import { Spinner } from '@/components/ui/spinner';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import Chat from '@/components/workflow/chat';

const WorkflowCanvas = ({ workflowId }: { workflowId: string }) => {
  const { view, setView, nodes,edges,setNodes,setEdges } = useWorkflow();

  const { screenToFlowPosition } = useReactFlow();
  const isPreview = view === 'preview';
 
const {mutate: updateWorkflow, isPending: isSaving} = useUpdateWorkflow(workflowId);

const { hasUnsavedChanges, discardChanges } = useUnsavedChanges(nodes, edges);

  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.HAND);
  const isSelectMode = toolMode === TOOL_MODE_ENUM.SELECT;


  const nodeTypes = {
    [NodeTypeEnum.START]: StartNode,
    [NodeTypeEnum.AGENT]: AgentNode,
    [NodeTypeEnum.IF_ELSE]: IfElseNode,
    [NodeTypeEnum.COMMENT]: CommentNode,
    [NodeTypeEnum.END]: EndNode,
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


const handleSaveChanges = () => {
  updateWorkflow({ nodes, edges });
};
const handleDiscard = () => {
  const result = discardChanges();
  setNodes(result.nodes);
  setEdges(result.edges);
};
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


        <Chat
          open={isPreview}
          onOpenChange={(open) => setView(open ? 'preview' : 'edit')}
          workflowId={workflowId}
        />
      </div>


<ActionBar
  open={hasUnsavedChanges}
  side="top"
  align="center"
  sideOffset={70}
  className="max-w-xs"
>
  <ActionBarGroup>
    <ActionBarItem
      disabled={isSaving}
      variant="ghost"
      onClick={handleDiscard}
    >
      Discard
    </ActionBarItem>
    <ActionBarItem
      disabled={isSaving}
      variant="ghost"
      onClick={handleSaveChanges}
    >
      {isSaving && <Spinner />}
      Save Changes
    </ActionBarItem>
  </ActionBarGroup>
</ActionBar>

    </>
  );
};

export default WorkflowCanvas;