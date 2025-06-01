import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getManager = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const { cognitoId } = req.params;

        const manager = await prisma.manager.findUnique({
            where: { cognitoId },
        });

        console.log("manager result:", manager);

        if (manager) {
            res.json(manager);            
            console.log(123123);
            
        } else {
            res.status(404).json({ message: "Manager not found" });
        }
    } catch (error: any) {
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving manager: " + error.message });
        }
    }
}

export const createManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        console.log(req.body);
        
        // const checkManager = await prisma.manager.findUnique({
        //     where: { cognitoId },
        // });

        // if (checkManager) {
        //     res.status(400).json({ message: "Manager already exists" });
        //     return;
        // }

        const manager = await prisma.manager.create({
            data: { cognitoId, name, email, phoneNumber }
        });

        console.log("xxxx", manager);
        

        res.status(201).json(manager);
    } catch (error: any) {
        if (!res.headersSent) {
            res.status(500).json({ message: "Error creating manager: " + error.message });
        }
    }
}
