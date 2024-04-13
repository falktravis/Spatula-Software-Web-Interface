import * as Realm from "realm-web";

// Initialize MongoDB Realm app
const app = new Realm.App({ id: process.env.ATLAS_ID });

export { app };