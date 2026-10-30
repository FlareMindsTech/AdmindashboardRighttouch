import React, { useState, useEffect, useRef } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
  Icon,
  Box,
  VStack,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  keyframes,
} from "@chakra-ui/react";
import {
  MdAdminPanelSettings,
  MdLightbulb,
  MdErrorOutline,
  MdLockOutline,
  MdWarningAmber,
  MdWifiOff,
  MdPersonOff,
  MdSecurity,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  loginOwner,
  logout,
  selectIsOwner,
  selectIsAuthenticated,
} from "store/slices/authSlice";

function AdminLogin() {
  const bgForm = useColorModeValue("white", "gray.800");
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isMountedRef = useRef(true);

  const mobileInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // If valid owner token is present, bypass login screen
  useEffect(() => {
    if (isOwner) {
      navigate("/owner/dashboard", { replace: true });
    } else if (isAuthenticated && !isOwner) {
      dispatch(logout());
    }
  }, [navigate, isOwner, isAuthenticated, dispatch]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGlow, setIsGlow] = useState(false);

  // Professional Login Failure Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    code: "",
    tips: [],
    type: "error", // "error" | "warning"
    focusField: "password", // "mobile" | "password" | "none"
  });

  // Animations
  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.05); }
  `;

  const shimmerAnimation = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  `;

  const slideIn = keyframes`
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  `;

  const bulbGlow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); opacity: 0.6; }
    50% { filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.9)); opacity: 1; }
  `;

  const glowAnimation = keyframes`
    0% { box-shadow: 0 0 20px rgba(0, 128, 128, 0.2); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.4); }
    100% { box-shadow: 0 0 20px rgba(0, 128, 128, 0.2); }
  `;

  const swing = keyframes`
    0% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
    100% { transform: rotate(-5deg); }
  `;

  const pulseRing = keyframes`
    0% { transform: scale(0.95); opacity: 0.7; }
    50% { transform: scale(1.2); opacity: 0.2; }
    100% { transform: scale(0.95); opacity: 0.7; }
  `;

  const showErrorModal = ({
    title,
    message,
    code = "",
    tips = [],
    type = "error",
    focusField = "password",
  }) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      code,
      tips,
      type,
      focusField,
    });
    // Also trigger toast notification for stack visibility
    toast({
      title,
      description: message,
      status: type === "warning" ? "warning" : "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleCloseModal = () => {
    const focusTarget = errorModal.focusField;
    setErrorModal((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      if (focusTarget === "password") {
        passwordInputRef.current?.focus();
        passwordInputRef.current?.select?.();
      } else if (focusTarget === "mobile") {
        mobileInputRef.current?.focus();
        mobileInputRef.current?.select?.();
      }
    }, 150);
  };

  const handleClearAndRetry = () => {
    if (errorModal.focusField === "password") {
      setPassword("");
      handleCloseModal();
      setTimeout(() => passwordInputRef.current?.focus(), 150);
    } else {
      setIdentifier("");
      setPassword("");
      handleCloseModal();
      setTimeout(() => mobileInputRef.current?.focus(), 150);
    }
  };

  const getModalIcon = (code, type) => {
    if (code === "NETWORK_ERROR" || code === "HTTP_0") return MdWifiOff;
    if (code === "USER_NOT_FOUND" || code === "ROLE_MISMATCH" || code === "FORBIDDEN") return MdPersonOff;
    if (code === "ACCOUNT_BLOCKED" || code === "ACCOUNT_DELETED") return MdSecurity;
    if (code === "INVALID_CREDENTIALS" || code === "PASSWORD_REQUIRED") return MdLockOutline;
    if (type === "warning") return MdWarningAmber;
    return MdErrorOutline;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const cleanIdentifier = (identifier || "").toString().trim();

    if (!cleanIdentifier && !password) {
      showErrorModal({
        title: "Required Fields Missing",
        message: "Please enter your registered mobile number and password to sign in.",
        code: "FIELDS_REQUIRED",
        type: "warning",
        focusField: "mobile",
        tips: [
          "Enter your registered 10-digit mobile number.",
          "Enter your administrator password.",
        ],
      });
      return;
    }

    if (!cleanIdentifier) {
      showErrorModal({
        title: "Mobile Number Required",
        message: "Please enter your registered mobile number to proceed.",
        code: "MOBILE_REQUIRED",
        type: "warning",
        focusField: "mobile",
        tips: [
          "Enter your 10-digit mobile number (e.g. 9876543210).",
          "Ensure your account is registered with Right Touch.",
        ],
      });
      return;
    }

    if (!password || !password.trim()) {
      showErrorModal({
        title: "Password Required",
        message: "Please enter your password to sign in.",
        code: "PASSWORD_REQUIRED",
        type: "warning",
        focusField: "password",
        tips: [
          "Password cannot be left blank.",
          "Check that Caps Lock is not enabled.",
        ],
      });
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        loginOwner({ identifier: cleanIdentifier, password })
      ).unwrap();

      if (!isMountedRef.current) return;

      const role = result?.role || result?.user?.role || "Owner";

      toast({
        title: "Login Successful",
        description: `Welcome back, ${role}!`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setTimeout(() => {
        window.location.hash = "#/owner/dashboard";
        window.location.reload();
      }, 500);

    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Login error:", err);

      const status = Number(err?.status) || 0;
      const code = String(err?.code || "").toUpperCase();
      const rawMessage = (err?.message || err?.detail || "").toString().trim();

      let title = "Login Failed";
      let message = rawMessage || "Invalid mobile number or password.";
      let tips = [
        "Check that Caps Lock is turned off.",
        "Verify your registered 10-digit mobile number.",
        "Contact super administrator if you forgot your credentials.",
      ];
      let type = "error";
      let focusField = "password";

      if (code === "NETWORK_ERROR" || status === 0 || (err?.name === "AxiosError" && !err.response)) {
        title = "Server Connection Error";
        message = "Unable to connect to the Right Touch authentication server. Please check your network connection or server status.";
        tips = [
          "Check your internet or Wi-Fi connectivity.",
          "If connected via VPN or strict firewall, ensure server access is allowed.",
          "The backend server may be restarting; please wait a moment.",
        ];
        type = "warning";
        focusField = "none";
      } else if (status === 429 || code === "TOO_MANY_ATTEMPTS") {
        title = "Too Many Attempts";
        message = rawMessage || "Too many failed login attempts. For security reasons, access is temporarily locked.";
        tips = [
          "Temporary rate limit has been triggered to safeguard your account.",
          "Please wait 15 minutes before submitting your next attempt.",
          "If urgent, reach out to your super administrator.",
        ];
        type = "warning";
        focusField = "none";
      } else if (status === 404 || code === "USER_NOT_FOUND" || /not found/i.test(rawMessage)) {
        title = "Account Not Found";
        message = rawMessage || "No account found with this mobile number. Please check the number or contact your super administrator.";
        tips = [
          "Verify the registered 10-digit mobile number.",
          "Ensure your account has been provisioned as an Owner/Admin.",
          "Contact your super admin to invite or register your mobile number.",
        ];
        focusField = "mobile";
      } else if (
        status === 403 ||
        code === "FORBIDDEN" ||
        code === "ROLE_MISMATCH" ||
        /access denied|role|restricted/i.test(rawMessage)
      ) {
        title = "Access Restricted";
        message = rawMessage || "This mobile number is registered under a different role. This dashboard is strictly for Owner and Admin accounts.";
        tips = [
          "The Admin Portal is restricted to Owner/Admin accounts only.",
          "Customer or technician accounts must use their respective mobile apps.",
          "Contact system administration to request elevated privileges.",
        ];
        focusField = "mobile";
      } else if (code === "ACCOUNT_BLOCKED" || /blocked|suspended/i.test(rawMessage)) {
        title = "Account Suspended";
        message = rawMessage || "Your administrator account has been suspended or blocked by security policy.";
        tips = [
          "Account access has been temporarily restricted.",
          "Please contact technical support or your super admin to restore access.",
        ];
        focusField = "none";
      } else if (
        status === 401 ||
        code === "INVALID_CREDENTIALS" ||
        /invalid|incorrect|password/i.test(rawMessage)
      ) {
        title = "Incorrect Credentials";
        message = rawMessage || "The mobile number or password you entered is incorrect. Please verify your credentials and try again.";
        tips = [
          "Ensure Caps Lock is not turned on.",
          "Double-check for typos in your password.",
          "Verify that your registered 10-digit mobile number is correct.",
        ];
        focusField = "password";
      } else if (status >= 500) {
        title = "Authentication Service Error";
        message = rawMessage || "The authentication service encountered an unexpected error. Please try again shortly.";
        tips = [
          "The backend server is temporarily experiencing issues.",
          "Please wait a few seconds and click Try Again.",
          "If the issue persists, contact technical support.",
        ];
        focusField = "none";
      }

      showErrorModal({
        title,
        message,
        code: code || (status ? `HTTP_${status}` : "AUTH_FAILED"),
        tips,
        type,
        focusField,
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      w="100%"
      h="100vh"
      alignItems="center"
      justifyContent="center"
      bg="radial-gradient(circle at center, #004d4d 0%, #002d2d 100%)"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        w: "100%",
        h: "100%",
        background: `
          radial-gradient(circle at 10% 10%, rgba(255, 215, 0, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(0, 128, 128, 0.1) 0%, transparent 40%)
        `,
        zIndex: 1,
      }}
    >
      {/* Hanging Bulb with Wire */}
      <Box
        position="absolute"
        top="0"
        right="15%"
        zIndex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        transformOrigin="top center"
        animation={`${swing} 4s ease-in-out infinite`}
      >
        <Box
          w="2px"
          h="150px"
          bg="rgba(0, 0, 0, 0.6)"
          boxShadow="0 0 10px rgba(0,0,0,0.5)"
        />
        <Box
          w="24px"
          h="30px"
          bg="gray.700"
          borderRadius="4px"
          mt="-2px"
        />
        <Box
          position="relative"
          mt="-5px"
          transition="all 0.5s ease"
          transform={isGlow ? "scale(1.1) rotate(180deg)" : "scale(1) rotate(180deg)"}
        >
          <Icon
            as={MdLightbulb}
            w="120px"
            h="120px"
            color={isGlow ? "#FFD700" : "rgba(255, 215, 0, 0.3)"}
            filter={isGlow ? "drop-shadow(0 0 50px #FFD700)" : "none"}
            animation={isGlow ? `${bulbGlow} 2s infinite ease-in-out` : "none"}
          />
          {isGlow && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="400px"
              h="400px"
              bg="radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)"
              borderRadius="50%"
              pointerEvents="none"
              zIndex="-1"
            />
          )}
        </Box>
      </Box>

      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="15%"
        left="5%"
        w={{ base: "30px", sm: "40px", md: "50px", lg: "60px", xl: "70px" }}
        h={{ base: "30px", sm: "40px", md: "50px", lg: "60px", xl: "70px" }}
        bg="rgba(255,255,255,0.15)"
        borderRadius="20%"
        animation={`${floatAnimation} 4s ease-in-out infinite`}
        zIndex="1"
      />

      <Box
        position="absolute"
        bottom="25%"
        right="8%"
        w={{ base: "25px", sm: "35px", md: "45px", lg: "55px", xl: "65px" }}
        h={{ base: "25px", sm: "35px", md: "45px", lg: "55px", xl: "65px" }}
        bg="rgba(255,255,255,0.1)"
        borderRadius="30%"
        animation={`${floatAnimation} 5s ease-in-out infinite 0.5s`}
        zIndex="1"
      />

      <Box
        position="absolute"
        top="60%"
        left="85%"
        w={{ base: "20px", sm: "30px", md: "40px", lg: "50px", xl: "60px" }}
        h={{ base: "20px", sm: "30px", md: "40px", lg: "50px", xl: "60px" }}
        bg="rgba(255,255,255,0.12)"
        borderRadius="25%"
        animation={`${floatAnimation} 6s ease-in-out infinite 1s`}
        zIndex="1"
      />

      {/* Main Login Container */}
      <Flex
        direction="column"
        w={{ base: "90%", sm: "85%", md: "75%", lg: "65%", xl: "55%" }}
        maxW={{ base: "400px", sm: "450px", md: "500px", lg: "550px", xl: "500px" }}
        bg={bgForm}
        borderRadius={{ base: "20px", sm: "25px", md: "30px", lg: "35px", xl: "40px" }}
        boxShadow={isGlow ? "0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)" : "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 128, 128, 0.3)"}
        overflow="hidden"
        zIndex="2"
        animation={isGlow ? `${glowAnimation} 3s infinite ease-in-out` : `${slideIn} 0.6s ease-out`}
        onClick={() => setIsGlow(true)}
        onFocusCapture={() => setIsGlow(true)}
        border="1px solid"
        borderColor={isGlow ? "#FFD700" : "#008080"}
        transition="all 0.5s ease"
      >
        {/* Header Section */}
        <Flex
          bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
          color="white"
          p={{ base: "25px", sm: "30px", md: "35px", lg: "40px", xl: "45px" }}
          h="200px"
          direction="column"
          align="center"
          justifyContent="center"
          textAlign="center"
          position="relative"
          overflow="hidden"
          borderBottom="4px solid"
          borderBottomColor="#FFD700"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            w: "100%",
            h: "100%",
            background: "linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%)",
            animation: `${shimmerAnimation} 3s infinite linear`,
          }}
        >
          <Box
            w={{ base: "60px", sm: "70px", md: "80px", lg: "90px", xl: "80px" }}
            h={{ base: "60px", sm: "70px", md: "80px", lg: "90px", xl: "80px" }}
            bg="rgba(0, 128, 128, 0.4)"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 25px rgba(0,0,0,0.2)"
            border="2px solid"
            borderColor="#FFD700"
          >
            <Icon as={MdAdminPanelSettings} h="50px" w="50px" color="#FFD700" />
          </Box>

          <Text
            fontSize={{ base: "22px", sm: "24px", md: "26px", lg: "28px", xl: "30px" }}
            fontWeight="bold"
            mt={3}
          >
            Right Touch Admin
          </Text>
        </Flex>

        {/* Form Section */}
        <Flex
          as="form"
          onSubmit={handleLogin}
          direction="column"
          justify="center"
          p={{ base: "25px", sm: "30px", md: "35px", lg: "40px", xl: "45px" }}
        >
          <VStack spacing={{ base: "20px", sm: "22px", md: "25px", lg: "28px", xl: "30px" }} align="stretch">
            {/* Mobile / Identifier Field */}
            <FormControl
              isRequired
              isInvalid={Boolean(
                errorModal.isOpen &&
                  (errorModal.focusField === "mobile" || errorModal.code === "FIELDS_REQUIRED")
              )}
            >
              <FormLabel
                fontSize={{ base: "14px", sm: "15px", md: "16px", lg: "16px", xl: "17px" }}
                fontWeight="600"
                color="gray.700"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack spacing="8px">
                  <Box
                    w="20px"
                    h="20px"
                    bg="teal.50"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="12px">📱</Text>
                  </Box>
                  <Text>Mobile Number / Identifier</Text>
                </HStack>
                <Badge
                  colorScheme="teal"
                  variant="subtle"
                  fontSize="11px"
                  borderRadius="6px"
                  px="8px"
                  py="1px"
                  textTransform="none"
                  fontWeight="600"
                >
                  Admin / Owner
                </Badge>
              </FormLabel>
              <Input
                ref={mobileInputRef}
                type="text"
                placeholder="Enter Registered 10-Digit Mobile Number"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorModal.isOpen) setErrorModal((prev) => ({ ...prev, isOpen: false }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin(e);
                }}
                size={{ base: "md", sm: "lg", md: "lg", lg: "lg", xl: "lg" }}
                h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                p="14px"
                borderRadius="12px"
                border="2px solid"
                borderColor={
                  errorModal.isOpen &&
                  (errorModal.focusField === "mobile" || errorModal.code === "FIELDS_REQUIRED")
                    ? "red.400"
                    : "gray.200"
                }
                bg="white"
                _hover={{ borderColor: "teal.300" }}
                _focus={{
                  borderColor: "#008080",
                  boxShadow: "0 0 0 3px rgba(0, 128, 128, 0.15)",
                  bg: "white",
                }}
                transition="all 0.3s ease"
              />
            </FormControl>

            {/* Password Field */}
            <FormControl
              isRequired
              isInvalid={Boolean(
                errorModal.isOpen &&
                  (errorModal.focusField === "password" || errorModal.code === "FIELDS_REQUIRED")
              )}
            >
              <FormLabel
                fontSize={{ base: "14px", sm: "15px", md: "16px", lg: "16px", xl: "17px" }}
                fontWeight="600"
                color="gray.700"
                display="flex"
                alignItems="center"
                gap="8px"
              >
                <Box
                  w="20px"
                  h="20px"
                  bg="teal.50"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="12px">🔒</Text>
                </Box>
                <Text>Password</Text>
              </FormLabel>
              <InputGroup size={{ base: "md", sm: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                <Input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorModal.isOpen) setErrorModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin(e);
                  }}
                  h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                  p="14px"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor={
                    errorModal.isOpen &&
                    (errorModal.focusField === "password" || errorModal.code === "FIELDS_REQUIRED")
                      ? "red.400"
                      : "gray.200"
                  }
                  bg="white"
                  _hover={{ borderColor: "teal.300" }}
                  _focus={{
                    borderColor: "#008080",
                    boxShadow: "0 0 0 3px rgba(0, 128, 128, 0.15)",
                    bg: "white",
                  }}
                  transition="all 0.3s ease"
                />
                <InputRightElement
                  h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                  w={{ base: "55px", sm: "60px", md: "60px", lg: "65px", xl: "65px" }}
                >
                  <Button
                    type="button"
                    h={{ base: "32px", sm: "34px", md: "36px", lg: "38px", xl: "40px" }}
                    w={{ base: "32px", sm: "34px", md: "36px", lg: "38px", xl: "40px" }}
                    bg="gray.100"
                    _hover={{ bg: "gray.200" }}
                    onClick={() => setShowPassword(!showPassword)}
                    borderRadius="10px"
                    transition="all 0.3s ease"
                  >
                    {showPassword ? <ViewIcon color="teal.500" /> : <ViewOffIcon color="teal.500" />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              w="100%"
              h={{ base: "48px", sm: "50px", md: "52px", lg: "55px", xl: "58px" }}
              borderRadius="14px"
              bg="linear-gradient(135deg, #FFD700 0%, #F5B700 100%)"
              color="#004d4d"
              onClick={handleLogin}
              isLoading={loading}
              loadingText="Authenticating..."
              fontSize={{ base: "16px", sm: "17px", md: "18px", lg: "18px", xl: "19px" }}
              fontWeight="bold"
              _hover={{
                bg: "linear-gradient(135deg, #F5B700 0%, #FFD700 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 30px rgba(255, 215, 0, 0.4)",
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "0 6px 20px rgba(255, 215, 0, 0.3)",
              }}
              _disabled={{
                opacity: 0.7,
                cursor: "not-allowed",
                transform: "none",
              }}
              transition="all 0.3s ease"
              boxShadow="0 8px 25px rgba(255, 215, 0, 0.25)"
            >
              {loading ? "🔐 Authenticating..." : "🚀 Sign In to Dashboard"}
            </Button>

            {/* Security Footer */}
            <HStack
              justify="center"
              spacing="8px"
              mt={{ base: "10px", sm: "12px", md: "15px", lg: "18px", xl: "20px" }}
            >
              <Box
                w="12px"
                h="12px"
                bg="teal.400"
                borderRadius="50%"
                animation={`${floatAnimation} 2s ease-in-out infinite`}
              />
              <Text
                fontSize={{ base: "12px", sm: "13px", md: "14px", lg: "14px", xl: "14px" }}
                color="teal.600"
                fontWeight="600"
              >
                Secure • Encrypted • Protected
              </Text>
            </HStack>
          </VStack>
        </Flex>
      </Flex>

      {/* Professional Login Failure Pop-up Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={handleCloseModal}
        isCentered
        motionPreset="scale"
        size="md"
        closeOnOverlayClick={true}
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
        <ModalContent
          containerProps={{ zIndex: 1401 }}
          borderRadius="24px"
          overflow="hidden"
          boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 35px rgba(239, 68, 68, 0.25)"
          border="1.5px solid"
          borderColor={errorModal.type === "warning" ? "orange.300" : "red.300"}
          bg="white"
          mx={{ base: 4, sm: "auto" }}
        >
          {/* Top Decorative Gradient Accent */}
          <Box
            h="6px"
            w="100%"
            bg={
              errorModal.type === "warning"
                ? "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)"
                : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)"
            }
          />

          <ModalCloseButton
            top="14px"
            right="14px"
            borderRadius="full"
            _hover={{ bg: "gray.100" }}
          />

          <ModalBody pt="28px" pb="20px" px={{ base: "20px", sm: "28px" }}>
            <VStack spacing={4} align="center" textAlign="center">
              {/* Pulsing Icon Badge */}
              <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                <Box
                  position="absolute"
                  w="84px"
                  h="84px"
                  borderRadius="full"
                  bg={errorModal.type === "warning" ? "orange.100" : "red.100"}
                  opacity={0.6}
                  animation={`${pulseRing} 2s infinite`}
                />
                <Box
                  w="70px"
                  h="70px"
                  borderRadius="full"
                  bg={errorModal.type === "warning" ? "orange.50" : "red.50"}
                  border="2px solid"
                  borderColor={errorModal.type === "warning" ? "orange.300" : "red.300"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 8px 24px rgba(239, 68, 68, 0.15)"
                  zIndex={2}
                >
                  <Icon
                    as={getModalIcon(errorModal.code, errorModal.type)}
                    w="36px"
                    h="36px"
                    color={errorModal.type === "warning" ? "orange.500" : "red.500"}
                  />
                </Box>
              </Box>

              {/* Title & Badge */}
              <VStack spacing={2}>
                <Text
                  fontSize={{ base: "20px", sm: "22px" }}
                  fontWeight="800"
                  color="gray.800"
                  letterSpacing="-0.3px"
                  lineHeight="1.2"
                >
                  {errorModal.title || "Login Failed"}
                </Text>
                <HStack spacing={2} justify="center">
                  <Badge
                    colorScheme={errorModal.type === "warning" ? "orange" : "red"}
                    variant="subtle"
                    fontSize="11px"
                    px="10px"
                    py="2px"
                    borderRadius="6px"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontWeight="700"
                  >
                    {errorModal.code ? errorModal.code.replace(/_/g, " ") : "AUTHENTICATION FAILED"}
                  </Badge>
                </HStack>
              </VStack>

              {/* Error Message */}
              <Text
                fontSize={{ base: "14px", sm: "15px" }}
                color="gray.600"
                lineHeight="1.6"
              >
                {errorModal.message}
              </Text>

              {/* Helpful Tips Card */}
              {errorModal.tips && errorModal.tips.length > 0 && (
                <Box
                  w="100%"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="14px"
                  p="14px 16px"
                  textAlign="left"
                >
                  <HStack spacing="6px" mb="8px">
                    <Text fontSize="13px">💡</Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color="gray.700"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                    >
                      Troubleshooting Tips:
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing="6px">
                    {errorModal.tips.map((tip, idx) => (
                      <HStack key={idx} align="flex-start" spacing="8px">
                        <Box
                          w="5px"
                          h="5px"
                          borderRadius="full"
                          bg={errorModal.type === "warning" ? "orange.400" : "red.400"}
                          mt="7px"
                          flexShrink={0}
                        />
                        <Text fontSize="13px" color="gray.600" lineHeight="1.4">
                          {tip}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.100"
            px={{ base: "20px", sm: "28px" }}
            py="16px"
            display="flex"
            flexDirection="column"
            gap="10px"
          >
            <HStack w="100%" spacing="12px">
              <Button
                variant="outline"
                colorScheme="gray"
                h="44px"
                borderRadius="12px"
                flex="1"
                fontSize="14px"
                fontWeight="600"
                onClick={handleClearAndRetry}
              >
                {errorModal.focusField === "password" ? "Clear Password" : "Clear Form"}
              </Button>

              <Button
                bg="linear-gradient(135deg, #008080 0%, #006666 100%)"
                color="white"
                h="44px"
                borderRadius="12px"
                flex="1.3"
                fontSize="14px"
                fontWeight="bold"
                _hover={{
                  bg: "linear-gradient(135deg, #006666 0%, #004d4d 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 18px rgba(0, 128, 128, 0.35)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
                onClick={handleCloseModal}
              >
                Try Again
              </Button>
            </HStack>

            <Text fontSize="12px" color="gray.500" textAlign="center" mt="2px">
              Need assistance? Contact{" "}
              <Text as="span" color="teal.600" fontWeight="600">
                support@righttouch.com
              </Text>
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default AdminLogin;