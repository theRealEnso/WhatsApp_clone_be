import mongoose from "mongoose";

const {ObjectId} = mongoose.Schema.Types;

const messageSchema = mongoose.Schema({
    sender: {
        type: ObjectId,
        ref: "UserModel"
    },

    message: {
        type: String,
        required: true
    },

    conversation: {
        type: ObjectId,
        ref: "ConversationModel",
    },

    files: [],

}, {collection: "messages", timestamps: true});

export const MessageModel = mongoose.models.MessageModel || mongoose.model("MessageModel", messageSchema);