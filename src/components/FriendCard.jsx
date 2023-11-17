import React, { useContext } from "react";
import ChatContext from "../../ChatContext";

export default function FriendCard({
  connectionId,
  name,
  receiverId,
  profilePic,
}) {
  const { setReceiver } = useContext(ChatContext);

  return (
    <div
      onClick={() => {
        setReceiver({ connectionId, name, receiverId, profilePic });
      }}
      className="card p-2 my-2"
      style={{ width: "100%" }}
    >
      <div className="row">
        <div className="col col-12 d-flex">
          <img
            className="rounded-circle mt-1"
            width={30}
            height={30}
            src={profilePic}
          />
          <p className="mx-2 mt-2">{name}</p>
        </div>
      </div>
    </div>
  );
}
