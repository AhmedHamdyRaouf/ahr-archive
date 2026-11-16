#!/usr/bin/env python3
"""Excel helper for sync-check.mjs (openpyxl keeps emoji, styles and the other sheets intact).
  xlsx_io.py read  <xlsx>            -> JSON {sheet: [[cell as text, ...], ...]} on stdout
  xlsx_io.py write <xlsx> <json>     -> json = {sheet: [[...], ...]}; replaces the cell values of those sheets
Needs: pip install openpyxl"""
import json, sys, openpyxl

def text(v):
    if isinstance(v, bool):  # Excel booleans are compared the way the database and CSV write them
        return 'true' if v else 'false'
    return '' if v is None else str(v)

mode, path = sys.argv[1], sys.argv[2]
if mode == 'read':
    wb = openpyxl.load_workbook(path, read_only=True)
    out = {ws.title: [[text(c) for c in row] for row in ws.iter_rows(values_only=True)] for ws in wb.worksheets}
    sys.stdout.write(json.dumps(out, ensure_ascii=False))
elif mode == 'write':
    new = json.load(open(sys.argv[3], encoding='utf-8'))
    wb = openpyxl.load_workbook(path)
    for name, rows in new.items():
        ws = wb[name] if name in wb.sheetnames else wb.create_sheet(name)
        old_rows = ws.max_row
        for ri, row in enumerate(rows, start=1):
            for ci, v in enumerate(row, start=1):
                ws.cell(row=ri, column=ci).value = v if v != '' else None
        if old_rows > len(rows):
            ws.delete_rows(len(rows) + 1, old_rows - len(rows))
    wb.save(path)
else:
    sys.exit('usage: xlsx_io.py read|write ...')
