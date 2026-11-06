import React from "react";
import ConfirmActionModal from "components/common/ConfirmActionModal";

export default function DeleteTechnicianDialog({
  isOpen,
  onClose,
  adminToDelete,
  allKycRecords,
  getTechnicianName,
  onConfirmDelete,
  isDeleting,
  error,
}) {
  const name = getTechnicianName(adminToDelete, allKycRecords);
  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmDelete}
      title="Delete technician"
      description={`This permanently deletes ${name || "this technician"} and their access to the admin dashboard. This action cannot be undone.`}
      confirmText="Delete technician"
      confirmColorScheme="red"
      isLoading={isDeleting}
      error={error}
    />
  );
}
