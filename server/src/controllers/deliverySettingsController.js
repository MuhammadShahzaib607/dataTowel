import DeliverySettings from "../models/DeliverySettings.js";

// Default charges
const DEFAULT_KARACHI = 300;
const DEFAULT_OUTSIDE_KARACHI = 500;

// GET /api/admin/settings/delivery — get current delivery settings
export const getDeliverySettings = async (req, res) => {
  try {
    let settings = await DeliverySettings.findOne().lean();
    if (!settings) {
      // Auto-create defaults
      settings = await DeliverySettings.create({
        karachiCharge: DEFAULT_KARACHI,
        outsideKarachiCharge: DEFAULT_OUTSIDE_KARACHI,
      });
      settings = settings.toObject();
    }
    res.json({
      success: true,
      deliverySettings: {
        karachiCharge: settings.karachiCharge,
        outsideKarachiCharge: settings.outsideKarachiCharge,
      },
    });
  } catch (error) {
    console.error("Get delivery settings error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/delivery — update delivery settings
export const updateDeliverySettings = async (req, res) => {
  try {
    const { karachiCharge, outsideKarachiCharge } = req.body;

    const karachi = Number(karachiCharge);
    const outside = Number(outsideKarachiCharge);

    if (isNaN(karachi) || karachi < 0) {
      return res.status(400).json({ success: false, message: "Karachi delivery charge must be a non-negative number." });
    }
    if (isNaN(outside) || outside < 0) {
      return res.status(400).json({ success: false, message: "Outside Karachi delivery charge must be a non-negative number." });
    }

    let settings = await DeliverySettings.findOne();
    if (settings) {
      settings.karachiCharge = karachi;
      settings.outsideKarachiCharge = outside;
      await settings.save();
    } else {
      settings = await DeliverySettings.create({
        karachiCharge: karachi,
        outsideKarachiCharge: outside,
      });
    }

    res.json({
      success: true,
      deliverySettings: {
        karachiCharge: settings.karachiCharge,
        outsideKarachiCharge: settings.outsideKarachiCharge,
      },
    });
  } catch (error) {
    console.error("Update delivery settings error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Helper: calculate delivery charge for a city
export async function calculateDeliveryCharge(city) {
  const settings = await DeliverySettings.findOne().lean();
  const karachi = settings ? settings.karachiCharge : DEFAULT_KARACHI;
  const outside = settings ? settings.outsideKarachiCharge : DEFAULT_OUTSIDE_KARACHI;

  const normalizedCity = (city || "").trim().toLowerCase();
  if (normalizedCity === "karachi") {
    return karachi;
  }
  return outside;
}

// Public helper: get current delivery charges (for checkout display)
export async function getPublicDeliverySettings() {
  const settings = await DeliverySettings.findOne().lean();
  return {
    karachiCharge: settings ? settings.karachiCharge : DEFAULT_KARACHI,
    outsideKarachiCharge: settings ? settings.outsideKarachiCharge : DEFAULT_OUTSIDE_KARACHI,
  };
}
