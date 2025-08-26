import {PlatformModel} from "~~/server/models/platform.model";
import {ItemModel} from "~~/server/models/item.model";

export default defineEventHandler(async (event) => {
    new Token({});
    new User({});
    new PlatformModel({});
    new ItemModel({});
})