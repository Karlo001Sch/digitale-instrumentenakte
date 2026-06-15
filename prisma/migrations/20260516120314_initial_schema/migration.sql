-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('WOODWIND_WORKSHOP', 'BRASS_WORKSHOP', 'MUSIC_SCHOOL', 'MUSIC_STORE', 'ORCHESTRA', 'CLUB', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "InstrumentStatus" AS ENUM ('AVAILABLE', 'RENTED', 'IN_REPAIR', 'AWAY_OR_MISSING', 'OVERHAUL_EXTERNAL', 'RESERVED', 'SOLD', 'RETIRED');

-- CreateEnum
CREATE TYPE "InstrumentFamily" AS ENUM ('WOODWIND', 'BRASS', 'STRING', 'PERCUSSION', 'KEYBOARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ConditionReportType" AS ENUM ('INITIAL', 'INSPECTION', 'RETURN', 'REPAIR_CHECK', 'OVERHAUL', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'DIRECT_DEBIT', 'CARD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RentalContractStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('OPEN', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PURCHASE_INVOICE', 'RENTAL_CONTRACT', 'HANDOVER_PROTOCOL', 'RETURN_PROTOCOL', 'REPAIR_REPORT', 'VALUATION', 'INSURANCE', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('GENERAL', 'DAMAGE', 'SERIAL_NUMBER', 'ACCESSORY', 'BEFORE_REPAIR', 'AFTER_REPAIR', 'CONDITION_REPORT');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'CONDITION', 'RENTAL', 'REPAIR', 'CUSTOMER', 'INTERNAL');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'WOODWIND_WORKSHOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentCategory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" "InstrumentFamily" NOT NULL DEFAULT 'WOODWIND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentBrand" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "internalId" TEXT NOT NULL,
    "label" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "groupCode" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "currentValue" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultMonthlyRent" DECIMAL(10,2),
    "defaultDeposit" DECIMAL(10,2),
    "conditionRating" INTEGER,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "generalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "street" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "customerType" TEXT,
    "iban" TEXT,
    "directDebitMandateExists" BOOLEAN NOT NULL DEFAULT false,
    "directDebitMandateDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalContract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2),
    "depositReceivedAt" TIMESTAMP(3),
    "depositReturnedAt" TIMESTAMP(3),
    "depositNotes" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'UNKNOWN',
    "paymentReference" TEXT NOT NULL,
    "firstMonthCash" BOOLEAN NOT NULL DEFAULT false,
    "status" "RentalContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rentalContractId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'OPEN',
    "paidAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "bankReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentStatusHistory" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "oldStatus" "InstrumentStatus",
    "newStatus" "InstrumentStatus" NOT NULL,
    "reason" TEXT,
    "changedByUserId" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentConditionReport" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "reportType" "ConditionReportType" NOT NULL DEFAULT 'INSPECTION',
    "conditionRating" INTEGER,
    "playable" BOOLEAN,
    "rentable" BOOLEAN,
    "summary" TEXT,
    "defects" TEXT,
    "recommendedAction" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentConditionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentPhoto" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT,
    "caption" TEXT,
    "photoType" "PhotoType" NOT NULL DEFAULT 'GENERAL',
    "uploadedByUserId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentDocument" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "rentalContractId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT,
    "title" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "uploadedByUserId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentAccessory" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "condition" TEXT,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentRepairEvent" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "repairDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "costEstimate" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentRepairEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "instrumentId" TEXT,
    "customerId" TEXT,
    "noteType" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "content" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "InstrumentCategory_organizationId_idx" ON "InstrumentCategory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentCategory_organizationId_name_key" ON "InstrumentCategory"("organizationId", "name");

-- CreateIndex
CREATE INDEX "InstrumentBrand_organizationId_idx" ON "InstrumentBrand"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentBrand_organizationId_name_key" ON "InstrumentBrand"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Instrument_organizationId_idx" ON "Instrument"("organizationId");

-- CreateIndex
CREATE INDEX "Instrument_status_idx" ON "Instrument"("status");

-- CreateIndex
CREATE INDEX "Instrument_groupCode_idx" ON "Instrument"("groupCode");

-- CreateIndex
CREATE INDEX "Instrument_serialNumber_idx" ON "Instrument"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_organizationId_internalId_key" ON "Instrument"("organizationId", "internalId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");

-- CreateIndex
CREATE INDEX "Customer_lastName_idx" ON "Customer"("lastName");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "RentalContract_organizationId_idx" ON "RentalContract"("organizationId");

-- CreateIndex
CREATE INDEX "RentalContract_customerId_idx" ON "RentalContract"("customerId");

-- CreateIndex
CREATE INDEX "RentalContract_instrumentId_idx" ON "RentalContract"("instrumentId");

-- CreateIndex
CREATE INDEX "RentalContract_status_idx" ON "RentalContract"("status");

-- CreateIndex
CREATE INDEX "RentalContract_paymentReference_idx" ON "RentalContract"("paymentReference");

-- CreateIndex
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_rentalContractId_idx" ON "Payment"("rentalContractId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Payment_instrumentId_idx" ON "Payment"("instrumentId");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE INDEX "InstrumentStatusHistory_instrumentId_idx" ON "InstrumentStatusHistory"("instrumentId");

-- CreateIndex
CREATE INDEX "InstrumentStatusHistory_changedAt_idx" ON "InstrumentStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "InstrumentConditionReport_instrumentId_idx" ON "InstrumentConditionReport"("instrumentId");

-- CreateIndex
CREATE INDEX "InstrumentConditionReport_createdAt_idx" ON "InstrumentConditionReport"("createdAt");

-- CreateIndex
CREATE INDEX "InstrumentPhoto_instrumentId_idx" ON "InstrumentPhoto"("instrumentId");

-- CreateIndex
CREATE INDEX "InstrumentDocument_instrumentId_idx" ON "InstrumentDocument"("instrumentId");

-- CreateIndex
CREATE INDEX "InstrumentDocument_rentalContractId_idx" ON "InstrumentDocument"("rentalContractId");

-- CreateIndex
CREATE INDEX "InstrumentAccessory_instrumentId_idx" ON "InstrumentAccessory"("instrumentId");

-- CreateIndex
CREATE INDEX "InstrumentRepairEvent_instrumentId_idx" ON "InstrumentRepairEvent"("instrumentId");

-- CreateIndex
CREATE INDEX "Note_organizationId_idx" ON "Note"("organizationId");

-- CreateIndex
CREATE INDEX "Note_instrumentId_idx" ON "Note"("instrumentId");

-- CreateIndex
CREATE INDEX "Note_customerId_idx" ON "Note"("customerId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategory" ADD CONSTRAINT "InstrumentCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentBrand" ADD CONSTRAINT "InstrumentBrand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InstrumentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "InstrumentBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalContract" ADD CONSTRAINT "RentalContract_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalContractId_fkey" FOREIGN KEY ("rentalContractId") REFERENCES "RentalContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentStatusHistory" ADD CONSTRAINT "InstrumentStatusHistory_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentConditionReport" ADD CONSTRAINT "InstrumentConditionReport_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentPhoto" ADD CONSTRAINT "InstrumentPhoto_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentDocument" ADD CONSTRAINT "InstrumentDocument_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentDocument" ADD CONSTRAINT "InstrumentDocument_rentalContractId_fkey" FOREIGN KEY ("rentalContractId") REFERENCES "RentalContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentAccessory" ADD CONSTRAINT "InstrumentAccessory_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentRepairEvent" ADD CONSTRAINT "InstrumentRepairEvent_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
