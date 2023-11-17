import React from "react";
import ReceiverCard from "./ReceiverCard";
import Messages from "./Messages";
import Sendbox from "./Sendbox";

export default function RightSideBar() {
  return (
    <div
      className="col col-9"
      style={{ border: "1px solid #d5d5d5", padding: 0, position: "relative" }}
    >
      <ReceiverCard />
      <Messages />
      <Sendbox />
    </div>
  );
}
