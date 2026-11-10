function unavailable(member) {
    throw new Error(`${member}() is not provided by this HTTP test context`);
}
export function createHttpExecutionContext(request, response) {
    const boxedRequest = request;
    const boxedResponse = response;
    const http = {
        getRequest: () => boxedRequest,
        getResponse: () => boxedResponse,
        getNext: () => unavailable("getNext"),
    };
    return {
        switchToHttp: () => http,
        switchToRpc: () => unavailable("switchToRpc"),
        switchToWs: () => unavailable("switchToWs"),
        getType: () => unavailable("getType"),
        getArgs: () => unavailable("getArgs"),
        getArgByIndex: () => unavailable("getArgByIndex"),
        getClass: () => unavailable("getClass"),
        getHandler: () => unavailable("getHandler"),
    };
}
//# sourceMappingURL=http-context.mock.js.map