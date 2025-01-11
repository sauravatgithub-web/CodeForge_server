import mongoose, { Types } from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please give a title to the product!']
  },
  description: {
    type: String,
  },
  price: {
    type: [String],
    required: [true, 'Please provide tags']
  },
  quantity: {
    type: [Number],
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
