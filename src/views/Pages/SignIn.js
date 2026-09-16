import React, { useState, useEffect } from "react";
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
  keyframes,
} from "@chakra-ui/react";
import { MdAdminPanelSettings, MdLightbulb } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuth, getToken, getUser, clearAuth } from "../utils/axiosInstance";

function AdminLogin() {
  const bgForm = useColorModeValue("white", "gray.800");
  const toast = useToast();
  const navigate = useNavigate();

  // If valid owner token is present, bypass login screen
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    const isOwner = token && user?.role?.toLowerCase() === "owner";
    if (isOwner) {
      navigate("/owner/dashboard", { replace: true });
    } else if (token && !isOwner) {
      clearAuth();
    }
  }, [navigate]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGlow, setIsGlow] = useState(false);

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

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!identifier || !password) {
      toast({
        title: "Missing fields",
        description: "Mobile number/Username and password are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || "https://righttouchservernew-727889857503.asia-south1.run.app"}/api/user/login/owner`,
        {
          identifier: identifier,
          password: password,
          role: "Owner"
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data?.result) {
        throw new Error("Invalid server response");
      }

      const { token, role, id } = res.data.result;

      setAuth(token, {
        identifier: identifier,
        role: role,
        id,
      });

      toast({
        title: "Login Successful",
        description: `Welcome ${role}!`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setTimeout(() => {
        window.location.hash = "/owner/dashboard";
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: err.response?.status === 429 ? "Too Many Attempts" : "Login Failed",
        description: err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message || "Server error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
            <FormControl isRequired>
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
                  <Text fontSize="12px">📱</Text>
                </Box>
                Mobile Number / Identifier
              </FormLabel>
              <Input
                type="text"
                placeholder="Enter Mobile Number or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleLogin(e); }}
                size={{ base: "md", sm: "lg", md: "lg", lg: "lg", xl: "lg" }}
                h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                p="4px"
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                bg="white"
                _hover={{ borderColor: "teal.300" }}
                _focus={{
                  borderColor: "#008080",
                  boxShadow: "0 0 0 3px rgba(0, 128, 128, 0.15)",
                  bg: "white"
                }}
                transition="all 0.3s ease"
              />
            </FormControl>

            <FormControl isRequired>
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
                Password
              </FormLabel>
              <InputGroup size={{ base: "md", sm: "lg", md: "lg", lg: "lg", xl: "lg" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleLogin(e); }}
                  h={{ base: "45px", sm: "48px", md: "50px", lg: "52px", xl: "55px" }}
                  p="4px"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  bg="white"
                  _hover={{ borderColor: "teal.300" }}
                  _focus={{
                    borderColor: "#008080",
                    boxShadow: "0 0 0 3px rgba(0, 128, 128, 0.15)",
                    bg: "white"
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
                boxShadow: "0 12px 30px rgba(255, 215, 0, 0.4)"
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "0 6px 20px rgba(255, 215, 0, 0.3)"
              }}
              _disabled={{
                opacity: 0.7,
                cursor: "not-allowed",
                transform: "none"
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