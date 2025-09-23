import mongoose from "mongoose";

const productOrderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    }
});

const ProductOrder = mongoose.model("ProductOrder", productOrderSchema);
export default ProductOrder;
