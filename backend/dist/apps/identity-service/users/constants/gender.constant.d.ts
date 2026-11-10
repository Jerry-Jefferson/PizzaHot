export declare const Gender: {
    readonly MALE: "male";
    readonly FEMALE: "female";
};
export type Gender = (typeof Gender)[keyof typeof Gender];
