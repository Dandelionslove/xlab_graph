window.addEventListener('load', initAll);

function initAll() {
    $(document).ready(function () {
        //上传文件按钮
        var submit_btn = d3.select('button#submit_btn');
        submit_btn.on('click', function (e) {
            var file_obj = d3.select('input#json_file');
            if (file_obj.attr('value') == "") {
                console.log('未选择文件');
            }
            var files = $('#json_file').prop('files');
            if (files.length == 0) {
                alert('请选择文件');
            }
            else {
                var reader = new FileReader();
                reader.readAsText(files[0], 'UTF-8');
                reader.addEventListener('load', function (e) {
                    var fileString = e.target.result;
                    var jsonObj = $.parseJSON(fileString);
                    // console.log(typeof(jsonObj));
                    // console.log(jsonObj);
                    // $.getJSON('json/service-catalogue.json', "", function (_data) {
                    var data = jsonObj['edgeLists'];
                    var nodesName = [];
                    var my_nodes = []; //{name:node_name}
                    // var nodesX = [];
                    // var nodesY = [];
                    var my_links = [];  //有向边{source,target}
                    var my_lines = [];  //无向边{source, target}
                    // var my_possible_lines = []; //两边都是圆圈的情况

                    var text_div = d3.select('body').append('div').attr('class', 'text_div');
                    var p1 = text_div.append('p').attr('class', 'p1').text('当前选中节点：');
                    var span1 = p1.append('span').text('无');
                    var paths_string_div = text_div.append('div').attr('class', 'paths_string_div');
                    // var p2 = text_div.append('p').attr('class', 'p2').text('根因追溯图：');
                    // var span2 = p2.append('span');
                    var clear_cause_type = 1; // -->
                    var possible_cause_type_o_o = 2; // o--o
                    var possible_cause_type_line = 3; // --
                    var possible_cause_type_o_a = 4; // o-->
                    // var nodesType = [];  //nodesType应该视具体连接的两点间的关系而定
                    for (var item in data) {
                        let edgeSets = data[item]; //获得边集
                        for (let i = 0; i < edgeSets.length; i++) //依次处理每个边集中的边
                        {
                            var edge = edgeSets[i];
                            var node1;
                            var node2;
                            if (edge.hasOwnProperty('node1') && edge.hasOwnProperty('node2')) {
                                node1 = edge['node1'];
                                node2 = edge['node2'];
                                let node1Type = edge['endpoint1'].ordinal;
                                let node2Type = edge['endpoint2'].ordinal;
                                let node1name = node1.name;
                                let node2name = node2.name;
                                let link;
                                let node1Index = -1;
                                let node2Index = -1;
                                //处理点的信息
                                if (nodesName.indexOf(node1name) === -1) {
                                    nodesName[nodesName.length] = node1name;
                                    // nodesX[nodesX.length] = node1['centerX'];
                                    // nodesY[nodesY.length] = node1['centerY'];
                                    my_nodes[my_nodes.length] = {name: node1name};
                                }
                                if (nodesName.indexOf(node2name) === -1) {
                                    nodesName[nodesName.length] = node2name;
                                    // nodesX[nodesX.length] = node2['centerX'];
                                    // nodesY[nodesY.length] = node2['centerY'];
                                    my_nodes[my_nodes.length] = {name: node2name};
                                }
                                node1Index = nodesName.indexOf(node1name);
                                node2Index = nodesName.indexOf(node2name);
                                //把该边信息加入my_links/my_lines
                                link = {source: node1Index, target: node2Index};
                                if (node1Type == 1 && node2Type == 0) { // <--
                                    if (!is_included_in_links(my_links, node2Index, node1Index)) {
                                        my_links.push({
                                            source: node2Index,
                                            target: node1Index,
                                            link_type: clear_cause_type
                                        });
                                    }
                                }
                                else if (node1Type == 0 && node2Type == 1) { // -->
                                    if (!is_included_in_links(my_links, node1Index, node2Index)) {
                                        my_links.push({
                                            source: node1Index,
                                            target: node2Index,
                                            link_type: clear_cause_type
                                        });
                                    }
                                }
                                else if (node1Type == 1 && node2Type == 2) { // <--o
                                    if (!is_included_in_links(my_links, node2Index, node1Index)) {
                                        my_links.push({
                                            source: node2Index,
                                            target: node1Index,
                                            link_type: possible_cause_type_o_a
                                        });
                                    }
                                }
                                else if (node1Type == 2 && node2Type == 1) // o-->
                                {
                                    if (!is_included_in_links(my_links, node1Index, node2Index)) {
                                        my_links.push({
                                            source: node1Index,
                                            target: node2Index,
                                            link_type: possible_cause_type_o_a
                                        });
                                    }
                                }
                                else if (node1Type == 2 && node2Type == 2) // o--o 两边都是圈的情况
                                {
                                    if (!is_included_in_links(my_lines, node1Index, node2Index)) {
                                        my_lines.push({
                                            source: node1Index,
                                            target: node2Index,
                                            link_type: possible_cause_type_o_o
                                        });
                                    }
                                    // if(!is_included_in_links(my_lines, node2Index, node1Index))
                                    // {
                                    //     my_lines.push({source:node2Index, target:node1Index, link_type:possible_cause_type_o_o});
                                    // }
                                }
                                // else if (!is_included_in_links(my_lines, node1Index, node2Index)) {
                                //     my_lines.push({source: node1Index, target: node2Index, link_type: possible_cause_type_line});
                                // }
                                else if (node1Type == 0 && node2Type == 0) // -- 一条线的情况
                                {
                                    if (!is_included_in_links(my_lines, node1Index, node2Index)) {
                                        my_lines.push({
                                            source: node1Index,
                                            target: node2Index,
                                            link_type: possible_cause_type_line
                                        });
                                    }
                                    // if(!is_included_in_links(my_lines, node2Index, node1Index))
                                    // {
                                    //     my_lines.push({source:node2Index, target:node1Index, link_type:possible_cause_type_o_o});
                                    // }
                                }
                            }
                        }
                    }

                    function is_included_in_links(_links, _source, _target) {
                        for (var i = 0; i < _links.length; i++) {
                            let cur_link = _links[i];
                            if (cur_link.source === _source && cur_link.target === _target) {
                                return true;
                            }
                        }
                        return false;
                    }

                    build(my_nodes, my_links, my_lines);

                    function build(nodes, links, lines) {

                        var width = 1024;
                        var height = 1024;
                        var total_links_lines = [];
                        var node_distance = 180; // 节点之间的距离
                        var sources = [];  // 记录点击的节点的因节点,存的是节点的index
                        var sources_layer = []; //记录每个因节点对应的因的层级
                        var sources_path = []; //记录因节点path箭头
                        var sources_line = []; //记录可能因节点的线条
                        // var sources_type = [];//记录因节点的类型，直接，可能之类的
                        var circle_r = 20; // 节点的半径
                        var current_clicked_node_name; // 记录当前点击的节点的名字
                        var is_clicked_twice = false; // 判断是否点击相同的点，是的话变回原色

                        //节点颜色
                        var usual_color = "#8B658B";
                        var target_color = "#00CED1";
                        // var cause_color = "red";
                        //构建了11层的因节点颜色
                        var cause_layer_color =
                            ['#FFC0CB',
                                '#f1bf88',
                                '#f1b788',
                                '#f1a688',
                                '#f19c88',
                                '#f19188',
                                '#f18889',
                                '#f1889f',
                                '#f188aa',
                                '#f188c3',
                                '#f188d0',
                                '#f188df'];

                        //path颜色
                        var usual_path_color = '#62aeef';
                        // var cause_path_color = '';


                        //line颜色，无向线
                        // var line_color = '#add8e6';
                        var usual_line_color = '#add8e6';
                        // var possible_line_color = "#008B8B";
                        // var possible_line_hilight_color = "#fb5b56";

                        var clear_path_color = '#f00';
                        var possible_path_color = '#67f4ea'; //#62aeef
                        var possible_line_color = '#67f4ea'; //#0c7edf

                        //用于text区域展示
                        var target_source_json_obj = {};
                        var paths_string = []; //用于展示根源路径的字符串

                        for (var i = 0; i < links.length; i++) {
                            total_links_lines.push(links[i]);
                        }
                        for (var i = 0; i < lines.length; i++) {
                            total_links_lines.push(lines[i]);
                        }
                        // for(var i=0;i<possible_lines.length;i++)
                        // {
                        //     total_links_lines.push(possible_lines[i]);
                        // }

                        if (window.innerWidth) {
                            width = window.innerWidth;
                        }
                        else if (document.body && document.body.clientWidth) {
                            width = document.body.clientWidth;
                        }
                        if (window.innerHeight) {
                            height = window.innerHeight;
                        }
                        else if (document.body && document.body.clientHeight) {
                            height = document.body.clientHeight;
                        }

                        var svg = d3.select("body")
                            .append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .attr('class', 'total_graph');
                        // 通过布局来转换数据，然后进行绘制
                        var simulation = d3.forceSimulation(nodes)
                        // .force("link", d3.forceLink(links).distance(100))
                            .force("link", d3.forceLink(total_links_lines).distance(node_distance))
                            .force("charge", d3.forceManyBody())//创建多体力
                            .force("center", d3.forceCenter(width * 0.6, height / 2));

                        simulation
                            .nodes(nodes)//设置力模拟的节点
                            .on("tick", ticked);

                        simulation.force("link")//添加或移除力
                        // .links(links);//设置连接数组
                            .links(total_links_lines);//设置连接数组
                        var color = d3.scaleOrdinal(d3.schemeCategory20);
                        //添加描述节点的文字
                        var svg_texts = svg.selectAll("text")
                            .data(nodes)
                            .enter()
                            .append("text")
                            .style("fill", "black")
                            .attr("dx", 20)
                            .attr("dy", 8)
                            .text(function (d) {
                                return d.name;
                            });

                        // 绘制带箭头的线path
                        // var defs = svg.append('defs');
                        // var arrowMarker = defs.append('marker')
                        //     .attr('id', 'arrow')
                        //     .attr('markerUnits', 'strokeWidth')
                        //     .attr('markerWidth', "20")
                        //     .attr('markerHeight', "20")
                        //     .attr('viewBox', '0 0 20 20')
                        //     .attr('refX', "6")
                        //     .attr('refY', "6")
                        //     .attr('orient', 'auto');
                        // var arrowPath = "M2,2 L10,6 L2, 10 L6,6 L2,2";
                        // arrowMarker.append("path").attr("d",arrowPath).attr("fill","#000");
                        // var svg_links = svg.selectAll("line")
                        //     .data(links)
                        //     .enter()
                        //     .append("line")
                        //     .style("stroke","#ccc")
                        //     .style("stroke-width",1)
                        //     .attr("marker-end", "url(#arrow)")
                        //     .call(d3.zoom()//创建缩放行为
                        //         .scaleExtent([-5, 2])//设置缩放范围
                        //     );
                        var svg_links = svg.selectAll("path")
                            .data(links)
                            .enter()
                            .append("path")
                            .style("stroke", usual_path_color)
                            .style("stroke-width", 2)
                            // .attr("marker-mid", "url(#arrow)")
                            .call(d3.zoom()//创建缩放行为
                                .scaleExtent([-5, 2])//设置缩放范围
                            );
                        //绘制不带箭头的线line
                        var svg_lines = svg.selectAll('line')
                            .data(lines)
                            .enter()
                            .append('line')
                            .style('stroke', function (d, i) {
                                // if (d.link_type == possible_cause_type_o_o) {  //颜色待改
                                //     return possible_line_color;
                                // }
                                // else {
                                //     return line_color;
                                // }
                                return usual_line_color;
                            })
                            .style('stroke-width', function (d, i) {
                                if (d.link_type == possible_cause_type_o_o) { //线粗待改
                                    return 2;
                                }
                                else {
                                    return 2;
                                }
                            })
                            .call(d3.zoom().scaleExtent([-5, 2]));

                        // var svg_possible_lines = svg.append("g").selectAll("line")
                        //     .data(possible_lines)
                        //     .enter()
                        //     .append("line")
                        //     .attr("class", "possible_line")
                        //     .style("stroke", possible_line_color)
                        //     .style("stroke-width", 1)
                        //     .call(d3.zoom().scaleExtent([-5,2]));

                        //绘制节点
                        var svg_nodes = svg.selectAll("circle")
                            .data(nodes)
                            .enter()
                            .append("circle")
                            .attr("cx", function (d) {
                                return d.x;
                            })
                            .attr("cy", function (d) {
                                return d.y;
                            })
                            .attr("r", circle_r)
                            .attr("fill", function (d, i) {
                                // return color(i);
                                return usual_color;
                            }).call(d3.drag().on("start", dragstarted)//d3.drag() 创建一个拖曳行为
                                .on("drag", dragged)
                                .on("end", dragended))
                            .on('click', function (d, i) {
                                current_clicked_node_name = d.name;
                                // console.log(this);
                                if (d3.select(this).attr('fill') === target_color) {
                                    is_clicked_twice = true;
                                    // recoverNodes();
                                    // recoverPathsAndLines();
                                    // recoverData();
                                }
                                // else
                                // {
                                //     is_clicked_twice=false;
                                searchSources(d.name);
                                hilightNodes();
                                hilightPathsAndLines();

                                update_text();
                                // is_clicked_twice = false;
                            });

                        //绘制箭头在线条中间的path
                        function drawLineArrow(x1, y1, x2, y2) {
                            var path;
                            var slopy, cosy, siny;
                            var Par = 10.0;
                            var x3, y3;
                            slopy = Math.atan2((y1 - y2), (x1 - x2));
                            cosy = Math.cos(slopy);
                            siny = Math.sin(slopy);
                            path = "M" + x1 + "," + y1 + " L" + x2 + "," + y2;
                            x3 = (Number(x1) + Number(x2)) / 2;
                            y3 = (Number(y1) + Number(y2)) / 2;
                            path += " M" + x3 + "," + y3;
                            path += " L" + (Number(x3) + Number(Par * cosy - (Par / 2.0 * siny))) + "," + (Number(y3) + Number(Par * siny + (Par / 2.0 * cosy)));
                            path += " M" + (Number(x3) + Number(Par * cosy + Par / 2.0 * siny) + "," + (Number(y3) - Number(Par / 2.0 * cosy - Par * siny)));
                            path += " L" + x3 + "," + y3;
                            return path;
                        }

                        function dragstarted(d) {
                            if (!d3.event.active) simulation.alphaTarget(0.3).restart();//设置目标α
                            d.fx = d.x;
                            d.fy = d.y;
                        }

                        function dragged(d) {
                            d.fx = d3.event.x;
                            d.fy = d3.event.y;
                        }

                        function dragended(d) {
                            if (!d3.event.active) simulation.alphaTarget(0);
                            d.fx = null;
                            d.fy = null;
                        }

                        function ticked() {
                            svg_links.attr('d', function (d) {
                                return drawLineArrow(d.source.x, d.source.y, d.target.x, d.target.y);
                            });

                            svg_lines.attr("x1", function (d) {
                                return d.source.x;
                            })
                                .attr("y1", function (d) {
                                    return d.source.y;
                                })
                                .attr("x2", function (d) {
                                    return d.target.x;
                                })
                                .attr("y2", function (d) {
                                    return d.target.y;
                                });
                            // .attr('marker-end','url(#arrow)');

                            svg_nodes.attr("cx", function (d) {
                                return d.x;
                            })
                                .attr("cy", function (d) {
                                    return d.y;
                                });

                            svg_texts.attr("x", function (d) {
                                return d.x;
                            })
                                .attr("y", function (d) {
                                    return d.y;
                                });
                        }

                        //******** target_source_json_obj格式：*******//
                        // {
                        //      name:
                        //      children:[
                        //          {
                        //              name:
                        //              index:
                        //              type:
                        //              children:[......]
                        //          }
                        //          {......}
                        //              ]
                        //  }
                        //*******************************************//
                        function searchSources(_nodeName) {
                            sources = [];
                            sources_layer = [];
                            sources_path = [];
                            sources_line = [];
                            // sources_type = [];
                            var nodeIndex = nodesName.indexOf(_nodeName);
                            if (nodeIndex === -1) {
                                return [];
                            }
                            // var sources = [];
                            sources.push(nodeIndex);
                            sources_layer.push(0); //本身节点是第0层
                            //target的json数据
                            var target_json = {};
                            // target_json.sources = [];
                            target_json.children = [];
                            target_json.name = _nodeName;
                            target_json.index = nodeIndex;
                            target_json.type = 0; //0代表这是target节点
                            // target_source_json_obj.push(target_json);
                            target_source_json_obj = target_json;
                            //利用广度优先搜索算法来向上搜索source节点
                            _searchSources(nodeIndex, 1, target_json); // 1代表搜索第一层因节点
                        }

                        function _searchSources(_target_index, current_layer, _target_json) {
                            var sub_sources = [];
                            var target_index = _target_index;
                            //************只在links中查找****************
                            // for(var link_index in my_links)
                            // {
                            //     let link=my_links[link_index];
                            //     if(link.target.index === target)
                            //     {
                            //         if(sub_sources.includes(link.source.index))
                            //         {
                            //             continue;
                            //         }
                            //         //记录因节点index信息和layer信息
                            //         sub_sources.push(link.source.index);
                            //         sources_layer.push(current_layer);
                            //         //记录因节点到当前果节点的link信息
                            //         sources_path.push(link);
                            //         //构建新的json数据来展示因果树形图
                            //         var _source_json = {};
                            //         // _source_json.sources = [];
                            //         _source_json.children = [];
                            //         _source_json.name = link.source.name;
                            //         _source_json.index = link.source.index;
                            //         _target_json.children.push(_source_json);
                            //     }
                            // }

                            //***********在所有links和line中查找
                            for (var link_index in total_links_lines) {
                                let link = total_links_lines[link_index];
                                if (link.link_type == possible_cause_type_o_o || link.link_type == possible_cause_type_line) {

                                    if ((link.source.index == target_index) && !is_clicked_twice)
                                    {
                                        console.log("target:" + target_index + "---" + link.source.index + "," + link.target.index);
                                        // link.source.index = link.target.index;
                                        // link.target.index = target_index;
                                        // if(is_clicked_twice)
                                        total_links_lines[link_index].source.index = total_links_lines[link_index].target.index;
                                        total_links_lines[link_index].target.index = target_index;
                                        link = total_links_lines[link_index];
                                        console.log("target:" + target_index + "---" + link.source.index + "," + link.target.index);

                                        // continue;
                                    }

                                }

                                if (link.target.index == target_index) {
                                    if (sub_sources.includes(link.source.index)) {
                                        continue;
                                    }
                                    // if (link.link_type === possible_cause_type_o_o) {
                                    //     continue;
                                    // }
                                    sub_sources.push(link.source.index);
                                    sources_layer.push(current_layer);
                                    // console.log(link.link_type);
                                    if (link.link_type === clear_cause_type || link.link_type === possible_cause_type_o_a)//path
                                    {
                                        sources_path.push(link);
                                    }
                                    else if (link.link_type === possible_cause_type_o_o || link.link_type === possible_cause_type_line) {
                                        sources_line.push(link);
                                    }
                                    // else
                                    // {
                                    //     continue;
                                    // }
                                    var _source_json = {};
                                    _source_json.children = [];
                                    _source_json.name = link.source.name;
                                    _source_json.index = link.source.index;
                                    _source_json.type = link.link_type;
                                    _target_json.children.push(_source_json);
                                }
                            }
                            if (sub_sources.length < 1) {
                                return;
                            }
                            sources.push.apply(sources, sub_sources);
                            // console.log("target index:"+target_index);
                            for (let i = 0; i < sub_sources.length; i++) {
                                // console.log(sub_sources[i]);
                                // if (sub_sources[i] == target_index) continue;
                                //此处要考虑双向的情况
                                _searchSources(sub_sources[i], current_layer + 1, _target_json.children[i]);
                            }
                        }

                        function recoverNodes() {
                            svg_nodes.attr('fill', function (d, i) {
                                return usual_color;
                            });
                        }

                        function recoverPathsAndLines() {
                            svg_links.style('stroke', function (d, i) {
                                return usual_path_color;
                            });
                            svg_lines.style('stroke', function (d, i) {
                                return usual_path_color;
                            });
                        }

                        function recoverData() {
                            sources = [];
                            target_source_json_obj = {};
                        }

                        function hilightNodes() // sources
                        {
                            svg_nodes.attr('fill', function (d, i) {
                                if (sources.indexOf(i) !== -1) {
                                    var in_sources_index = sources.indexOf(i);
                                    var current_source_layer = sources_layer[in_sources_index];
                                    if (d.name === current_clicked_node_name) {
                                        return is_clicked_twice ? usual_color : target_color;
                                    }
                                    return is_clicked_twice ? usual_color : cause_layer_color[current_source_layer - 1];
                                }
                                else {
                                    return usual_color;
                                }
                            })
                        }

                        function hilightPathsAndLines() // sources_path
                        {
                            svg_links.style('stroke', function (d, i) {
                                if (is_cause_path(d.source.index, d.target.index) && !is_clicked_twice) {
                                    // console.log(d);
                                    if (d.link_type === clear_cause_type) {
                                        return clear_path_color;
                                    }
                                    return possible_path_color;
                                }
                                return usual_path_color;
                            });

                            svg_lines.style('stroke', function (d, i) {
                                if (is_cause_line(d.source.index, d.target.index) && !is_clicked_twice) {
                                    // if(d.link_type === possible_cause_type_line)
                                    // {
                                    //     return possible_line_color;
                                    // }
                                    return possible_line_color;
                                }
                                // if (d.link_type === possible_cause_type_line) {
                                //     return line_color;
                                // }
                                // if (d.link_type === possible_cause_type_o_o) {
                                //     return possible_line_color;
                                // }
                                return usual_line_color;
                            })
                        }

                        function is_cause_path(_source, _target) {
                            for (var i = 0; i < sources_path.length; i++) {
                                var cur_path = sources_path[i];
                                if (_source === cur_path.source.index && _target === cur_path.target.index) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        // function hilightLines() // sources_line
                        // {
                        //
                        // }

                        function is_cause_line(_source, _target) {
                            for (var i = 0; i < sources_line.length; i++) {
                                var cur_path = sources_line[i];
                                if (_source === cur_path.source.index && _target === cur_path.target.index) {
                                    return true;
                                }
                            }
                            return false;
                        }

                        function update_text() {
                            if (is_clicked_twice) {
                                span1.text('无');
                                d3.select('div.text_div').select('svg').remove();
                                d3.select('div.sub_paths_string_div').remove();
                            }
                            else {
                                span1.text(current_clicked_node_name);
                                build_target_source_tree(target_source_json_obj);
                                show_paths_string();
                            }
                            is_clicked_twice=false;
                        }

                        function build_target_source_tree(json_data) {
                            //先删除旧的tree svg
                            d3.select('div.text_div svg').remove();
                            var margin = {top: 100, right: 10, bottom: 240, left: 10},
                                width = 340 - margin.left - margin.right,
                                height = 600 - margin.top - margin.bottom;

                            var orientation = {
                                "bottom-to-top": {
                                    size: [width, height],
                                    x: function (d) {
                                        return d.x
                                    },
                                    y: function (d) {
                                        return height - d.y;
                                    }
                                }
                            };

                            var svg = d3.select("div.text_div").append('svg')
                            // .datum(d3.entries(orientation))
                            // .enter().append("svg")
                                .attr("width", width + margin.left + margin.right)
                                .attr('height', height + margin.top + margin.bottom)
                                .append('g')
                                .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");

                            // var o=orientation.value;
                            var o = orientation["bottom-to-top"];
                            // console.log(o);
                            //Compute the layout
                            var treemap = d3.tree().size(o.size);
                            var nodes = d3.hierarchy(json_data);
                            treemap(nodes);
                            // console.log(nodes);
                            // console.log(nodes.descendants());
                            var links = nodes.descendants().slice(1);
                            // console.log(links);

                            // 绘制带箭头的线path
                            // var defs = svg.append('defs');
                            // var arrowMarker = defs.append('marker')
                            //     .attr('id', 'arrow')
                            //     .attr('markerUnits', 'strokeWidth')
                            //     .attr('markerWidth', "20")
                            //     .attr('markerHeight', "20")
                            //     .attr('viewBox', '0 0 20 20')
                            //     .attr('refX', "6")
                            //     .attr('refY', "6")
                            //     .attr('orient', 'auto');
                            // var arrowPath = "M2,2 L10,6 L2, 10 L6,6 L2,2";
                            // arrowMarker.append("path").attr("d", arrowPath).attr("fill", "#000");

                            //Create the link lines
                            svg.selectAll(".link").data(links)
                                .enter().append("path")
                                .attr("class", "text_link")
                                // .style("marker-mid", "url(#arrow)")
                                .attr("d", function (d) {
                                    return "M" + d.x + "," + o.y(d)
                                        + "C" + d.x + "," + (o.y(d) + o.y(d.parent)) / 2
                                        + " " + d.parent.x + "," + (o.y(d) + o.y(d.parent)) / 2
                                        + " " + d.parent.x + "," + o.y(d.parent);
                                });

                            //Create the node circles
                            var node = svg.selectAll(".text_node")
                                .data(nodes.descendants())
                                .enter()
                                .append("g");
                            node.append("circle")
                                .attr("class", "text_node")
                                .attr("r", 4.5)
                                .attr("cx", o.x)
                                .attr("cy", o.y);
                            node.append("text")
                                .text(function (d) {
                                    return d.data.name;
                                })
                                .attr("x", o.x)
                                .attr("dx", 10)
                                .attr("dy", -5)
                                .attr("y", o.y);
                        }

                        function show_paths_string() {
                            build_paths_string();
                            d3.select('div.sub_paths_string_div').remove();
                            var sub_paths_string_div = d3.select('div.paths_string_div').append('div').attr('class', 'sub_paths_string_div');
                            sub_paths_string_div.append('br');
                            sub_paths_string_div.append('br');
                            for (var i = 0; i < paths_string.length; i++) {
                                var _path_string = paths_string[i].split(',').reverse().join('-->');
                                // console.log(_path_string);
                                sub_paths_string_div.append('p').text('根因路径' + (i + 1) + ':  ' + _path_string).attr('class', 'paths_string');
                            }
                        }

                        function build_paths_string() {
                            //广度优先构建路径字符串
                            paths_string = [];
                            var cur_node_name = current_clicked_node_name;
                            paths_string.push(cur_node_name);
                            _build_paths_string(target_source_json_obj.children, paths_string[0]);
                        }

                        function _build_paths_string(children, cur_string) {
                            if (children.length == 0) {
                                return;
                            }
                            var sub_string = [];
                            for (var i = 0; i < children.length; i++) {
                                sub_string.push(cur_string + ',' + children[i].name);
                            }
                            var cur_string_index_in_paths = paths_string.indexOf(cur_string);
                            paths_string.splice(cur_string_index_in_paths, 1);
                            for (var i = 0; i < sub_string.length; i++) {
                                paths_string.push(sub_string[i]);
                                _build_paths_string(children[i].children, sub_string[i]);
                            }
                        }
                    }

                    // })
                });
            }
        });
        // $.getJSON('json/service-catalogue.json', "", function (_data) {
        //     var data = _data['edgeLists'];
        //     var nodesName = [];
        //     var my_nodes = []; //{name:node_name}
        //     // var nodesX = [];
        //     // var nodesY = [];
        //     var my_links = [];  //有向边{source,target}
        //     var my_lines = [];  //无向边{source, target}
        //     // var my_possible_lines = []; //两边都是圆圈的情况
        //
        //     var text_div = d3.select('body').append('div').attr('class', 'text_div');
        //     var p1 = text_div.append('p').attr('class', 'p1').text('当前选中节点：');
        //     var span1 = p1.append('span').text('无');
        //     var p2 = text_div.append('p').attr('class', 'p2').text('根因追溯图：');
        //     // var span2 = p2.append('span');
        //     var clear_cause_type = 1;
        //     var possible_cause_type = 2;
        //     var non_possible_cause_type = 3;
        //     // var nodesType = [];  //nodesType应该视具体连接的两点间的关系而定
        //     for (var item in data) {
        //         let edgeSets = data[item]; //获得边集
        //         for (let i = 0; i < edgeSets.length; i++) //依次处理每个边集中的边
        //         {
        //             var edge = edgeSets[i];
        //             var node1;
        //             var node2;
        //             if (edge.hasOwnProperty('node1') && edge.hasOwnProperty('node2')) {
        //                 node1 = edge['node1'];
        //                 node2 = edge['node2'];
        //                 let node1Type = edge['endpoint1'].ordinal;
        //                 let node2Type = edge['endpoint2'].ordinal;
        //                 let node1name = node1.name;
        //                 let node2name = node2.name;
        //                 let link;
        //                 let node1Index = -1;
        //                 let node2Index = -1;
        //                 //处理点的信息
        //                 if (nodesName.indexOf(node1name) === -1) {
        //                     nodesName[nodesName.length] = node1name;
        //                     // nodesX[nodesX.length] = node1['centerX'];
        //                     // nodesY[nodesY.length] = node1['centerY'];
        //                     my_nodes[my_nodes.length] = {name: node1name};
        //                 }
        //                 if (nodesName.indexOf(node2name) === -1) {
        //                     nodesName[nodesName.length] = node2name;
        //                     // nodesX[nodesX.length] = node2['centerX'];
        //                     // nodesY[nodesY.length] = node2['centerY'];
        //                     my_nodes[my_nodes.length] = {name: node2name};
        //                 }
        //                 node1Index = nodesName.indexOf(node1name);
        //                 node2Index = nodesName.indexOf(node2name);
        //                 //把该边信息加入my_links/my_lines
        //                 link = {source: node1Index, target: node2Index};
        //                 if (node1Type == 1 && node2Type == 0) {
        //                     if (!is_included_in_links(my_links, node2Index, node1Index)) {
        //                         my_links.push({source: node2Index, target: node1Index, link_type: clear_cause_type});
        //                     }
        //                 }
        //                 else if (node1Type == 0 && node2Type == 1) {
        //                     if (!is_included_in_links(my_links, node1Index, node2Index)) {
        //                         my_links.push({source: node1Index, target: node2Index, link_type: clear_cause_type});
        //                     }
        //                 }
        //                 else if (node1Type == 2 && node2Type == 2) //两边都是圈的情况
        //                 {
        //                     if (!is_included_in_links(my_lines, node1Index, node1Index)) {
        //                         my_lines.push({source: node1Index, target: node2Index, link_type: possible_cause_type});
        //                     }
        //                     // if(!is_included_in_links(my_lines, node2Index, node1Index))
        //                     // {
        //                     //     my_lines.push({source:node2Index, target:node1Index, link_type:possible_cause_type});
        //                     // }
        //                 }
        //                 else if (!is_included_in_links(my_lines, node1Index, node2Index)) {
        //                     my_lines.push({source: node1Index, target: node2Index, link_type: non_possible_cause_type});
        //                 }
        //             }
        //         }
        //     }
        //
        //     function is_included_in_links(_links, _source, _target) {
        //         for (var i = 0; i < _links.length; i++) {
        //             let cur_link = _links[i];
        //             if (cur_link.source === _source && cur_link.target === _target) {
        //                 return true;
        //             }
        //         }
        //         return false;
        //     }
        //
        //     build(my_nodes, my_links, my_lines);
        //
        //     function build(nodes, links, lines) {
        //
        //         var width = 1024;
        //         var height = 1024;
        //         var total_links_lines = [];
        //         var node_distance = 180; // 节点之间的距离
        //         var sources = [];  // 记录点击的节点的因节点,存的是节点的index
        //         var sources_layer = []; //记录每个因节点对应的因的层级
        //         var sources_path = []; //记录因节点path箭头
        //         var sources_line = []; //记录可能因节点的线条
        //         // var sources_type = [];//记录因节点的类型，直接，可能之类的
        //         var circle_r = 20; // 节点的半径
        //         var current_clicked_node_name; // 记录当前点击的节点的名字
        //         var is_clicked_twice = false; // 判断是否点击相同的点，是的话变回原色
        //
        //         //节点颜色
        //         var usual_color = "#8B658B";
        //         var target_color = "#00CED1";
        //         // var cause_color = "red";
        //         //构建了11层的因节点颜色
        //         var cause_layer_color =
        //             ['#FFC0CB',
        //                 '#DB7093',
        //                 '#B03060',
        //                 '#FF3030',
        //                 '#CD2626',
        //                 '#8b636c',
        //                 '#8a2be2',
        //                 '#68228b',
        //                 '#53868b',
        //                 '#595959',
        //                 '#36648b',
        //                 '#0a0a0a'];
        //
        //         //path颜色
        //         var usual_path_color = '#add8e6';
        //         var cause_path_color = '#f00';
        //
        //         //line颜色，无向线
        //         var line_color = '#ccc';
        //         var possible_line_color = "#008B8B";
        //         var possible_line_hilight_color = "#C0FF3E";
        //
        //         //用于text区域展示
        //         var target_source_json_obj = {};
        //
        //         for (var i = 0; i < links.length; i++) {
        //             total_links_lines.push(links[i]);
        //         }
        //         for (var i = 0; i < lines.length; i++) {
        //             total_links_lines.push(lines[i]);
        //         }
        //         // for(var i=0;i<possible_lines.length;i++)
        //         // {
        //         //     total_links_lines.push(possible_lines[i]);
        //         // }
        //
        //         if (window.innerWidth) {
        //             width = window.innerWidth;
        //         }
        //         else if (document.body && document.body.clientWidth) {
        //             width = document.body.clientWidth;
        //         }
        //         if (window.innerHeight) {
        //             height = window.innerHeight;
        //         }
        //         else if (document.body && document.body.clientHeight) {
        //             height = document.body.clientHeight;
        //         }
        //
        //         var svg = d3.select("body")
        //             .append("svg")
        //             .attr("width", width)
        //             .attr("height", height)
        //             .attr('class', 'total_graph');
        //         // 通过布局来转换数据，然后进行绘制
        //         var simulation = d3.forceSimulation(nodes)
        //         // .force("link", d3.forceLink(links).distance(100))
        //             .force("link", d3.forceLink(total_links_lines).distance(node_distance))
        //             .force("charge", d3.forceManyBody())//创建多体力
        //             .force("center", d3.forceCenter(width * 0.6, height / 2));
        //
        //         simulation
        //             .nodes(nodes)//设置力模拟的节点
        //             .on("tick", ticked);
        //
        //         simulation.force("link")//添加或移除力
        //         // .links(links);//设置连接数组
        //             .links(total_links_lines);//设置连接数组
        //         var color = d3.scaleOrdinal(d3.schemeCategory20);
        //         //添加描述节点的文字
        //         var svg_texts = svg.selectAll("text")
        //             .data(nodes)
        //             .enter()
        //             .append("text")
        //             .style("fill", "black")
        //             .attr("dx", 20)
        //             .attr("dy", 8)
        //             .text(function (d) {
        //                 return d.name;
        //             });
        //
        //         // 绘制带箭头的线path
        //         // var defs = svg.append('defs');
        //         // var arrowMarker = defs.append('marker')
        //         //     .attr('id', 'arrow')
        //         //     .attr('markerUnits', 'strokeWidth')
        //         //     .attr('markerWidth', "20")
        //         //     .attr('markerHeight', "20")
        //         //     .attr('viewBox', '0 0 20 20')
        //         //     .attr('refX', "6")
        //         //     .attr('refY', "6")
        //         //     .attr('orient', 'auto');
        //         // var arrowPath = "M2,2 L10,6 L2, 10 L6,6 L2,2";
        //         // arrowMarker.append("path").attr("d",arrowPath).attr("fill","#000");
        //         // var svg_links = svg.selectAll("line")
        //         //     .data(links)
        //         //     .enter()
        //         //     .append("line")
        //         //     .style("stroke","#ccc")
        //         //     .style("stroke-width",1)
        //         //     .attr("marker-end", "url(#arrow)")
        //         //     .call(d3.zoom()//创建缩放行为
        //         //         .scaleExtent([-5, 2])//设置缩放范围
        //         //     );
        //         var svg_links = svg.selectAll("path")
        //             .data(links)
        //             .enter()
        //             .append("path")
        //             .style("stroke", usual_path_color)
        //             .style("stroke-width", 2)
        //             // .attr("marker-mid", "url(#arrow)")
        //             .call(d3.zoom()//创建缩放行为
        //                 .scaleExtent([-5, 2])//设置缩放范围
        //             );
        //         //绘制不带箭头的线line
        //         var svg_lines = svg.selectAll('line')
        //             .data(lines)
        //             .enter()
        //             .append('line')
        //             .style('stroke', function (d, i) {
        //                 if (d.link_type == possible_cause_type) {
        //                     return possible_line_color;
        //                 }
        //                 else {
        //                     return line_color;
        //                 }
        //             })
        //             .style('stroke-width', function (d, i) {
        //                 if (d.link_type == possible_cause_type) {
        //                     return 2;
        //                 }
        //                 else {
        //                     return 1;
        //                 }
        //             })
        //             .call(d3.zoom().scaleExtent([-5, 2]));
        //
        //         // var svg_possible_lines = svg.append("g").selectAll("line")
        //         //     .data(possible_lines)
        //         //     .enter()
        //         //     .append("line")
        //         //     .attr("class", "possible_line")
        //         //     .style("stroke", possible_line_color)
        //         //     .style("stroke-width", 1)
        //         //     .call(d3.zoom().scaleExtent([-5,2]));
        //
        //         //绘制节点
        //         var svg_nodes = svg.selectAll("circle")
        //             .data(nodes)
        //             .enter()
        //             .append("circle")
        //             .attr("cx", function (d) {
        //                 return d.x;
        //             })
        //             .attr("cy", function (d) {
        //                 return d.y;
        //             })
        //             .attr("r", circle_r)
        //             .attr("fill", function (d, i) {
        //                 // return color(i);
        //                 return usual_color;
        //             }).call(d3.drag().on("start", dragstarted)//d3.drag() 创建一个拖曳行为
        //                 .on("drag", dragged)
        //                 .on("end", dragended))
        //             .on('click', function (d, i) {
        //                 current_clicked_node_name = d.name;
        //                 // console.log(this);
        //                 if (d3.select(this).attr('fill') == target_color) {
        //                     is_clicked_twice = true;
        //                 }
        //                 searchSources(d.name);
        //                 // console.log(target_source_json_obj);
        //                 hilightNodes();
        //                 hilightPathsAndLines();
        //                 update_text();
        //                 is_clicked_twice = false;
        //             });
        //
        //         //绘制箭头在线条中间的path
        //         function drawLineArrow(x1, y1, x2, y2) {
        //             var path;
        //             var slopy, cosy, siny;
        //             var Par = 10.0;
        //             var x3, y3;
        //             slopy = Math.atan2((y1 - y2), (x1 - x2));
        //             cosy = Math.cos(slopy);
        //             siny = Math.sin(slopy);
        //             path = "M" + x1 + "," + y1 + " L" + x2 + "," + y2;
        //             x3 = (Number(x1) + Number(x2)) / 2;
        //             y3 = (Number(y1) + Number(y2)) / 2;
        //             path += " M" + x3 + "," + y3;
        //             path += " L" + (Number(x3) + Number(Par * cosy - (Par / 2.0 * siny))) + "," + (Number(y3) + Number(Par * siny + (Par / 2.0 * cosy)));
        //             path += " M" + (Number(x3) + Number(Par * cosy + Par / 2.0 * siny) + "," + (Number(y3) - Number(Par / 2.0 * cosy - Par * siny)));
        //             path += " L" + x3 + "," + y3;
        //             return path;
        //         }
        //
        //         function dragstarted(d) {
        //             if (!d3.event.active) simulation.alphaTarget(0.3).restart();//设置目标α
        //             d.fx = d.x;
        //             d.fy = d.y;
        //         }
        //
        //         function dragged(d) {
        //             d.fx = d3.event.x;
        //             d.fy = d3.event.y;
        //         }
        //
        //         function dragended(d) {
        //             if (!d3.event.active) simulation.alphaTarget(0);
        //             d.fx = null;
        //             d.fy = null;
        //         }
        //
        //         function ticked() {
        //             svg_links.attr('d', function (d) {
        //                 return drawLineArrow(d.source.x, d.source.y, d.target.x, d.target.y);
        //             });
        //
        //             svg_lines.attr("x1", function (d) {
        //                 return d.source.x;
        //             })
        //                 .attr("y1", function (d) {
        //                     return d.source.y;
        //                 })
        //                 .attr("x2", function (d) {
        //                     return d.target.x;
        //                 })
        //                 .attr("y2", function (d) {
        //                     return d.target.y;
        //                 });
        //             // .attr('marker-end','url(#arrow)');
        //
        //             svg_nodes.attr("cx", function (d) {
        //                 return d.x;
        //             })
        //                 .attr("cy", function (d) {
        //                     return d.y;
        //                 });
        //
        //             svg_texts.attr("x", function (d) {
        //                 return d.x;
        //             })
        //                 .attr("y", function (d) {
        //                     return d.y;
        //                 });
        //         }
        //
        //         //******** target_source_json_obj格式：*******//
        //         // {
        //         //      name:
        //         //      children:[
        //         //          {
        //         //              name:
        //         //              index:
        //         //              type:
        //         //              children:[......]
        //         //          }
        //         //          {......}
        //         //              ]
        //         //  }
        //         //*******************************************//
        //         function searchSources(_nodeName) {
        //             sources = [];
        //             sources_layer = [];
        //             sources_path = [];
        //             sources_line = [];
        //             // sources_type = [];
        //             var nodeIndex = nodesName.indexOf(_nodeName);
        //             if (nodeIndex === -1) {
        //                 return [];
        //             }
        //             // var sources = [];
        //             sources.push(nodeIndex);
        //             sources_layer.push(0); //本身节点是第0层
        //             //target的json数据
        //             var target_json = {};
        //             // target_json.sources = [];
        //             target_json.children = [];
        //             target_json.name = _nodeName;
        //             target_json.index = nodeIndex;
        //             target_json.type = 0; //0代表这是target节点
        //             // target_source_json_obj.push(target_json);
        //             target_source_json_obj = target_json;
        //             //利用广度优先搜索算法来向上搜索source节点
        //             _searchSources(nodeIndex, 1, target_json); // 1代表搜索第一层因节点
        //         }
        //
        //         function _searchSources(_target_index, current_layer, _target_json) {
        //             var sub_sources = [];
        //             var target_index = _target_index;
        //             //************只在links中查找****************
        //             // for(var link_index in my_links)
        //             // {
        //             //     let link=my_links[link_index];
        //             //     if(link.target.index === target)
        //             //     {
        //             //         if(sub_sources.includes(link.source.index))
        //             //         {
        //             //             continue;
        //             //         }
        //             //         //记录因节点index信息和layer信息
        //             //         sub_sources.push(link.source.index);
        //             //         sources_layer.push(current_layer);
        //             //         //记录因节点到当前果节点的link信息
        //             //         sources_path.push(link);
        //             //         //构建新的json数据来展示因果树形图
        //             //         var _source_json = {};
        //             //         // _source_json.sources = [];
        //             //         _source_json.children = [];
        //             //         _source_json.name = link.source.name;
        //             //         _source_json.index = link.source.index;
        //             //         _target_json.children.push(_source_json);
        //             //     }
        //             // }
        //
        //             //***********在所有links和line中查找
        //             for (var link_index in total_links_lines) {
        //                 let link = total_links_lines[link_index];
        //                 if (link.target.index === target_index) {
        //                     if (sub_sources.includes(link.source.index)) {
        //                         continue;
        //                     }
        //                     if (link.link_type === non_possible_cause_type) {
        //                         continue;
        //                     }
        //                     sub_sources.push(link.source.index);
        //                     sources_layer.push(current_layer);
        //                     // console.log(link.link_type);
        //                     if (link.link_type === clear_cause_type)//path
        //                     {
        //                         sources_path.push(link);
        //                     }
        //                     else if (link.link_type === possible_cause_type) {
        //                         sources_line.push(link);
        //                     }
        //                     // else
        //                     // {
        //                     //     continue;
        //                     // }
        //                     var _source_json = {};
        //                     _source_json.children = [];
        //                     _source_json.name = link.source.name;
        //                     _source_json.index = link.source.index;
        //                     _source_json.type = link.link_type;
        //                     _target_json.children.push(_source_json);
        //                 }
        //             }
        //             if (sub_sources.length < 1) {
        //                 return;
        //             }
        //             sources.push.apply(sources, sub_sources);
        //             // console.log("target index:"+target_index);
        //             for (let i = 0; i < sub_sources.length; i++) {
        //                 // console.log(sub_sources[i]);
        //                 if (sub_sources[i] == target_index) continue;
        //                 _searchSources(sub_sources[i], current_layer + 1, _target_json.children[i]);
        //             }
        //         }
        //
        //         function hilightNodes() // sources
        //         {
        //             svg_nodes.attr('fill', function (d, i) {
        //                 if (sources.indexOf(i) !== -1) {
        //                     var in_sources_index = sources.indexOf(i);
        //                     var current_source_layer = sources_layer[in_sources_index];
        //                     if (d.name == current_clicked_node_name) {
        //                         return is_clicked_twice ? usual_color : target_color;
        //                     }
        //                     return is_clicked_twice ? usual_color : cause_layer_color[current_source_layer - 1];
        //                 }
        //                 else {
        //                     return usual_color;
        //                 }
        //             })
        //         }
        //
        //         function hilightPathsAndLines() // sources_path
        //         {
        //             svg_links.style('stroke', function (d, i) {
        //                 if (is_cause_path(d.source.index, d.target.index) && !is_clicked_twice) {
        //                     return cause_path_color;
        //                 }
        //                 return usual_path_color;
        //             });
        //
        //             svg_lines.style('stroke', function (d, i) {
        //                 if (is_cause_line(d.source.index, d.target.index) && !is_clicked_twice) {
        //                     return possible_line_hilight_color;
        //                 }
        //                 if (d.link_type == non_possible_cause_type) {
        //                     return line_color;
        //                 }
        //                 if (d.link_type == possible_cause_type) {
        //                     return possible_line_color;
        //                 }
        //             })
        //         }
        //
        //         function is_cause_path(_source, _target) {
        //             for (var i = 0; i < sources_path.length; i++) {
        //                 var cur_path = sources_path[i];
        //                 if (_source == cur_path.source.index && _target == cur_path.target.index) {
        //                     return true;
        //                 }
        //             }
        //             return false;
        //         }
        //
        //         // function hilightLines() // sources_line
        //         // {
        //         //
        //         // }
        //
        //         function is_cause_line(_source, _target) {
        //             for (var i = 0; i < sources_line.length; i++) {
        //                 var cur_path = sources_line[i];
        //                 if (_source == cur_path.source.index && _target == cur_path.target.index) {
        //                     return true;
        //                 }
        //             }
        //             return false;
        //         }
        //
        //         function update_text() {
        //             if (is_clicked_twice) {
        //                 span1.text('无');
        //                 d3.select('div.text_div').select('svg').remove();
        //             }
        //             else {
        //                 span1.text(current_clicked_node_name);
        //                 build_target_source_tree(target_source_json_obj);
        //             }
        //         }
        //
        //         function build_target_source_tree(json_data) {
        //             //先删除旧的tree svg
        //             d3.select('div.text_div svg').remove();
        //             var margin = {top: 100, right: 10, bottom: 240, left: 10},
        //                 width = 340 - margin.left - margin.right,
        //                 height = 600 - margin.top - margin.bottom;
        //
        //             var orientation = {
        //                 "bottom-to-top": {
        //                     size: [width, height],
        //                     x: function (d) {
        //                         return d.x
        //                     },
        //                     y: function (d) {
        //                         return height - d.y;
        //                     }
        //                 }
        //             };
        //
        //             var svg = d3.select("div.text_div").append('svg')
        //             // .datum(d3.entries(orientation))
        //             // .enter().append("svg")
        //                 .attr("width", width + margin.left + margin.right)
        //                 .attr('height', height + margin.top + margin.bottom)
        //                 .append('g')
        //                 .attr('transform', 'translate(' + margin.left + "," + margin.top + ")");
        //
        //             // var o=orientation.value;
        //             var o = orientation["bottom-to-top"];
        //             // console.log(o);
        //             //Compute the layout
        //             var treemap = d3.tree().size(o.size);
        //             var nodes = d3.hierarchy(json_data);
        //             treemap(nodes);
        //             // console.log(nodes);
        //             // console.log(nodes.descendants());
        //             var links = nodes.descendants().slice(1);
        //             // console.log(links);
        //
        //             // 绘制带箭头的线path
        //             // var defs = svg.append('defs');
        //             // var arrowMarker = defs.append('marker')
        //             //     .attr('id', 'arrow')
        //             //     .attr('markerUnits', 'strokeWidth')
        //             //     .attr('markerWidth', "20")
        //             //     .attr('markerHeight', "20")
        //             //     .attr('viewBox', '0 0 20 20')
        //             //     .attr('refX', "6")
        //             //     .attr('refY', "6")
        //             //     .attr('orient', 'auto');
        //             // var arrowPath = "M2,2 L10,6 L2, 10 L6,6 L2,2";
        //             // arrowMarker.append("path").attr("d", arrowPath).attr("fill", "#000");
        //
        //             //Create the link lines
        //             svg.selectAll(".link").data(links)
        //                 .enter().append("path")
        //                 .attr("class", "text_link")
        //                 // .style("marker-mid", "url(#arrow)")
        //                 .attr("d", function (d) {
        //                     return "M" + d.x + "," + o.y(d)
        //                         + "C" + d.x + "," + (o.y(d) + o.y(d.parent)) / 2
        //                         + " " + d.parent.x + "," + (o.y(d) + o.y(d.parent)) / 2
        //                         + " " + d.parent.x + "," + o.y(d.parent);
        //                 });
        //
        //             //Create the node circles
        //             var node = svg.selectAll(".text_node")
        //                 .data(nodes.descendants())
        //                 .enter()
        //                 .append("g");
        //             node.append("circle")
        //                 .attr("class", "text_node")
        //                 .attr("r", 4.5)
        //                 .attr("cx", o.x)
        //                 .attr("cy", o.y);
        //             node.append("text")
        //                 .text(function (d) {
        //                     return d.data.name;
        //                 })
        //                 .attr("x", o.x)
        //                 .attr("dx", 10)
        //                 .attr("dy", -5)
        //                 .attr("y", o.y);
        //         }
        //     }
        // })
    })
}