const sampleHtml = `
                        <h1 style="color:darkblue">Báo Cáo Review</h1>
                        <p>Đây là file PDF được tạo từ quy trình <strong>Review & Export</strong>.</p>
                        <table style="width:100%; border-collapse: collapse;" border="1">
                            <tr style="background:#ddd;"><th>Mục</th><th>Trạng Thái</th></tr>
                            <tr><td>Code Review</td><td>Passed</td></tr>
                            <tr><td>Export Test</td><td>Success</td></tr>
                        </table>
                    `;

const sampleBlueprint = {
    "version": "1.0",
    "pageSize": {
        "width": 210,
        "height": 297,
        "unit": "mm"
    },
    "margins": {
        "top": 20,
        "bottom": 20,
        "left": 15,
        "right": 15
    },
    "pages": [
        {
            "pageNumber": 1,
            "elements": [
                {
                    "type": "richtext",
                    "indent": 0,
                    "marginLeft": 0,
                    "width": 180,
                    "segments": [
                        {
                            "text": "Báo Cáo Review",
                            "style": {
                                "bold": false,
                                "italic": false,
                                "underline": false,
                                "strikethrough": false,
                                "color": null,
                                "backgroundColor": null,
                                "fontSize": null
                            }
                        }
                    ],
                    "content": "Báo Cáo Review",
                    "style": {
                        "fontSize": 18,
                        "fontWeight": "bold",
                        "fontStyle": "normal",
                        "color": "#000000",
                        "align": "left",
                        "underline": false,
                        "lineHeight": 9.525006
                    }
                },
                {
                    "type": "richtext",
                    "indent": 0,
                    "marginLeft": 0,
                    "width": 180,
                    "segments": [
                        {
                            "text": "Đây là file PDF được tạo từ quy trình ",
                            "style": {
                                "bold": false,
                                "italic": false,
                                "underline": false,
                                "strikethrough": false,
                                "color": null,
                                "backgroundColor": null,
                                "fontSize": null
                            }
                        },
                        {
                            "text": "Review & Export",
                            "style": {
                                "bold": true,
                                "italic": false,
                                "underline": false,
                                "strikethrough": false,
                                "color": null,
                                "backgroundColor": null,
                                "fontSize": null
                            }
                        },
                        {
                            "text": ".",
                            "style": {
                                "bold": false,
                                "italic": false,
                                "underline": false,
                                "strikethrough": false,
                                "color": null,
                                "backgroundColor": null,
                                "fontSize": null
                            }
                        }
                    ],
                    "content": "Đây là file PDF được tạo từ quy trình Review & Export.",
                    "style": {
                        "fontSize": 12,
                        "fontWeight": "bold",
                        "fontStyle": "normal",
                        "color": "#000000",
                        "align": "left",
                        "underline": false,
                        "lineHeight": 6.350003999999999
                    }
                },
                {
                    "type": "table",
                    "width": 180,
                    "rows": [
                        [
                            {
                                "content": "Mục",
                                "isHeader": true,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            },
                            {
                                "content": "Trạng Thái",
                                "isHeader": true,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            }
                        ],
                        [
                            {
                                "content": "Code Review",
                                "isHeader": false,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            },
                            {
                                "content": "Passed",
                                "isHeader": false,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            }
                        ],
                        [
                            {
                                "content": "Export Test",
                                "isHeader": false,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            },
                            {
                                "content": "Success",
                                "isHeader": false,
                                "colSpan": 1,
                                "rowSpan": 1,
                                "align": "left",
                                "cellStyle": {
                                    "backgroundColor": null,
                                    "borderColor": null,
                                    "borderWidth": 0.5,
                                    "verticalAlign": "middle",
                                    "padding": null,
                                    "width": null,
                                    "height": null
                                }
                            }
                        ]
                    ],
                    "style": {
                        "width": 180,
                        "borderWidth": 1,
                        "borderColor": "#000000",
                        "backgroundColor": null,
                        "align": "left"
                    }
                }
            ]
        }
    ],
    "sourceHtml": "\n                        <h1 style=\"color:darkblue\">Báo Cáo Review</h1>\n                        <p>Đây là file PDF được tạo từ quy trình <strong>Review & Export</strong>.</p>\n                        <table style=\"width:100%; border-collapse: collapse;\" border=\"1\">\n                            <tr style=\"background:#ddd;\"><th>Mục</th><th>Trạng Thái</th></tr>\n                            <tr><td>Code Review</td><td>Passed</td></tr>\n                            <tr><td>Export Test</td><td>Success</td></tr>\n                        </table>\n                    ",
    "createdAt": "2026-02-04T05:19:43.685Z"
};