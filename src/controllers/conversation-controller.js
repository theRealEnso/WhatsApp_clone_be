import logger from "../configs/winston-logger.js";
import createHttpError from "http-errors";

import { findUser } from "../services/user-services-functions.js";
import { findConversationBetweenTwoUsers, createNewConversation, populateConversation, getAllUserConversations } from "../services/conversation-services-functions.js";

export const createNewOrOpenExistingConversation = async (req, res, next) => {
    try {
        //need id of the sender
        const sender_id = req.user.id; // get this from the auth middleware (decoded jsonwebtoken)

        // need id of the user we are sending to
        const {recipient_id} = req.body;
        if(!recipient_id){
            logger.error(`Please provide the ID of the user you want to create a conversation with`);
            throw createHttpError.BadRequest("Whoops! Something went wrong...");
        }

        //check if an existing chat conversation between two already exists. If it does, send it back. Otherwise, create a new conversation, and then populate the new conversation with data of the users excluding their passwords
        const conversationBetweenTwoUsers = await findConversationBetweenTwoUsers(sender_id, recipient_id);
        if(conversationBetweenTwoUsers){
            res.json(conversationBetweenTwoUsers);
            return;
        } else {
            const recipient_user = await findUser(recipient_id);
            const conversationData = {
                name: `${recipient_user.firstName} ${recipient_user.lastName}`,
                isGroupConversation: false,
                users: [sender_id, recipient_id]
            }

            const newConversation = await createNewConversation(conversationData);
            // console.log(newConversation);
            const populatedConversation = await populateConversation(newConversation._id, "users", "firstName lastName email picture status");
            // console.log(`I AM THE POPULATED CONVO! : ${populatedConversation}`);
            res.status(200).json(populatedConversation);
        }

    } catch(error) {
        next(error);
    };
};

//get all conversations of the user that is currently logged in
export const getAllConversations = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const foundConversations = await getAllUserConversations(user_id);

        if(foundConversations){
            res.json(foundConversations);
        } else {
            throw createHttpError.BadRequest("Whoops! Couldn't find what you were looking for")
        }

    } catch(error) {
        next(error)
    };
};