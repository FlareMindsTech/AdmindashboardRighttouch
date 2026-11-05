import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import AppModal from "components/common/AppModal";
import {
  createQuotation,
  reviseQuotation,
  sendQuotation,
  updateQuotation,
} from "api/quotations";
import {
  formatINR,
  getCustomer,
  getProduct,
  getQuotationTotalPaise,
  getRequestNumber,
  toPaise,
  unwrapResult,
} from "./productFlowUtils";

const DEFAULT_TERMS =
  "Quotation includes standard warranty and installation support.\nValid for 7 days from the date of issuance.";

const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const defaultValidUntil = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const getInitialState = ({ request, quotation }) => {
  const snapshot = quotation?.financialSnapshot || {};
  const product = request?.productId && typeof request.productId === "object" ? request.productId : {};
  const quotationItem = quotation?.items?.[0] || {};
  const fallbackPrice =
    snapshot.unitPricePaise != null
      ? snapshot.unitPricePaise / 100
      : quotationItem.unitPrice != null
        ? quotationItem.unitPrice
        : product.price ?? product.estimatedPriceFrom ?? 0;

  return {
    unitPrice: String(fallbackPrice || ""),
    installation: String(
      snapshot.installationAmountPaise != null
        ? snapshot.installationAmountPaise / 100
        : ""
    ),
    additionalCharges: String(
      snapshot.additionalChargesPaise != null
        ? snapshot.additionalChargesPaise / 100
        : ""
    ),
    discount: String(
      snapshot.discountPaise != null ? snapshot.discountPaise / 100 : ""
    ),
    gstPercent: String(
      snapshot.gstPercent != null ? snapshot.gstPercent : 5
    ),
    validFrom: dateInputValue(quotation?.validFrom) || dateInputValue(new Date()),
    validUntil:
      dateInputValue(quotation?.validUntil) ||
      dateInputValue(request?.validUntil) ||
      defaultValidUntil(),
    termsAndConditions:
      quotation?.termsAndConditions || DEFAULT_TERMS,
    adminNotes: quotation?.adminNotes || quotation?.notes || "",
  };
};

export default function QuotationEditorModal({
  isOpen,
  onClose,
  mode = "create",
  request = null,
  quotation = null,
  onSaved,
}) {
  const toast = useToast();
  const [form, setForm] = useState(() => getInitialState({ request, quotation }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(getInitialState({ request, quotation }));
  }, [isOpen, request, quotation]);

  const requestId =
    quotation?.quoteRequestId?._id ||
    quotation?.quoteRequestId ||
    request?._id ||
    request?.id ||
    "";
  const quantity = Number(quotation?.quantity || request?.quantity || 1);
  const customer = getCustomer(quotation || request || {});
  const product = getProduct(quotation || request || {});

  const preview = useMemo(() => {
    const unit = toPaise(form.unitPrice);
    const installation = toPaise(form.installation);
    const additional = toPaise(form.additionalCharges);
    const discount = toPaise(form.discount);
    const taxable = Math.max(0, unit * quantity + installation + additional - discount);
    const gst = Math.round((taxable * Number(form.gstPercent || 0)) / 100);
    return { taxable, gst, total: taxable + gst };
  }, [form, quantity]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (sendNow) => {
    if (!requestId) {
      toast({
        title: "Quote request required",
        description: "Open a quote request and prepare the quotation from there.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }
    if (preview.total <= 0) {
      toast({
        title: "Invalid quotation total",
        description: "Unit price must produce a total greater than zero.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    const payload = {
      quoteRequestId: requestId,
      unitPricePaise: toPaise(form.unitPrice),
      quantity,
      installationAmountPaise: toPaise(form.installation),
      additionalChargesPaise: toPaise(form.additionalCharges),
      discountPaise: toPaise(form.discount),
      gstPercent: Number(form.gstPercent || 0),
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || undefined,
      termsAndConditions: form.termsAndConditions?.trim() || undefined,
      adminNotes: form.adminNotes?.trim() || undefined,
    };

    setSaving(true);
    let response;
    if (mode === "edit" && quotation?._id) {
      response = await updateQuotation(quotation._id, payload);
    } else if (mode === "revise" && quotation?._id) {
      response = await reviseQuotation(quotation._id, payload);
    } else {
      response = await createQuotation(payload);
    }

    if (response.error) {
      setSaving(false);
      toast({
        title: "Quotation not saved",
        description: response.error,
        status: "error",
        duration: 4500,
        isClosable: true,
      });
      return;
    }

    const saved = unwrapResult(response.data);
    const savedId = saved?._id || saved?.id || quotation?._id;

    if (sendNow) {
      if (!savedId) {
        setSaving(false);
        toast({
          title: "Quotation saved",
          description: "The quotation was saved but its id was missing, so it was not sent.",
          status: "warning",
          duration: 4500,
          isClosable: true,
        });
        onSaved?.();
        onClose();
        return;
      }
      const sendResponse = await sendQuotation(savedId);
      if (sendResponse.error) {
        setSaving(false);
        toast({
          title: "Quotation saved, send failed",
          description: sendResponse.error,
          status: "warning",
          duration: 4500,
          isClosable: true,
        });
        onSaved?.();
        onClose();
        return;
      }
    }

    setSaving(false);
    toast({
      title: sendNow ? "Quotation sent" : "Quotation saved",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onSaved?.();
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "revise" ? "Revise quotation" : mode === "edit" ? "Edit draft quotation" : "Prepare quotation"}
      subtitle={request ? getRequestNumber(request) : quotation ? `Revision ${quotation.revision || 1}` : ""}
      size="xl"
      footer={
        <HStack spacing={2} justify="flex-end">
          <Button size="sm" variant="ghost" onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button size="sm" variant="outline" colorScheme="teal" onClick={() => handleSubmit(false)} isLoading={saving}>
            Save draft
          </Button>
          <Button size="sm" colorScheme="teal" onClick={() => handleSubmit(true)} isLoading={saving}>
            Save & send
          </Button>
        </HStack>
      }
    >
      <VStack align="stretch" spacing={3}>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
          <FormControl>
            <FormLabel fontSize="sm">Customer</FormLabel>
            <Input value={customer.name} isReadOnly bg="gray.50" />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Product</FormLabel>
            <Input value={product.name} isReadOnly bg="gray.50" />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Quantity</FormLabel>
            <Input value={quantity} isReadOnly bg="gray.50" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Unit price</FormLabel>
            <InputGroup>
              <InputLeftAddon>₹</InputLeftAddon>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setField("unitPrice", e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Installation</FormLabel>
            <InputGroup>
              <InputLeftAddon>₹</InputLeftAddon>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.installation}
                onChange={(e) => setField("installation", e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Additional charges</FormLabel>
            <InputGroup>
              <InputLeftAddon>₹</InputLeftAddon>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.additionalCharges}
                onChange={(e) => setField("additionalCharges", e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Discount</FormLabel>
            <InputGroup>
              <InputLeftAddon>₹</InputLeftAddon>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.discount}
                onChange={(e) => setField("discount", e.target.value)}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">GST %</FormLabel>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.gstPercent}
              onChange={(e) => setField("gstPercent", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Valid from</FormLabel>
            <Input
              type="date"
              value={form.validFrom}
              onChange={(e) => setField("validFrom", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Valid until</FormLabel>
            <Input
              type="date"
              value={form.validUntil}
              onChange={(e) => setField("validUntil", e.target.value)}
            />
          </FormControl>
        </Grid>

        <Divider />
        <VStack align="stretch" spacing={1}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Taxable amount</Text>
            <Text fontSize="sm" fontWeight="700">{formatINR(preview.taxable, { fromPaise: true })}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">GST</Text>
            <Text fontSize="sm" fontWeight="700">{formatINR(preview.gst, { fromPaise: true })}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="md" fontWeight="800">Total</Text>
            <Text fontSize="md" fontWeight="800" color="teal.700">{formatINR(preview.total, { fromPaise: true })}</Text>
          </HStack>
          {quotation ? (
            <Text fontSize="xs" color="gray.500">
              Previous total: {formatINR(getQuotationTotalPaise(quotation), { fromPaise: true })}
            </Text>
          ) : null}
        </VStack>

        <FormControl>
          <FormLabel fontSize="sm">Terms & conditions</FormLabel>
          <Textarea
            rows={4}
            value={form.termsAndConditions}
            onChange={(e) => setField("termsAndConditions", e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Admin notes</FormLabel>
          <Textarea
            rows={2}
            value={form.adminNotes}
            onChange={(e) => setField("adminNotes", e.target.value)}
            placeholder="Optional note shown to the customer"
          />
        </FormControl>
      </VStack>
    </AppModal>
  );
}
