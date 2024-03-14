// Import React and necessary hooks from the 'react' library
import React, { useState, useEffect } from "react";

// Import the 'socket.io-client' library to establish a WebSocket connection with the server
import io from "socket.io-client";

// Import CSS file for styling
import "../../src/App.css";

// Initialize socket variable
let socket;

// Define the port for the connection to the server
const CONNECTION_PORT = "localhost:3002/";

// Define the functional component 'ChatUi'
function ChatUi() {
    // Define state variables using the 'useState' hook to manage component state
    const [loggedIn, setLoggedIn] = useState(false); // Indicates whether the user is logged in
    const [room, setRoom] = useState(""); // Stores the room name entered by the user
    const [userName, setUserName] = useState(""); // Stores the user's name entered by the user
    const [message, setMessage] = useState(""); // Stores the message entered by the user
    const [messageList, setMessageList] = useState([]); // Stores the list of messages displayed in the chat

    // Effect hook to establish a socket connection when the component mounts or when the connection port changes
    useEffect(() => {
        socket = io(CONNECTION_PORT);
    }, [CONNECTION_PORT]);

    // Effect hook to listen for incoming messages and update the message list
    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessageList([...messageList, data]);
        });
    });

    // Function to connect to the chat room
    const connectToRoom = () => {
        setLoggedIn(true); // Set 'loggedIn' state to true
        socket.emit("join_room", room); // Emit a 'join_room' event to the server with the specified room
    };

    // Function to send a message
    const sendMessage = async () => {
        // Create an object containing the message content
        let messageContent = {
            room: room,
            content: {
                author: userName,
                message: message,
            },
        };

        // Emit a 'send_message' event to the server with the message content
        await socket.emit("send_message", messageContent);

        // Update the message list with the sent message
        setMessageList((prevMessageList) => [
            ...prevMessageList,
            messageContent.content,
        ]);

        // Clear the message input field
        setMessage("");
    };

    // JSX to render the chat UI
    return (
        <div className="App">
            {/* Header section displaying user name and room */}
            {!loggedIn ? (
                // Render the login form if the user is not logged in
                <div className="logIn">
                    <div className="inputs">
                        <input
                            type="text"
                            placeholder="Name..."
                            onChange={(e) => {
                                setUserName(e.target.value);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Room..."
                            onChange={(e) => {
                                setRoom(e.target.value);
                            }}
                        />
                    </div>
                    <button onClick={connectToRoom}>Enter Chat</button>
                </div>
            ) : (
                // Render the chat interface if the user is logged in
                <>

                    <div className="chatContainer">
                        <span><h3>Welcome,{userName} to Chatroom:{room}</h3> </span>
                        <div className="messages">
                            {/* Render each message in the message list */}

                            {messageList.map((val, key) => {
                                return (
                                    <div
                                        className="messageContainer"
                                        id={val.author === userName ? "You" : "Other"}
                                    >
                                        <div className="messageIndividual">
                                            {/* Display the message author and content */}
                                            {val.author}: {val.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Message input field and send button */}
                        <div className="messageInputs">
                            <input
                                type="text"
                                placeholder="Message..."
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                }}
                                onKeyPress={(e) => {
                                    // Send message when 'Enter' key is pressed
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Export the ChatUi component as the default export
export default ChatUi;
