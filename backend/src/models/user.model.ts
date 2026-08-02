import { Schema, model, type InferSchemaType } from 'mongoose';
const address = new Schema({ label:String, line1:{type:String,required:true}, area:String, city:{type:String,default:'Karachi'}, instructions:String },{_id:false});
const schema=new Schema({name:{type:String,required:true,trim:true},phone:{type:String,required:true,unique:true},email:{type:String,lowercase:true,trim:true,sparse:true},addresses:{type:[address],default:[]},role:{type:String,enum:['customer','admin'],default:'customer'}},{timestamps:true});
export type User=InferSchemaType<typeof schema>; export const UserModel=model('User',schema);
