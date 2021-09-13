const { Sequelize } = require('sequelize');

class ClientPool {
    static #instance = null;
    sequelize = null;

    constructor() {
        if (!ClientPool.#instance) {
            ClientPool.#instance = this;
            this.sequelize = new Sequelize(process.env.DB_URL);
        } else {
            return ClientPool.#instance;
        }
    }
}

module.exports = { ClientPool };