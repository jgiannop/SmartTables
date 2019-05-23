# SmartTables
This is a jquery plugin that renders data in tables or lists....


# Usage
## via cdn
```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/jgiannop/smarttables/dist/smarttables.min.css">
<script src="https://cdn.jsdelivr.net/gh/jgiannop/smarttables/dist/smarttables.min.js" type="text/javascript"></script>  

```

# Documentation
## Parameters

* draw: The draw of the table....Draw is an integer.
* dataview: An enum with 2 values... table,grid.
* lengthinput: An array of integer values that indicate the number of results for each draw.
* order: A json object that indicates the order in respect to column number and the direction of the order.
* columns: A json array that defines the column objects that beeing rendered.

## Methods

* redraw(): Refresh the table in the current draw.
* destroy(): Destroys the table.

## Events

* onInitComplete(): Fires on tables initialization.
* onDrawUpdated(): Fires when the draw updated.

## Example
### On Client
```html
<div class="smtable"></div>  
```

```javascript
var smtable = $(".smtable").SmartTable({
    "dataview": "table",
    "ajax": {
        "url": _URL + "/boats/GetBoats",
        "method": "post"
    },
    "lengthinput": ['2', '3', '4', '5', '8', '20', 'All'],
    "length": 5,
    "actions":{
        "length":true,
        "order":true,
        "view":true,
        "search":true
    },
    "ongridview":{
        "removeheaders":true
    },
    "order": {
        "column": "0",
        "dir": "asc"
    },
    "onInitComplete": function(){
       console.log("Init Complete");
    },
    "onDrawUpdated": function(){
       console.log("Draw updated");
    },
    "columns": [{
            "field": "owner_id",
            "data": "owner_id",
            "name": "Owner Id",
            "searchable": "true",
            "orderable": "true",
            "width": "15%",
            "hiddenOnGrid": false
        },
        {
            "field": "photopath",
            "data": "photopath",
            "name": "Photopath",
            "searchable": "true",
            "orderable": "true",
            "width": "15%"
        },
        {
            "field": "boatname",
            "data": "boatname",
            "name": "Boatname",
            "searchable": "true",
            "orderable": "true",
            "width": "60%"
        },
        {
            "data": "actions",
            "name": "Actions",
            "searchable": "true",
            "orderable": "false",
            "width": "10%",
            "hiddenOnGrid": true
        }
    ]
});       
```
### On Server (with php and PDO)
Supposed that $this->db is a PDO instance
```php
$db=new PDO('mysql:host='.$dbhost.';dbname='.$dbname,$dbuser,$dbpass);
```
and that you have include somewhere SmartTables.php
```php
require 'SmartTables.php';
```
```php
public function GetBoats($table,$requestData) {
    $jdata=SmartTables::Instance($this->db,$table, $requestData)->GetTable();
    foreach ($jdata["data"] as $row){
        $nestedData = array();
        $nestedData["boatname"] = $row["boatname"];
        $nestedData["overview"] = $row["overview"];
        $nestedData["owner_id"] = $row["owner_id"];
        $nestedData["photopath"] = '<div class="imgzoom"><img style="height:50px;width:50px; border:1px solid #FF851B;" src="public/images/boats/' . $row['photopath'] . '" alt="Item picture" border="0"></div>';
        $nestedData["actions"] = "<div class='btn-group actionmenubtn' data-button='" . json_encode($row) . "'><i class='fa  fa-pencil-square-o action_icon' id='action_icon_" . $row["id"] . "' style='cursor:pointer; font-size:18px !important'></i></div>";
        $data[] = $nestedData;
    }
    $json_data = array(
        "draw" => intval($requestData['draw']),
        "recordsTotal" => intval($jdata["recordsTotal"]),
        "recordsFiltered" => intval($jdata["recordsFiltered"]),
        "recordsDraw" => intval($jdata["recordsDraw"]),
        "data" => $data
    );
    return $json_data;
}
```
