let onlineUsers = [];
export const SocketListener = (socket, io) => {
    //when user joins or opens the application
    socket.on("join", (user_id) => {
        socket.join(user_id);
        console.log(`user has joined: ${user_id}`);

        //add the user that joined to the onlineUsers array
        if(!onlineUsers.some((u) => u.userId === user_id)){
            onlineUsers.push({userId: user_id, socketId: socket.id });
        }

        //send online users to the frontend
        io.emit("get-online-users", onlineUsers);
    });

    //socket disconnect, or when a user disconnects
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
        io.emit("get-online-users", onlineUsers); // cannot use socket.emit because when user disconnects, they disconnect from the socket, so the socket won't exist for us to use. Must use io instead
    })

    //join a conversation room
    socket.on("join conversation room", (conversationId) => {
        socket.join(conversationId);
        console.log(`user has joined the conversation room with the following conversation room ID: ${conversationId}`);
    });

    //send and receive a message to show in real time
    // ex: 
    //1.) user 1 sends message under name "newly sent message" on the front end
    //2.) receive "newly sent message" here in the server through socket.on
    //3.) iterate through the users array nested in the message data. Everyone besides user 1 receives the message in real time
    socket.on("newly sent message", (message) => {
        console.log("new message received ------------------->", message);
        let conversation = message.conversation;
        if(!conversation.users) return;

        //for each user that is not the sender of the message, receive the message in real time
        conversation.users.forEach((user) => {
            if(user._id === message.sender._id){
                return; // return in the context of `forEach` just skips to the next iteration of the loop
            } else {
                socket.in(user._id).emit("received message", message);
            } 
        });
    });
};