const mongose = require("mongoose");
const ProductSchema = new mongose.Schema({
image_path:{
    type:String,
    required:true
},
title:{
    type:String,
    required:true
},
price:{
    type:String,
    required:true
},
deception:{
    type:String,
    required:true
},
date:{
    type:Date,
    default:Date.now()
}
});
const Product = mongose.model("Product", ProductSchema);
module.exports = Product;
