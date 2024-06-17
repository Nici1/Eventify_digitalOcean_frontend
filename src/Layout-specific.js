import { Outlet } from "react-router-dom";
import Selector from "./Selector";

export default function LayoutS() {
  return (
    <div className="p-4 flex flex-col">
      <Selector />
      <Outlet />
    </div>
  );
}