import {
  createDelegationService,
  getDelegationsService,
  getRecentDelegationsService,
  updateDelegationStatusService,
  deleteDelegationService,
} from "../services/delegation.service.js";
import { logActivity } from "../models/activity.model.js";

// POST /api/delegations/create
export const createDelegationController = async (req, res, next) => {
  try {
    const { title, description, assigned_to } = req.body;

    const delegation = await createDelegationService({
      title,
      description,
      assigned_to,
      created_by: req.user.id,
    });

    await logActivity(req.user.id, `Created delegation: "${title}"`);

    return res.status(201).json({
      success: true,
      message: "Delegation created successfully",
      data: delegation,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/delegations
export const getDelegationsController = async (req, res, next) => {
  try {
    const delegations = await getDelegationsService(req.user);

    return res.status(200).json({
      success: true,
      message: "Delegations fetched successfully",
      data: delegations,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/delegations/recent?limit=5
export const getRecentDelegationsController = async (req, res, next) => {
  try {
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;
    const limit = Math.max(1, Math.min(parseInt(rawLimit, 10) || 5, 50));
    const offset = Math.max(0, parseInt(rawOffset, 10) || 0);

    const delegations = await getRecentDelegationsService(req.user, limit, offset);

    return res.status(200).json({
      success: true,
      message: "Recent delegations fetched successfully",
      data: delegations,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/delegations/:id/status
export const updateDelegationStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const delegation = await updateDelegationStatusService(id, status, req.user);

    await logActivity(
      req.user.id,
      `Updated delegation "${delegation.title}" status to "${status}"`
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/delegations/:id
export const deleteDelegationController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delegation = await deleteDelegationService(id);

    await logActivity(req.user.id, `Deleted delegation "${delegation.title}"`);

    return res.status(200).json({
      success: true,
      message: "Delegation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
