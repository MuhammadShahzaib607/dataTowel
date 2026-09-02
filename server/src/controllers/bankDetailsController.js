import BankDetails from "../models/BankDetails.js";

// GET /api/admin/settings/bank-details
export const getBankDetails = async (req, res) => {
  try {
    const details = await BankDetails.findOne().lean();
    res.json({
      success: true,
      bankDetails: details
        ? {
            id: details._id,
            accountTitle: details.accountTitle,
            bankName: details.bankName,
            accountNumber: details.accountNumber,
            iban: details.iban,
            createdAt: details.createdAt,
            updatedAt: details.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Get bank details error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/admin/settings/bank-details — create only if none exists
export const createBankDetails = async (req, res) => {
  try {
    const existing = await BankDetails.findOne();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Bank details already exist. Use PUT to update.",
      });
    }

    const { accountTitle, bankName, accountNumber, iban } = req.body;

    if (!accountTitle?.trim() || !bankName?.trim() || !accountNumber?.trim() || !iban?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All four fields are required.",
      });
    }

    const details = await BankDetails.create({
      accountTitle: String(accountTitle).trim(),
      bankName: String(bankName).trim(),
      accountNumber: String(accountNumber).trim(),
      iban: String(iban).trim().toUpperCase(),
    });

    res.status(201).json({
      success: true,
      bankDetails: {
        id: details._id,
        accountTitle: details.accountTitle,
        bankName: details.bankName,
        accountNumber: details.accountNumber,
        iban: details.iban,
      },
    });
  } catch (error) {
    console.error("Create bank details error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/settings/bank-details — update existing record
export const updateBankDetails = async (req, res) => {
  try {
    let details = await BankDetails.findOne();

    const { accountTitle, bankName, accountNumber, iban } = req.body;

    if (!accountTitle?.trim() || !bankName?.trim() || !accountNumber?.trim() || !iban?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All four fields are required.",
      });
    }

    if (details) {
      details.accountTitle = String(accountTitle).trim();
      details.bankName = String(bankName).trim();
      details.accountNumber = String(accountNumber).trim();
      details.iban = String(iban).trim().toUpperCase();
      await details.save();
    } else {
      details = await BankDetails.create({
        accountTitle: String(accountTitle).trim(),
        bankName: String(bankName).trim(),
        accountNumber: String(accountNumber).trim(),
        iban: String(iban).trim().toUpperCase(),
      });
    }

    res.json({
      success: true,
      bankDetails: {
        id: details._id,
        accountTitle: details.accountTitle,
        bankName: details.bankName,
        accountNumber: details.accountNumber,
        iban: details.iban,
      },
    });
  } catch (error) {
    console.error("Update bank details error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
