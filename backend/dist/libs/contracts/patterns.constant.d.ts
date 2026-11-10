export declare const RPC: {
    readonly identity: {
        readonly register: "identity.auth.register";
        readonly login: "identity.auth.login";
        readonly verifyEmail: "identity.auth.verify_email";
        readonly declineEmail: "identity.auth.decline_email";
        readonly findById: "identity.user.find_by_id";
        readonly findAll: "identity.user.find_all";
        readonly updateMe: "identity.user.update_me";
        readonly setImage: "identity.user.set_image";
        readonly setRole: "identity.user.set_role";
        readonly changePassword: "identity.user.change_password";
        readonly deleteMe: "identity.user.delete_me";
    };
    readonly catalog: {
        readonly pizzaList: "catalog.pizza.list";
        readonly pizzaFindById: "catalog.pizza.find_by_id";
        readonly pizzaCreate: "catalog.pizza.create";
        readonly pizzaUpdate: "catalog.pizza.update";
        readonly pizzaSetImage: "catalog.pizza.set_image";
        readonly pizzaRemove: "catalog.pizza.remove";
        readonly pizzaResolve: "catalog.pizza.resolve";
        readonly ingredientList: "catalog.ingredient.list";
        readonly ingredientFindById: "catalog.ingredient.find_by_id";
        readonly ingredientCreate: "catalog.ingredient.create";
        readonly ingredientUpdate: "catalog.ingredient.update";
        readonly ingredientRemove: "catalog.ingredient.remove";
    };
    readonly cart: {
        readonly get: "cart.get";
        readonly addItem: "cart.add_item";
        readonly updateItemQuantity: "cart.update_item_quantity";
        readonly removeItem: "cart.remove_item";
        readonly clear: "cart.clear";
        readonly applyPromocode: "cart.apply_promocode";
        readonly removePromocode: "cart.remove_promocode";
        readonly checkoutSnapshot: "cart.checkout_snapshot";
    };
    readonly order: {
        readonly create: "order.create";
        readonly findMine: "order.find_mine";
        readonly findMineById: "order.find_mine_by_id";
        readonly findAll: "order.find_all";
        readonly findByUserId: "order.find_by_user_id";
        readonly findById: "order.find_by_id";
        readonly updateStatus: "order.update_status";
    };
    readonly promocode: {
        readonly list: "promocode.list";
        readonly findById: "promocode.find_by_id";
        readonly findByCode: "promocode.find_by_code";
        readonly create: "promocode.create";
        readonly update: "promocode.update";
        readonly remove: "promocode.remove";
        readonly restore: "promocode.restore";
        readonly checkAvailable: "promocode.check_available";
        readonly reserve: "promocode.reserve";
    };
    readonly analytics: {
        readonly popularPizza: "analytics.popular_pizza";
        readonly highestChecks: "analytics.highest_checks";
    };
    readonly log: {
        readonly query: "log.query";
    };
};
export declare const EVENTS: {
    readonly userRegistered: "user.registered";
    readonly userEmailVerified: "user.email_verified";
    readonly userDeleted: "user.deleted";
    readonly pizzaCreated: "pizza.created";
    readonly pizzaUpdated: "pizza.updated";
    readonly pizzaDeleted: "pizza.deleted";
    readonly promocodeDeleted: "promocode.deleted";
    readonly orderCreated: "order.created";
    readonly orderFailed: "order.failed";
    readonly orderStatusChanged: "order.status_changed";
    readonly criticalError: "system.critical_error";
    readonly logWritten: "log.written";
};
