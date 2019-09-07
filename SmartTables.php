<?php

Class SmartTables {
    
    public $table=null;
    public $requestData=null;
    public $db=null;
    function __construct($dbs,$tab,$requestdata) {
        $this->requestData=$requestdata;
        $this->table=$tab;
        $this->db=$dbs;
    }
    
    public static function Instance($dbs,$tab,$requestdata) {
        static $inst = null;
        if ($inst === null) {
            $inst = new SmartTables($dbs,$tab,$requestdata);
            
        }
        return $inst;
    }
    public function GetTable($options=null){
        $columns = array();
        $searchablecolumns = array();
        $cols=$this->requestData["columns"];
        foreach ($cols as $col){
            if(isset($col["field"])){
               array_push($columns ,$col["field"]);
            }
            if($col["searchable"]){
                array_push($searchablecolumns ,$col);
            }
        }
        $addsql="";
        $addsqlwhere="";
        if($options!=null){
            if(isset($options["join"])){
                foreach($options["join"] as $join){
                    $addsql.=" ".$join[1]." join ".$join[0]." on ".$join[0].".".$join[2][1]." = ".$this->table.".".$join[2][0];
                }
            }
            if(isset($options["where"])){
               
                $addsqlwhere.=" where ";
                foreach($options["where"] as $where){
                    $addsqlwhere.=$where[0].$where[1].$where[2] ." and";
                }
             
                $addsqlwhere=rtrim($addsqlwhere," and");
            }
        }
       
        $sql="SELECT count(*) as total FROM ". $this->table . $addsql. $addsqlwhere ;
        $st= $this->db->prepare($sql);
        $st->execute();
        $totalData = $st->fetch(PDO::FETCH_ASSOC)["total"];

        $totalDraw = $totalData;
        $totalFiltered = $totalData;  // when there is no search parameter then total number rows = total number filtered rows.
        $len=$this->requestData['length']=="All"?"":" LIMIT " . $this->requestData['start'] . " ," . $this->requestData['length'];

        if (!empty($this->requestData['search']['value'])) {
            // if there is a search parameter
            $sql="SELECT * FROM ". $this->table . $addsql;
           
            if(count($searchablecolumns)>0){
                $sqlpat="";
                $sqlpat.=" where (";
                foreach ($searchablecolumns as $col){
                
                    if($col["searchable"]){
                        if(isset($col["field"])){
                             $sqlpat.=$col["field"]. " LIKE '%" . $this->requestData['search']['value'] . "%' OR ";    
                        }
                    }
                }
                $sqlpat=  rtrim($sqlpat,"OR ");
                if(count($searchablecolumns)>0){
                    $sqlpat.=" ) ";
                }
                $sql.=$sqlpat;
                // if($addsqlwhere!=""){
                //     $addsqlwhere=ltrim($addsqlwhere);
                //     $addsqlwhere=ltrim($addsqlwhere,"where");
                // }
                // $sql.=" and ".$addsqlwhere;
            }
            else{
                $sql.=$addsqlwhere;
            }         
           
            $sql.=" ORDER BY " . $columns[$this->requestData['order']['column']] . "   " . $this->requestData['order']['dir'] . $len . "   ";
            $st = $this->db->prepare($sql);
            $st->execute();
            $totalDraw = $st->rowCount();
            $sql2="SELECT count(*) as total FROM ". $this->table . $addsql .$sqlpat;
            $st2= $this->db->prepare($sql2);
            $st2->execute();
            $row2 = $st2->fetch(PDO::FETCH_ASSOC);
            $totalFiltered = $row2["total"];
        } else {
            
            $sql="SELECT * FROM ". $this->table . $addsql. $addsqlwhere;
            $sql.=" ORDER BY " . $columns[$this->requestData['order']['column']] . "   " . $this->requestData['order']['dir'] . $len . "   ";
            $st = $this->db->prepare($sql);
            $st->execute();
            $totalDraw = $st->rowCount();
        }

        $data = array();
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        $json_data = array(
            "draw" => intval($this->requestData['draw']), // for every request/draw by clientside , they send a number as a parameter, when they recieve a response/data they first check the draw number, so we are sending same number in draw. 
            "recordsTotal" => intval($totalData), // total number of records
            "recordsFiltered" => intval($totalFiltered), // total number of records after searching, if there is no searching then totalFiltered = totalData
            "recordsDraw" => intval($totalDraw), // total number of records after searching, if there is no searching then totalFiltered = totalData
            "data" => $data   // total data array
        );
        return $json_data;
    }
}
