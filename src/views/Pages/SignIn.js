import React, { useState, useEffect, useRef } from "react";
import { useAppToast } from "components/feedback";
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
  Icon,
  Box,
  VStack,
  HStack,
  Badge,
  keyframes,
} from "@chakra-ui/react";
import { MdAdminPanelSettings, MdLightbulb } from "react-icons/md";
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
  const toast = useAppToast();
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
  const [invalidField, setInvalidField] = useState("");

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

  const focusField = (field) => {
    setInvalidField(field === "mobile" || field === "password" ? field : "");
    if (field !== "mobile" && field !== "password") return;
    setTimeout(() => {
      const target = field === "password" ? passwordInputRef.current : mobileInputRef.current;
      target?.focus();
      target?.select?.();
    }, 100);
  };

  const showErrorToast = ({
    title,
    message,
    type = "error",
    field = "",
  }) => {
    toast({
      title,
      description: message,
      status: type === "warning" ? "warning" : "error",
      duration: 5000,
      isClosable: true,
    });
    focusField(field);
  };

  const handleMobileKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const cleanIdentifier = (identifier || "").toString().trim();
    if (!cleanIdentifier) {
      showErrorToast({
        title: "Mobile Number Required",
        message: "Please enter your registered mobile number to continue.",
        type: "warning",
        field: "mobile",
      });
      return;
    }
    focusField("password");
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setInvalidField("");

    const cleanIdentifier = (identifier || "").toString().trim();

    if (!cleanIdentifier && !password) {
      showErrorToast({
        title: "Required Fields Missing",
        message: "Please enter your registered mobile number and password to sign in.",
        type: "warning",
        field: "mobile",
      });
      return;
    }

    if (!cleanIdentifier) {
      showErrorToast({
        title: "Mobile Number Required",
        message: "Please enter your registered mobile number to proceed.",
        type: "warning",
        field: "mobile",
      });
      return;
    }

    if (!password || !password.trim()) {
      showErrorToast({
        title: "Password Required",
        message: "Please enter your password to sign in.",
        type: "warning",
        field: "password",
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
      let type = "error";
      let field = "password";

      if (code === "NETWORK_ERROR" || status === 0 || (err?.name === "AxiosError" && !err.response)) {
        title = "Server Connection Error";
        message = "Unable to connect to the Right Touch authentication server. Please check your network connection or server status.";
        type = "warning";
        field = "none";
      } else if (status === 429 || code === "TOO_MANY_ATTEMPTS") {
        title = "Too Many Attempts";
        message = rawMessage || "Too many failed login attempts. For security reasons, access is temporarily locked.";
        type = "warning";
        field = "none";
      } else if (status === 404 || code === "USER_NOT_FOUND" || /not found/i.test(rawMessage)) {
        title = "Account Not Found";
        message = rawMessage || "No account found with this mobile number. Please check the number or contact your super administrator.";
        field = "mobile";
      } else if (
        status === 403 ||
        code === "FORBIDDEN" ||
        code === "ROLE_MISMATCH" ||
        /access denied|role|restricted/i.test(rawMessage)
      ) {
        title = "Access Restricted";
        message = rawMessage || "This mobile number is registered under a different role. This dashboard is strictly for Owner and Admin accounts.";
        field = "mobile";
      } else if (code === "ACCOUNT_BLOCKED" || /blocked|suspended/i.test(rawMessage)) {
        title = "Account Suspended";
        message = rawMessage || "Your administrator account has been suspended or blocked by security policy.";
        field = "none";
      } else if (
        status === 401 ||
        code === "INVALID_CREDENTIALS" ||
        /invalid|incorrect|password/i.test(rawMessage)
      ) {
        title = "Incorrect Credentials";
        message = rawMessage || "The mobile number or password you entered is incorrect. Please verify your credentials and try again.";
        field = "password";
      } else if (status >= 500) {
        title = "Authentication Service Error";
        message = rawMessage || "The authentication service encountered an unexpected error. Please try again shortly.";
        field = "none";
      }

      showErrorToast({ title, message, type, field });
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
            <FormControl isRequired isInvalid={invalidField === "mobile"}>
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
                  setInvalidField("");
                }}
                onKeyDown={handleMobileKeyDown}
                size={{ base: "md", sm: "lg", md: "lg", lg: "lg", xl: "lg" }}
                h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                p="14px"
                borderRadius="12px"
                border="2px solid"
                borderColor={invalidField === "mobile" ? "red.400" : "gray.200"}
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
            <FormControl isRequired isInvalid={invalidField === "password"}>
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
                    setInvalidField("");
                  }}
                  h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                  p="14px"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor={invalidField === "password" ? "red.400" : "gray.200"}
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
    </Flex>
  );
}

export default AdminLogin;