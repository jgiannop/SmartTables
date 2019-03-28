# SmartTables
This is a jquery plugin that renders data in tables or lists....


# Usage
## via cdn
```html
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/jgiannop/smarttables/smarttables.css">
<script src="https://cdn.jsdelivr.net/gh/jgiannop/public/js/smarttables.js" type="text/javascript"></script>  

```

# Documentation
## Parameters

* draw: The draw of the table....Draw is an integer
* dataview: values are table,grid
* lengthinput: an array of integer values that indicate the number of results for each draw


## Example
### On Client
```html
<div class="smarttable"></div>  
```

```javascript

$(".smarttable").SmartTable({
    "dataview": "table",
    "ajax": {
        "url": _URL + "/boats/GetBoats",
        "method": "post"
    },
    "lengthinput": ['2', '3', '4', '5', '8'],
    "length": 5,
    "order": {
        "column": "0",
        "dir": "asc"
    },
    "columns": [{
        "data": "owner_id",
        "name": "Owner_Id",
        "searchable": "true",
        "orderable": "true",
        "width": "15%"
    },
    {
        "data": "photopath",
        "name": "PhotoPath",
        "searchable": "true",
        "orderable": "false",
        "width": "15%"
    },
    {
        "data": "boatname",
        "name": "BoatName",
        "searchable": "true",
        "orderable": "true",
        "width": "60%"
    },
    {
        "data": "actions",
        "name": "Actions",
        "searchable": "true",
        "orderable": "false",
        "width": "10%"
    }];
});
```
### On Server (with php)
```php
public function GetBoats() {
        $requestData=$_REQUEST;
        $columns = array(
            // datatable column index  => database column name

            0 => 'owner_id',
            1 => 'photopath',
            2 => 'boatname',
        );
  
        $st = $this->db->prepare("SELECT * FROM boats");
        $st->execute();
        $totalData = $st->rowCount();
        $totalFiltered = $totalData;  // when there is no search parameter then total number rows = total number filtered rows.
        $len=$requestData['length']=="All"?"":" LIMIT " . $requestData['start'] . " ," . $requestData['length'];

        if (!empty($requestData['search']['value'])) {
            // if there is a search parameter
            $sql = "SELECT  * FROM boats";
            $sql.=" where (boatname LIKE '%" . $requestData['search']['value'] . "%' ";    // $requestData['search']['value'] contains search parameter
            $sql.=" OR owner_id LIKE '%" . $requestData['search']['value'] . "%') ";
            $sql.=" ORDER BY " . $columns[$requestData['order']['column']] . "   " . $requestData['order']['dir'] . $len . "   ";
            $st = $this->db->prepare($sql);
            $st->execute();

            $sql2 = "SELECT count(*) as total from boats";
            $sql2.=" where (boatname LIKE '%" . $requestData['search']['value'] . "%' ";    // $requestData['search']['value'] contains search parameter
            $sql2.=" OR owner_id LIKE '%" . $requestData['search']['value'] . "%') ";
            $sql2.=" ORDER BY " . $columns[$requestData['order']['column']];
            $st2= $this->db->prepare($sql2);
            $st2->execute();
            $row2 = $st2->fetch(PDO::FETCH_ASSOC);
            $totalFiltered = $row2["total"];

            
        } else {
            $sql = "SELECT  * FROM boats";
            $sql.=" ORDER BY " . $columns[$requestData['order']['column']] . "   " . $requestData['order']['dir'] . $len . "   ";
            $st = $this->db->prepare($sql);
            $st->execute();
        }

        $data = array();
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $nestedData = array();
            $nestedData["boatname"] = $row["boatname"];
            $nestedData["overview"] = $row["overview"];
            $nestedData["owner_id"] = $row["owner_id"];
            $nestedData["photopath"] = '<div class="imgzoom"><img style="height:50px;width:50px; border:1px solid #FF851B;" src="http://116.203.118.184/clicknroll/clicknrollclient/public/images/boats/' . $row['photopath'] . '" alt="Item picture" border="0"></div>';
            $nestedData["actions"] = "<div class='btn-group actionmenubtn' data-button='" . json_encode($nestedData) . "'><i class='fa  fa-pencil-square-o action_icon' id='action_icon_" . $row["id"] . "' style='cursor:pointer; font-size:18px !important'></i></div>";
            $data[] = $nestedData;
        }
        $json_data = array(
            "draw" => intval($requestData['draw']), // for every request/draw by clientside , they send a number as a parameter, when they recieve a response/data they first check the draw number, so we are sending same number in draw. 
            "recordsTotal" => intval($totalData), // total number of records
            "recordsFiltered" => intval($totalFiltered), // total number of records after searching, if there is no searching then totalFiltered = totalData
            "data" => $data   // total data array
        );
        return $json_data;
    }
```
