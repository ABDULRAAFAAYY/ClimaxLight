# Admin Excel Upload System - Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install the new `xlsx` package needed for Excel parsing.

### Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```

Server will run on: `http://localhost:5000`

### Step 3: Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Step 4: Access Admin Panel

Open your browser and navigate to:
```
http://localhost:5173/admin
```

---

## 📊 Using the Admin Panel

### Upload Products from Excel

1. **Prepare Your Excel File**
   - Use the provided `sample-products.csv` as a template
   - Or create your own with these columns:
     - `Item Code` (required)
     - `Picture` (optional - image URL)
     - `Tag Price` (optional - original price)
     - `Rate` (required - selling price)
     - `Name` (optional - product name)

2. **Upload the File**
   - Drag and drop your Excel file onto the upload area
   - Or click "Browse Files" to select
   - Click "Upload & Process"

3. **Review Results**
   - See summary of total, successful, created, updated, and failed products
   - Check error table for any issues
   - View all successfully processed products

---

## 📝 Excel File Format

### Required Columns
- **Item Code**: Unique product identifier
- **Rate**: Selling price

### Optional Columns
- **Picture**: Product image URL
- **Tag Price**: Original/MRP price
- **Name**: Product name (defaults to Item Code if not provided)

### Example

| Item Code | Picture | Tag Price | Rate | Name |
|-----------|---------|-----------|------|------|
| CL001 | https://example.com/img.jpg | 1500 | 1299 | LED Bulb 9W |
| CL002 | https://example.com/img2.jpg | 2000 | 1799 | LED Tube Light |

---

## 🎯 Features

✅ Drag-and-drop file upload  
✅ Real-time progress tracking  
✅ Automatic product creation/update  
✅ Detailed error reporting  
✅ Beautiful, responsive UI  
✅ Support for multiple column name formats  

---

## 📞 Need Help?

Check the full walkthrough document for detailed information:
- Complete feature list
- File structure
- Testing guide
- Troubleshooting tips

---

**Enjoy managing your products! 🎉**
