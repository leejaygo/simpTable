//前端表格分页插件（后期拓展服务器端分页）
//params={sWrapDivId:"包含表格的id", sTableId:"传入表格id" ,aDatas:"表格数据", aHeadDatas:"表格头部数据", iDisplayNum:'显示条数', bIfPagination:'是否分页', bIfExport: "是否导出", bIfEdit:"是否允许编辑", bIfServerPage:"是否服务器端分页"}
function simpleTable(params){
	this._ostTable = null;//表格的dom对象
	this._outwrap = null;//表格的外层div

	this.bindData = params.aDatas;//表格中的数据
	this.bindTbHead = params.aHeadDatas;//表头数据

	this.wrapDivId = params.sWrapDivId;//包含表格div的id
	// this.outwrapDiv = document.getElementById(params.sWrapDivId);
	// this.outwrapDivWidth = this.outwrapDiv.style.width;
	// this.outwrapDivHeight = this.outwrapDiv.style.height;

	this.innerWarpDiv = null;

 	this.tableId = params.sTableId;//要生成的表格id

	this.itotalnum = params.aDatas.length;
	this.isinglePageNum = params.bIfPagination ? (params.iDisplayNum ? parseInt(params.iDisplayNum) : 15) : params.aDatas.length;//单页显示条数,如果不分页就全部显示，如果分页默认是15条，否则按照用户输入的条数

	this.ifPagination = params.bIfPagination;//是否翻页
	this.ifExport = params.bIfExport;//是否允许导出
	this.ifEdit = params.bIfEdit ? true : false;//是否允许编辑
	this.ifServerPage = params.bIfServerPage;//是否服务器端分页

	this.ipageNum = Math.ceil(this.itotalnum / this.isinglePageNum);//总页数
	//可选择页数
	this.aSelDisNum = [];
	this.aSelDisNum = this._execDisPageNumCh(this.isinglePageNum);

	this._currentPageNum = 1;//当前页数
	
	this.init();

	
}
//初始化表格
simpleTable.prototype.init = function (){
	var divid = this.wrapDivId;

	var _doc = document;
	var _d = _doc.getElementById(divid);//外层div
	//创建表格的外层div
	var _owrapDiv = _doc.createElement('div');
	_owrapDiv.className = "st_wrapper";
	_owrapDiv.id = "st_wrapper";
	_d.appendChild(_owrapDiv);
	this._outwrap = _owrapDiv;
	//创建表格的
	var _tb = _doc.createElement('table');
	_tb.id = this.tableId;
	_tb.setAttribute("cellspacing","0");
	_tb.setAttribute("cellpadding","0");
	_owrapDiv.appendChild(_tb);
	this._ostTable = _tb;
	//创建表格的thead和tbody
	this._ostTable.createTHead();
	//创建表格的内容区tbody
	var tbody = document.createElement('tbody');
	this._ostTable.appendChild(tbody);

	this._createTable();

	if(this.ifPagination){
		this._createDisplaySel();
		this._createPageSel();
		this._Displaytbinfo();
		this._initEvent();
	}

	this._createFooterPage();

	if(!this.ifEdit){
		this.cancelEdit();
	}

	var clearboth = document.createElement('div');
	clearboth.className = "st-clear";
	_owrapDiv.insertBefore(clearboth, this._ostTable);
	
}
//生成表格
simpleTable.prototype._createTable = function (){
	var _headData = this.bindTbHead,
	_allData = this.bindData;

	var curpagedata = this.getCurPageData(_allData, this._currentPageNum, this.isinglePageNum);

	this._createThead(_headData);
	this._createTbody(curpagedata);
}

/**
 * [_createThead description]
 * @param  {[array]} _headData [表格数组]
 */
simpleTable.prototype._createThead = function (_headData){
	var _t = this._ostTable;
	if(_t){
		var thead = _t.getElementsByTagName('thead')[0];
		this._clearChildDom(thead);
		var fg1 = document.createDocumentFragment();
		var _tr = document.createElement('tr');
		for(var k = 0, len = _headData.length; k < len; k++){
			var tmpth = document.createElement('th');
			tmpth.innerHTML = _headData[k];

			fg1.appendChild(tmpth);
		}
		_tr.appendChild(fg1);
		thead.appendChild(_tr);
	}
}
/**
 * [_createTbody description]
 * @param  {[array2]} _bodyData [二维数组]
 * @return {[type]}           [description]
 */
simpleTable.prototype._createTbody = function (_bodyData){
	var _t = this._ostTable;
	if(_t){
		var _doc = document;
		var tbody = _t.tBodies[0];
		this._clearChildDom(tbody);

		var fg2 = _doc.createDocumentFragment();
		var _otr = _doc.createElement('tr');
		var _otd = _doc.createElement('td');

		for(var i = 0, l =_bodyData.length; i < l; i++){
			var trb = _otr.cloneNode(false);
			if(( i + 1 ) % 2 !== 0){
				trb.className = 'st-odd';//奇数
			}else{
				trb.className = 'st-even';//偶数
			}

			for(var j = 0, l2 = _bodyData[i].length; j < l2; j++){
				var tdtmp = _otd.cloneNode(false);
				var _input = _doc.createElement('input');
				_input.value = _bodyData[i][j];

				var tmpval = '' + _bodyData[i][j];
				if(tmpval.length == 0){
					_input.size = 4;
					//_input.style.minWidth = 
				}else{
					_input.size = tmpval.length + 1;
				}
				tdtmp.appendChild(_input);
				trb.appendChild(tdtmp);
			}
			fg2.appendChild(trb);
		}
		tbody.appendChild(fg2);
	}
}

simpleTable.prototype.reDraw = function (){

}
//开始编辑
simpleTable.prototype.startEdit = function (){
	var inputs = this._ostTable.getElementsByTagName('input');

	for(var i = 0, len = inputs.length; i < len; i++){
		inputs[i].setAttribute('disabled', false);
	}

}
//取消编辑
simpleTable.prototype.cancelEdit = function (){
	var inputs = this._ostTable.getElementsByTagName('input');

	for(var i = 0, len = inputs.length; i < len; i++){
		inputs[i].setAttribute('disabled', true);
	}
}

simpleTable.prototype._initEvent = function (){
	var seldispagenum= document.getElementById('st-dispagenum');
	var selpage = document.getElementById('st-allpages');

	this.addEvtHandler('change', seldispagenum, pageNumChange);
	this.addEvtHandler('change', selpage, changePage);

	var that = this;
	function pageNumChange(){
		that.isinglePageNum = parseInt(seldispagenum.value);
		console.log(that.isinglePageNum)
		that._reDrawPageChange();
		that._disChoosePageData();
		that._changeInfo();
	}

	function changePage(){
		that._currentPageNum = parseInt(selpage.value);
		that._disChoosePageData();
		that._changeInfo();
	}
}

/*simpleTable.prototype._bindSelDisPage = function (){
	var seldispagenum= document.getElementById('st-dispagenum');
	var that = this;

	this.removeEvtHandler('change', seldispagenum, pageNumChange);
	this.addEvtHandler('change', seldispagenum, pageNumChange);

	function pageNumChange(){

	}
}

simpleTable.prototype._bindChangePage = function (){

}*/

//创建选择每页显示条数的下拉列表
simpleTable.prototype._createDisplaySel = function (){
	var anum = this.aSelDisNum;
	var cpdis = this.isinglePageNum;
	var _owpd = document.createElement('div');
	_owpd.style.display = "inline-block";
	_owpd.className = "st-pagenum-wrap";
	_owpd.id = "st-pagenum-wrap";

	var sopts = "";
	for(var i = 0, len = anum.length; i < len; i++){
		//if(anum[i] > 0){
			var opt = "<option value="+anum[i]+">"+anum[i]+"</option>";
			if(cpdis == anum[i]){
				opt = "<option value="+anum[i]+" selected=true>"+anum[i]+"</option>";
			}
			sopts += opt;
		//}
	}
	_owpd.innerHTML = "每页显示 "+"<select class='st-pagenum' id='st-dispagenum'>"+sopts+"</select> 条";
	//在表格前面插入表格
	this._outwrap.insertBefore(_owpd, this._ostTable);
}

simpleTable.prototype._execDisPageNumCh = function (isinglenum){
	var adis = [];
	var count = 0;
	var startnum = -10;
	while(count < 4){
		var pushdata = isinglenum + startnum;
		if( pushdata > 0 ){
			adis.push( pushdata );
			startnum = startnum + 5;
			count++
		}
	}

	return adis;
}

simpleTable.prototype._reDrawPageDisRec = function (){
	var disarr = this._execDisPageNumCh(this.isinglePageNum);
	this.aSelDisNum = disarr;

	var selwrapdiv = document.getElementById('st-pagenum-wrap');
	var seldiv = selwrapdiv.getElementsByTagName('select')[0];

	this._clearChildDom(seldiv);

	for(var i = 0, len = disarr.length; i < len; i++){
		var opt = document.createElement('option');
		opt.innerHTML = disarr[i];
		opt.value = disarr[i];
		seldiv.appendChild(opt);
	}

	// var options = selwrapdiv.getElementsByTagName('option');

	// console.log(options)
	// console.log(disarr)
	// for(var i = 0, len = options.length; i < len; i++){
	// 	// options[i].innerHTML = disarr[i];
	// 	// options[i].value = disarr[i];
	// 	console.log(options[i].innerHTML)
	// }
}
/**
 * [_reDrawPageChange 重新绘制页数]
 * @return {[type]} [description]
 */
simpleTable.prototype._reDrawPageChange = function (){
	var totalnum = this.ipageNum = Math.ceil(this.itotalnum / this.isinglePageNum);

	var pagechangediv = document.getElementById('st-pagesel-wrap');
	var seldiv = pagechangediv.getElementsByTagName('select')[0];
	this._clearChildDom(seldiv);
	var sopts = "";
	for(var i = 1; i <= totalnum; i++){
		var opt = "<option value="+i+">"+i+"</option>";
		sopts += opt;
	}
	seldiv.innerHTML = sopts;

	this._currentPageNum = 1;
}

simpleTable.prototype._createFooterPage = function (){
	var footpagediv = document.createElement('div');
	footpagediv.id = "st-fastpage";
	footpagediv.className = "st-fastpage";
	footpagediv.style.display = "inline-block"

	var span = document.createElement('span');
	span.id = "st-fastpage-first";
	span.innerHTML = "首页";
	// this._addClass(span, 'disabledbtn');
	span.className = 'disabledbtn';

	var span2 = document.createElement('span');
	span2.id = "st-fastpage-prev";
	span2.innerHTML = "上一页";
	span2.className = 'disabledbtn';

	var span3 = document.createElement('span');
	span3.id = "st-fastpage-next";
	span3.innerHTML = "下一页";


	var span4 = span.cloneNode(false);
	span4.id = "st-fastpage-last";
	span4.innerHTML = "尾页";

	footpagediv.appendChild(span);
	footpagediv.appendChild(span2);
	footpagediv.appendChild(span3);
	footpagediv.appendChild(span4);

	this._outwrap.appendChild(footpagediv);

	var that = this;
	footpagediv.onclick = function (e){
		var evt = e || window.event;
		var target = evt.target || evt.srcElement;

		if(that._hasClass(target,"disabledbtn")){
			return;
		}

		switch(target.id){
			case "st-fastpage-first":
			that._currentPageNum = 1;
			that._disChoosePageData();
			that._changeInfo();
			break;

			case "st-fastpage-prev":
			that._currentPageNum = that._currentPageNum - 1;
			that._disChoosePageData();
			that._changeInfo();
			break;

			case "st-fastpage-next":
			that._currentPageNum = that._currentPageNum + 1;
			that._disChoosePageData();
			that._changeInfo();
			break;

			case "st-fastpage-last":
			that._currentPageNum = that.ipageNum;
			that._disChoosePageData();
			that._changeInfo();
			break;
		}

		that.judgeCouldPage();
	}

}

simpleTable.prototype.judgeCouldPage = function (){
	var curpage = this._currentPageNum;
	if(curpage == 1){
		this._addClass(document.getElementById('st-fastpage-first'), 'disabledbtn');
		this._addClass(document.getElementById('st-fastpage-prev'), 'disabledbtn');  
	}else if(curpage == this.ipageNum){
		this._addClass(document.getElementById('st-fastpage-next'), 'disabledbtn');
		this._addClass(document.getElementById('st-fastpage-last'), 'disabledbtn');
	}else{
		this._removeClass(document.getElementById('st-fastpage-next'), 'disabledbtn');
		this._removeClass(document.getElementById('st-fastpage-last'), 'disabledbtn');
		this._removeClass(document.getElementById('st-fastpage-first'), 'disabledbtn');
		this._removeClass(document.getElementById('st-fastpage-prev'), 'disabledbtn');
	}


}

//页数列表,这个地方要改成datatables那种
simpleTable.prototype._createPageSel = function (){
	var _toalnum = this.ipageNum;
	if(_toalnum > 0){
		var _doc = document;
		var _wrap = _doc.createElement('div');
		_wrap.className = "st-pagesel-wrap";
		_wrap.id = "st-pagesel-wrap";
		_wrap.style.display = "inline-block";

		var sopts = "";
		for(var i = 1; i <= _toalnum; i++){
			var opt = "<option value="+i+">"+i+"</option>";
			sopts += opt;
		}
		_wrap.innerHTML = "选择页码: "+"<select class='st-allpages' id='st-allpages'>"+sopts+"</select>";
		this._outwrap.insertBefore(_wrap, this._ostTable);
	}
}

simpleTable.prototype.edit = function (){

}

simpleTable.prototype._Displaytbinfo = function (){
	var currentpage = this._currentPageNum;
	var currentlength = this.isinglePageNum;
	var alllength = this.itotalnum;

	var infowrap = document.createElement('div');
	infowrap.className = "st-infowrap";
	infowrap.style.display = "inline-block";
	var curBE = this._execPageBgEnd(currentpage, currentlength);
	infowrap.innerHTML = "从 " +"<span id='st-curbegain'>"+ curBE.begain +"</span>"+" 到 " +"<span id='st-curend'>"+ curBE.end +"</span>"+ " / 共 " +"<span id='st-curtotal'>"+ alllength +"</span>"+ " 条数据";
	this._outwrap.appendChild(infowrap);
}

simpleTable.prototype._changeInfo = function (){
	var curBE = this._execPageBgEnd(this._currentPageNum, this.isinglePageNum);
	var _doc = document;
	_doc.getElementById('st-curbegain').innerHTML = curBE.begain;
	_doc.getElementById('st-curend').innerHTML = curBE.end;
	_doc.getElementById('st-curtotal').innerHTML = this.itotalnum;
}

simpleTable.prototype._addClass = function (ele,clsName){
	var _existcls = ele.className;
	var _acls = _existcls.split(" ");
	for(var i = 0, len = _acls.length; i < len; i++){
		if(_acls[i] == clsName){
			return;
		}
	}
	if(_existcls.length > 0){
		_existcls = _existcls + " "+ clsName;
	}else{
		_existcls = clsName;
	}
	
	ele.className = _existcls;
}

simpleTable.prototype._removeClass = function (ele, clsName){
	var _existcls = ele.className;
	var _acls = _existcls.split(" ");
	var optcls = "";
	for(var i = 0, len = _acls.length; i < len; i++){
		if(_acls[i] !== clsName){
			optcls = optcls + _acls[i] + " ";
		}
	}
	optcls = optcls.substring(0, optcls.length - 1);
	ele.className = optcls;
}

simpleTable.prototype._hasClass = function (ele, clsName){
	var _existcls = ele.className;
	var _acls = _existcls.split(" ");
	for(var i = 0, len = _acls.length; i < len; i++){
		if(_acls[i] === clsName){
			return true;
		}
	}
	return false;
}
/**
 * [_clearChildDom 删除dom子节点]
 * @param  {[object]} ele [父节点]
 */
simpleTable.prototype._clearChildDom = function (ele){
		while(ele.hasChildNodes()){
			ele.removeChild(ele.firstChild);
		}

}

simpleTable.prototype._disChoosePageData = function (){
	var alldatas = this.bindData;
	var curpagedata = this.getCurPageData(alldatas, this._currentPageNum, this.isinglePageNum);
	this._createTbody(curpagedata);

}

//根据每页显示条数和当前页码，计算出当前也其实数据序号，终止数据序号
simpleTable.prototype._execPageBgEnd = function (icurpage, idislength){
	var begain = (icurpage - 1) * idislength + 1;
	var end = icurpage * idislength;
	return {begain: begain, end: end};
}
//根据起始和终止的num取出当页的数据
/*
 * @param  {[array]} datas   [请求回来的所有的数据]
 * @param  {[JSON]} oPageBE [execPageBgEnd返回的对象，记录当页其实和终止的序号]
 */
simpleTable.prototype.getCurPageData = function (datas, icurpage, idislength){
	var aoutput = [];
	var oPageBE = this._execPageBgEnd(icurpage, idislength);
	var _b = oPageBE.begain;
	var _e = oPageBE.end;
	for(var t = _b - 1; t < _e; t++){
		if(datas[t]){
			aoutput.push(datas[t]);
		}
	}
	return aoutput;
}

simpleTable.prototype.addEvtHandler = function(evtType,ele,handle){
	if(ele.addEventListener){

		ele.addEventListener(evtType, handle, false);

	}else if(ele.attachEvent){

		ele.attachEvent("on" + evtType, handle);

	}else{

		ele["on" + evtType] = handle;
	}
}

simpleTable.prototype.removeEvtHandler = function (evtType,ele,handle){
	if(ele.removeEventListener){

		ele.removeEventListener(evtType, handle, false);

	}else if(ele.detachEvent){

		ele.detachEvent("on" + evtType, handle);

	}else{

		ele["on" + evtType] = null;

	}
}