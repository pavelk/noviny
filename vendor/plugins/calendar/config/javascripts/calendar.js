var months = "leden,únor,březen,duben,květen,červen,červenec,srpen,září,říjen,listopad,prosinec".split(",");
var days   = "Ne,Po,Út,St,Čt,Pá,So,Ne".split(",");	

function checks(el){
	val = el.value;
	if (val.length == 0) {return true;}
	var d2,reg2;
	reg2  = new RegExp("^[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{4}$","");
	d2    = val;
	if (reg2.test(d2))
		{
		d2=d2.split(".");
		d2[1]=d2[1]*1-1;
		nd = new Date(d2[2],d2[1],d2[0]);
		d  = nd.getDate();
		m  = nd.getMonth() + 1;
		y  = nd.getFullYear();
		if (nd) {el.value = d + '.' + m + '.' + y;return;}
		else {
			el.value = "";
			alert("Špatné datum!");
			return;
		}
	}
	else {
		el.value = "";
		alert("Špatné datum!");
		return;
	}
}
function objGet(x,doc)	{var d=(doc)?doc:document; return (d.getElementById?d.getElementById(x):d.all?d.all[x]:d.layers?d.layers[x]:null);}

function decY(x)	{
	return x-1;
}
function incY(x)	{
	return x+1;
}
function d_from_MD(x,y)	{
	if (x == 0){
		return new Date(y-1,11,1);
	}
	return new Date(y,x-1,1);
}
function d_from_MI(x,y)	{
	if (x == 11){
		return new Date(y+1,0,1);
	}
	return new Date(y,x+1,1);
}

function calendar(xName,xFrom,xTo)
{
	this.eu      = 1;	// 0/1 bez funkce, zatim
	this.days    = days; //"Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun".split(",");
	this.months  = months; //"January,February,March,April,May,June,July,August,September,October,November,December".split(",");
	this.nameCal = xName;
	this.objCal  = xFrom;
	this.objTo   = xTo;
	this.putDate = function(y,m,d)	{this.objTo.value = d+"."+(m*1+1)+"."+y; this.close();}
	this.fromDate= fromDate;
	this.open    = calendarWrite;
	this.close   = function()	{this.objCal.innerHTML = "";}
}

function fromDate()
{
var d,reg;
reg  = new RegExp("[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{4}","");
d    = this.objTo.value;
if (reg.test(d))
	{
	d=d.split(".");
	d[1]=d[1]*1-1;
	if (new Date(d[2],d[1],d[0])) {return new Date(d[2],d[1],d[0]);}
	}
return new Date();
}

function calendarWrite(date)
{
var a,d,d0,d2,m,m0,m1,m2,x,y,y2,w,w0, cal,i,j,days,s1,s2,days2,dateT;
a  = this.nameCal;
if (date==null)	{date = this.fromDate();}
dateT = new Date();
d2 = dateT.getDate();
m2 = dateT.getMonth();
y2 = dateT.getFullYear();
d  = date.getDate();
m  = date.getMonth();
y  = date.getFullYear();
x  = ((y2-y)==0 && (m2-m)==0) ? 1 : 0;
m0 = new Date(y,m,  1);
m1 = new Date(y,m+1,1);
w0 = m0.getDay();
w0 = ((w0-this.eu)<0) ? 6 : w0-this.eu;
days = Math.round((m1.getTime()-m0.getTime())/86400000);	//1000*60*60*24

pomY = ""
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/prev_year.gif\" onclick=\""+a+".open(new Date(decY("+y+"),"+m+",1))\" \/>";
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/prev_month.gif\" onclick=\""+a+".open(new Date(d_from_MD("+m+","+y+")))\" \/>";
pomY += "</td><td colspan=\"3\" style=\"border-left:none;border-right:none;padding:7px 0px 0px 0px;\">";
pomY += this.months[m];
pomY += "&nbsp;";
pomY += y;
pomY += "<br>";
pomY += "<span style=\"cursor:pointer;text-decoration:underline;\" onclick=\""+a+".putDate("+y2+","+m2+","+d2+")\">";
pomY += "Dnes";
pomY += "<\/span>";
pomY += "</td><td colspan=\"2\" style=\"border-left:none;\">";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/next_month.gif\" onclick=\""+a+".open(new Date(d_from_MI("+m+","+y+")))\" \/>";
pomY += "&nbsp;";
pomY += "<img style=\"cursor:pointer;\" src=\"..\/..\/..\/images\/calendar\/next_year.gif\" onclick=\""+a+".open(new Date(incY("+y+"),"+m+",1))\" \/>";
pomY += "<br>";
pomM = pomY;

s1 = pomM

days2 = "\n<tr>";
for (i=0;i<7;i++)
	{days2+= "\n<td>"+this.days[i+this.eu]+"<\/td>";}	//nazvy dnu
days2+= "<\/tr>";

cal = "";
//cal+= s1;
cal+= "\n<table>";
cal+= "\n<thead align=\"center\" bgcolor=\"#eeeeee\">";
cal+= "<tr><td colspan=\"2\" style=\"border-right:none;\">"+s1+"<\/td><\/tr>";
cal+= days2+"\n<\/thead>";
cal+= "\n<tbody align=\"center\">";
cal+= "\n<tr>";

for (i=0;i<w0;i++)
	{cal+= "<td>&nbsp;<\/td>";}				//prazdne dny
w = w0;
for (i=1;i<=days;i++)
	{
	w%=7;
	if (w==0) {cal+= "<\/tr><tr>";}
	j = (x && i==d2) ? "<i>"+i+"<\/i>" : i;
	j = (i==d) ? "<u>"+j+"<\/u>" : j;
	cal+= "\n<td onclick=\""+a+".putDate("+y+","+m+","+i+")\">"+j+"<\/td>";//Y-m-d
	w++;
	}
for (i=0;i<7-w;i++)
	{cal+= "<td>&nbsp;<\/td>";}	
cal+= "<\/tr>";
cal+= "\n<\/tbody>";
cal+= "\n<\/table>";

this.objCal.innerHTML = cal;
}
function init(div_id,text_field_id,myvar){
	ob = objGet(div_id);
	if (ob.innerHTML.length > 0) {
		ob.innerHTML = "";
	}
	else {
		window[myvar] = new calendar(myvar, objGet(div_id), objGet(text_field_id));
		window[myvar].open();
	}
}
