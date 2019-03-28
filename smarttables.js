jQuery.fn.extend({
    SmartTable: function(obj) {

        var updatedrawCallback = function(container, obj) {
            var linput = container.find(".headarea > .lengthinputcont > .lengthinput");
            var oinput = container.find(".headarea > .orderinputcont > .orderinput");
            var otinput = container.find(".headarea > .ordertypeinputcont > .ordertypeinput");
            var pagin = container.find(".pagination");
            linput.off('change').on('change', function() {
                container.find("ul.table").empty();
                pagin.empty();
                var newobj = obj;
                newobj.length = linput.val();
                newobj.draw = 1;
                newobj.start = 0;
                updatedraw(newobj, container);

            });

            oinput.off('change').on('change', function() {
                container.find("ul.table").empty();
                var colid = $(this).val();
                console.log(colid);
                pagin.empty();
                var newobj = obj;
                newobj.length = linput.val();
                newobj.draw = 1;
                newobj.start = 0;
                newobj.order.column = colid;
                newobj.order.dir = otinput.val();
                updatedraw(newobj, container);

            });

            otinput.off('change').on('change', function() {
                container.find("ul.table").empty();
                //                container.find("table").find("tbody").empty();
                pagin.empty();
                var newobj = obj;
                newobj.length = parseInt(linput.val());
                newobj.draw = 1;
                newobj.start = 0;
                newobj.order.dir = $(this).val();
                console.log(newobj);
                updatedraw(newobj, container)

            });

            $(".viewtypeinput").off('change').on('change', function() {
                container.find("ul.table").empty();
                container.find("table").find("tbody").empty();
                pagin.empty();
                var newobj = obj;
                newobj.length = parseInt(linput.val());
                newobj.draw = 1;
                newobj.start = 0;
                newobj.dataview = $(this).val();
                console.log(newobj);
                container.empty();
                createmainui(container, obj);
                updatedraw(obj, container, updatedrawCallback(container, obj));

            });

            $(".searchtable").off("keyup").on("keyup", function(e) {
                if (e.keyCode == 13) {
                    container.find("ul.table").empty();
                    pagin.empty();
                    var newobj = obj;
                    newobj.length = parseInt(linput.val());
                    newobj.draw = 1;
                    newobj.start = 0;
                    newobj.search.value = $(this).val();
                    updatedraw(newobj, container);
                }
            });
        };

        function updatedraw(obj, container, callback) {
            cols = obj["columns"];
            var url = obj["ajax"]["url"];
            var method = obj["ajax"]["method"];
            $.ajax({
                url: url,
                method: method,
                data: obj,
                success: function(data) {
                    var jsondata = JSON.parse(data);
                    var total = jsondata.recordsFiltered;
                    var dataview = obj["dataview"];
                    var length = parseInt($(".lengthinput").val());
                    var pagescount = 0;
                    if (total % length == 0) {
                        pagescount = parseInt(total / length);
                    } else {
                        pagescount = parseInt(total / length) + 1;
                    }
                    if (dataview == "table") {
                        var tbody = "<tbody>";
                        var arraydata = jsondata.data;
                        $.each(arraydata, function(k, v) {
                            tbody += "<tr>";
                            $.each(cols, function(k1, v1) {
                                tbody += "<td>" + v[v1.data] + "</td>";
                            });
                            tbody += "</tr>";
                        });
                        tbody += "</tbody>";
                        //  container.find("table").find("tbody").empty();
                        var tbodyexist = container.find("table").find("tbody").length > 0;
                        if (tbodyexist) {
                            container.find("table").find("tbody").replaceWith(tbody);
                        } else {
                            container.find("table").append(tbody);
                        }

                    } else if (dataview == "grid") {
                        var tbody = "";
                        var arraydata = jsondata.data;
                        $.each(arraydata, function(k, v) {
                            tbody += "<li>";
                            $.each(cols, function(k1, v1) {
                                tbody += "<div>" + v1.name + ": " + v[v1.data] + "</div>";
                            });
                            tbody += "</li>";
                        });
                        container.find("ul.table").append(tbody);
                    }
                    createpaginator(obj["draw"], pagescount, container);
                    callback;

                }
            });

        }

        function createmainui(container, obj) {
            console.log(obj);
            var lengthinput = obj["lengthinput"];
            var length = obj["length"];
            var dataview = obj["dataview"];
            var cols = obj["columns"];
            var txt = '<div class="headarea"><label class="lengthinputcont">Length: <select class="form-control lengthinput" type="text">';
            $.each(lengthinput, function(k, v) {
                txt += '<option value="' + v + '">' + v + '</option>';
            });
            txt += '</select></label>';


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

            txt += '<label class="viewtypecont">View: <select class="form-control viewtypeinput" type="text">';
            txt += '<option value="table">table</option>';
            txt += '<option value="grid">grid</option>';
            txt += '</select></label>';

            txt += '<label class="searchtablecont"><input class="form-control searchtable" placeholder="Search"  type="text"></label></div>';

            var clsname = container.attr("class") + "_smtable";
            if (dataview == "table") {
                txt += '<table class="table ' + clsname + ' table-bordered" type="text"></table>';

            } else if (dataview == "grid") {
                txt += '<ul class="table ' + clsname + '" type="text"></ul>';

            }

            txt += '<div class="tablefooterarea"><nav aria-label="Page navigation example"><ul class="pagination"></ul></nav></div>';
            container.append(txt);
            $(".lengthinput").val(length);
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
            $(".page-link").off('click').on('click', function() {
                var currentdraw = parseInt($(".page-item.active > a").html());
                container.find("ul.table").empty();
                container.find(".pagination").empty();

                if ($(this).hasClass("prev")) {
                    var draw = currentdraw - 1;
                } else if ($(this).hasClass("next")) {
                    var draw = currentdraw + 1;
                    console.log(draw);
                } else {
                    var draw = $(this).html();
                }
                var start = (draw - 1) * $(".lengthinput").val();
                var newobj = obj;
                newobj.draw = draw;
                newobj.start = start;
                newobj.length = $(".lengthinput").val();
                updatedraw(newobj, container);
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
            updatedraw(obj, container, updatedrawCallback(container, obj));
        });
    }
});
