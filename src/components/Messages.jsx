import { useContext } from "react";
import ChatContext from "../../ChatContext";

const senderStyles = {
  backgroundColor: "lightpink",
  width: "fit-content",
  padding: 7,
  borderRadius: 10,
  borderBottomRightRadius: 0,
  margin: 10,
};

const receiverStyles = {
  backgroundColor: "lightblue",
  width: "fit-content",
  padding: 7,
  borderRadius: 10,
  borderTopLeftRadius: 0,
  margin: 10,
};

export default function Messages() {
  const { messages, user } = useContext(ChatContext);

  const formatTime = (timeString) => {
    const dateObject = new Date(timeString);

    // try to formate the time
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    let period = "AM";
    if (hours >= 12) {
      period = "PM";
      if (hours > 12) {
        hours = hours - 12;
      }
    }
    if (hours == 0) hours = 12;
    return `${dateObject.toDateString()} at ${hours} : ${minutes} ${period}`;
  };

  return (
    <div className="p-3" style={{ height: "640px", overflow: "scroll" }}>
      {messages.map((item, index) =>
        item.sender == user._id ? (
          <div key={index}>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <p style={senderStyles}>{item.message}</p>
            </div>
            <p
              style={{
                color: "grey",
                fontSize: "12px",
                textAlign: "right",
                marginRight: "10px",
              }}
            >
              {formatTime(item.createdAt)}
            </p>
          </div>
        ) : (
          <div key={index}>
            <p style={receiverStyles}>{item.message}</p>
            <p
              style={{
                color: "grey",
                fontSize: "12px",
                textAlign: "left",
                marginLeft: "10px",
              }}
            >
              {formatTime(item.createdAt)}
            </p>
          </div>
        )
      )}
    </div>
  );
}
