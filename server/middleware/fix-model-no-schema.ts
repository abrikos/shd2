import {PlatformModel} from "~~/server/models/platform.model";
import {ItemModel} from "~~/server/models/item.model";
import {PartModel} from "~~/server/models/part.model";
import {ConfigModel} from "~~/server/models/config.model";

export default defineEventHandler(async (event) => {
    new Token({});
    new User({});
    new PlatformModel({});
    new ItemModel({});
    new PartModel({});
    new ConfigModel({});
})