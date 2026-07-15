import { Request, Response } from "express";
import * as assetService from "../services/asset.service";

export async function getAssetController(
    req: Request,
    res: Response
){
    try{
        const id = req.params.id as string;

        if(!id){
            return res.status(400).json({
                message:"Asset id is required"
            })
        }

        const asset = await assetService.getAsset(id);

        if(!asset){
            return res.status(404).json({
                message:'Asset not found'
            })
        }

        return res.status(200).json(asset)
    } catch (error) {
        console.error("Error fetching asset", error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}