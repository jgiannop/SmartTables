SMTable = jQuery.fn.extend({
    SmartTable: function(obj) {

        $.extend(SMTable, {
            redraw: function() {
                updatedraw(obj, $(this));
            },
            destroy: function() {
                $(this).empty();
            }
        });
        
        var updatedrawCallback = function(container, obj) {
            var linput = container.find(".headarea > .lengthinputcont > .lengthinput");
            var oinput = container.find(".headarea > .orderinputcont > .orderinput");
            var otinput = container.find(".headarea > .ordertypeinputcont > .ordertypeinput");
            var vtinput = container.find(".headarea > .viewtypecont > .viewtypeinput");
            var stinput = container.find(".headarea > .searchtablecont > .searchtable");
            var pagin = container.find(".pagination");
            
            linput.off('change').on('change', function() {
                pagin.empty();
                var newobj = obj;
                newobj.length = linput.val();
                newobj.draw = 1;
                newobj.start = 0;
                updatedraw(newobj, container);
                return false;
            });
            oinput.off('change').on('change', function() {
                var colid = $(this).val();
                pagin.empty();
                var newobj = obj;
                newobj.length = linput.val();
                newobj.draw = 1;
                newobj.start = 0;
                newobj.order.column = colid;
                newobj.order.dir = otinput.val();
                updatedraw(newobj, container);
                return false;
            });
            otinput.off('change').on('change', function() {
                pagin.empty();
                var newobj = obj;
                newobj.length = parseInt(linput.val());
                newobj.draw = 1;
                newobj.start = 0;
                newobj.order.dir = $(this).val();
                updatedraw(newobj, container);
                return false;
            });
            vtinput.off('change').on('change', function() {
                container.find("table").find("tbody").empty();
                pagin.empty();
                var newobj = obj;
                newobj.length = parseInt(linput.val());
                newobj.draw = 1;
                newobj.start = 0;
                newobj.dataview = $(this).val();
                container.empty();
                createmainui(container, obj);
                updatedraw(obj, container, updatedrawCallback(container, obj));
                return false;
            });
            var to = true;
            stinput.off("input").on("input", function(e) {  
                var newobj = obj;
                newobj.length = parseInt(linput.val());
                newobj.draw = 1;
                newobj.start = 0;
                newobj.search.value = $(this).val();
                if (to) {
                    clearTimeout(to);
                }
                to = setTimeout(function () {
                    pagin.empty();
                    updatedraw(newobj, container);
                }, 500);
                return false;
            });
            if(obj.onInitComplete!=null)
            {
               obj.onInitComplete(); 
            }
        };

        function updatedraw(obj, container, callback) {
            container.find(".tablefooterarea > .statuslbl").css("visibility","visible");
            var cols = obj["columns"];
            var url = obj["ajax"]["url"];
            var method = obj["ajax"]["method"];
            var dataobj=Object.assign({}, obj);
            dataobj.onInitComplete=null;
            dataobj.onDrawUpdated=null;
            $.ajax({
                url: url,
                method: method,
                data: dataobj,
                success: function(data) {
                    var jsondata = JSON.parse(data);
                    var total = jsondata.recordsFiltered;
                    var totalDraw = jsondata.recordsDraw;
                    var dataview = obj["dataview"];
                    var length = parseInt(container.find(".headarea > .lengthinputcont > .lengthinput").val());
                    var pagescount = 0;
                    if (total % length == 0) {
                        pagescount = parseInt(total / length);
                    } else {
                        pagescount = parseInt(total / length) + 1;
                    }
                    if (dataview == "table") {
                        var tbody = "<tbody >";
                        var arraydata = jsondata.data;
                        $.each(arraydata, function(k, v) {
                            tbody += "<tr>";
                            $.each(cols, function(k1, v1) {
                                if(!obj.hiddenOnTable)
                                {
                                    tbody += "<td>" + v[v1.data] + "</td>";
                                }
                            });
                            tbody += "</tr>";
                        });
                        tbody += "</tbody>";
                        var tbodyexist = container.find("table").find("tbody").length > 0;
                        if (tbodyexist) {
                            container.find("table").find("tbody").fadeOut("fast",function(){
                                container.find("table").find("tbody").replaceWith(tbody);
                                container.find("table").find("tbody").hide();
                                container.find("table").find("tbody").fadeIn("fast",function(){
                                    container.find(".tablefooterarea > .statuslbl").css("visibility","hidden");
                                });
                            });
                           
                        } else {
                            container.find("table").append(tbody);
                            container.find("table").find("tbody").hide();
                            container.find("table").find("tbody").fadeIn("fast",function(){
                                container.find(".tablefooterarea > .statuslbl").css("visibility","hidden");
                            });
                        }

                    } else if (dataview == "grid") {
                        var tbody = "";
                        var arraydata = jsondata.data;
                        $.each(arraydata, function(k, v) {
                            tbody += "<li>";
                            $.each(cols, function(k1, v1) {
                                if(!v1.hiddenOnGrid)
                                {
                                    if(obj.ongridview.removeheaders)
                                    {
                                        tbody += "<div>" + v[v1.data] + "</div>";
                                    }
                                    else
                                    {
                                        tbody += "<div>" + v1.name + ": " + v[v1.data] + "</div>";
                                    } 
                                }                               
                            });
                            tbody += "</li>";
                        });
                        var tbodyexist =container.find(".gridcontainer").find("ul.table").children().length > 0;
                        if (tbodyexist) {
                            var clsname = container.attr("class") + "_smtable";
                            var txt = '<div class="gridcontainer"><ul class="table '+clsname+'" type="text">'+tbody+'</ul></div>';
                            container.find(".gridcontainer").fadeOut("fast",function(){
                                container.find(".gridcontainer").replaceWith(txt);
                                container.find(".gridcontainer").hide();
                                container.find(".gridcontainer").fadeIn("fast",function(){
                                    container.find(".tablefooterarea > .statuslbl").css("visibility","hidden");
                                });
                            });
                            
                            
                        } else {
                            container.find("ul.table").append(tbody);
                            container.find(".gridcontainer").hide();
                            container.find(".gridcontainer").fadeIn("fast",function(){
                                container.find(".tablefooterarea > .statuslbl").css("visibility","hidden");
                            });
                        }
                    }
                   
                    createpaginator(obj["draw"], pagescount, container);
                    container.find(".tablefooterarea > .resultslbl").html("Shows: "+(obj["start"]+1)+" to "+(obj["start"]+totalDraw)+". Total: "+total);
                    if(obj.onDrawUpdated!=null)
                    {
                       obj.onDrawUpdated(); 
                    }
                    callback;
                }
            });
        }

        function createmainui(container, obj) {
            container.addClass("smarttable");
            var lengthinput = obj["lengthinput"];
            var length = obj["length"];
            var dataview = obj["dataview"];
            var cols = obj["columns"];
            var txt = '<div class="headarea">';
            if(obj.actions.length){
                txt += '<label class="lengthinputcont">Length: <select class="form-control lengthinput" type="text">';
                $.each(lengthinput, function(k, v) {
                    txt += '<option value="' + v + '">' + v + '</option>';
                });
                txt += '</select></label>';
            }
            if(obj.actions.order){
                txt += '<label class="orderinputcont">Order by: <select class="form-control orderinput" type="text">';
                $.each(cols, function(k, v) {
                    if (v.orderable == "true") {
                        txt += '<option value="' + k + '">' + v.data + '</option>';
                    }
                });
                txt += '</select></label>';

                txt += '<label class="ordertypeinputcont">Order dir: <select class="form-control ordertypeinput" type="text">';
                txt += '<option value="asc">asc</option>';
                txt += '<option value="desc">desc</option>';
                txt += '</select></label>';
            }
            if(obj.actions.view){
                txt += '<label class="viewtypecont">View: <select class="form-control viewtypeinput" type="text">';
                txt += '<option value="table">table</option>';
                txt += '<option value="grid">grid</option>';
                txt += '</select></label>';
            }
            if(obj.actions.search){
                txt += '<label class="searchtablecont"><input class="form-control searchtable" placeholder="Search"  type="text"></label>';
            }
            txt += '</div>';
            var clsname = container.attr("class") + "_smtable";
            if (dataview == "table") {
                txt += '<table class="table ' + clsname + ' table-bordered" type="text"></table>';

            } else if (dataview == "grid") {
                txt += '<div class="gridcontainer"><ul class="table ' + clsname + '" type="text"></ul></div>';

            }
            txt += '<div class="tablefooterarea"><div class="resultslbl">Total:</div><div class="statuslbl"><div class="smtableloader"></div>Loading...</div><nav><ul class="pagination"></ul></nav></div>';
            container.append(txt);
            container.find(".headarea > .lengthinputcont > .lengthinput").val(length);
            $(".viewtypeinput").val(obj["dataview"]);
            if (dataview == "table") {
                createthead(container, obj);
            }
        }
        function createthead(container, obj) {
            cols = obj["columns"];
            ordercol = obj["order"]["column"];
            container.find("thead").append("<tr>");
            var thead = "<thead class='thead-light'><tr>";
            $.each(cols, function(k, v) {
                thead += "<th style='width:" + v.width + "'>";
                thead += "<a  data='" + k + "' class='headerlinks'>" + v.name + '</a>';
                thead += "</th>";
            });
            thead += "</tr></thead>";
            if (container.find("table").find("thead").length == 0) {
                container.find("table").append(thead);
            }
        }
        function createpaginator(draw, pagescount, container) {
            if (draw == 1) {
                container.find(".pagination").append('<li class="page-item prev disabled"><a class="page-link prev" href="#">Previous</a></li>');
            } else {
                container.find(".pagination").append('<li class="page-item prev"><a class="page-link prev" href="#">Previous</a></li>');
            }
            for (i = 0; i < pagescount; i++) {
                if (i + 1 == draw) {
                    container.find(".pagination").append('<li class="page-item active"><a class="page-link" href="#">' + (i + 1) + '</a></li>');
                } else {
                    container.find(".pagination").append('<li class="page-item"><a class="page-link" href="#">' + (i + 1) + '</a></li>');
                }
            }
            if (draw == pagescount) {
                container.find(".pagination").append('<li class="page-item next disabled"><a class="page-link next" href="#">Next</a></li>');
            } else {
                container.find(".pagination").append('<li class="page-item next"><a class="page-link next" href="#">Next</a></li>');
            }
            container.find(".pagination").find(".page-item").find(".page-link").off('click').on('click', function() {
                var currentdraw = parseInt(container.find(".tablefooterarea > nav > ul.pagination > .page-item.active > a").html());
                var newdraw = parseInt($(this).html());
                if (currentdraw != newdraw) {
                    container.find(".pagination").empty();
                    if ($(this).hasClass("prev")) {
                        var draw = currentdraw - 1;
                    } else if ($(this).hasClass("next")) {
                        var draw = currentdraw + 1;
                        console.log(draw);
                    } else {
                        var draw = $(this).html();
                    }
                    var start = (draw - 1) * container.find(".headarea > .lengthinputcont > .lengthinput").val();
                    var newobj = obj;
                    newobj.draw = draw;
                    newobj.start = start;
                    newobj.length = container.find(".headarea > .lengthinputcont > .lengthinput").val();
                    updatedraw(newobj, container);
                    return false;
                }
            });
        }
        return this.each(function() {
            var container = $(this);
            obj.draw = 1;
            obj.start = 0;
            obj.search = {};
            obj.search.value = "";
            obj.search.regex = "false";
            createmainui(container, obj);
            updatedraw(obj, container,updatedrawCallback(container, obj));
        });
    }
});
