import createHttpError from "http-errors";
import logger from "../configs/winston-logger.js";

import { searchForUsers } from "../services/user-services-functions.js";

export const searchUsers = async (req, res, next) => {
    try {
        const keyword = req.query.search;
        if(!keyword){
            logger.error("Please include a search parameter for the user your are looking for");
            throw createHttpError.BadRequest("Whoops! Looks like something went wrong...")
        }

        const users = await searchForUsers(keyword);

        if(users){
            res.json(users);
        }

    } catch (error) {
        next(error);
    };
};