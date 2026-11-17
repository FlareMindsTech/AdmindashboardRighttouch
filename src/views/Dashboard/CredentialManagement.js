import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, RepeatIcon } from "@chakra-ui/icons";
import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AppModal from "components/common/AppModal";
import StatusBadge from "components/common/StatusBadge";
import FormErrorSummary from "components/feedback/FormErrorSummary";
import { useAppToast } from "components/feedback";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  logout,
  selectAuthInitialized,
  selectIsOwner,
  selectUser,
} from "store/slices/authSlice";
import {
  changePrivilegedUserRole,
  createPrivilegedUser,
  listPrivilegedUsers,
} from "api/adminUsers";

const BRAND = "#008080";
const EMPTY_FORM = {
  role: "Admin",
  fname: "",
  lname: "",
  identifier: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const normalizeMobile = (value) =>
  (value || "").toString().replace(/[\s-]/g, "");

const validateMobile = (value) =>
  /^(?:\+91)?[6-9]\d{9}$/.test(normalizeMobile(value));

const validateEmail = (value) => /^\S+@\S+\.\S+$/.test((value || "").trim());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const roleBadgeProps = (role) =>
  role === "Owner"
    ? { colorScheme: "purple", variant: "subtle" }
    : { colorScheme: "blue", variant: "subtle" };

export default function CredentialManagement() {
  const toast = useAppToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isOwner = useAppSelector(selectIsOwner);
  const currentUser = useAppSelector(selectUser);
  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId || "";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const [roleTarget, setRoleTarget] = useState(null);
  const [nextRole, setNextRole] = useState("Admin");
  const [roleReason, setRoleReason] = useState("");
  const [roleErrors, setRoleErrors] = useState({});
  const [roleError, setRoleError] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);

  useEffect(() => {
    if (authInitialized && !isOwner) {
      navigate("/access-denied", { replace: true });
    }
  }, [authInitialized, isOwner, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await listPrivilegedUsers();
    if (error) {
      setLoadError(error);
      setUsers([]);
    } else {
      setUsers(Array.isArray(data?.result) ? data.result : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOwner) fetchUsers();
  }, [fetchUsers, isOwner]);

  const counts = useMemo(
    () => ({
      total: users.length,
      owners: users.filter((user) => user.role === "Owner").length,
      admins: users.filter((user) => user.role === "Admin").length,
    }),
    [users]
  );

  const activeOwners = useMemo(
    () =>
      users.filter(
        (user) => user.role === "Owner" && user.status === "Active"
      ).length,
    [users]
  );

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setFormError("");
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError("");
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (creating) return;
    setCreateOpen(false);
    setFormError("");
    setFormErrors({});
  };

  const validateCreateForm = () => {
    const errors = {};
    const fname = form.fname.trim();
    const identifier = form.identifier.trim();
    const email = form.email.trim();

    if (!fname) errors.fname = "First name is required.";
    if (!identifier) {
      errors.identifier = "Mobile number is required.";
    } else if (!validateMobile(identifier)) {
      errors.identifier = "Enter a valid 10-digit Indian mobile number.";
    }
    if (email && !validateEmail(email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    } else if (form.password.length > 128) {
      errors.password = "Password must not exceed 128 characters.";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitCreate = async () => {
    setFormError("");
    if (!validateCreateForm()) return;

    setCreating(true);
    const payload = {
      role: form.role,
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      identifier: form.identifier.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    if (!payload.lname) delete payload.lname;
    if (!payload.email) delete payload.email;

    const { data, error, fieldErrors, code } =
      await createPrivilegedUser(payload);

    if (error) {
      const serverFieldErrors = { ...(fieldErrors || {}) };
      if (code === "MOBILE_ALREADY_EXISTS") {
        serverFieldErrors.identifier = error;
      } else if (code === "EMAIL_ALREADY_EXISTS") {
        serverFieldErrors.email = error;
      } else if (code === "INVALID_MOBILE_NUMBER") {
        serverFieldErrors.identifier = error;
      } else if (code === "INVALID_EMAIL") {
        serverFieldErrors.email = error;
      }
      setFormErrors((prev) => ({ ...prev, ...serverFieldErrors }));
      setFormError(error);
      setCreating(false);
      return;
    }

    toast({
      title: "Credential created",
      description: `${data?.result?.role || form.role} account created successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setCreating(false);
    setCreateOpen(false);
    setForm(EMPTY_FORM);
    fetchUsers();
  };

  const openRoleChange = (user) => {
    setRoleTarget(user);
    setNextRole(user.role === "Owner" ? "Admin" : "Owner");
    setRoleReason("");
    setRoleErrors({});
    setRoleError("");
  };

  const closeRoleChange = () => {
    if (roleSaving) return;
    setRoleTarget(null);
    setRoleError("");
    setRoleErrors({});
  };

  const submitRoleChange = async () => {
    const errors = {};
    if (!roleTarget) return;
    if (nextRole === roleTarget.role) {
      errors.role = "Choose a different role.";
    }
    if (roleReason.trim().length < 5) {
      errors.reason = "Enter a reason of at least 5 characters.";
    }
    if (
      roleTarget.role === "Owner" &&
      nextRole !== "Owner" &&
      activeOwners <= 1
    ) {
      errors.role = "The last active Owner cannot be demoted.";
    }

    setRoleErrors(errors);
    setRoleError("");
    if (Object.keys(errors).length > 0) return;

    setRoleSaving(true);
    const { error, fieldErrors, code } = await changePrivilegedUserRole(
      roleTarget._id,
      { role: nextRole, reason: roleReason.trim() }
    );

    if (error) {
      const serverFieldErrors = { ...(fieldErrors || {}) };
      if (code === "LAST_ACTIVE_OWNER") serverFieldErrors.role = error;
      if (code === "ROLE_UNCHANGED") serverFieldErrors.role = error;
      setRoleErrors((prev) => ({ ...prev, ...serverFieldErrors }));
      setRoleError(error);
      setRoleSaving(false);
      return;
    }

    const isSelf = currentUserId && roleTarget._id === currentUserId;
    toast({
      title: "Role updated",
      description: `Account role changed to ${nextRole}. Existing sessions were revoked.`,
      status: "success",
      duration: 3500,
      isClosable: true,
    });
    setRoleSaving(false);
    setRoleTarget(null);

    if (isSelf) {
      dispatch(logout());
      navigate("/auth/signin", { replace: true });
      return;
    }

    fetchUsers();
  };

  if (!authInitialized || !isOwner) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color={BRAND} thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: "120px", md: "75px" }}>
      <Card>
        <CardBody>
          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
            mb={5}
          >
            <HStack spacing={3}>
              <Flex
                align="center"
                justify="center"
                w="42px"
                h="42px"
                borderRadius="12px"
                bg="teal.50"
                color={BRAND}
              >
                <FaUserShield size={20} />
              </Flex>
              <Box>
                <Heading size="md" color="gray.800">
                  Admin & Owner Credentials
                </Heading>
                <HStack spacing={2} mt={1}>
                  <Badge colorScheme="teal" borderRadius="full" px={2}>
                    {counts.total} total
                  </Badge>
                  <Badge colorScheme="purple" borderRadius="full" px={2}>
                    {counts.owners} owner
                  </Badge>
                  <Badge colorScheme="blue" borderRadius="full" px={2}>
                    {counts.admins} admin
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
              <IconButton
                aria-label="Refresh credentials"
                icon={<RepeatIcon />}
                variant="outline"
                borderColor="gray.200"
                onClick={fetchUsers}
                isLoading={loading}
              />
              <Button
                leftIcon={<AddIcon />}
                bg={BRAND}
                color="white"
                _hover={{ bg: "#006f6f" }}
                onClick={openCreate}
              >
                Create Credential
              </Button>
            </HStack>
          </Flex>

          {loadError ? (
            <FormErrorSummary
              error={loadError}
              title="Unable to load credentials"
              onRetry={fetchUsers}
            />
          ) : loading ? (
            <Center py={16}>
              <Spinner size="lg" color={BRAND} />
            </Center>
          ) : users.length === 0 ? (
            <Center py={16}>
              <Text color="gray.500">No Admin or Owner credentials found.</Text>
            </Center>
          ) : (
            <TableContainer
              border="1px solid"
              borderColor="gray.100"
              borderRadius="12px"
              overflowX="auto"
            >
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Account</Th>
                    <Th>Mobile</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Email
                    </Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th display={{ base: "none", lg: "table-cell" }}>
                      Last Login
                    </Th>
                    <Th textAlign="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => {
                    const name =
                      `${user.fname || ""} ${user.lname || ""}`.trim() ||
                      "Unnamed account";
                    return (
                      <Tr key={user._id}>
                        <Td>
                          <Stack spacing={0.5}>
                            <Text fontWeight="700" fontSize="sm">
                              {name}
                            </Text>
                            <Text fontSize="2xs" color="gray.500">
                              Created {formatDate(user.createdAt)}
                            </Text>
                          </Stack>
                        </Td>
                        <Td fontFamily="mono" fontSize="xs">
                          {user.mobileNumber || "—"}
                        </Td>
                        <Td
                          display={{ base: "none", lg: "table-cell" }}
                          fontSize="xs"
                          color="gray.600"
                        >
                          {user.email || "—"}
                        </Td>
                        <Td>
                          <Badge
                            {...roleBadgeProps(user.role)}
                            borderRadius="full"
                          >
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>
                          <StatusBadge
                            colorScheme={
                              user.status === "Active" ? "green" : "gray"
                            }
                            label={user.status || "Unknown"}
                            variant="subtle"
                          />
                        </Td>
                        <Td
                          display={{ base: "none", lg: "table-cell" }}
                          fontSize="xs"
                          color="gray.600"
                        >
                          {formatDate(user.lastLoginAt)}
                        </Td>
                        <Td textAlign="right">
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            onClick={() => openRoleChange(user)}
                          >
                            Change Role
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>

      <AppModal
        isOpen={createOpen}
        onClose={closeCreate}
        title="Create Credential"
        tone="info"
        icon={FaUserShield}
        size="lg"
        primaryAction={{
          label: "Create Credential",
          onClick: submitCreate,
          isLoading: creating,
          colorScheme: "teal",
        }}
        secondaryAction={{ label: "Cancel", onClick: closeCreate }}
      >
        <VStack spacing={4} align="stretch">
          {formError ? (
            <FormErrorSummary
              error={formError}
              fieldErrors={formErrors}
              title="Unable to create credential"
            />
          ) : null}

          <FormControl isRequired isInvalid={Boolean(formErrors.role)}>
            <FormLabel fontSize="sm">Role</FormLabel>
            <Select
              value={form.role}
              onChange={(e) => updateForm("role", e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
            </Select>
            <FormErrorMessage>{formErrors.role}</FormErrorMessage>
          </FormControl>

          <HStack spacing={3} align="flex-start">
            <FormControl isRequired isInvalid={Boolean(formErrors.fname)}>
              <FormLabel fontSize="sm">First Name</FormLabel>
              <Input
                value={form.fname}
                onChange={(e) => updateForm("fname", e.target.value)}
                placeholder="First name"
              />
              <FormErrorMessage>{formErrors.fname}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(formErrors.lname)}>
              <FormLabel fontSize="sm">Last Name</FormLabel>
              <Input
                value={form.lname}
                onChange={(e) => updateForm("lname", e.target.value)}
                placeholder="Last name"
              />
              <FormErrorMessage>{formErrors.lname}</FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl isRequired isInvalid={Boolean(formErrors.identifier)}>
            <FormLabel fontSize="sm">Mobile Number</FormLabel>
            <Input
              type="tel"
              value={form.identifier}
              onChange={(e) => updateForm("identifier", e.target.value)}
              placeholder="10-digit mobile number"
            />
            <FormErrorMessage>{formErrors.identifier}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={Boolean(formErrors.email)}>
            <FormLabel fontSize="sm">Email</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              placeholder="Optional email address"
            />
            <FormErrorMessage>{formErrors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={Boolean(formErrors.password)}>
            <FormLabel fontSize="sm">Password</FormLabel>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              placeholder="8 to 128 characters"
            />
            <FormErrorMessage>{formErrors.password}</FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={Boolean(formErrors.confirmPassword)}
          >
            <FormLabel fontSize="sm">Confirm Password</FormLabel>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateForm("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
            />
            <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
          </FormControl>
        </VStack>
      </AppModal>

      <AppModal
        isOpen={Boolean(roleTarget)}
        onClose={closeRoleChange}
        title="Change Role"
        tone="warning"
        icon={FaUserShield}
        size="md"
        primaryAction={{
          label: "Update Role",
          onClick: submitRoleChange,
          isLoading: roleSaving,
          colorScheme: "teal",
        }}
        secondaryAction={{ label: "Cancel", onClick: closeRoleChange }}
      >
        {roleTarget ? (
          <VStack spacing={4} align="stretch">
            {roleError ? (
              <FormErrorSummary
                error={roleError}
                fieldErrors={roleErrors}
                title="Unable to change role"
              />
            ) : null}

            <Box p={3} bg="gray.50" borderRadius="10px">
              <Text fontSize="sm" fontWeight="700">
                {`${roleTarget.fname || ""} ${roleTarget.lname || ""}`.trim() ||
                  "Unnamed account"}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {roleTarget.mobileNumber} · Current role: {roleTarget.role}
              </Text>
            </Box>

            <FormControl isRequired isInvalid={Boolean(roleErrors.role)}>
              <FormLabel fontSize="sm">New Role</FormLabel>
              <Select
                value={nextRole}
                onChange={(e) => {
                  setNextRole(e.target.value);
                  setRoleErrors((prev) => ({ ...prev, role: "" }));
                  setRoleError("");
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Owner">Owner</option>
              </Select>
              <FormErrorMessage>{roleErrors.role}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(roleErrors.reason)}>
              <FormLabel fontSize="sm">Reason</FormLabel>
              <Textarea
                rows={3}
                value={roleReason}
                onChange={(e) => {
                  setRoleReason(e.target.value);
                  setRoleErrors((prev) => ({ ...prev, reason: "" }));
                  setRoleError("");
                }}
                placeholder="Why is this role changing?"
              />
              <FormErrorMessage>{roleErrors.reason}</FormErrorMessage>
            </FormControl>

            <Text fontSize="xs" color="orange.600" fontWeight="600">
              Changing a role revokes all active sessions for this account.
            </Text>

            {currentUserId && roleTarget._id === currentUserId ? (
              <Text fontSize="xs" color="red.500" fontWeight="700">
                You are changing your own role. You will be signed out.
              </Text>
            ) : null}
          </VStack>
        ) : null}
      </AppModal>
    </Box>
  );
}
