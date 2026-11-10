import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../auth.constant.js";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
//# sourceMappingURL=public.decorator.js.map