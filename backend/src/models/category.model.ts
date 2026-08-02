import { Schema, model, type InferSchemaType } from 'mongoose';
const schema=new Schema({name:{type:String,enum:['Fast Food','Chinese Food','BBQ'],required:true,unique:true},displayOrder:{type:Number,required:true,min:0}},{timestamps:true});export type Category=InferSchemaType<typeof schema>;export const CategoryModel=model('Category',schema);
