import { boolean, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const UserSubscription=pgTable('userSubscription',{
    id:serial('id').primaryKey(),
    email:varchar('email'),
    userName:varchar('userName'),
    defaultModel:varchar('defaultModel'),
    active:boolean('active'),
    paymentId:varchar('paymentId'),
    joinDate:varchar('joinData')
})

