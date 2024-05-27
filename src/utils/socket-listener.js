export const SocketListener = (socket) => {
    //when user joins or opens the application
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`user has joined: ${userId}`);
    });

    //join a conversation room
    socket.on("join conversation room", (conversationId) => {
        socket.join(conversationId);
        console.log(`user has joined the conversation room: ${conversationId}`)
    });

    //send and receive a message
    // ex: 
    //1.) enso sends message under name "newly sent message"
    //2.) receive "newly sent message" here through socket.on
    //3.) iterate through the users array nested in the message data, filtering out enso so that the other user can emit the same message back
    socket.on("newly sent message", (message) => {
        console.log("new message received ------------------->", message);
        let conversation = message.conversation;
        if(!conversation.users) return;

        conversation.users.forEach((user) => {
            if(user._id === message.sender._id) return;
            socket.in(user._id).emit("received message", message);
        });
    });
};