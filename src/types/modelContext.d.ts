declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        inputSchema: {
          type: "object";
          properties: {
            search_query: {
              type: "string";
              description: string;
            };
          };
          required: string[];
        };
        execute: (args: { search_query: string }) => Promise<{
          success: boolean;
          data: {
            id: string;
            name: string;
            class: string;
            attendance: number;
            feeStatus: "Paid" | "Pending" | "Partial";
          };
        }>;
      }) => void;
    };
  }
}

export {};
