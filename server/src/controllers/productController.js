import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Helper: sanitize product response
function sanitizeProduct(product) {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    subCategory: product.subCategory,
    sizes: product.sizes,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// POST /api/products — accepts multipart/form-data with optional image files
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, subCategory, sizes, price, discountedPrice, isActive } = req.body;

    // Parse sizes — may arrive as JSON string (FormData) or array (JSON body)
    let parsedSizes = [];
    if (sizes) {
      try {
        const raw = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
        parsedSizes = Array.isArray(raw) ? raw.map((s) => String(s).trim()).filter(Boolean) : [];
      } catch {
        parsedSizes = [];
      }
    }

    // Validate prices if provided
    if (price !== undefined && price !== null && price !== "") {
      const p = Number(price);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ success: false, message: "Price must be a valid positive number" });
      }
    }
    if (discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "") {
      const dp = Number(discountedPrice);
      if (isNaN(dp) || dp < 0) {
        return res.status(400).json({ success: false, message: "Discounted price must be a valid positive number" });
      }
      if (price !== undefined && price !== null && price !== "" && Number(dp) > Number(price)) {
        return res.status(400).json({ success: false, message: "Discounted price cannot be greater than price" });
      }
    }

    const productData = {
      name: name ? String(name).trim() : "",
      description: description ? String(description).trim() : "",
      category: category ? String(category).trim() : "",
      subCategory: subCategory ? String(subCategory).trim() : "",
      sizes: parsedSizes,
      price: price !== undefined && price !== null && price !== "" ? Number(price) : null,
      discountedPrice: discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "" ? Number(discountedPrice) : null,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      images: [],
    };

    // Upload images to Cloudinary via memory buffers (no disk writes)
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "datatowel/products",
                resource_type: "image",
                transformation: [
                  { width: 800, height: 800, crop: "limit" },
                ],
                format: "webp",
                quality: "auto",
              },
              (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, publicId: result.public_id });
              }
            );
            stream.end(file.buffer);
          })
        )
      );
      productData.images = uploadResults;
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product: sanitizeProduct(product) });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      products: products.map((p) => ({ ...p, id: p._id })),
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/products/:id
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product: { ...product, id: product._id } });
  } catch (error) {
    console.error("Get product error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, description, category, subCategory, sizes, price, discountedPrice, isActive } = req.body;

    // Validate prices if both are provided
    if (price !== undefined && price !== null && price !== "") {
      const p = Number(price);
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ success: false, message: "Price must be a valid positive number" });
      }
    }
    if (discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "") {
      const dp = Number(discountedPrice);
      if (isNaN(dp) || dp < 0) {
        return res.status(400).json({ success: false, message: "Discounted price must be a valid positive number" });
      }
      const effectivePrice = price !== undefined && price !== null && price !== "" ? Number(price) : product.price;
      if (effectivePrice !== null && Number(dp) > effectivePrice) {
        return res.status(400).json({ success: false, message: "Discounted price cannot be greater than price" });
      }
    }

    // Update only provided fields
    if (name !== undefined) product.name = String(name).trim();
    if (description !== undefined) product.description = String(description).trim();
    if (category !== undefined) product.category = String(category).trim();
    if (subCategory !== undefined) product.subCategory = String(subCategory).trim();
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes.map((s) => String(s).trim()).filter(Boolean) : [];
    if (price !== undefined) product.price = price !== null && price !== "" ? Number(price) : null;
    if (discountedPrice !== undefined) product.discountedPrice = discountedPrice !== null && discountedPrice !== "" ? Number(discountedPrice) : null;
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    await product.save();
    res.json({ success: true, product: sanitizeProduct(product) });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete Cloudinary images if they exist
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (err) {
          console.error("Cloudinary delete failed for", image.publicId, err.message);
          // Continue — don't crash if one image fails
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/products/:id/status
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, product: sanitizeProduct(product) });
  } catch (error) {
    console.error("Toggle product status error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// POST /api/products/:id/images
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No image files provided" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Upload all images in parallel
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "datatowel/products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "limit" },
              ],
              format: "webp",
              quality: "auto",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({ url: result.secure_url, publicId: result.public_id });
            }
          );
          stream.end(file.buffer);
        })
      )
    );

    product.images.push(...uploadResults);
    await product.save();

    res.json({ success: true, product: sanitizeProduct(product) });
  } catch (error) {
    console.error("Upload product images error:", error.message);
    res.status(500).json({ success: false, message: "Failed to upload images. Please try again." });
  }
};

// DELETE /api/products/:id/images/:publicId
export const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { publicId } = req.params;

    // Remove from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary delete failed:", err.message);
    }

    // Remove from product images array
    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json({ success: true, product: sanitizeProduct(product) });
  } catch (error) {
    console.error("Delete product image error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
