import createHttpError from "http-errors";
import logger from "../configs/winston-logger.js";

import { createNewMessage, populateMessage, getMessages } from "../services/message-services-functions.js";
import { updateLatestMessage } from "../services/conversation-services-functions.js";

export const sendMessage = async (req, res, next) => {
    try {
        //get id of sender
        const sender_id = req.user.id;

        //the conversation id (bc messages are tied to specific conversations), the message itself, and files from the front end.
        const {conversation_id, message, files} = req.body;
        if(!conversation_id || (!message && !files)) throw createHttpError.BadRequest("Please provide a conversation ID and a message body");

        const messageData = {
            sender: sender_id,
            message: message,
            conversation: conversation_id,
            files: files || [],
        }
        const newMessage = await createNewMessage(messageData);
        const newPopulatedMessage = await populateMessage(newMessage._id);
        
        //update the latest message in the conversation
        await updateLatestMessage(conversation_id, newMessage);
        
        //send message back to the front end
        res.status(200).json(newPopulatedMessage);
    } catch(error) {
        next(error);
    };
};

export const getAllUserMessagesInsideConversation = async (req, res, next) => {
    try {
        const conversation_id = req.params.conversation_id;
        if(!conversation_id) {
            logger.error("Please include a conversation ID");
            res.status(400);
        }

        const foundMessages = await getMessages(conversation_id);
        res.send(foundMessages);
    } catch(error) {
        next(error);
    }
}

