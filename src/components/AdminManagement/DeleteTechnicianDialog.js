import React from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";

export default function DeleteTechnicianDialog({
  isOpen,
  onClose,
  cancelRef,
  adminToDelete,
  allKycRecords,
  getTechnicianName,
  onConfirmDelete,
  isDeleting,
}) {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="14px">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Technician
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete{" "}
            <strong>{getTechnicianName(adminToDelete, allKycRecords)}</strong>? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirmDelete}
              ml={3}
              size="sm"
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
