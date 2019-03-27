# smarttables

This is a jquery plugin....

# Documentation

## Parameters

draw: The draw of the table....Draw is an integer
dataview: values are table,grid



## example
```javascript
 var cols = [
            {
                "data": "owner_id",
                "name": "",
                "searchable": "true",
                "orderable": "true",
                "width": "15%",
                "search": {
                    "value": "",
                    "regex": "false"
                }
            },
            {
                "data": "photopath",
                "name": "",
                "searchable": "true",
                "orderable": "false",
                "width": "15%",
                "search": {
                    "value": "",
                    "regex": "false"
                }
            },
            {
                "data": "boatname",
                "name": "",
                "searchable": "true",
                "orderable": "true",
                "width": "60%",
                "search": {
                    "value": "",
                    "regex": "false"
                }
            },
            {
                "data": "actions",
                "name": "",
                "searchable": "true",
                "orderable": "false",
                "width": "10%",
                "search": {
                    "value": "",
                    "regex": "false"
                }
            }
        ];

        $(".smarttable").SmartTable({
            "draw": 1,
            "start": 0,
            "dataview": "table",
            "ajax": {
                "url": _URL + "/boats/GetBoats",
                "method": "post"
            },
            "lengthinput": ['2', '3', '4', '5', '8'],
            "length": 5,
            "order": [{
                "column": "0",
                "dir": "asc"
            }],
            "columns": cols,
            "search": {
                "value": "",
                "regex": "false"
            }
        });


```
