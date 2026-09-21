/**
 * TypeORM ships a DeepPartial of its own, and this is deliberately not it: repository
 * interfaces describe the contract a service depends on, and importing TypeORM into them
 * would tie that contract to one ORM - which is the thing the interfaces exist to avoid.
 * The repository classes, which wrap TypeORM directly, use TypeORM's version.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};
