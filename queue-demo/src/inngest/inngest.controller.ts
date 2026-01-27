import { Controller, Req, Res, All } from "@nestjs/common";
import type { Request, Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest.client";
import { functions } from "./inngest.functions"

@Controller("inngest")
export class InngestController {
    @All()
    async handler(@Req() req: Request, @Res() res: Response) {
    return serve({ client: inngest, functions })(req, res)
    }
}