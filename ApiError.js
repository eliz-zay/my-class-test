class ApiError extends Error {
    constructor(message) {
        super(message);
        this.name = "ApiError";
        this.details = [{ message: message }];
    }
}

module.exports = { ApiError };