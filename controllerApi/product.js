const Product = require("../models/product");
const { v4: uuidv4 } = require("uuid");

exports.uploadImage = (req, res) => {
  const id = uuidv4();
  let uploadedFile = req.files.image;
  let fileExtension = uploadedFile.mimetype.split("/")[1];
  let image_path = id + "." + fileExtension;
  if (
    uploadedFile.mimetype === "image/png" ||
    uploadedFile.mimetype === "image/jpeg" ||
    uploadedFile.mimetype === "image/gif"
  ) {
    uploadedFile.mv(`public/image/${image_path}`, (err) => {
      if (err) {
        res.json({
          success: false,
          data: {},
          status_code: 500,
          messages: "There was a problem when save image the users.",
        });
      } else {
        res.json({
          success: true,
          data: {
            image_path: image_path,
          },
          status_code: 200,
          messages: "Upload Image Successfully!!",
        });
      }
    });
  } else {
    res.json({
      success: false,
      data: {},
      status_code: 405,
      messages:
        "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.",
    });
  }
};
exports.addProduct = (req, res) => {
  const product = new Product(req.body);
  product
    .save()
    .then(() => {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: "Add product Successfully!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when add the product.",
      });
    });
};
exports.getAllProduct = (req, res) => {
  Product.find({})
    .then((products) => {
      res.json({
        success: true,
        data: { products: products },
        status_code: 200,
        messages: "Get products Successfully!",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when get products.",
      });
    });
};
exports.editProduct = (req, res) => {
  Product.findByIdAndUpdate(req.params.id, req.body, (err, product) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when update the product",
      });
    } else {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: "Update product '" + product.title + "' Successfully!",
      });
    }
  });
};
exports.deleteProduct = (req, res) => {
  Product.findByIdAndDelete(req.params.id, (err, product) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        data: {},
        status_code: 500,
        messages: "There was a problem when delete product",
      });
    } else {
      res.json({
        success: true,
        data: {},
        status_code: 200,
        messages: "Delete product '" + product.title + "' Successfully!",
      });
    }
  });
};
