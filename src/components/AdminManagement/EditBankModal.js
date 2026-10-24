import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export default function EditBankModal({
  isOpen,
  onClose,
  bankEditForm,
  setBankEditForm,
  onSave,
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent borderRadius="14px">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          Edit Technician Bank & Payout Details
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <VStack spacing={3}>
            <FormControl isRequired>
              <FormLabel fontSize="xs">Account Holder Name</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.accountHolderName}
                onChange={(e) => setBankEditForm({ ...bankEditForm, accountHolderName: e.target.value })}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs">Bank Name</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.bankName}
                onChange={(e) => setBankEditForm({ ...bankEditForm, bankName: e.target.value })}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs">Account Number</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.accountNumber}
                onChange={(e) => setBankEditForm({ ...bankEditForm, accountNumber: e.target.value })}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="xs">IFSC Code</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.ifscCode}
                onChange={(e) => setBankEditForm({ ...bankEditForm, ifscCode: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Branch Name</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.branchName}
                onChange={(e) => setBankEditForm({ ...bankEditForm, branchName: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">UPI ID</FormLabel>
              <Input
                size="sm"
                value={bankEditForm.upiId}
                onChange={(e) => setBankEditForm({ ...bankEditForm, upiId: e.target.value })}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50">
          <Button size="sm" mr={2} variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" colorScheme="teal" onClick={onSave} isLoading={isLoading}>
            Save Bank Details
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
