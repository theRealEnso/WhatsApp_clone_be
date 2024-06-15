let onlineUsers = [];
export const SocketListener = (socket, io) => {
    //each user that connects to the server is assigned a unique `socket` object, thus, each user is connected through an individual socket.
    //unique socket object for each user allows the server to manage and differentiate between multiple users simultaneously.
    //The front end emits the user id so that we can receive it here. When user joins or opens the application, server makes the socket join a room named after the user's user id
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

    // when user signs out of the app, but the browser window is still open
    socket.on("user signed out", (user_id) => {
        console.log(`the following user has signed out: ${user_id}`);
        onlineUsers = onlineUsers.filter((u) => u.userId !== user_id);
        socket.emit("get-online-users", onlineUsers);
    })

    //socket disconnect, or when a user disconnects (closes browser window)
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
    //1.) user 1 sends message from the front end that is emmitted  under the name "newly sent message" 
    //2.) server receives the "newly sent message" here in the server through socket.on, which contains the entire message object.
    //3.) Message object, as per the MessageModel, contains a conversation field/key/property. Nested inside the conversation field is a users array that we can iterate through
    //4.) Everyone besides user 1 (i.e. the person who sent the message) receives the message in real. To do this, we iterate through the users array, ignore the user that sent the message, and emit the message to everyone else
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

    //show typing status
    socket.on("typing", (conversationId) => {
        console.log(`typing in... ${conversationId}`)
        socket.in(conversationId).emit("typing", {typingStatus: "typing...", conversationId});
    });
    socket.on("stopped typing", (conversationId) => {
        console.log(`stopped typing in.... ${conversationId}`)
        socket.in(conversationId).emit("stopped typing", {typingStatus: "stopped typing", conversationId});
    });
};

