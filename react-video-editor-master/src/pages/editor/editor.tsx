import Timeline from "./timeline";
import useStore from "../../store/store";
import Navbar from "./navbar";
import MenuList from "./menu-list";
import { MenuItem } from "./menu-item";
import useTimelineEvents from "@/hooks/use-timeline-events";
import Scene from "./scene";
import StateManager from "@designcombo/state";
import { ControlItem } from "./control-item";
import ControlList from "./control-list";
import Sidebar from "../../components/Sidebar";

const stateManager = new StateManager();

function App() {
  const { playerRef } = useStore();

  useTimelineEvents();

  return (
    <div className="w-screen h-screen flex flex-col relative bg-background">
      <Navbar />
      <Sidebar />
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          flex: 1,
          overflow: "hidden"
        }}
        className="flex flex-row w-full h-full"
      >
        <div className="flex-1 relative h-full">
          <MenuList />
          <MenuItem />
          <ControlList />
          <ControlItem />
          <Scene stateManager={stateManager} />
        </div>
        {/* Removed right sidebar */}
      </div>
      <div className="h-80 w-full">
        {playerRef && <Timeline stateManager={stateManager} />}
      </div>
    </div>
  );
}

export default App;
