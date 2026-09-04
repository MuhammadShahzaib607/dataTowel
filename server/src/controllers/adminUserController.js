import User from "../models/User.js";

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "all",
      sort = "newest",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search across username, firstName, lastName, email, phone
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { username: regex },
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    // Filter by account status
    if (status === "active") {
      query.isVerified = true;
    } else if (status === "inactive") {
      query.isVerified = false;
    }

    // Sort
    const sortOption = sort === "oldest"
      ? { createdAt: 1 }
      : { createdAt: -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("username email firstName lastName phone city country profileImage isVerified isAdmin authProvider createdAt updatedAt")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        phone: u.phone || "",
        city: u.city || "",
        country: u.country || "",
        profileImage: u.profileImage || "",
        isVerified: u.isVerified,
        isAdmin: u.isAdmin,
        authProvider: u.authProvider || "local",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
