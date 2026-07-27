"""
Business column mapping for monday.com boards.
These are logical names used throughout the application.
"""

DEALS_COLUMNS = {
    "name": "name",
    "owner": "text_mm5nzzv5",
    "client": "text_mm5n2nh0",
    "status": "color_mm5nv9r2",
    "close_date": "date_mm5n2ryd",
    "probability": "color_mm5nsc65",
    "deal_value": "numeric_mm5nvwfz",
    "tentative_close": "date_mm5n4wtb",
    "stage": "color_mm5nt456",
    "product": "dropdown_mm5nwerb",
    "sector": "dropdown_mm5ntktj",
    "created": "date_mm5nfvw8",
}

# Work Orders board column ID -> human-readable mapping
WORK_ORDER_COLUMNS = {
    "name": "name",
    "customer_code": "text_mm5n3hr4",
    "serial": "text_mm5nwjny",
    "nature_of_work": "text_mm5n5wzx",
    "last_executed_month": "text_mm5n4n16",
    "execution_status": "color_mm5nzm8r",
    "data_delivery_date": "date_mm5nb3j4",
    "date_po_loi": "date_mm5n2jg7",
    "document_type": "text_mm5nmed4",
    "probable_start_date": "date_mm5njd0v",
    "probable_end_date": "date_mm5n2m7d",
    "bd_kam_code": "text_mm5ncjv2",
    "sector": "dropdown_mm5n35e6",
    "type_of_work": "text_mm5nstja",
    "skylark_software": "text_mm5n8ysw",
    "last_invoice_date": "date_mm5nxjqq",
    "invoice_no": "text_mm5nt54p",
    "amount_excl_gst": "numeric_mm5nk541",
    "amount_incl_gst": "numeric_mm5nassw",
    "billed_excl_gst": "numeric_mm5n6t80",
    "billed_incl_gst": "numeric_mm5n5eg8",
    "amount_receivable": "numeric_mm5ns1h3",
    "ar_priority": "text_mm5nr6r0",
    "invoice_status": "color_mm5nqnc7",
    "expected_billing_month": "text_mm5nz74s",
    "actual_billing_month": "text_mm5n4fz7",
    "actual_collection_month": "text_mm5ny66m",
    "wo_status_billed": "color_mm5nfqta",
    "collection_status": "text_mm5nxy6p",
    "collection_date": "date_mm5nb9t7",
    "billing_status": "color_mm5nntkd",
}

# Reverse map: Monday column ID -> human-readable field name (for live API data normalization)
WO_ID_TO_HUMAN = {v: k for k, v in WORK_ORDER_COLUMNS.items()}

# Excel column names -> Monday column ID mapping (for fallback data)
WO_EXCEL_TO_ID = {
    "Deal name masked": "name",
    "Customer Name Code": WORK_ORDER_COLUMNS["customer_code"],
    "Serial #": WORK_ORDER_COLUMNS["serial"],
    "Nature of Work": WORK_ORDER_COLUMNS["nature_of_work"],
    "Last executed month of recurring project": WORK_ORDER_COLUMNS["last_executed_month"],
    "Execution Status": WORK_ORDER_COLUMNS["execution_status"],
    "Data Delivery Date": WORK_ORDER_COLUMNS["data_delivery_date"],
    "Date of PO/LOI": WORK_ORDER_COLUMNS["date_po_loi"],
    "Document Type": WORK_ORDER_COLUMNS["document_type"],
    "Probable Start Date": WORK_ORDER_COLUMNS["probable_start_date"],
    "Probable End Date": WORK_ORDER_COLUMNS["probable_end_date"],
    "BD/KAM Personnel code": WORK_ORDER_COLUMNS["bd_kam_code"],
    "Sector": WORK_ORDER_COLUMNS["sector"],
    "Type of Work": WORK_ORDER_COLUMNS["type_of_work"],
    "Amount in Rupees (Excl of GST) (Masked)": WORK_ORDER_COLUMNS["amount_excl_gst"],
    "Amount in Rupees (Incl of GST) (Masked)": WORK_ORDER_COLUMNS["amount_incl_gst"],
    "Billed Value in Rupees (Excl of GST.) (Masked)": WORK_ORDER_COLUMNS["billed_excl_gst"],
    "Billed Value in Rupees (Incl of GST.) (Masked)": WORK_ORDER_COLUMNS["billed_incl_gst"],
    "Collected Amount in Rupees (Incl of GST.) (Masked)": WORK_ORDER_COLUMNS["amount_incl_gst"],
    "Amount Receivable (Masked)": WORK_ORDER_COLUMNS["amount_receivable"],
    "AR Priority account": WORK_ORDER_COLUMNS["ar_priority"],
    "Invoice Status": WORK_ORDER_COLUMNS["invoice_status"],
    "Expected Billing Month": WORK_ORDER_COLUMNS["expected_billing_month"],
    "Actual Billing Month": WORK_ORDER_COLUMNS["actual_billing_month"],
    "Actual Collection Month": WORK_ORDER_COLUMNS["actual_collection_month"],
    "Billing Status": WORK_ORDER_COLUMNS["billing_status"],
    "Collection status": WORK_ORDER_COLUMNS["collection_status"],
}