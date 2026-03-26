import {
  createAdmin,
  createNormalUser,
  fetchAllUsers,
  updateUserRole,
  removeUser,
} from "../services/user.service.js";
import { logActivity } from "../models/activity.model.js";

// POST /api/users/create-admin  (Super Admin only)
export const createAdminController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const admin = await createAdmin({ name, email, password });

    await logActivity(req.user.id, `Created admin account for: ${email}`);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/create-user  (Admin + Super Admin)
export const createUserController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await createNormalUser({ name, email, password });

    await logActivity(req.user.id, `Created user account for: ${email}`);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/all-users  (Admin + Super Admin)
export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await fetchAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role  (Super Admin only)
export const updateUserRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    await updateUserRole(id, role);

    await logActivity(req.user.id, `Updated user #${id} role to "${role}"`);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  (Super Admin only)
export const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent Super Admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await removeUser(id);

    await logActivity(req.user.id, `Deleted user #${id}`);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
