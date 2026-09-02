import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";

function sanitizeBlog(blog) {
  return {
    id: blog._id,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    category: blog.category,
    images: blog.images,
    isActive: blog.isActive,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

// POST /api/blogs — admin only, create blog
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, isActive } = req.body;

    const blogData = {
      title: title ? String(title).trim() : "",
      excerpt: excerpt ? String(excerpt).trim() : "",
      content: content ? String(content).trim() : "",
      category: category ? String(category).trim() : "",
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      images: [],
    };

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "datatowel/blogs",
                resource_type: "image",
                transformation: [
                  { width: 1200, height: 800, crop: "limit" },
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
      blogData.images = uploadResults;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, blog: sanitizeBlog(blog) });
  } catch (error) {
    console.error("Create blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/blogs — admin only, all blogs
export const getBlogs = async (req, res) => {
  try {
    const { category, isActive, search } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      blogs: blogs.map((b) => ({ ...b, id: b._id })),
    });
  } catch (error) {
    console.error("Get blogs error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/blogs/:id — admin only, single blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog: { ...blog, id: blog._id } });
  } catch (error) {
    console.error("Get blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/blogs/:id — admin only, update blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const { title, excerpt, content, category, isActive, removeImages } = req.body;

    if (title !== undefined) blog.title = String(title).trim();
    if (excerpt !== undefined) blog.excerpt = String(excerpt).trim();
    if (content !== undefined) blog.content = String(content).trim();
    if (category !== undefined) blog.category = String(category).trim();
    if (isActive !== undefined) blog.isActive = Boolean(isActive);

    // Handle image removal
    if (removeImages) {
      let idsToRemove = [];
      try {
        const raw = typeof removeImages === "string" ? JSON.parse(removeImages) : removeImages;
        idsToRemove = Array.isArray(raw) ? raw : [];
      } catch {
        idsToRemove = [];
      }

      if (idsToRemove.length > 0) {
        for (const publicId of idsToRemove) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Cloudinary delete failed for", publicId, err.message);
          }
        }
        blog.images = blog.images.filter((img) => !idsToRemove.includes(img.publicId));
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "datatowel/blogs",
                resource_type: "image",
                transformation: [
                  { width: 1200, height: 800, crop: "limit" },
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
      blog.images.push(...uploadResults);
    }

    await blog.save();
    res.json({ success: true, blog: sanitizeBlog(blog) });
  } catch (error) {
    console.error("Update blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// DELETE /api/blogs/:id — admin only
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Clean up Cloudinary images
    for (const image of blog.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (err) {
          console.error("Cloudinary delete failed for", image.publicId, err.message);
        }
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/blogs/:id/status — admin only
export const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.isActive = !blog.isActive;
    await blog.save();
    res.json({ success: true, blog: sanitizeBlog(blog) });
  } catch (error) {
    console.error("Toggle blog status error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Public: GET /api/store/blogs — active blogs only
export const getPublicBlogs = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      blogs: blogs.map((b) => ({
        id: b._id,
        title: b.title,
        excerpt: b.excerpt,
        category: b.category,
        images: b.images,
        isActive: b.isActive,
        createdAt: b.createdAt,
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Get public blogs error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Public: GET /api/store/blogs/:id — single active blog
export const getPublicBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog || !blog.isActive) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({
      success: true,
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        images: blog.images,
        createdAt: blog.createdAt,
      },
    });
  } catch (error) {
    console.error("Get public blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
