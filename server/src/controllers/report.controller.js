import { getReportsService } from "../services/report.service.js";

export const getReportsController = async (req, res) => {
  try {
    const reports = await getReportsService(req.user);

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};