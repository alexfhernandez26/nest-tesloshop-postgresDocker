import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetRowHeader = createParamDecorator(
    (data:string, ctx: ExecutionContext) =>{
        const request = ctx.switchToHttp().getRequest();
        const header = request.rawHeaders;
        return header;
    }
)