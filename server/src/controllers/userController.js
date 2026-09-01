import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Helper: safe user response object
function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    city: user.city || "",
    country: user.country || "",
    profileImage: user.profileImage || "",
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
  };
}

// GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, city, country } = req.body;

    const updates = {};

    if (firstName !== undefined) {
      const val = String(firstName).trim();
      if (val.length > 50) {
        return res.status(400).json({ success: false, message: "First name must be 50 characters or less" });
      }
      updates.firstName = val;
    }
    if (lastName !== undefined) {
      const val = String(lastName).trim();
      if (val.length > 50) {
        return res.status(400).json({ success: false, message: "Last name must be 50 characters or less" });
      }
      updates.lastName = val;
    }
    if (phone !== undefined) {
      const val = String(phone).trim();
      if (val.length > 30) {
        return res.status(400).json({ success: false, message: "Phone must be 30 characters or less" });
      }
      updates.phone = val;
    }
    if (city !== undefined) {
      const val = String(city).trim();
      if (val.length > 100) {
        return res.status(400).json({ success: false, message: "City must be 100 characters or less" });
      }
      updates.city = val;
    }
    if (country !== undefined) {
      const val = String(country).trim();
      if (val.length > 100) {
        return res.status(400).json({ success: false, message: "Country must be 100 characters or less" });
      }
      updates.country = val;
    }

    // Never allow these fields from the client
    delete updates.isAdmin;
    delete updates.password;
    delete updates.email;
    delete updates.firebaseUid;
    delete updates.isVerified;
    delete updates.username;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// POST /api/users/profile/image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "datatowel/profiles",
          resource_type: "image",
          transformation: [
            {
              width: 500,
              height: 500,
              crop: "fill",
              gravity: "face",
            },
          ],
          format: "webp",
          quality: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileImage: result.secure_url } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      profileImage: result.secure_url,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Upload profile image error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload image. Please try again.",
    });
  }
};
