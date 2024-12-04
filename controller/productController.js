import Product from "../models/productModel.js";
import { tryCatch } from '../middlewares/error.js';

export const getProducts = tryCatch(async(req, res) => {
    const products = await Product.find();
    return res.status(200).json({ success: true, products: products });
});
