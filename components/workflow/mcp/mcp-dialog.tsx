import { addMcpServer, connectMcpServer } from "@/app/actions/agent";
import { MCPToolType } from "@/lib/workflow/constants";
import React, { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { KeyRoundIcon, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";

interface MCPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    label: string;
    serverId: string;
    selectedTools: MCPToolType[];
  }) => void;
}

const authList = [
  {
    value: "token",
    label: "Access token / API key"
  }
];

const McpDialog = ({ open, onOpenChange, onAdd }: MCPDialogProps) => {
  const [step, setStep] = useState<"connect" | "select">("connect");
  const [url, setUrl] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [tools, setTools] = useState<MCPToolType[]>([]);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  // Move toggleTool INSIDE the component
  const toggleTool = (name: string) => {
    setSelectedTools((prev) => {
      const set = new Set(prev);
      if (set.has(name)) {
        set.delete(name);
      } else {
        set.add(name);
      }
      return set;
    });
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { tools } = await connectMcpServer({
        url,
        apiKey
      });
      
      setTools(tools);
      setSelectedTools(new Set(tools.map((tool) => tool.name)));
      setStep("select");
      toast.success("Connected to Mcp Server");
    } catch (error) {
      console.log(error);
      toast.error("Failed to connect to Mcp server");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMcp = async () => {
    const selected_tools = tools.filter((t) => selectedTools.has(t.name));
    try {
      setLoading(true);
      const { serverId } = await addMcpServer({
        url,
        apiKey,
        label
      });

      onAdd({
        label,
        serverId,
        selectedTools: selected_tools
      });

      onOpenChange(false);
      setStep("connect");
      setUrl("");
      setLabel("");
      setApiKey("");
      setTools([]);
      setSelectedTools(new Set());
      toast.success("Mcp server added successfully");
    } catch (error) {
      console.log("Failed to save mcp", error);
      toast.error("Failed to save Mcp server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {step === "connect" ? (
          <>
            <DialogTitle>
              <div className="flex flex-col items-center mb-6">
                <Server className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  Connect to MCP Server
                </span>
              </div>
            </DialogTitle>

            <div className="space-y-4">
              <div>
                <Label>URL</Label>
                <InputGroup>
                  <InputGroupInput
                    id="mcp-url"
                    placeholder="https://example.com/mcp"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </InputGroup>
                <p className="mt-1 text-xs text-muted-foreground">
                  Only use MCP Server you trust and verify
                </p>
              </div>

              <div>
                <Label>Label</Label>
                <InputGroup>
                  <InputGroupInput
                    placeholder="my_mcp_server"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </InputGroup>
              </div>

              <div>
                <Label>Authentication</Label>
                <InputGroup>
                  <Select disabled value="token">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authList.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </InputGroup>
              </div>

              <div>
                <InputGroup>
                  <InputGroupAddon>
                    <KeyRoundIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="password"
                    placeholder="Enter your api key/access token"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </InputGroup>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleConnect}
                  disabled={!url || !label || !apiKey || loading}
                  className="w-32"
                >
                  {loading ? <Spinner /> : "Connect"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Server className="w-8 h-8 text-muted-foreground" />
                <span className="text-base font-semibold">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {url}
              </p>
            </DialogTitle>

            <div>
              <h3 className="font-semibold text-sm mb-2">TOOLS</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center gap-3 p-2 border border-border rounded"
                  >
                    <Checkbox
                      checked={selectedTools.has(tool.name)}
                      onCheckedChange={() => toggleTool(tool.name)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-xs">
                        {tool.name}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 truncate max-w-75">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddMcp}
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  `Add (${selectedTools.size} selected)`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default McpDialog;