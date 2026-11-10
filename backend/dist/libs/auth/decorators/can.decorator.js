import { SetMetadata } from "@nestjs/common";
export const PERMISSIONS_KEY = "permissions";
export const Can = (...permissions) => SetMetadata(PERMISSIONS_KEY, permissions);
//# sourceMappingURL=can.decorator.js.map