"use server";

import { revalidatePath } from "next/cache";

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from "@/lib/validations/user";

import { createUser } from "@/lib/services/users/create-user";
import { updateUser } from "@/lib/services/users/update-user";
import { setUserActive } from "@/lib/services/users/set-user-active";

export type UserActionState = {
  success: boolean;
  message: string;
};

export async function createUserAction(
  _previousState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid user data.",
    };
  }

  const result = await createUser(
    parsed.data
  );

  if (!result.success) {
    if (result.reason === "FORBIDDEN") {
      return {
        success: false,
        message:
          "You do not have permission to create users.",
      };
    }

    if (result.reason === "EMAIL_EXISTS") {
      return {
        success: false,
        message:
          "A user with this email already exists.",
      };
    }

    return {
      success: false,
      message:
        "Could not create user.",
    };
  }

  revalidatePath("/users");

  return {
    success: true,
    message:
      "User created successfully.",
  };
}

export async function updateUserAction(
  _previousState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "Invalid user data.",
    };
  }

  const result = await updateUser(
    parsed.data
  );

  if (!result.success) {
    if (result.reason === "FORBIDDEN") {
      return {
        success: false,
        message:
          "You do not have permission to edit users.",
      };
    }

    if (result.reason === "LAST_ADMIN") {
      return {
        success: false,
        message:
          "The last active admin cannot be changed to staff.",
      };
    }

    return {
      success: false,
      message: "User not found.",
    };
  }

  revalidatePath("/users");

  return {
    success: true,
    message:
      "User updated successfully.",
  };
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean
): Promise<UserActionState> {
  const parsed = userIdSchema.safeParse({
    userId,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid user.",
    };
  }

  const result = await setUserActive(
    parsed.data.userId,
    isActive
  );

  if (!result.success) {
    switch (result.reason) {
      case "FORBIDDEN":
        return {
          success: false,
          message:
            "You do not have permission to manage users.",
        };

      case "CANNOT_DEACTIVATE_SELF":
        return {
          success: false,
          message:
            "You cannot deactivate your own account.",
        };

      case "LAST_ADMIN":
        return {
          success: false,
          message:
            "The last active admin cannot be deactivated.",
        };

      case "USER_CHANGED":
        return {
          success: false,
          message:
            "The user changed. Refresh and try again.",
        };

      default:
        return {
          success: false,
          message: "User not found.",
        };
    }
  }

  revalidatePath("/users");

  return {
    success: true,
    message: isActive
      ? "User activated successfully."
      : "User deactivated successfully.",
  };
}