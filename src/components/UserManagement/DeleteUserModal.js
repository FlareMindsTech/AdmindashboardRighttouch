import React from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import { MdWarning } from "react-icons/md";
import { getUserDisplayName } from "views/Dashboard/UserManagement";

export default function DeleteUserModal({
  isOpen,
  onClose,
  userToDelete,
  onConfirm,
  isLoading,
  cancelRef,
  customColor = "#008080",
}) {
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <Flex align="center" gap={2}>
              <Icon as={MdWarning} color="red.500" />
              Confirm Delete
            </Flex>
          </AlertDialogHeader>

          <AlertDialogBody>
            {userToDelete && (
              <Text>
                Are you sure you want to delete{" "}
                <Text as="span" fontWeight="bold" color={customColor}>
                  "{getUserDisplayName(userToDelete)}"
                </Text>
                ? This action cannot be undone.
              </Text>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
              size="sm"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
