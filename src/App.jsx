import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import { Route, Routes, useNavigate } from "react-router-dom";
import Pusher from "pusher-js";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import ChatContext from "../ChatContext";
import { useEffect, useState } from "react";
export default function App() {
  const [user, setUser] = useState(null);
  const [pendingRequest, setPendingRequest] = useState([]);
  const [acceptedRequests, setAcceptedRequest] = useState([]);
  const [receiver, setReceiver] = useState(null);

  const [messages, setMessages] = useState([]);

  const navigator = useNavigate();
  const BASE_URL = "https://chatbackend-b8vu.onrender.com";

  const login = (email, password) => {
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) {
          toast.error(data.message);
        } else {
          // store the user in state
          setUser(data);
          // store the user in local storage also
          localStorage.setItem("chatuser", JSON.stringify(data));
          // redirect to homepage
          navigator("/home");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const signup = (email, password, name) => {
    fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) {
          toast.error(data.message);
        } else {
          toast.success(data.message);
          navigator("/");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.clear("chatuser");
    navigator("/");
  };

  // check if user is loggedin in already then redirect him to home page
  useEffect(() => {
    if (localStorage.getItem("chatuser")) {
      setUser(JSON.parse(localStorage.getItem("chatuser")));
      navigator("/home");
    }
  }, []);

  const [searchResults, setSearchResults] = useState([]);
  // search for friend

  const fetchPendingRequest = () => {
    fetch(`${BASE_URL}/friends/all-pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == true) {
          setPendingRequest(data.friends);
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const fetchAcceptedRequests = () => {
    fetch(`${BASE_URL}/friends/all-friends`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == true) {
          setAcceptedRequest(data.friends);
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const searchFriends = (query) => {
    fetch(`${BASE_URL}/friends/search-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) {
          toast.error(data.message);
        } else {
          // store all the user in state
          setSearchResults(data.users);
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const handleAcceptReqeust = (docid) => {
    fetch(`${BASE_URL}/friends/accept-request/${docid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) {
          toast.error(data.message);
        } else {
          // store all the user in state
          fetchPendingRequest();
          fetchAcceptedRequests();
          toast.success("Request Accepted");
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const sendMessage = (message) => {
    if (message.length == 0) return;

    fetch(`${BASE_URL}/messages/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
      body: JSON.stringify({
        message,
        reciever: receiver.receiverId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) toast.error(data.message);
      })
      .catch((err) => console.log(err.message));
  };

  const handleRejectReqeust = (docid) => {
    fetch(`${BASE_URL}/friends/reject-request/${docid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) {
          toast.error(data.message);
        } else {
          // store all the user in state
          fetchPendingRequest();
          fetchAcceptedRequests();
          toast.success("Request Rejected");
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const fetchMessages = () => {
    fetch(
      `${BASE_URL}/messages/get-message/${receiver && receiver.receiverId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success == false) toast.err(data.message);
        else setMessages(data.messeges);
      })
      .catch((err) => console.log(err.message));
  };

  // if the user is coming in website first time fetch all the pending and accepted request
  useEffect(() => {
    if (user) {
      fetchPendingRequest();
      fetchAcceptedRequests();
    }
  }, [user]);

  // configure the connection or subscribe the pusher channel when website is loading first time
  useEffect(() => {
    let pusher = new Pusher("1d4213f041c66cd69c4e", {
      cluster: "ap2",
    });
    // 1. subscribe the channel
    let channel = pusher.subscribe("new-messege-channel");
    // 2. bind with a specific event inside this channel
    channel.bind("messege-added", (data) => {
      // check if data belong to us
      if (receiver.connectionId == data.messageId) {
        // create a new array in which all the previous element of array + new data will be there
        setMessages((previousState) => [...previousState, data]);
      }
    });

    // syntax to proviede the cleanup function
    return () => {
      pusher.unsubscribe("new-messege-channel");
    };
  }, [receiver]);

  // subscribe to pusher so that u can get the update friend requests
  useEffect(() => {
    let pusher = new Pusher("1d4213f041c66cd69c4e", {
      cluster: "ap2",
    });
    // 1. subscribe the channel
    let channel = pusher.subscribe("new-messege-channel");
    // 2. bind with a specific event inside this channel
    channel.bind("friend-request", (data) => {
      // if u are receiver in the coming pending friend request then this belongs to u
      if (user._id == data.receiver) {
        setPendingRequest((prev) => [...prev, data]);
      }
    });

    channel.bind("friend-request-accepted", (data) => {
      // if the friend request is accepted and in received we are present as a sender it means
      // this is the request that we sent and the receiver has accepted so we update in real time
      if (user._id == data.sender._id) {
        setAcceptedRequest((prev) => [...prev, data]);
      }
    });

    // syntax to proviede the cleanup function
    return () => {
      pusher.unsubscribe("new-messege-channel");
    };
  }, [user]);

  //

  useEffect(() => {
    if (acceptedRequests.length > 0) {
      // connection , name
      const connectionId = acceptedRequests[0].connectionId;
      const name =
        user._id == acceptedRequests[0].sender._id
          ? acceptedRequests[0].receiver.name
          : acceptedRequests[0].sender.name;

      const receiverId =
        acceptedRequests[0].sender._id == user._id
          ? acceptedRequests[0].receiver._id
          : acceptedRequests[0].sender._id;

      const profilePic =
        acceptedRequests[0].sender._id == user._id
          ? acceptedRequests[0].receiver.profilePic
          : acceptedRequests[0].sender.profilePic;

      setReceiver({ connectionId, name, receiverId, profilePic });
    }
  }, [acceptedRequests]);

  // fetch all the messages everytime when the receiver state is change
  useEffect(() => {
    if (user) fetchMessages();
  }, [receiver, user]);

  // function that will upload the file
  const uploadProfilePic = (file) => {};

  // console.log(messages);
  return (
    <div>
      <ChatContext.Provider
        value={{
          login,
          signup,
          logout,
          user,
          searchFriends,
          fetchPendingRequest,
          fetchAcceptedRequests,
          pendingRequest,
          acceptedRequests,
          searchResults,
          handleAcceptReqeust,
          handleRejectReqeust,
          receiver,
          setReceiver,
          sendMessage,
          messages,
          BASE_URL,
          uploadProfilePic,
          setUser,
        }}
      >
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </ChatContext.Provider>
    </div>
  );
}
