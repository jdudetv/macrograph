import { Show } from "solid-js";
import { CoreProvider } from "./contexts";
import { Graph } from "~/components/Graph";
import { GraphList } from "~/components/ProjectSidebar";
import { core } from "@macrograph/core";
import { createUIStore, UIStoreProvider } from "./UIStore";
import { PrintOutput } from "./components/PrintOutput";

function App() {
  const ui = createUIStore();

  const graph = core.createGraph();

  ui.setCurrentGraph(graph);

  return (
    <UIStoreProvider store={ui}>
      <CoreProvider core={core}>
        <div
          class="w-screen h-screen flex flex-row overflow-hidden select-none"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div class="flex flex-col bg-neutral-600 w-64 shadow-2xl">
            <GraphList onChange={(g) => ui.setCurrentGraph(g)} />
            <PrintOutput />
          </div>
          <Show when={ui.state.currentGraph} fallback="No Graph">
            {(graph) => <Graph graph={graph()} />}
          </Show>
        </div>
      </CoreProvider>
    </UIStoreProvider>
  );
}

export default App;
