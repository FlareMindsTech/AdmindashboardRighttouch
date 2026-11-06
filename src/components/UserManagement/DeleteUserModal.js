import React from "react";
import ConfirmActionModal from "components/common/ConfirmActionModal";
import { getUserDisplayName } from "views/Dashboard/UserManagement";

export default function DeleteUserModal({
  isOpen,
  onClose,
  userToDelete,
  onConfirm,
  isLoading,
  error,
}) {
  const name = userToDelete ? getUserDisplayName(userToDelete) : "";
  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete user"
      description={`This permanently deletes ${name ? `"${name}"` : "this user"} and revokes their access. This action cannot be undone.`}
      confirmText="Delete user"
      confirmColorScheme="red"
      isLoading={isLoading}
      error={error}
    />
  );
}
