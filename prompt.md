# BUILD A PROFESSIONAL ELECTRICAL CONTRACTING BUSINESS MANAGEMENT WEB APPLICATION

## 1. PROJECT OVERVIEW

I want to build a professional web-based Electrical Engineering & Contracting Business Management System for my electrical contracting company in Nepal.

This is NOT just a company website.

It should be a complete internal business management platform that helps an electrical contractor manage:

1. BOQ
2. Quotations
3. Invoices
4. Electrical drawings
5. Material database
6. Supplier database
7. Labour rate database
8. Project costing
9. Method statements
10. Testing & commissioning
11. Projects
12. Clients
13. Employees/workers
14. Payments
15. Expenses
16. Reports
17. Company documents

The system must be professional enough to eventually be used by a real electrical contracting company.

The application should be modular, scalable, responsive, secure and easy to maintain.

Target country: Nepal

Currency: NPR (Rs.)

Primary language: English

Architecture must allow Nepali language support in the future.

---

# 2. RECOMMENDED TECHNOLOGY STACK

Use a modern production-ready stack.

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide icons

Backend:

* Next.js API routes / server actions
* TypeScript

Database:

* PostgreSQL
* Prisma ORM

Authentication:

* Secure email/password authentication
* Role-based access control

File storage:

* Local development storage initially
* Design the system so it can later use S3-compatible storage

PDF:

* Professional PDF generation for:

  * Quotations
  * Invoices
  * BOQ
  * Method Statements
  * Testing Reports
  * Project Reports

Excel:

* Import/export Excel files
* BOQ export
* Material export
* Supplier export
* Labour rate export
* Costing export

Charts:

* Use a suitable React chart library.

Development environment:

* VS Code / Cursor
* npm
* .env for secrets

The application should run locally with:

npm install
npm run dev

---

# 3. IMPORTANT DEVELOPMENT RULE

DO NOT build everything as one giant component.

Use a clean modular architecture.

Create reusable components such as:

* DataTable
* SearchBar
* FilterBar
* Modal
* Drawer
* Form
* CurrencyInput
* NumberInput
* FileUpload
* PDFExportButton
* ExcelExportButton
* StatusBadge
* ConfirmDialog
* ProjectSelector
* ClientSelector
* MaterialSelector
* SupplierSelector
* LabourSelector

Use reusable services and utilities.

Keep business logic separate from UI.

Use strong TypeScript types.

Avoid unnecessary duplication.

---

# 4. MAIN APPLICATION STRUCTURE

Create the following application sections:

/dashboard

/projects

/clients

/boq

/quotations

/invoices

/materials

/suppliers

/labour

/costing

/drawings

/method-statements

/testing-commissioning

/expenses

/payments

/reports

/documents

/settings

/users

---

# 5. DASHBOARD

Create a professional contractor dashboard.

Show:

* Total active projects
* Completed projects
* Pending quotations
* Accepted quotations
* Outstanding invoices
* Total receivables
* Total project cost
* Estimated profit
* Actual profit
* Monthly revenue
* Monthly expenses
* Cash flow
* Material purchases
* Labour cost

Charts:

* Revenue vs expenses
* Estimated vs actual project cost
* Project status
* Monthly profit
* Outstanding invoices

Use cards and charts with a clean professional engineering/ERP style.

---

# 6. COMPANY PROFILE

Create company settings.

Fields:

* Company name
* Logo
* Registration number
* PAN
* VAT number
* Address
* District
* Province
* Phone
* Email
* Website
* Bank name
* Bank account number
* Branch
* Authorized person
* Signature

These details must automatically appear in generated:

* quotations
* invoices
* BOQ
* reports
* method statements
* testing reports

Allow company logo upload.

---

# 7. CLIENT MANAGEMENT

Create Client CRUD.

Fields:

* Client name
* Company
* Contact person
* Phone
* Email
* Address
* PAN/VAT
* Client type
* Notes

Client types:

* Residential
* Commercial
* Industrial
* Hospital
* Hotel
* School
* Government
* Contractor
* Developer

Client profile should show:

* Projects
* Quotations
* Invoices
* Payments
* Outstanding balance

---

# 8. PROJECT MANAGEMENT

Create Project CRUD.

Project fields:

* Project name
* Project code
* Client
* Location
* Project type
* Start date
* Expected completion date
* Actual completion date
* Contract value
* Estimated cost
* Actual cost
* Estimated profit
* Actual profit
* Project manager
* Status
* Notes

Project status:

* Planning
* Quotation
* Awarded
* In Progress
* On Hold
* Completed
* Cancelled

Inside each project create tabs:

Overview
BOQ
Quotation
Materials
Labour
Expenses
Drawings
Method Statements
Testing
Invoices
Payments
Documents
Reports

---

# 9. BOQ MODULE

Create a professional BOQ management system.

BOQ columns:

* Item No.
* Description
* Specification
* Category
* Unit
* Quantity
* Material Unit Rate
* Material Total
* Labour Unit Rate
* Labour Total
* Equipment Rate
* Equipment Total
* Total Unit Rate
* Total Amount
* Remarks

Categories:

* Lighting
* Power
* Distribution Board
* MDB
* SMDB
* MCC
* Cable
* Cable Tray
* Cable Ladder
* Conduit
* Earthing
* Lightning Protection
* Generator
* ATS
* AMF
* UPS
* Transformer
* Capacitor Bank
* Motor
* Fire Alarm
* CCTV
* Data
* Access Control
* BMS
* KNX
* DALI
* Solar
* Miscellaneous

Calculations:

Material Total =
Quantity × Material Unit Rate

Labour Total =
Quantity × Labour Unit Rate

Equipment Total =
Quantity × Equipment Rate

Total =
Material + Labour + Equipment

Add:

* overhead percentage
* contingency percentage
* profit percentage
* discount
* VAT

Generate professional BOQ PDF.

Export to Excel.

Import BOQ from Excel.

---

# 10. QUOTATION MODULE

Create quotation generation from BOQ.

Quotation fields:

* Quotation number
* Date
* Valid until
* Client
* Project
* Scope of work
* Payment terms
* Delivery terms
* Warranty
* Exclusions
* Inclusions
* Notes

Quotation table:

Item
Description
Specification
Qty
Unit
Rate
Amount

Automatically calculate:

Subtotal
Discount
Taxable amount
VAT
Grand total

Allow:

* Draft
* Sent
* Accepted
* Rejected
* Expired

Generate professional A4 PDF.

Include:

Company logo
Company information
Client information
Project information
Quotation number
Terms and conditions
Authorized signature

---

# 11. INVOICE MODULE

Create professional invoice management.

Fields:

* Invoice number
* Invoice date
* Due date
* Client
* Project
* Payment terms

Invoice items:

* Description
* Quantity
* Unit
* Rate
* Amount

Totals:

Subtotal
Discount
VAT
Grand Total
Paid
Balance Due

Invoice status:

* Draft
* Issued
* Partially Paid
* Paid
* Overdue
* Cancelled

Generate A4 PDF.

Include payment/bank details.

Allow payment recording.

---

# 12. MATERIAL DATABASE

Create a centralized electrical material database.

Material fields:

* Material code
* Material name
* Category
* Subcategory
* Brand
* Model
* Specification
* Unit
* Current purchase price
* Selling price
* Supplier
* VAT rate
* Minimum stock
* Current stock
* Warranty
* Datasheet
* Notes

Examples:

MCB
MCCB
ACB
RCCB
RCBO
Contactor
Overload relay
Cable
Cable gland
Cable lug
Cable tray
Cable ladder
Conduit
DB
MDB
SMDB
LED light
Emergency light
Socket
Switch
Earthing rod
Earth clamp
Earth cable
SPD
Relay
Timer
Contactor
VFD
Motor
Generator
ATS
UPS
Transformer
Capacitor
etc.

Allow:

* search
* filter
* sorting
* import Excel
* export Excel
* price history
* supplier comparison

---

# 13. SUPPLIER DATABASE

Create Supplier CRUD.

Fields:

* Supplier name
* Company
* Contact person
* Phone
* Email
* Address
* PAN/VAT
* Product categories
* Payment terms
* Credit limit
* Notes

Supplier profile:

* Materials supplied
* Purchase history
* Total purchases
* Outstanding amount
* Contact details
* Documents

Allow multiple suppliers for the same material.

Show supplier price comparison.

---

# 14. LABOUR RATE DATABASE

Create labour database.

Worker categories:

* Electrical Engineer
* Project Engineer
* Site Engineer
* Electrical Supervisor
* Foreman
* Senior Electrician
* Electrician
* Junior Electrician
* Helper
* Technician
* Welder
* Cable Joiner
* Testing Technician

Rate fields:

* Labour category
* Daily rate
* Hourly rate
* Overtime rate
* Transport allowance
* Accommodation allowance
* Notes

Allow project-specific labour rates.

---

# 15. PROJECT COSTING MODULE

This is one of the most important modules.

For each project calculate:

Estimated cost:

Material
Labour
Equipment
Transport
Subcontractor
Other expenses
Overhead
Contingency

Actual cost:

Actual material cost
Actual labour cost
Actual equipment cost
Actual transport
Actual subcontractor
Other expenses

Show:

Contract Value
Estimated Cost
Estimated Profit
Estimated Margin
Actual Cost
Actual Profit
Actual Margin
Cost Variance

Formula:

Estimated Profit =
Contract Value - Estimated Cost

Actual Profit =
Contract Value - Actual Cost

Margin =
Profit / Contract Value × 100

Create visual comparison:

Estimated vs Actual.

---

# 16. EXPENSE MANAGEMENT

Create expense tracking.

Fields:

* Expense number
* Date
* Project
* Category
* Description
* Amount
* Vendor
* Payment method
* Receipt
* Notes

Categories:

* Material
* Labour
* Transport
* Fuel
* Tools
* Accommodation
* Food
* Office
* Equipment
* Subcontractor
* Other

Allow receipt upload.

---

# 17. PAYMENT MANAGEMENT

Track:

* Client payments
* Supplier payments
* Labour payments
* Other payments

Payment fields:

* Date
* Amount
* Project
* Invoice
* Payment type
* Bank/cash
* Reference
* Notes

Dashboard should calculate:

Receivables
Payables
Paid
Pending

---

# 18. ELECTRICAL DRAWING MANAGEMENT

Create a drawing/document management module.

Upload:

* SLD
* Lighting layout
* Power layout
* DB schedule
* Panel schematic
* Control diagram
* Earthing layout
* Lightning protection
* Cable schedule
* As-built drawing

Fields:

* Drawing number
* Drawing title
* Revision
* Date
* Project
* Discipline
* Status
* Prepared by
* Checked by
* Approved by

Statuses:

* Draft
* For Review
* Approved
* As Built
* Superseded

Allow PDF/DWG/DXF/image upload.

Create drawing revision history.

---

# 19. METHOD STATEMENT MODULE

Create reusable method statement templates.

Examples:

* Cable installation
* Cable tray installation
* Cable ladder installation
* Conduit installation
* DB installation
* MDB installation
* Panel installation
* Earthing installation
* Lighting installation
* Generator installation
* UPS installation
* Motor installation
* Testing
* Commissioning

Method statement structure:

1. Purpose
2. Scope
3. Responsibilities
4. Tools and equipment
5. Materials
6. Safety requirements
7. PPE
8. Work procedure
9. Quality control
10. Inspection
11. Testing
12. Acceptance criteria
13. Risk assessment
14. References

Allow project-specific method statements.

Generate professional PDF.

---

# 20. TESTING & COMMISSIONING MODULE

Create testing checklists.

Electrical testing categories:

## Cable

* Visual inspection
* Continuity
* Insulation resistance
* Phase identification
* Phase sequence
* Termination inspection
* Torque verification

## DB / Panel

* Visual inspection
* Labeling
* Tightness
* Insulation resistance
* Earth continuity
* RCD test
* Functional test

## Earthing

* Earth resistance
* Earth continuity
* Bonding
* Visual inspection

## Lighting

* Functional test
* Lux measurement
* Emergency lighting test
* Sensor test
* Control test

## Generator

* Visual inspection
* Battery
* Fuel
* Oil
* ATS
* AMF
* Manual mode
* Auto mode
* Load test

## Motor

* Insulation resistance
* Continuity
* Rotation
* Phase sequence
* Protection
* No-load test
* Load test

## UPS

* Input voltage
* Output voltage
* Battery
* Bypass
* Alarm
* Load test
* Runtime

Each checklist should include:

* Project
* Equipment
* Test date
* Tested by
* Witnessed by
* Instrument
* Instrument calibration date
* Test result
* Pass/Fail
* Remarks
* Signature

Generate testing report PDF.

---

# 21. REPORTING MODULE

Create professional reports.

Reports:

* Project cost report
* Profit report
* BOQ report
* Material report
* Purchase report
* Supplier report
* Labour report
* Expense report
* Invoice report
* Payment report
* Outstanding report
* Project progress report
* Testing report

Allow:

PDF
Excel
CSV

Export.

---

# 22. DOCUMENT MANAGEMENT

Each project should have a document repository.

Folders:

01 Contract
02 BOQ
03 Quotations
04 Drawings
05 Material Submittals
06 Method Statements
07 Risk Assessments
08 Inspection Requests
09 Testing
10 Commissioning
11 Invoices
12 Payments
13 Completion Documents
14 As-Built

Allow upload/download/delete with proper permissions.

---

# 23. USER ROLES

Create RBAC.

Roles:

Admin
Director
Project Manager
Engineer
Estimator
Site Supervisor
Electrician
Accountant
Viewer

Permissions:

View
Create
Edit
Delete
Approve
Export
Upload
Manage users

Example:

Electrician should not access financial reports.

Accountant should access invoices and payments.

Estimator should access BOQ and quotations.

Admin should access everything.

---

# 24. SEARCH

Global search should search:

Projects
Clients
BOQ items
Materials
Suppliers
Quotations
Invoices
Documents

Use keyboard shortcut:

Ctrl + K

for global search.

---

# 25. NOTIFICATIONS

Create notification system for:

* Quotation expiring
* Invoice overdue
* Payment due
* Project deadline
* Material low stock
* Pending approval
* Testing pending
* Drawing revision
* Method statement pending

---

# 26. PROFESSIONAL UI DESIGN

Design should look like a modern engineering ERP.

Style:

* Clean
* Professional
* Minimal
* Industrial
* Technical
* Responsive

Desktop:
Sidebar + top navigation + content area.

Mobile:
Responsive drawer navigation.

Use consistent:

Typography
Spacing
Cards
Tables
Buttons
Forms
Status badges

Do NOT make it look like a generic template.

Use an engineering/business aesthetic.

---

# 27. DATABASE DESIGN

Create normalized PostgreSQL schema.

Main tables:

users
roles
permissions
companies
clients
projects
project_members
boqs
boq_items
quotations
quotation_items
invoices
invoice_items
payments
materials
material_categories
material_prices
suppliers
supplier_materials
labour_categories
labour_rates
employees
expenses
drawings
drawing_revisions
method_statements
method_statement_templates
testing_checklists
testing_items
testing_results
documents
notifications
audit_logs

Use foreign keys.

Use timestamps.

Use soft deletion where appropriate.

---

# 28. AUDIT LOG

Track important changes.

Example:

User
Action
Entity
Entity ID
Old value
New value
Timestamp

Track:

Quotation edits
Invoice edits
BOQ edits
Cost changes
Project changes
Material price changes
User permission changes

---

# 29. SECURITY

Implement:

* Password hashing
* Secure sessions
* RBAC
* Input validation
* Server-side authorization
* SQL injection protection through Prisma
* File type validation
* File size limits
* Rate limiting where appropriate
* Secure environment variables

Never expose secrets in frontend.

Never hardcode passwords/API keys.

---

# 30. ELECTRICAL CALCULATOR MODULE

Add an Engineering Tools section.

Include calculators for:

### Power

Single phase:

P = V × I × PF

Three phase:

P = √3 × V × I × PF

### Current

I = P / (√3 × V × PF)

### Voltage Drop

Support:

* single phase
* three phase
* copper
* aluminium

### Cable Selection

Input:

* load kW
* voltage
* phase
* power factor
* cable length
* installation method
* conductor material
* ambient temperature

Output:

* calculated current
* suggested cable size
* voltage drop
* voltage drop %
* suggested protection

Important:

Do NOT present calculator results as code-compliance certification.

Clearly state that final cable/protection selection must be verified against applicable Nepal standards, manufacturer data and project requirements.

### Generator sizing

### Transformer sizing

### UPS sizing

### Capacitor bank estimation

### Load schedule calculator

### Energy consumption calculator

---

# 31. STANDARDS / REFERENCE LIBRARY

Create a reference section for electrical standards.

Allow documents to be uploaded and categorized.

Categories:

* Nepal Electrical standards
* Building regulations
* IEC
* NEC
* IEEE
* Manufacturer manuals
* Project specifications

Do not automatically claim that a standard applies.

Store:

Standard name
Standard number
Edition
Description
Document
Project applicability
Notes

---

# 32. PROJECT WORKFLOW

Implement this workflow:

LEAD

↓

SITE SURVEY

↓

ESTIMATION

↓

BOQ

↓

QUOTATION

↓

CLIENT APPROVAL

↓

CONTRACT

↓

PROJECT PLANNING

↓

PROCUREMENT

↓

INSTALLATION

↓

INSPECTION

↓

TESTING

↓

COMMISSIONING

↓

HANDOVER

↓

INVOICE

↓

PAYMENT

↓

WARRANTY / MAINTENANCE

Create project status tracking based on this workflow.

---

# 33. SITE SURVEY MODULE

Add site survey functionality.

Fields:

Project
Client
Location
Survey date
Survey engineer

Checklist:

Incoming supply
Voltage
Phase
Main breaker
Transformer
Generator
Existing DB
Existing cable
Earthing
Load
Available space
Cable route
Cable tray
Panel location
Lighting
Emergency lighting
Fire alarm
UPS
Other observations

Allow:

Photos
Notes
Measurements
PDF report

---

# 34. PROCUREMENT

Create basic procurement management.

Workflow:

BOQ/material requirement

↓

Purchase Request

↓

Supplier quotation

↓

Supplier comparison

↓

Purchase Order

↓

Material received

↓

Stock update

↓

Project consumption

Purchase order fields:

PO number
Supplier
Project
Items
Quantity
Rate
VAT
Total
Delivery date
Payment terms
Status

---

# 35. INVENTORY

Create basic inventory.

Track:

Opening stock
Purchase
Project issue
Return
Adjustment
Current stock

Low stock alerts.

Material movement history.

---

# 36. HOME PAGE / PUBLIC WEBSITE

The same application should include a public company website.

Pages:

Home
About
Services
Projects
Industries
Our Team
Certifications
Contact

Services:

Electrical Contracting
Industrial Electrical
Building Electrical
Panel Installation
Generator & ATS
UPS
Solar
Earthing
Lightning Protection
Fire Alarm
CCTV
BMS
Automation
Testing & Commissioning
Maintenance

Add:

Contact form
WhatsApp button
Phone
Email
Google Maps location

The public website should use the same company profile information from the admin system.

---

# 37. SEO

Implement:

* Proper metadata
* Open Graph
* Sitemap
* Robots.txt
* Semantic HTML
* SEO-friendly URLs
* Structured data where appropriate

Target keywords should be configurable rather than hardcoded.

Example:

Electrical Contractor Nepal
Electrical Engineering Nepal
Industrial Electrical Contractor Nepal
Electrical Installation Nepal

---

# 38. RESPONSIVE DESIGN

Must work on:

Desktop
Laptop
Tablet
Mobile

Tables should become horizontally scrollable or responsive cards on mobile.

Forms must be mobile friendly.

---

# 39. ERROR HANDLING

Implement professional error handling.

Use:

Loading states
Empty states
Error states
Success notifications
Validation messages
Confirmation dialogs

Never silently fail.

---

# 40. DEMO DATA

Create realistic demo data.

Example projects:

* Residential Building
* Hotel
* Factory
* Hospital

Demo materials:

* 1.5 mm² Cu cable
* 2.5 mm² Cu cable
* 4 mm² Cu cable
* 6 mm² Cu cable
* 10 mm² Cu cable
* 16 mm² Cu cable
* MCB
* MCCB
* DB
* Cable tray
* LED
* Contactor
* Overload
* Earthing rod

Demo suppliers.

Demo clients.

Demo quotations.

Demo invoices.

Demo BOQs.

---

# 41. PDF DOCUMENT DESIGN

All PDFs must look professional.

Use:

Company logo
Header
Footer
Document number
Date
Page numbers
Client information
Project information
Tables
Terms
Signature section

Use A4 format.

Professional typography.

---

# 42. NUMBERING SYSTEM

Automatically generate:

Project:
PRJ-2026-001

BOQ:
BOQ-2026-001

Quotation:
QT-2026-001

Invoice:
INV-2026-001

Purchase Order:
PO-2026-001

Testing:
TCR-2026-001

Method Statement:
MS-2026-001

Drawing:
DWG-PRJ001-001

Make numbering configurable from settings.

---

# 43. SETTINGS

Settings should include:

Company
Users
Roles
Tax
Currency
Document numbering
Units
Project statuses
Material categories
Labour categories
Payment terms
Quotation terms
Invoice terms
PDF settings
Notification settings

Default currency:

NPR

Currency symbol:

Rs.

---

# 44. IMPORTANT BUSINESS LOGIC

Do not allow:

Invoice total < paid amount

Negative quantities

Negative rates

Duplicate invoice numbers

Duplicate project codes

Invalid dates

Invalid percentages

Use validation everywhere.

---

# 45. DATA IMPORT / EXPORT

Implement Excel templates.

BOQ import template:

Item No
Description
Specification
Category
Unit
Quantity
Material Rate
Labour Rate
Equipment Rate
Remarks

Material import:

Material Code
Material Name
Category
Brand
Model
Specification
Unit
Purchase Price
Selling Price
Supplier

Supplier import.

Labour rate import.

Export all major tables to Excel.

---

# 46. BACKUP

Create database backup strategy documentation.

Design application so database can eventually be backed up automatically.

Do not store critical data only in browser/localStorage.

---

# 47. FUTURE FEATURES

Architecture should allow future modules:

* Mobile app
* Offline site mode
* GPS site attendance
* Worker attendance
* Payroll
* WhatsApp integration
* Email integration
* Accounting integration
* E-signature
* Cloud storage
* Multi-company
* Multi-branch
* Nepali language
* AI estimation assistant
* AI BOQ generation
* AI document generation

Do not implement these initially unless required.

Design the architecture so they can be added later.

---

# 48. DEVELOPMENT APPROACH

Do NOT try to create the entire application in one file.

Build incrementally.

PHASE 1:
Project setup
Database
Authentication
Company settings
Users
RBAC
Dashboard

PHASE 2:
Clients
Projects
Materials
Suppliers
Labour

PHASE 3:
BOQ
Quotation
Costing

PHASE 4:
Invoices
Payments
Expenses
Procurement

PHASE 5:
Drawings
Documents
Method Statements

PHASE 6:
Testing & Commissioning

PHASE 7:
Reports
PDF
Excel

PHASE 8:
Public company website

PHASE 9:
Engineering calculators

PHASE 10:
Testing
Security
Performance
Deployment

---

# 49. BEFORE WRITING CODE

First analyze the requirements.

Then provide:

1. Complete folder structure
2. Database ERD description
3. Database schema
4. API architecture
5. Authentication architecture
6. Component architecture
7. Development phases

Do NOT start by creating hundreds of files blindly.

After presenting the architecture, start implementing Phase 1.

---

# 50. CODE QUALITY REQUIREMENTS

Use:

TypeScript strict mode.

Avoid:

any

unless absolutely necessary.

Use reusable functions.

Use meaningful variable names.

Add comments only where the logic is not obvious.

Do not create unnecessary abstractions.

Follow clean architecture principles.

Keep components reasonably small.

Use server-side validation.

Use database transactions for financial operations.

---

# 51. FINANCIAL DATA RULE

Financial calculations must use decimal-safe calculations.

Do not rely on floating-point arithmetic for money.

Use appropriate PostgreSQL Decimal/Numeric types and Prisma Decimal.

Store monetary values safely.

Round only at appropriate presentation/calculation boundaries.

---

# 52. FINAL PRODUCT GOAL

The final system should feel like a professional combination of:

Electrical Estimation Software
+
Project Management System
+
Quotation Software
+
Invoice System
+
Inventory System
+
Contractor ERP
+
Engineering Document Management System

It should be suitable for a Nepal-based electrical engineering and contracting company.

The UI should be clean and professional.

The database should be scalable.

The code should be maintainable.

The system should be production-ready in architecture, even if the first version is developed incrementally.

START WITH PHASE 1.

Before coding, show me the proposed architecture and folder structure.
s