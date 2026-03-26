import {
  createDelegation,
  getAllDelegations,
  getDelegationsByUser,
  getAllDelegationsRecent,
  getDelegationsByUserRecent,
  getDelegationById,
  updateDelegationStatus,
  deleteDelegation,
} from "../models/delegation.model.js";
import { ROLES } from "../constants/roles.js";

export const createDelegationService = async ({
  title,
  description,
  assigned_to,
  created_by,
}) => {
  return await createDelegation({ title, description, assigned_to, created_by });
};

export const getDelegationsService = async (user) => {
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
    return await getAllDelegations();
  }
  return await getDelegationsByUser(user.id);
};

// Recent delegations for dashboard (limited set)
export const getRecentDelegationsService = async (user, limit, offset = 0) => {
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
    return await getAllDelegationsRecent(limit, offset);
  }
  return await getDelegationsByUserRecent(user.id, limit, offset);
};

export const updateDelegationStatusService = async (delegationId, status, user) => {
  const delegation = await getDelegationById(delegationId);

  if (!delegation) {
    const err = new Error("Delegation not found");
    err.statusCode = 404;
    throw err;
  }

  const uid = Number(user.id);
  const adminOwnsRow =
    Number(delegation.created_by) === uid || Number(delegation.assigned_to) === uid;
  if (user.role === ROLES.ADMIN && !adminOwnsRow) {
    const err = new Error(
      "You can only update delegations you created or that are assigned to you"
    );
    err.statusCode = 403;
    throw err;
  }

  // Regular users can only update delegations assigned to them
  if (user.role === ROLES.USER && Number(delegation.assigned_to) !== uid) {
    const err = new Error("You can only update delegations assigned to you");
    err.statusCode = 403;
    throw err;
  }

  await updateDelegationStatus(delegationId, status);
  return delegation; // Return the full object so the controller can log the title
};

export const deleteDelegationService = async (delegationId) => {
  const delegation = await getDelegationById(delegationId);

  if (!delegation) {
    const err = new Error("Delegation not found");
    err.statusCode = 404;
    throw err;
  }

  await deleteDelegation(delegationId);
  return delegation;
};
