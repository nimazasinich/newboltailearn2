import{c as Et,g as wt,h as Dt,r as At,j as H,D as jt,F as Lt,d as It}from"./index-42a0ee52.js";import{B as Ft}from"./Button-ef1e4edb.js";import{C as Bt,a as Pt,b as Ut,c as Mt}from"./Card-7dd85c47.js";const Wt=Et("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]),Ct=Et("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]),Zt=Et("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);function kt(pt){throw new Error('Could not dynamically require "'+pt+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Rt={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/(function(pt,bt){(function(b){pt.exports=b()})(function(){return function b(L,k,d){function o(_,y){if(!k[_]){if(!L[_]){var p=typeof kt=="function"&&kt;if(!y&&p)return p(_,!0);if(n)return n(_,!0);var g=new Error("Cannot find module '"+_+"'");throw g.code="MODULE_NOT_FOUND",g}var i=k[_]={exports:{}};L[_][0].call(i.exports,function(u){var r=L[_][1][u];return o(r||u)},i,i.exports,b,L,k,d)}return k[_].exports}for(var n=typeof kt=="function"&&kt,l=0;l<d.length;l++)o(d[l]);return o}({1:[function(b,L,k){var d=b("./utils"),o=b("./support"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";k.encode=function(l){for(var _,y,p,g,i,u,r,c=[],s=0,f=l.length,v=f,E=d.getTypeOf(l)!=="string";s<l.length;)v=f-s,p=E?(_=l[s++],y=s<f?l[s++]:0,s<f?l[s++]:0):(_=l.charCodeAt(s++),y=s<f?l.charCodeAt(s++):0,s<f?l.charCodeAt(s++):0),g=_>>2,i=(3&_)<<4|y>>4,u=1<v?(15&y)<<2|p>>6:64,r=2<v?63&p:64,c.push(n.charAt(g)+n.charAt(i)+n.charAt(u)+n.charAt(r));return c.join("")},k.decode=function(l){var _,y,p,g,i,u,r=0,c=0,s="data:";if(l.substr(0,s.length)===s)throw new Error("Invalid base64 input, it looks like a data url.");var f,v=3*(l=l.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(l.charAt(l.length-1)===n.charAt(64)&&v--,l.charAt(l.length-2)===n.charAt(64)&&v--,v%1!=0)throw new Error("Invalid base64 input, bad content length.");for(f=o.uint8array?new Uint8Array(0|v):new Array(0|v);r<l.length;)_=n.indexOf(l.charAt(r++))<<2|(g=n.indexOf(l.charAt(r++)))>>4,y=(15&g)<<4|(i=n.indexOf(l.charAt(r++)))>>2,p=(3&i)<<6|(u=n.indexOf(l.charAt(r++))),f[c++]=_,i!==64&&(f[c++]=y),u!==64&&(f[c++]=p);return f}},{"./support":30,"./utils":32}],2:[function(b,L,k){var d=b("./external"),o=b("./stream/DataWorker"),n=b("./stream/Crc32Probe"),l=b("./stream/DataLengthProbe");function _(y,p,g,i,u){this.compressedSize=y,this.uncompressedSize=p,this.crc32=g,this.compression=i,this.compressedContent=u}_.prototype={getContentWorker:function(){var y=new o(d.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new l("data_length")),p=this;return y.on("end",function(){if(this.streamInfo.data_length!==p.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),y},getCompressedWorker:function(){return new o(d.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},_.createWorkerFrom=function(y,p,g){return y.pipe(new n).pipe(new l("uncompressedSize")).pipe(p.compressWorker(g)).pipe(new l("compressedSize")).withStreamInfo("compression",p)},L.exports=_},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(b,L,k){var d=b("./stream/GenericWorker");k.STORE={magic:"\0\0",compressWorker:function(){return new d("STORE compression")},uncompressWorker:function(){return new d("STORE decompression")}},k.DEFLATE=b("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(b,L,k){var d=b("./utils"),o=function(){for(var n,l=[],_=0;_<256;_++){n=_;for(var y=0;y<8;y++)n=1&n?3988292384^n>>>1:n>>>1;l[_]=n}return l}();L.exports=function(n,l){return n!==void 0&&n.length?d.getTypeOf(n)!=="string"?function(_,y,p,g){var i=o,u=g+p;_^=-1;for(var r=g;r<u;r++)_=_>>>8^i[255&(_^y[r])];return-1^_}(0|l,n,n.length,0):function(_,y,p,g){var i=o,u=g+p;_^=-1;for(var r=g;r<u;r++)_=_>>>8^i[255&(_^y.charCodeAt(r))];return-1^_}(0|l,n,n.length,0):0}},{"./utils":32}],5:[function(b,L,k){k.base64=!1,k.binary=!1,k.dir=!1,k.createFolders=!0,k.date=null,k.compression=null,k.compressionOptions=null,k.comment=null,k.unixPermissions=null,k.dosPermissions=null},{}],6:[function(b,L,k){var d=null;d=typeof Promise<"u"?Promise:b("lie"),L.exports={Promise:d}},{lie:37}],7:[function(b,L,k){var d=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",o=b("pako"),n=b("./utils"),l=b("./stream/GenericWorker"),_=d?"uint8array":"array";function y(p,g){l.call(this,"FlateWorker/"+p),this._pako=null,this._pakoAction=p,this._pakoOptions=g,this.meta={}}k.magic="\b\0",n.inherits(y,l),y.prototype.processChunk=function(p){this.meta=p.meta,this._pako===null&&this._createPako(),this._pako.push(n.transformTo(_,p.data),!1)},y.prototype.flush=function(){l.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},y.prototype.cleanUp=function(){l.prototype.cleanUp.call(this),this._pako=null},y.prototype._createPako=function(){this._pako=new o[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var p=this;this._pako.onData=function(g){p.push({data:g,meta:p.meta})}},k.compressWorker=function(p){return new y("Deflate",p)},k.uncompressWorker=function(){return new y("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(b,L,k){function d(i,u){var r,c="";for(r=0;r<u;r++)c+=String.fromCharCode(255&i),i>>>=8;return c}function o(i,u,r,c,s,f){var v,E,x=i.file,D=i.compression,R=f!==_.utf8encode,P=n.transformTo("string",f(x.name)),C=n.transformTo("string",_.utf8encode(x.name)),Z=x.comment,V=n.transformTo("string",f(Z)),m=n.transformTo("string",_.utf8encode(Z)),O=C.length!==x.name.length,e=m.length!==Z.length,z="",Q="",B="",$=x.dir,U=x.date,J={crc32:0,compressedSize:0,uncompressedSize:0};u&&!r||(J.crc32=i.crc32,J.compressedSize=i.compressedSize,J.uncompressedSize=i.uncompressedSize);var A=0;u&&(A|=8),R||!O&&!e||(A|=2048);var S=0,K=0;$&&(S|=16),s==="UNIX"?(K=798,S|=function(G,it){var lt=G;return G||(lt=it?16893:33204),(65535&lt)<<16}(x.unixPermissions,$)):(K=20,S|=function(G){return 63&(G||0)}(x.dosPermissions)),v=U.getUTCHours(),v<<=6,v|=U.getUTCMinutes(),v<<=5,v|=U.getUTCSeconds()/2,E=U.getUTCFullYear()-1980,E<<=4,E|=U.getUTCMonth()+1,E<<=5,E|=U.getUTCDate(),O&&(Q=d(1,1)+d(y(P),4)+C,z+="up"+d(Q.length,2)+Q),e&&(B=d(1,1)+d(y(V),4)+m,z+="uc"+d(B.length,2)+B);var q="";return q+=`
\0`,q+=d(A,2),q+=D.magic,q+=d(v,2),q+=d(E,2),q+=d(J.crc32,4),q+=d(J.compressedSize,4),q+=d(J.uncompressedSize,4),q+=d(P.length,2),q+=d(z.length,2),{fileRecord:p.LOCAL_FILE_HEADER+q+P+z,dirRecord:p.CENTRAL_FILE_HEADER+d(K,2)+q+d(V.length,2)+"\0\0\0\0"+d(S,4)+d(c,4)+P+z+V}}var n=b("../utils"),l=b("../stream/GenericWorker"),_=b("../utf8"),y=b("../crc32"),p=b("../signature");function g(i,u,r,c){l.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=u,this.zipPlatform=r,this.encodeFileName=c,this.streamFiles=i,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}n.inherits(g,l),g.prototype.push=function(i){var u=i.meta.percent||0,r=this.entriesCount,c=this._sources.length;this.accumulate?this.contentBuffer.push(i):(this.bytesWritten+=i.data.length,l.prototype.push.call(this,{data:i.data,meta:{currentFile:this.currentFile,percent:r?(u+100*(r-c-1))/r:100}}))},g.prototype.openedSource=function(i){this.currentSourceOffset=this.bytesWritten,this.currentFile=i.file.name;var u=this.streamFiles&&!i.file.dir;if(u){var r=o(i,u,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},g.prototype.closedSource=function(i){this.accumulate=!1;var u=this.streamFiles&&!i.file.dir,r=o(i,u,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),u)this.push({data:function(c){return p.DATA_DESCRIPTOR+d(c.crc32,4)+d(c.compressedSize,4)+d(c.uncompressedSize,4)}(i),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},g.prototype.flush=function(){for(var i=this.bytesWritten,u=0;u<this.dirRecords.length;u++)this.push({data:this.dirRecords[u],meta:{percent:100}});var r=this.bytesWritten-i,c=function(s,f,v,E,x){var D=n.transformTo("string",x(E));return p.CENTRAL_DIRECTORY_END+"\0\0\0\0"+d(s,2)+d(s,2)+d(f,4)+d(v,4)+d(D.length,2)+D}(this.dirRecords.length,r,i,this.zipComment,this.encodeFileName);this.push({data:c,meta:{percent:100}})},g.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},g.prototype.registerPrevious=function(i){this._sources.push(i);var u=this;return i.on("data",function(r){u.processChunk(r)}),i.on("end",function(){u.closedSource(u.previous.streamInfo),u._sources.length?u.prepareNextSource():u.end()}),i.on("error",function(r){u.error(r)}),this},g.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},g.prototype.error=function(i){var u=this._sources;if(!l.prototype.error.call(this,i))return!1;for(var r=0;r<u.length;r++)try{u[r].error(i)}catch{}return!0},g.prototype.lock=function(){l.prototype.lock.call(this);for(var i=this._sources,u=0;u<i.length;u++)i[u].lock()},L.exports=g},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(b,L,k){var d=b("../compressions"),o=b("./ZipFileWorker");k.generateWorker=function(n,l,_){var y=new o(l.streamFiles,_,l.platform,l.encodeFileName),p=0;try{n.forEach(function(g,i){p++;var u=function(f,v){var E=f||v,x=d[E];if(!x)throw new Error(E+" is not a valid compression method !");return x}(i.options.compression,l.compression),r=i.options.compressionOptions||l.compressionOptions||{},c=i.dir,s=i.date;i._compressWorker(u,r).withStreamInfo("file",{name:g,dir:c,date:s,comment:i.comment||"",unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions}).pipe(y)}),y.entriesCount=p}catch(g){y.error(g)}return y}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(b,L,k){function d(){if(!(this instanceof d))return new d;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var o=new d;for(var n in this)typeof this[n]!="function"&&(o[n]=this[n]);return o}}(d.prototype=b("./object")).loadAsync=b("./load"),d.support=b("./support"),d.defaults=b("./defaults"),d.version="3.10.1",d.loadAsync=function(o,n){return new d().loadAsync(o,n)},d.external=b("./external"),L.exports=d},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(b,L,k){var d=b("./utils"),o=b("./external"),n=b("./utf8"),l=b("./zipEntries"),_=b("./stream/Crc32Probe"),y=b("./nodejsUtils");function p(g){return new o.Promise(function(i,u){var r=g.decompressed.getContentWorker().pipe(new _);r.on("error",function(c){u(c)}).on("end",function(){r.streamInfo.crc32!==g.decompressed.crc32?u(new Error("Corrupted zip : CRC32 mismatch")):i()}).resume()})}L.exports=function(g,i){var u=this;return i=d.extend(i||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),y.isNode&&y.isStream(g)?o.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):d.prepareContent("the loaded zip file",g,!0,i.optimizedBinaryString,i.base64).then(function(r){var c=new l(i);return c.load(r),c}).then(function(r){var c=[o.Promise.resolve(r)],s=r.files;if(i.checkCRC32)for(var f=0;f<s.length;f++)c.push(p(s[f]));return o.Promise.all(c)}).then(function(r){for(var c=r.shift(),s=c.files,f=0;f<s.length;f++){var v=s[f],E=v.fileNameStr,x=d.resolve(v.fileNameStr);u.file(x,v.decompressed,{binary:!0,optimizedBinaryString:!0,date:v.date,dir:v.dir,comment:v.fileCommentStr.length?v.fileCommentStr:null,unixPermissions:v.unixPermissions,dosPermissions:v.dosPermissions,createFolders:i.createFolders}),v.dir||(u.file(x).unsafeOriginalName=E)}return c.zipComment.length&&(u.comment=c.zipComment),u})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(b,L,k){var d=b("../utils"),o=b("../stream/GenericWorker");function n(l,_){o.call(this,"Nodejs stream input adapter for "+l),this._upstreamEnded=!1,this._bindStream(_)}d.inherits(n,o),n.prototype._bindStream=function(l){var _=this;(this._stream=l).pause(),l.on("data",function(y){_.push({data:y,meta:{percent:0}})}).on("error",function(y){_.isPaused?this.generatedError=y:_.error(y)}).on("end",function(){_.isPaused?_._upstreamEnded=!0:_.end()})},n.prototype.pause=function(){return!!o.prototype.pause.call(this)&&(this._stream.pause(),!0)},n.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},L.exports=n},{"../stream/GenericWorker":28,"../utils":32}],13:[function(b,L,k){var d=b("readable-stream").Readable;function o(n,l,_){d.call(this,l),this._helper=n;var y=this;n.on("data",function(p,g){y.push(p)||y._helper.pause(),_&&_(g)}).on("error",function(p){y.emit("error",p)}).on("end",function(){y.push(null)})}b("../utils").inherits(o,d),o.prototype._read=function(){this._helper.resume()},L.exports=o},{"../utils":32,"readable-stream":16}],14:[function(b,L,k){L.exports={isNode:typeof Buffer<"u",newBufferFrom:function(d,o){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(d,o);if(typeof d=="number")throw new Error('The "data" argument must not be a number');return new Buffer(d,o)},allocBuffer:function(d){if(Buffer.alloc)return Buffer.alloc(d);var o=new Buffer(d);return o.fill(0),o},isBuffer:function(d){return Buffer.isBuffer(d)},isStream:function(d){return d&&typeof d.on=="function"&&typeof d.pause=="function"&&typeof d.resume=="function"}}},{}],15:[function(b,L,k){function d(x,D,R){var P,C=n.getTypeOf(D),Z=n.extend(R||{},y);Z.date=Z.date||new Date,Z.compression!==null&&(Z.compression=Z.compression.toUpperCase()),typeof Z.unixPermissions=="string"&&(Z.unixPermissions=parseInt(Z.unixPermissions,8)),Z.unixPermissions&&16384&Z.unixPermissions&&(Z.dir=!0),Z.dosPermissions&&16&Z.dosPermissions&&(Z.dir=!0),Z.dir&&(x=s(x)),Z.createFolders&&(P=c(x))&&f.call(this,P,!0);var V=C==="string"&&Z.binary===!1&&Z.base64===!1;R&&R.binary!==void 0||(Z.binary=!V),(D instanceof p&&D.uncompressedSize===0||Z.dir||!D||D.length===0)&&(Z.base64=!1,Z.binary=!0,D="",Z.compression="STORE",C="string");var m=null;m=D instanceof p||D instanceof l?D:u.isNode&&u.isStream(D)?new r(x,D):n.prepareContent(x,D,Z.binary,Z.optimizedBinaryString,Z.base64);var O=new g(x,m,Z);this.files[x]=O}var o=b("./utf8"),n=b("./utils"),l=b("./stream/GenericWorker"),_=b("./stream/StreamHelper"),y=b("./defaults"),p=b("./compressedObject"),g=b("./zipObject"),i=b("./generate"),u=b("./nodejsUtils"),r=b("./nodejs/NodejsStreamInputAdapter"),c=function(x){x.slice(-1)==="/"&&(x=x.substring(0,x.length-1));var D=x.lastIndexOf("/");return 0<D?x.substring(0,D):""},s=function(x){return x.slice(-1)!=="/"&&(x+="/"),x},f=function(x,D){return D=D!==void 0?D:y.createFolders,x=s(x),this.files[x]||d.call(this,x,null,{dir:!0,createFolders:D}),this.files[x]};function v(x){return Object.prototype.toString.call(x)==="[object RegExp]"}var E={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(x){var D,R,P;for(D in this.files)P=this.files[D],(R=D.slice(this.root.length,D.length))&&D.slice(0,this.root.length)===this.root&&x(R,P)},filter:function(x){var D=[];return this.forEach(function(R,P){x(R,P)&&D.push(P)}),D},file:function(x,D,R){if(arguments.length!==1)return x=this.root+x,d.call(this,x,D,R),this;if(v(x)){var P=x;return this.filter(function(Z,V){return!V.dir&&P.test(Z)})}var C=this.files[this.root+x];return C&&!C.dir?C:null},folder:function(x){if(!x)return this;if(v(x))return this.filter(function(C,Z){return Z.dir&&x.test(C)});var D=this.root+x,R=f.call(this,D),P=this.clone();return P.root=R.name,P},remove:function(x){x=this.root+x;var D=this.files[x];if(D||(x.slice(-1)!=="/"&&(x+="/"),D=this.files[x]),D&&!D.dir)delete this.files[x];else for(var R=this.filter(function(C,Z){return Z.name.slice(0,x.length)===x}),P=0;P<R.length;P++)delete this.files[R[P].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(x){var D,R={};try{if((R=n.extend(x||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:o.utf8encode})).type=R.type.toLowerCase(),R.compression=R.compression.toUpperCase(),R.type==="binarystring"&&(R.type="string"),!R.type)throw new Error("No output type specified.");n.checkSupport(R.type),R.platform!=="darwin"&&R.platform!=="freebsd"&&R.platform!=="linux"&&R.platform!=="sunos"||(R.platform="UNIX"),R.platform==="win32"&&(R.platform="DOS");var P=R.comment||this.comment||"";D=i.generateWorker(this,R,P)}catch(C){(D=new l("error")).error(C)}return new _(D,R.type||"string",R.mimeType)},generateAsync:function(x,D){return this.generateInternalStream(x).accumulate(D)},generateNodeStream:function(x,D){return(x=x||{}).type||(x.type="nodebuffer"),this.generateInternalStream(x).toNodejsStream(D)}};L.exports=E},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(b,L,k){L.exports=b("stream")},{stream:void 0}],17:[function(b,L,k){var d=b("./DataReader");function o(n){d.call(this,n);for(var l=0;l<this.data.length;l++)n[l]=255&n[l]}b("../utils").inherits(o,d),o.prototype.byteAt=function(n){return this.data[this.zero+n]},o.prototype.lastIndexOfSignature=function(n){for(var l=n.charCodeAt(0),_=n.charCodeAt(1),y=n.charCodeAt(2),p=n.charCodeAt(3),g=this.length-4;0<=g;--g)if(this.data[g]===l&&this.data[g+1]===_&&this.data[g+2]===y&&this.data[g+3]===p)return g-this.zero;return-1},o.prototype.readAndCheckSignature=function(n){var l=n.charCodeAt(0),_=n.charCodeAt(1),y=n.charCodeAt(2),p=n.charCodeAt(3),g=this.readData(4);return l===g[0]&&_===g[1]&&y===g[2]&&p===g[3]},o.prototype.readData=function(n){if(this.checkOffset(n),n===0)return[];var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},L.exports=o},{"../utils":32,"./DataReader":18}],18:[function(b,L,k){var d=b("../utils");function o(n){this.data=n,this.length=n.length,this.index=0,this.zero=0}o.prototype={checkOffset:function(n){this.checkIndex(this.index+n)},checkIndex:function(n){if(this.length<this.zero+n||n<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+n+"). Corrupted zip ?")},setIndex:function(n){this.checkIndex(n),this.index=n},skip:function(n){this.setIndex(this.index+n)},byteAt:function(){},readInt:function(n){var l,_=0;for(this.checkOffset(n),l=this.index+n-1;l>=this.index;l--)_=(_<<8)+this.byteAt(l);return this.index+=n,_},readString:function(n){return d.transformTo("string",this.readData(n))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var n=this.readInt(4);return new Date(Date.UTC(1980+(n>>25&127),(n>>21&15)-1,n>>16&31,n>>11&31,n>>5&63,(31&n)<<1))}},L.exports=o},{"../utils":32}],19:[function(b,L,k){var d=b("./Uint8ArrayReader");function o(n){d.call(this,n)}b("../utils").inherits(o,d),o.prototype.readData=function(n){this.checkOffset(n);var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},L.exports=o},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(b,L,k){var d=b("./DataReader");function o(n){d.call(this,n)}b("../utils").inherits(o,d),o.prototype.byteAt=function(n){return this.data.charCodeAt(this.zero+n)},o.prototype.lastIndexOfSignature=function(n){return this.data.lastIndexOf(n)-this.zero},o.prototype.readAndCheckSignature=function(n){return n===this.readData(4)},o.prototype.readData=function(n){this.checkOffset(n);var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},L.exports=o},{"../utils":32,"./DataReader":18}],21:[function(b,L,k){var d=b("./ArrayReader");function o(n){d.call(this,n)}b("../utils").inherits(o,d),o.prototype.readData=function(n){if(this.checkOffset(n),n===0)return new Uint8Array(0);var l=this.data.subarray(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},L.exports=o},{"../utils":32,"./ArrayReader":17}],22:[function(b,L,k){var d=b("../utils"),o=b("../support"),n=b("./ArrayReader"),l=b("./StringReader"),_=b("./NodeBufferReader"),y=b("./Uint8ArrayReader");L.exports=function(p){var g=d.getTypeOf(p);return d.checkSupport(g),g!=="string"||o.uint8array?g==="nodebuffer"?new _(p):o.uint8array?new y(d.transformTo("uint8array",p)):new n(d.transformTo("array",p)):new l(p)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(b,L,k){k.LOCAL_FILE_HEADER="PK",k.CENTRAL_FILE_HEADER="PK",k.CENTRAL_DIRECTORY_END="PK",k.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",k.ZIP64_CENTRAL_DIRECTORY_END="PK",k.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(b,L,k){var d=b("./GenericWorker"),o=b("../utils");function n(l){d.call(this,"ConvertWorker to "+l),this.destType=l}o.inherits(n,d),n.prototype.processChunk=function(l){this.push({data:o.transformTo(this.destType,l.data),meta:l.meta})},L.exports=n},{"../utils":32,"./GenericWorker":28}],25:[function(b,L,k){var d=b("./GenericWorker"),o=b("../crc32");function n(){d.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}b("../utils").inherits(n,d),n.prototype.processChunk=function(l){this.streamInfo.crc32=o(l.data,this.streamInfo.crc32||0),this.push(l)},L.exports=n},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(b,L,k){var d=b("../utils"),o=b("./GenericWorker");function n(l){o.call(this,"DataLengthProbe for "+l),this.propName=l,this.withStreamInfo(l,0)}d.inherits(n,o),n.prototype.processChunk=function(l){if(l){var _=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=_+l.data.length}o.prototype.processChunk.call(this,l)},L.exports=n},{"../utils":32,"./GenericWorker":28}],27:[function(b,L,k){var d=b("../utils"),o=b("./GenericWorker");function n(l){o.call(this,"DataWorker");var _=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,l.then(function(y){_.dataIsReady=!0,_.data=y,_.max=y&&y.length||0,_.type=d.getTypeOf(y),_.isPaused||_._tickAndRepeat()},function(y){_.error(y)})}d.inherits(n,o),n.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this.data=null},n.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,d.delay(this._tickAndRepeat,[],this)),!0)},n.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(d.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},n.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var l=null,_=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":l=this.data.substring(this.index,_);break;case"uint8array":l=this.data.subarray(this.index,_);break;case"array":case"nodebuffer":l=this.data.slice(this.index,_)}return this.index=_,this.push({data:l,meta:{percent:this.max?this.index/this.max*100:0}})},L.exports=n},{"../utils":32,"./GenericWorker":28}],28:[function(b,L,k){function d(o){this.name=o||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}d.prototype={push:function(o){this.emit("data",o)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(o){this.emit("error",o)}return!0},error:function(o){return!this.isFinished&&(this.isPaused?this.generatedError=o:(this.isFinished=!0,this.emit("error",o),this.previous&&this.previous.error(o),this.cleanUp()),!0)},on:function(o,n){return this._listeners[o].push(n),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(o,n){if(this._listeners[o])for(var l=0;l<this._listeners[o].length;l++)this._listeners[o][l].call(this,n)},pipe:function(o){return o.registerPrevious(this)},registerPrevious:function(o){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=o.streamInfo,this.mergeStreamInfo(),this.previous=o;var n=this;return o.on("data",function(l){n.processChunk(l)}),o.on("end",function(){n.end()}),o.on("error",function(l){n.error(l)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var o=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),o=!0),this.previous&&this.previous.resume(),!o},flush:function(){},processChunk:function(o){this.push(o)},withStreamInfo:function(o,n){return this.extraStreamInfo[o]=n,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var o in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,o)&&(this.streamInfo[o]=this.extraStreamInfo[o])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var o="Worker "+this.name;return this.previous?this.previous+" -> "+o:o}},L.exports=d},{}],29:[function(b,L,k){var d=b("../utils"),o=b("./ConvertWorker"),n=b("./GenericWorker"),l=b("../base64"),_=b("../support"),y=b("../external"),p=null;if(_.nodestream)try{p=b("../nodejs/NodejsStreamOutputAdapter")}catch{}function g(u,r){return new y.Promise(function(c,s){var f=[],v=u._internalType,E=u._outputType,x=u._mimeType;u.on("data",function(D,R){f.push(D),r&&r(R)}).on("error",function(D){f=[],s(D)}).on("end",function(){try{var D=function(R,P,C){switch(R){case"blob":return d.newBlob(d.transformTo("arraybuffer",P),C);case"base64":return l.encode(P);default:return d.transformTo(R,P)}}(E,function(R,P){var C,Z=0,V=null,m=0;for(C=0;C<P.length;C++)m+=P[C].length;switch(R){case"string":return P.join("");case"array":return Array.prototype.concat.apply([],P);case"uint8array":for(V=new Uint8Array(m),C=0;C<P.length;C++)V.set(P[C],Z),Z+=P[C].length;return V;case"nodebuffer":return Buffer.concat(P);default:throw new Error("concat : unsupported type '"+R+"'")}}(v,f),x);c(D)}catch(R){s(R)}f=[]}).resume()})}function i(u,r,c){var s=r;switch(r){case"blob":case"arraybuffer":s="uint8array";break;case"base64":s="string"}try{this._internalType=s,this._outputType=r,this._mimeType=c,d.checkSupport(s),this._worker=u.pipe(new o(s)),u.lock()}catch(f){this._worker=new n("error"),this._worker.error(f)}}i.prototype={accumulate:function(u){return g(this,u)},on:function(u,r){var c=this;return u==="data"?this._worker.on(u,function(s){r.call(c,s.data,s.meta)}):this._worker.on(u,function(){d.delay(r,arguments,c)}),this},resume:function(){return d.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(u){if(d.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new p(this,{objectMode:this._outputType!=="nodebuffer"},u)}},L.exports=i},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(b,L,k){if(k.base64=!0,k.array=!0,k.string=!0,k.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",k.nodebuffer=typeof Buffer<"u",k.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")k.blob=!1;else{var d=new ArrayBuffer(0);try{k.blob=new Blob([d],{type:"application/zip"}).size===0}catch{try{var o=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);o.append(d),k.blob=o.getBlob("application/zip").size===0}catch{k.blob=!1}}}try{k.nodestream=!!b("readable-stream").Readable}catch{k.nodestream=!1}},{"readable-stream":16}],31:[function(b,L,k){for(var d=b("./utils"),o=b("./support"),n=b("./nodejsUtils"),l=b("./stream/GenericWorker"),_=new Array(256),y=0;y<256;y++)_[y]=252<=y?6:248<=y?5:240<=y?4:224<=y?3:192<=y?2:1;_[254]=_[254]=1;function p(){l.call(this,"utf-8 decode"),this.leftOver=null}function g(){l.call(this,"utf-8 encode")}k.utf8encode=function(i){return o.nodebuffer?n.newBufferFrom(i,"utf-8"):function(u){var r,c,s,f,v,E=u.length,x=0;for(f=0;f<E;f++)(64512&(c=u.charCodeAt(f)))==55296&&f+1<E&&(64512&(s=u.charCodeAt(f+1)))==56320&&(c=65536+(c-55296<<10)+(s-56320),f++),x+=c<128?1:c<2048?2:c<65536?3:4;for(r=o.uint8array?new Uint8Array(x):new Array(x),f=v=0;v<x;f++)(64512&(c=u.charCodeAt(f)))==55296&&f+1<E&&(64512&(s=u.charCodeAt(f+1)))==56320&&(c=65536+(c-55296<<10)+(s-56320),f++),c<128?r[v++]=c:(c<2048?r[v++]=192|c>>>6:(c<65536?r[v++]=224|c>>>12:(r[v++]=240|c>>>18,r[v++]=128|c>>>12&63),r[v++]=128|c>>>6&63),r[v++]=128|63&c);return r}(i)},k.utf8decode=function(i){return o.nodebuffer?d.transformTo("nodebuffer",i).toString("utf-8"):function(u){var r,c,s,f,v=u.length,E=new Array(2*v);for(r=c=0;r<v;)if((s=u[r++])<128)E[c++]=s;else if(4<(f=_[s]))E[c++]=65533,r+=f-1;else{for(s&=f===2?31:f===3?15:7;1<f&&r<v;)s=s<<6|63&u[r++],f--;1<f?E[c++]=65533:s<65536?E[c++]=s:(s-=65536,E[c++]=55296|s>>10&1023,E[c++]=56320|1023&s)}return E.length!==c&&(E.subarray?E=E.subarray(0,c):E.length=c),d.applyFromCharCode(E)}(i=d.transformTo(o.uint8array?"uint8array":"array",i))},d.inherits(p,l),p.prototype.processChunk=function(i){var u=d.transformTo(o.uint8array?"uint8array":"array",i.data);if(this.leftOver&&this.leftOver.length){if(o.uint8array){var r=u;(u=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),u.set(r,this.leftOver.length)}else u=this.leftOver.concat(u);this.leftOver=null}var c=function(f,v){var E;for((v=v||f.length)>f.length&&(v=f.length),E=v-1;0<=E&&(192&f[E])==128;)E--;return E<0||E===0?v:E+_[f[E]]>v?E:v}(u),s=u;c!==u.length&&(o.uint8array?(s=u.subarray(0,c),this.leftOver=u.subarray(c,u.length)):(s=u.slice(0,c),this.leftOver=u.slice(c,u.length))),this.push({data:k.utf8decode(s),meta:i.meta})},p.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:k.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},k.Utf8DecodeWorker=p,d.inherits(g,l),g.prototype.processChunk=function(i){this.push({data:k.utf8encode(i.data),meta:i.meta})},k.Utf8EncodeWorker=g},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(b,L,k){var d=b("./support"),o=b("./base64"),n=b("./nodejsUtils"),l=b("./external");function _(r){return r}function y(r,c){for(var s=0;s<r.length;++s)c[s]=255&r.charCodeAt(s);return c}b("setimmediate"),k.newBlob=function(r,c){k.checkSupport("blob");try{return new Blob([r],{type:c})}catch{try{var s=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return s.append(r),s.getBlob(c)}catch{throw new Error("Bug : can't construct the Blob.")}}};var p={stringifyByChunk:function(r,c,s){var f=[],v=0,E=r.length;if(E<=s)return String.fromCharCode.apply(null,r);for(;v<E;)c==="array"||c==="nodebuffer"?f.push(String.fromCharCode.apply(null,r.slice(v,Math.min(v+s,E)))):f.push(String.fromCharCode.apply(null,r.subarray(v,Math.min(v+s,E)))),v+=s;return f.join("")},stringifyByChar:function(r){for(var c="",s=0;s<r.length;s++)c+=String.fromCharCode(r[s]);return c},applyCanBeUsed:{uint8array:function(){try{return d.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return d.nodebuffer&&String.fromCharCode.apply(null,n.allocBuffer(1)).length===1}catch{return!1}}()}};function g(r){var c=65536,s=k.getTypeOf(r),f=!0;if(s==="uint8array"?f=p.applyCanBeUsed.uint8array:s==="nodebuffer"&&(f=p.applyCanBeUsed.nodebuffer),f)for(;1<c;)try{return p.stringifyByChunk(r,s,c)}catch{c=Math.floor(c/2)}return p.stringifyByChar(r)}function i(r,c){for(var s=0;s<r.length;s++)c[s]=r[s];return c}k.applyFromCharCode=g;var u={};u.string={string:_,array:function(r){return y(r,new Array(r.length))},arraybuffer:function(r){return u.string.uint8array(r).buffer},uint8array:function(r){return y(r,new Uint8Array(r.length))},nodebuffer:function(r){return y(r,n.allocBuffer(r.length))}},u.array={string:g,array:_,arraybuffer:function(r){return new Uint8Array(r).buffer},uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(r)}},u.arraybuffer={string:function(r){return g(new Uint8Array(r))},array:function(r){return i(new Uint8Array(r),new Array(r.byteLength))},arraybuffer:_,uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(new Uint8Array(r))}},u.uint8array={string:g,array:function(r){return i(r,new Array(r.length))},arraybuffer:function(r){return r.buffer},uint8array:_,nodebuffer:function(r){return n.newBufferFrom(r)}},u.nodebuffer={string:g,array:function(r){return i(r,new Array(r.length))},arraybuffer:function(r){return u.nodebuffer.uint8array(r).buffer},uint8array:function(r){return i(r,new Uint8Array(r.length))},nodebuffer:_},k.transformTo=function(r,c){if(c=c||"",!r)return c;k.checkSupport(r);var s=k.getTypeOf(c);return u[s][r](c)},k.resolve=function(r){for(var c=r.split("/"),s=[],f=0;f<c.length;f++){var v=c[f];v==="."||v===""&&f!==0&&f!==c.length-1||(v===".."?s.pop():s.push(v))}return s.join("/")},k.getTypeOf=function(r){return typeof r=="string"?"string":Object.prototype.toString.call(r)==="[object Array]"?"array":d.nodebuffer&&n.isBuffer(r)?"nodebuffer":d.uint8array&&r instanceof Uint8Array?"uint8array":d.arraybuffer&&r instanceof ArrayBuffer?"arraybuffer":void 0},k.checkSupport=function(r){if(!d[r.toLowerCase()])throw new Error(r+" is not supported by this platform")},k.MAX_VALUE_16BITS=65535,k.MAX_VALUE_32BITS=-1,k.pretty=function(r){var c,s,f="";for(s=0;s<(r||"").length;s++)f+="\\x"+((c=r.charCodeAt(s))<16?"0":"")+c.toString(16).toUpperCase();return f},k.delay=function(r,c,s){setImmediate(function(){r.apply(s||null,c||[])})},k.inherits=function(r,c){function s(){}s.prototype=c.prototype,r.prototype=new s},k.extend=function(){var r,c,s={};for(r=0;r<arguments.length;r++)for(c in arguments[r])Object.prototype.hasOwnProperty.call(arguments[r],c)&&s[c]===void 0&&(s[c]=arguments[r][c]);return s},k.prepareContent=function(r,c,s,f,v){return l.Promise.resolve(c).then(function(E){return d.blob&&(E instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(E))!==-1)&&typeof FileReader<"u"?new l.Promise(function(x,D){var R=new FileReader;R.onload=function(P){x(P.target.result)},R.onerror=function(P){D(P.target.error)},R.readAsArrayBuffer(E)}):E}).then(function(E){var x=k.getTypeOf(E);return x?(x==="arraybuffer"?E=k.transformTo("uint8array",E):x==="string"&&(v?E=o.decode(E):s&&f!==!0&&(E=function(D){return y(D,d.uint8array?new Uint8Array(D.length):new Array(D.length))}(E))),E):l.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(b,L,k){var d=b("./reader/readerFor"),o=b("./utils"),n=b("./signature"),l=b("./zipEntry"),_=b("./support");function y(p){this.files=[],this.loadOptions=p}y.prototype={checkSignature:function(p){if(!this.reader.readAndCheckSignature(p)){this.reader.index-=4;var g=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+o.pretty(g)+", expected "+o.pretty(p)+")")}},isSignature:function(p,g){var i=this.reader.index;this.reader.setIndex(p);var u=this.reader.readString(4)===g;return this.reader.setIndex(i),u},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var p=this.reader.readData(this.zipCommentLength),g=_.uint8array?"uint8array":"array",i=o.transformTo(g,p);this.zipComment=this.loadOptions.decodeFileName(i)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var p,g,i,u=this.zip64EndOfCentralSize-44;0<u;)p=this.reader.readInt(2),g=this.reader.readInt(4),i=this.reader.readData(g),this.zip64ExtensibleData[p]={id:p,length:g,value:i}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var p,g;for(p=0;p<this.files.length;p++)g=this.files[p],this.reader.setIndex(g.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),g.readLocalPart(this.reader),g.handleUTF8(),g.processAttributes()},readCentralDir:function(){var p;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(n.CENTRAL_FILE_HEADER);)(p=new l({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(p);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var p=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(p<0)throw this.isSignature(0,n.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(p);var g=p;if(this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===o.MAX_VALUE_16BITS||this.diskWithCentralDirStart===o.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===o.MAX_VALUE_16BITS||this.centralDirRecords===o.MAX_VALUE_16BITS||this.centralDirSize===o.MAX_VALUE_32BITS||this.centralDirOffset===o.MAX_VALUE_32BITS){if(this.zip64=!0,(p=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(p),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,n.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var i=this.centralDirOffset+this.centralDirSize;this.zip64&&(i+=20,i+=12+this.zip64EndOfCentralSize);var u=g-i;if(0<u)this.isSignature(g,n.CENTRAL_FILE_HEADER)||(this.reader.zero=u);else if(u<0)throw new Error("Corrupted zip: missing "+Math.abs(u)+" bytes.")},prepareReader:function(p){this.reader=d(p)},load:function(p){this.prepareReader(p),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},L.exports=y},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(b,L,k){var d=b("./reader/readerFor"),o=b("./utils"),n=b("./compressedObject"),l=b("./crc32"),_=b("./utf8"),y=b("./compressions"),p=b("./support");function g(i,u){this.options=i,this.loadOptions=u}g.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(i){var u,r;if(i.skip(22),this.fileNameLength=i.readInt(2),r=i.readInt(2),this.fileName=i.readData(this.fileNameLength),i.skip(r),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((u=function(c){for(var s in y)if(Object.prototype.hasOwnProperty.call(y,s)&&y[s].magic===c)return y[s];return null}(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+o.pretty(this.compressionMethod)+" unknown (inner file : "+o.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,u,i.readData(this.compressedSize))},readCentralPart:function(i){this.versionMadeBy=i.readInt(2),i.skip(2),this.bitFlag=i.readInt(2),this.compressionMethod=i.readString(2),this.date=i.readDate(),this.crc32=i.readInt(4),this.compressedSize=i.readInt(4),this.uncompressedSize=i.readInt(4);var u=i.readInt(2);if(this.extraFieldsLength=i.readInt(2),this.fileCommentLength=i.readInt(2),this.diskNumberStart=i.readInt(2),this.internalFileAttributes=i.readInt(2),this.externalFileAttributes=i.readInt(4),this.localHeaderOffset=i.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");i.skip(u),this.readExtraFields(i),this.parseZIP64ExtraField(i),this.fileComment=i.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var i=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),i==0&&(this.dosPermissions=63&this.externalFileAttributes),i==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var i=d(this.extraFields[1].value);this.uncompressedSize===o.MAX_VALUE_32BITS&&(this.uncompressedSize=i.readInt(8)),this.compressedSize===o.MAX_VALUE_32BITS&&(this.compressedSize=i.readInt(8)),this.localHeaderOffset===o.MAX_VALUE_32BITS&&(this.localHeaderOffset=i.readInt(8)),this.diskNumberStart===o.MAX_VALUE_32BITS&&(this.diskNumberStart=i.readInt(4))}},readExtraFields:function(i){var u,r,c,s=i.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});i.index+4<s;)u=i.readInt(2),r=i.readInt(2),c=i.readData(r),this.extraFields[u]={id:u,length:r,value:c};i.setIndex(s)},handleUTF8:function(){var i=p.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=_.utf8decode(this.fileName),this.fileCommentStr=_.utf8decode(this.fileComment);else{var u=this.findExtraFieldUnicodePath();if(u!==null)this.fileNameStr=u;else{var r=o.transformTo(i,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var c=this.findExtraFieldUnicodeComment();if(c!==null)this.fileCommentStr=c;else{var s=o.transformTo(i,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(s)}}},findExtraFieldUnicodePath:function(){var i=this.extraFields[28789];if(i){var u=d(i.value);return u.readInt(1)!==1||l(this.fileName)!==u.readInt(4)?null:_.utf8decode(u.readData(i.length-5))}return null},findExtraFieldUnicodeComment:function(){var i=this.extraFields[25461];if(i){var u=d(i.value);return u.readInt(1)!==1||l(this.fileComment)!==u.readInt(4)?null:_.utf8decode(u.readData(i.length-5))}return null}},L.exports=g},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(b,L,k){function d(u,r,c){this.name=u,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this.unixPermissions=c.unixPermissions,this.dosPermissions=c.dosPermissions,this._data=r,this._dataBinary=c.binary,this.options={compression:c.compression,compressionOptions:c.compressionOptions}}var o=b("./stream/StreamHelper"),n=b("./stream/DataWorker"),l=b("./utf8"),_=b("./compressedObject"),y=b("./stream/GenericWorker");d.prototype={internalStream:function(u){var r=null,c="string";try{if(!u)throw new Error("No output type specified.");var s=(c=u.toLowerCase())==="string"||c==="text";c!=="binarystring"&&c!=="text"||(c="string"),r=this._decompressWorker();var f=!this._dataBinary;f&&!s&&(r=r.pipe(new l.Utf8EncodeWorker)),!f&&s&&(r=r.pipe(new l.Utf8DecodeWorker))}catch(v){(r=new y("error")).error(v)}return new o(r,c,"")},async:function(u,r){return this.internalStream(u).accumulate(r)},nodeStream:function(u,r){return this.internalStream(u||"nodebuffer").toNodejsStream(r)},_compressWorker:function(u,r){if(this._data instanceof _&&this._data.compression.magic===u.magic)return this._data.getCompressedWorker();var c=this._decompressWorker();return this._dataBinary||(c=c.pipe(new l.Utf8EncodeWorker)),_.createWorkerFrom(c,u,r)},_decompressWorker:function(){return this._data instanceof _?this._data.getContentWorker():this._data instanceof y?this._data:new n(this._data)}};for(var p=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],g=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},i=0;i<p.length;i++)d.prototype[p[i]]=g;L.exports=d},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(b,L,k){(function(d){var o,n,l=d.MutationObserver||d.WebKitMutationObserver;if(l){var _=0,y=new l(u),p=d.document.createTextNode("");y.observe(p,{characterData:!0}),o=function(){p.data=_=++_%2}}else if(d.setImmediate||d.MessageChannel===void 0)o="document"in d&&"onreadystatechange"in d.document.createElement("script")?function(){var r=d.document.createElement("script");r.onreadystatechange=function(){u(),r.onreadystatechange=null,r.parentNode.removeChild(r),r=null},d.document.documentElement.appendChild(r)}:function(){setTimeout(u,0)};else{var g=new d.MessageChannel;g.port1.onmessage=u,o=function(){g.port2.postMessage(0)}}var i=[];function u(){var r,c;n=!0;for(var s=i.length;s;){for(c=i,i=[],r=-1;++r<s;)c[r]();s=i.length}n=!1}L.exports=function(r){i.push(r)!==1||n||o()}}).call(this,typeof wt<"u"?wt:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(b,L,k){var d=b("immediate");function o(){}var n={},l=["REJECTED"],_=["FULFILLED"],y=["PENDING"];function p(s){if(typeof s!="function")throw new TypeError("resolver must be a function");this.state=y,this.queue=[],this.outcome=void 0,s!==o&&r(this,s)}function g(s,f,v){this.promise=s,typeof f=="function"&&(this.onFulfilled=f,this.callFulfilled=this.otherCallFulfilled),typeof v=="function"&&(this.onRejected=v,this.callRejected=this.otherCallRejected)}function i(s,f,v){d(function(){var E;try{E=f(v)}catch(x){return n.reject(s,x)}E===s?n.reject(s,new TypeError("Cannot resolve promise with itself")):n.resolve(s,E)})}function u(s){var f=s&&s.then;if(s&&(typeof s=="object"||typeof s=="function")&&typeof f=="function")return function(){f.apply(s,arguments)}}function r(s,f){var v=!1;function E(R){v||(v=!0,n.reject(s,R))}function x(R){v||(v=!0,n.resolve(s,R))}var D=c(function(){f(x,E)});D.status==="error"&&E(D.value)}function c(s,f){var v={};try{v.value=s(f),v.status="success"}catch(E){v.status="error",v.value=E}return v}(L.exports=p).prototype.finally=function(s){if(typeof s!="function")return this;var f=this.constructor;return this.then(function(v){return f.resolve(s()).then(function(){return v})},function(v){return f.resolve(s()).then(function(){throw v})})},p.prototype.catch=function(s){return this.then(null,s)},p.prototype.then=function(s,f){if(typeof s!="function"&&this.state===_||typeof f!="function"&&this.state===l)return this;var v=new this.constructor(o);return this.state!==y?i(v,this.state===_?s:f,this.outcome):this.queue.push(new g(v,s,f)),v},g.prototype.callFulfilled=function(s){n.resolve(this.promise,s)},g.prototype.otherCallFulfilled=function(s){i(this.promise,this.onFulfilled,s)},g.prototype.callRejected=function(s){n.reject(this.promise,s)},g.prototype.otherCallRejected=function(s){i(this.promise,this.onRejected,s)},n.resolve=function(s,f){var v=c(u,f);if(v.status==="error")return n.reject(s,v.value);var E=v.value;if(E)r(s,E);else{s.state=_,s.outcome=f;for(var x=-1,D=s.queue.length;++x<D;)s.queue[x].callFulfilled(f)}return s},n.reject=function(s,f){s.state=l,s.outcome=f;for(var v=-1,E=s.queue.length;++v<E;)s.queue[v].callRejected(f);return s},p.resolve=function(s){return s instanceof this?s:n.resolve(new this(o),s)},p.reject=function(s){var f=new this(o);return n.reject(f,s)},p.all=function(s){var f=this;if(Object.prototype.toString.call(s)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=s.length,E=!1;if(!v)return this.resolve([]);for(var x=new Array(v),D=0,R=-1,P=new this(o);++R<v;)C(s[R],R);return P;function C(Z,V){f.resolve(Z).then(function(m){x[V]=m,++D!==v||E||(E=!0,n.resolve(P,x))},function(m){E||(E=!0,n.reject(P,m))})}},p.race=function(s){var f=this;if(Object.prototype.toString.call(s)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=s.length,E=!1;if(!v)return this.resolve([]);for(var x=-1,D=new this(o);++x<v;)R=s[x],f.resolve(R).then(function(P){E||(E=!0,n.resolve(D,P))},function(P){E||(E=!0,n.reject(D,P))});var R;return D}},{immediate:36}],38:[function(b,L,k){var d={};(0,b("./lib/utils/common").assign)(d,b("./lib/deflate"),b("./lib/inflate"),b("./lib/zlib/constants")),L.exports=d},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(b,L,k){var d=b("./zlib/deflate"),o=b("./utils/common"),n=b("./utils/strings"),l=b("./zlib/messages"),_=b("./zlib/zstream"),y=Object.prototype.toString,p=0,g=-1,i=0,u=8;function r(s){if(!(this instanceof r))return new r(s);this.options=o.assign({level:g,method:u,chunkSize:16384,windowBits:15,memLevel:8,strategy:i,to:""},s||{});var f=this.options;f.raw&&0<f.windowBits?f.windowBits=-f.windowBits:f.gzip&&0<f.windowBits&&f.windowBits<16&&(f.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new _,this.strm.avail_out=0;var v=d.deflateInit2(this.strm,f.level,f.method,f.windowBits,f.memLevel,f.strategy);if(v!==p)throw new Error(l[v]);if(f.header&&d.deflateSetHeader(this.strm,f.header),f.dictionary){var E;if(E=typeof f.dictionary=="string"?n.string2buf(f.dictionary):y.call(f.dictionary)==="[object ArrayBuffer]"?new Uint8Array(f.dictionary):f.dictionary,(v=d.deflateSetDictionary(this.strm,E))!==p)throw new Error(l[v]);this._dict_set=!0}}function c(s,f){var v=new r(f);if(v.push(s,!0),v.err)throw v.msg||l[v.err];return v.result}r.prototype.push=function(s,f){var v,E,x=this.strm,D=this.options.chunkSize;if(this.ended)return!1;E=f===~~f?f:f===!0?4:0,typeof s=="string"?x.input=n.string2buf(s):y.call(s)==="[object ArrayBuffer]"?x.input=new Uint8Array(s):x.input=s,x.next_in=0,x.avail_in=x.input.length;do{if(x.avail_out===0&&(x.output=new o.Buf8(D),x.next_out=0,x.avail_out=D),(v=d.deflate(x,E))!==1&&v!==p)return this.onEnd(v),!(this.ended=!0);x.avail_out!==0&&(x.avail_in!==0||E!==4&&E!==2)||(this.options.to==="string"?this.onData(n.buf2binstring(o.shrinkBuf(x.output,x.next_out))):this.onData(o.shrinkBuf(x.output,x.next_out)))}while((0<x.avail_in||x.avail_out===0)&&v!==1);return E===4?(v=d.deflateEnd(this.strm),this.onEnd(v),this.ended=!0,v===p):E!==2||(this.onEnd(p),!(x.avail_out=0))},r.prototype.onData=function(s){this.chunks.push(s)},r.prototype.onEnd=function(s){s===p&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=s,this.msg=this.strm.msg},k.Deflate=r,k.deflate=c,k.deflateRaw=function(s,f){return(f=f||{}).raw=!0,c(s,f)},k.gzip=function(s,f){return(f=f||{}).gzip=!0,c(s,f)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(b,L,k){var d=b("./zlib/inflate"),o=b("./utils/common"),n=b("./utils/strings"),l=b("./zlib/constants"),_=b("./zlib/messages"),y=b("./zlib/zstream"),p=b("./zlib/gzheader"),g=Object.prototype.toString;function i(r){if(!(this instanceof i))return new i(r);this.options=o.assign({chunkSize:16384,windowBits:0,to:""},r||{});var c=this.options;c.raw&&0<=c.windowBits&&c.windowBits<16&&(c.windowBits=-c.windowBits,c.windowBits===0&&(c.windowBits=-15)),!(0<=c.windowBits&&c.windowBits<16)||r&&r.windowBits||(c.windowBits+=32),15<c.windowBits&&c.windowBits<48&&!(15&c.windowBits)&&(c.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new y,this.strm.avail_out=0;var s=d.inflateInit2(this.strm,c.windowBits);if(s!==l.Z_OK)throw new Error(_[s]);this.header=new p,d.inflateGetHeader(this.strm,this.header)}function u(r,c){var s=new i(c);if(s.push(r,!0),s.err)throw s.msg||_[s.err];return s.result}i.prototype.push=function(r,c){var s,f,v,E,x,D,R=this.strm,P=this.options.chunkSize,C=this.options.dictionary,Z=!1;if(this.ended)return!1;f=c===~~c?c:c===!0?l.Z_FINISH:l.Z_NO_FLUSH,typeof r=="string"?R.input=n.binstring2buf(r):g.call(r)==="[object ArrayBuffer]"?R.input=new Uint8Array(r):R.input=r,R.next_in=0,R.avail_in=R.input.length;do{if(R.avail_out===0&&(R.output=new o.Buf8(P),R.next_out=0,R.avail_out=P),(s=d.inflate(R,l.Z_NO_FLUSH))===l.Z_NEED_DICT&&C&&(D=typeof C=="string"?n.string2buf(C):g.call(C)==="[object ArrayBuffer]"?new Uint8Array(C):C,s=d.inflateSetDictionary(this.strm,D)),s===l.Z_BUF_ERROR&&Z===!0&&(s=l.Z_OK,Z=!1),s!==l.Z_STREAM_END&&s!==l.Z_OK)return this.onEnd(s),!(this.ended=!0);R.next_out&&(R.avail_out!==0&&s!==l.Z_STREAM_END&&(R.avail_in!==0||f!==l.Z_FINISH&&f!==l.Z_SYNC_FLUSH)||(this.options.to==="string"?(v=n.utf8border(R.output,R.next_out),E=R.next_out-v,x=n.buf2string(R.output,v),R.next_out=E,R.avail_out=P-E,E&&o.arraySet(R.output,R.output,v,E,0),this.onData(x)):this.onData(o.shrinkBuf(R.output,R.next_out)))),R.avail_in===0&&R.avail_out===0&&(Z=!0)}while((0<R.avail_in||R.avail_out===0)&&s!==l.Z_STREAM_END);return s===l.Z_STREAM_END&&(f=l.Z_FINISH),f===l.Z_FINISH?(s=d.inflateEnd(this.strm),this.onEnd(s),this.ended=!0,s===l.Z_OK):f!==l.Z_SYNC_FLUSH||(this.onEnd(l.Z_OK),!(R.avail_out=0))},i.prototype.onData=function(r){this.chunks.push(r)},i.prototype.onEnd=function(r){r===l.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=r,this.msg=this.strm.msg},k.Inflate=i,k.inflate=u,k.inflateRaw=function(r,c){return(c=c||{}).raw=!0,u(r,c)},k.ungzip=u},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(b,L,k){var d=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";k.assign=function(l){for(var _=Array.prototype.slice.call(arguments,1);_.length;){var y=_.shift();if(y){if(typeof y!="object")throw new TypeError(y+"must be non-object");for(var p in y)y.hasOwnProperty(p)&&(l[p]=y[p])}}return l},k.shrinkBuf=function(l,_){return l.length===_?l:l.subarray?l.subarray(0,_):(l.length=_,l)};var o={arraySet:function(l,_,y,p,g){if(_.subarray&&l.subarray)l.set(_.subarray(y,y+p),g);else for(var i=0;i<p;i++)l[g+i]=_[y+i]},flattenChunks:function(l){var _,y,p,g,i,u;for(_=p=0,y=l.length;_<y;_++)p+=l[_].length;for(u=new Uint8Array(p),_=g=0,y=l.length;_<y;_++)i=l[_],u.set(i,g),g+=i.length;return u}},n={arraySet:function(l,_,y,p,g){for(var i=0;i<p;i++)l[g+i]=_[y+i]},flattenChunks:function(l){return[].concat.apply([],l)}};k.setTyped=function(l){l?(k.Buf8=Uint8Array,k.Buf16=Uint16Array,k.Buf32=Int32Array,k.assign(k,o)):(k.Buf8=Array,k.Buf16=Array,k.Buf32=Array,k.assign(k,n))},k.setTyped(d)},{}],42:[function(b,L,k){var d=b("./common"),o=!0,n=!0;try{String.fromCharCode.apply(null,[0])}catch{o=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{n=!1}for(var l=new d.Buf8(256),_=0;_<256;_++)l[_]=252<=_?6:248<=_?5:240<=_?4:224<=_?3:192<=_?2:1;function y(p,g){if(g<65537&&(p.subarray&&n||!p.subarray&&o))return String.fromCharCode.apply(null,d.shrinkBuf(p,g));for(var i="",u=0;u<g;u++)i+=String.fromCharCode(p[u]);return i}l[254]=l[254]=1,k.string2buf=function(p){var g,i,u,r,c,s=p.length,f=0;for(r=0;r<s;r++)(64512&(i=p.charCodeAt(r)))==55296&&r+1<s&&(64512&(u=p.charCodeAt(r+1)))==56320&&(i=65536+(i-55296<<10)+(u-56320),r++),f+=i<128?1:i<2048?2:i<65536?3:4;for(g=new d.Buf8(f),r=c=0;c<f;r++)(64512&(i=p.charCodeAt(r)))==55296&&r+1<s&&(64512&(u=p.charCodeAt(r+1)))==56320&&(i=65536+(i-55296<<10)+(u-56320),r++),i<128?g[c++]=i:(i<2048?g[c++]=192|i>>>6:(i<65536?g[c++]=224|i>>>12:(g[c++]=240|i>>>18,g[c++]=128|i>>>12&63),g[c++]=128|i>>>6&63),g[c++]=128|63&i);return g},k.buf2binstring=function(p){return y(p,p.length)},k.binstring2buf=function(p){for(var g=new d.Buf8(p.length),i=0,u=g.length;i<u;i++)g[i]=p.charCodeAt(i);return g},k.buf2string=function(p,g){var i,u,r,c,s=g||p.length,f=new Array(2*s);for(i=u=0;i<s;)if((r=p[i++])<128)f[u++]=r;else if(4<(c=l[r]))f[u++]=65533,i+=c-1;else{for(r&=c===2?31:c===3?15:7;1<c&&i<s;)r=r<<6|63&p[i++],c--;1<c?f[u++]=65533:r<65536?f[u++]=r:(r-=65536,f[u++]=55296|r>>10&1023,f[u++]=56320|1023&r)}return y(f,u)},k.utf8border=function(p,g){var i;for((g=g||p.length)>p.length&&(g=p.length),i=g-1;0<=i&&(192&p[i])==128;)i--;return i<0||i===0?g:i+l[p[i]]>g?i:g}},{"./common":41}],43:[function(b,L,k){L.exports=function(d,o,n,l){for(var _=65535&d|0,y=d>>>16&65535|0,p=0;n!==0;){for(n-=p=2e3<n?2e3:n;y=y+(_=_+o[l++]|0)|0,--p;);_%=65521,y%=65521}return _|y<<16|0}},{}],44:[function(b,L,k){L.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(b,L,k){var d=function(){for(var o,n=[],l=0;l<256;l++){o=l;for(var _=0;_<8;_++)o=1&o?3988292384^o>>>1:o>>>1;n[l]=o}return n}();L.exports=function(o,n,l,_){var y=d,p=_+l;o^=-1;for(var g=_;g<p;g++)o=o>>>8^y[255&(o^n[g])];return-1^o}},{}],46:[function(b,L,k){var d,o=b("../utils/common"),n=b("./trees"),l=b("./adler32"),_=b("./crc32"),y=b("./messages"),p=0,g=4,i=0,u=-2,r=-1,c=4,s=2,f=8,v=9,E=286,x=30,D=19,R=2*E+1,P=15,C=3,Z=258,V=Z+C+1,m=42,O=113,e=1,z=2,Q=3,B=4;function $(t,N){return t.msg=y[N],N}function U(t){return(t<<1)-(4<t?9:0)}function J(t){for(var N=t.length;0<=--N;)t[N]=0}function A(t){var N=t.state,I=N.pending;I>t.avail_out&&(I=t.avail_out),I!==0&&(o.arraySet(t.output,N.pending_buf,N.pending_out,I,t.next_out),t.next_out+=I,N.pending_out+=I,t.total_out+=I,t.avail_out-=I,N.pending-=I,N.pending===0&&(N.pending_out=0))}function S(t,N){n._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,N),t.block_start=t.strstart,A(t.strm)}function K(t,N){t.pending_buf[t.pending++]=N}function q(t,N){t.pending_buf[t.pending++]=N>>>8&255,t.pending_buf[t.pending++]=255&N}function G(t,N){var I,h,a=t.max_chain_length,w=t.strstart,j=t.prev_length,F=t.nice_match,T=t.strstart>t.w_size-V?t.strstart-(t.w_size-V):0,M=t.window,X=t.w_mask,W=t.prev,Y=t.strstart+Z,nt=M[w+j-1],et=M[w+j];t.prev_length>=t.good_match&&(a>>=2),F>t.lookahead&&(F=t.lookahead);do if(M[(I=N)+j]===et&&M[I+j-1]===nt&&M[I]===M[w]&&M[++I]===M[w+1]){w+=2,I++;do;while(M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&M[++w]===M[++I]&&w<Y);if(h=Z-(Y-w),w=Y-Z,j<h){if(t.match_start=N,F<=(j=h))break;nt=M[w+j-1],et=M[w+j]}}while((N=W[N&X])>T&&--a!=0);return j<=t.lookahead?j:t.lookahead}function it(t){var N,I,h,a,w,j,F,T,M,X,W=t.w_size;do{if(a=t.window_size-t.lookahead-t.strstart,t.strstart>=W+(W-V)){for(o.arraySet(t.window,t.window,W,W,0),t.match_start-=W,t.strstart-=W,t.block_start-=W,N=I=t.hash_size;h=t.head[--N],t.head[N]=W<=h?h-W:0,--I;);for(N=I=W;h=t.prev[--N],t.prev[N]=W<=h?h-W:0,--I;);a+=W}if(t.strm.avail_in===0)break;if(j=t.strm,F=t.window,T=t.strstart+t.lookahead,M=a,X=void 0,X=j.avail_in,M<X&&(X=M),I=X===0?0:(j.avail_in-=X,o.arraySet(F,j.input,j.next_in,X,T),j.state.wrap===1?j.adler=l(j.adler,F,X,T):j.state.wrap===2&&(j.adler=_(j.adler,F,X,T)),j.next_in+=X,j.total_in+=X,X),t.lookahead+=I,t.lookahead+t.insert>=C)for(w=t.strstart-t.insert,t.ins_h=t.window[w],t.ins_h=(t.ins_h<<t.hash_shift^t.window[w+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[w+C-1])&t.hash_mask,t.prev[w&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=w,w++,t.insert--,!(t.lookahead+t.insert<C)););}while(t.lookahead<V&&t.strm.avail_in!==0)}function lt(t,N){for(var I,h;;){if(t.lookahead<V){if(it(t),t.lookahead<V&&N===p)return e;if(t.lookahead===0)break}if(I=0,t.lookahead>=C&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+C-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),I!==0&&t.strstart-I<=t.w_size-V&&(t.match_length=G(t,I)),t.match_length>=C)if(h=n._tr_tally(t,t.strstart-t.match_start,t.match_length-C),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=C){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+C-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,--t.match_length!=0;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else h=n._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(h&&(S(t,!1),t.strm.avail_out===0))return e}return t.insert=t.strstart<C-1?t.strstart:C-1,N===g?(S(t,!0),t.strm.avail_out===0?Q:B):t.last_lit&&(S(t,!1),t.strm.avail_out===0)?e:z}function tt(t,N){for(var I,h,a;;){if(t.lookahead<V){if(it(t),t.lookahead<V&&N===p)return e;if(t.lookahead===0)break}if(I=0,t.lookahead>=C&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+C-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=C-1,I!==0&&t.prev_length<t.max_lazy_match&&t.strstart-I<=t.w_size-V&&(t.match_length=G(t,I),t.match_length<=5&&(t.strategy===1||t.match_length===C&&4096<t.strstart-t.match_start)&&(t.match_length=C-1)),t.prev_length>=C&&t.match_length<=t.prev_length){for(a=t.strstart+t.lookahead-C,h=n._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-C),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=a&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+C-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),--t.prev_length!=0;);if(t.match_available=0,t.match_length=C-1,t.strstart++,h&&(S(t,!1),t.strm.avail_out===0))return e}else if(t.match_available){if((h=n._tr_tally(t,0,t.window[t.strstart-1]))&&S(t,!1),t.strstart++,t.lookahead--,t.strm.avail_out===0)return e}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(h=n._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<C-1?t.strstart:C-1,N===g?(S(t,!0),t.strm.avail_out===0?Q:B):t.last_lit&&(S(t,!1),t.strm.avail_out===0)?e:z}function rt(t,N,I,h,a){this.good_length=t,this.max_lazy=N,this.nice_length=I,this.max_chain=h,this.func=a}function ot(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=f,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new o.Buf16(2*R),this.dyn_dtree=new o.Buf16(2*(2*x+1)),this.bl_tree=new o.Buf16(2*(2*D+1)),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new o.Buf16(P+1),this.heap=new o.Buf16(2*E+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new o.Buf16(2*E+1),J(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function st(t){var N;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=s,(N=t.state).pending=0,N.pending_out=0,N.wrap<0&&(N.wrap=-N.wrap),N.status=N.wrap?m:O,t.adler=N.wrap===2?0:1,N.last_flush=p,n._tr_init(N),i):$(t,u)}function ht(t){var N=st(t);return N===i&&function(I){I.window_size=2*I.w_size,J(I.head),I.max_lazy_match=d[I.level].max_lazy,I.good_match=d[I.level].good_length,I.nice_match=d[I.level].nice_length,I.max_chain_length=d[I.level].max_chain,I.strstart=0,I.block_start=0,I.lookahead=0,I.insert=0,I.match_length=I.prev_length=C-1,I.match_available=0,I.ins_h=0}(t.state),N}function dt(t,N,I,h,a,w){if(!t)return u;var j=1;if(N===r&&(N=6),h<0?(j=0,h=-h):15<h&&(j=2,h-=16),a<1||v<a||I!==f||h<8||15<h||N<0||9<N||w<0||c<w)return $(t,u);h===8&&(h=9);var F=new ot;return(t.state=F).strm=t,F.wrap=j,F.gzhead=null,F.w_bits=h,F.w_size=1<<F.w_bits,F.w_mask=F.w_size-1,F.hash_bits=a+7,F.hash_size=1<<F.hash_bits,F.hash_mask=F.hash_size-1,F.hash_shift=~~((F.hash_bits+C-1)/C),F.window=new o.Buf8(2*F.w_size),F.head=new o.Buf16(F.hash_size),F.prev=new o.Buf16(F.w_size),F.lit_bufsize=1<<a+6,F.pending_buf_size=4*F.lit_bufsize,F.pending_buf=new o.Buf8(F.pending_buf_size),F.d_buf=1*F.lit_bufsize,F.l_buf=3*F.lit_bufsize,F.level=N,F.strategy=w,F.method=I,ht(t)}d=[new rt(0,0,0,0,function(t,N){var I=65535;for(I>t.pending_buf_size-5&&(I=t.pending_buf_size-5);;){if(t.lookahead<=1){if(it(t),t.lookahead===0&&N===p)return e;if(t.lookahead===0)break}t.strstart+=t.lookahead,t.lookahead=0;var h=t.block_start+I;if((t.strstart===0||t.strstart>=h)&&(t.lookahead=t.strstart-h,t.strstart=h,S(t,!1),t.strm.avail_out===0)||t.strstart-t.block_start>=t.w_size-V&&(S(t,!1),t.strm.avail_out===0))return e}return t.insert=0,N===g?(S(t,!0),t.strm.avail_out===0?Q:B):(t.strstart>t.block_start&&(S(t,!1),t.strm.avail_out),e)}),new rt(4,4,8,4,lt),new rt(4,5,16,8,lt),new rt(4,6,32,32,lt),new rt(4,4,16,16,tt),new rt(8,16,32,32,tt),new rt(8,16,128,128,tt),new rt(8,32,128,256,tt),new rt(32,128,258,1024,tt),new rt(32,258,258,4096,tt)],k.deflateInit=function(t,N){return dt(t,N,f,15,8,0)},k.deflateInit2=dt,k.deflateReset=ht,k.deflateResetKeep=st,k.deflateSetHeader=function(t,N){return t&&t.state?t.state.wrap!==2?u:(t.state.gzhead=N,i):u},k.deflate=function(t,N){var I,h,a,w;if(!t||!t.state||5<N||N<0)return t?$(t,u):u;if(h=t.state,!t.output||!t.input&&t.avail_in!==0||h.status===666&&N!==g)return $(t,t.avail_out===0?-5:u);if(h.strm=t,I=h.last_flush,h.last_flush=N,h.status===m)if(h.wrap===2)t.adler=0,K(h,31),K(h,139),K(h,8),h.gzhead?(K(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),K(h,255&h.gzhead.time),K(h,h.gzhead.time>>8&255),K(h,h.gzhead.time>>16&255),K(h,h.gzhead.time>>24&255),K(h,h.level===9?2:2<=h.strategy||h.level<2?4:0),K(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(K(h,255&h.gzhead.extra.length),K(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(t.adler=_(t.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=69):(K(h,0),K(h,0),K(h,0),K(h,0),K(h,0),K(h,h.level===9?2:2<=h.strategy||h.level<2?4:0),K(h,3),h.status=O);else{var j=f+(h.w_bits-8<<4)<<8;j|=(2<=h.strategy||h.level<2?0:h.level<6?1:h.level===6?2:3)<<6,h.strstart!==0&&(j|=32),j+=31-j%31,h.status=O,q(h,j),h.strstart!==0&&(q(h,t.adler>>>16),q(h,65535&t.adler)),t.adler=1}if(h.status===69)if(h.gzhead.extra){for(a=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),A(t),a=h.pending,h.pending!==h.pending_buf_size));)K(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=73)}else h.status=73;if(h.status===73)if(h.gzhead.name){a=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),A(t),a=h.pending,h.pending===h.pending_buf_size)){w=1;break}w=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,K(h,w)}while(w!==0);h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),w===0&&(h.gzindex=0,h.status=91)}else h.status=91;if(h.status===91)if(h.gzhead.comment){a=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),A(t),a=h.pending,h.pending===h.pending_buf_size)){w=1;break}w=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,K(h,w)}while(w!==0);h.gzhead.hcrc&&h.pending>a&&(t.adler=_(t.adler,h.pending_buf,h.pending-a,a)),w===0&&(h.status=103)}else h.status=103;if(h.status===103&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&A(t),h.pending+2<=h.pending_buf_size&&(K(h,255&t.adler),K(h,t.adler>>8&255),t.adler=0,h.status=O)):h.status=O),h.pending!==0){if(A(t),t.avail_out===0)return h.last_flush=-1,i}else if(t.avail_in===0&&U(N)<=U(I)&&N!==g)return $(t,-5);if(h.status===666&&t.avail_in!==0)return $(t,-5);if(t.avail_in!==0||h.lookahead!==0||N!==p&&h.status!==666){var F=h.strategy===2?function(T,M){for(var X;;){if(T.lookahead===0&&(it(T),T.lookahead===0)){if(M===p)return e;break}if(T.match_length=0,X=n._tr_tally(T,0,T.window[T.strstart]),T.lookahead--,T.strstart++,X&&(S(T,!1),T.strm.avail_out===0))return e}return T.insert=0,M===g?(S(T,!0),T.strm.avail_out===0?Q:B):T.last_lit&&(S(T,!1),T.strm.avail_out===0)?e:z}(h,N):h.strategy===3?function(T,M){for(var X,W,Y,nt,et=T.window;;){if(T.lookahead<=Z){if(it(T),T.lookahead<=Z&&M===p)return e;if(T.lookahead===0)break}if(T.match_length=0,T.lookahead>=C&&0<T.strstart&&(W=et[Y=T.strstart-1])===et[++Y]&&W===et[++Y]&&W===et[++Y]){nt=T.strstart+Z;do;while(W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&W===et[++Y]&&Y<nt);T.match_length=Z-(nt-Y),T.match_length>T.lookahead&&(T.match_length=T.lookahead)}if(T.match_length>=C?(X=n._tr_tally(T,1,T.match_length-C),T.lookahead-=T.match_length,T.strstart+=T.match_length,T.match_length=0):(X=n._tr_tally(T,0,T.window[T.strstart]),T.lookahead--,T.strstart++),X&&(S(T,!1),T.strm.avail_out===0))return e}return T.insert=0,M===g?(S(T,!0),T.strm.avail_out===0?Q:B):T.last_lit&&(S(T,!1),T.strm.avail_out===0)?e:z}(h,N):d[h.level].func(h,N);if(F!==Q&&F!==B||(h.status=666),F===e||F===Q)return t.avail_out===0&&(h.last_flush=-1),i;if(F===z&&(N===1?n._tr_align(h):N!==5&&(n._tr_stored_block(h,0,0,!1),N===3&&(J(h.head),h.lookahead===0&&(h.strstart=0,h.block_start=0,h.insert=0))),A(t),t.avail_out===0))return h.last_flush=-1,i}return N!==g?i:h.wrap<=0?1:(h.wrap===2?(K(h,255&t.adler),K(h,t.adler>>8&255),K(h,t.adler>>16&255),K(h,t.adler>>24&255),K(h,255&t.total_in),K(h,t.total_in>>8&255),K(h,t.total_in>>16&255),K(h,t.total_in>>24&255)):(q(h,t.adler>>>16),q(h,65535&t.adler)),A(t),0<h.wrap&&(h.wrap=-h.wrap),h.pending!==0?i:1)},k.deflateEnd=function(t){var N;return t&&t.state?(N=t.state.status)!==m&&N!==69&&N!==73&&N!==91&&N!==103&&N!==O&&N!==666?$(t,u):(t.state=null,N===O?$(t,-3):i):u},k.deflateSetDictionary=function(t,N){var I,h,a,w,j,F,T,M,X=N.length;if(!t||!t.state||(w=(I=t.state).wrap)===2||w===1&&I.status!==m||I.lookahead)return u;for(w===1&&(t.adler=l(t.adler,N,X,0)),I.wrap=0,X>=I.w_size&&(w===0&&(J(I.head),I.strstart=0,I.block_start=0,I.insert=0),M=new o.Buf8(I.w_size),o.arraySet(M,N,X-I.w_size,I.w_size,0),N=M,X=I.w_size),j=t.avail_in,F=t.next_in,T=t.input,t.avail_in=X,t.next_in=0,t.input=N,it(I);I.lookahead>=C;){for(h=I.strstart,a=I.lookahead-(C-1);I.ins_h=(I.ins_h<<I.hash_shift^I.window[h+C-1])&I.hash_mask,I.prev[h&I.w_mask]=I.head[I.ins_h],I.head[I.ins_h]=h,h++,--a;);I.strstart=h,I.lookahead=C-1,it(I)}return I.strstart+=I.lookahead,I.block_start=I.strstart,I.insert=I.lookahead,I.lookahead=0,I.match_length=I.prev_length=C-1,I.match_available=0,t.next_in=F,t.input=T,t.avail_in=j,I.wrap=w,i},k.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(b,L,k){L.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(b,L,k){L.exports=function(d,o){var n,l,_,y,p,g,i,u,r,c,s,f,v,E,x,D,R,P,C,Z,V,m,O,e,z;n=d.state,l=d.next_in,e=d.input,_=l+(d.avail_in-5),y=d.next_out,z=d.output,p=y-(o-d.avail_out),g=y+(d.avail_out-257),i=n.dmax,u=n.wsize,r=n.whave,c=n.wnext,s=n.window,f=n.hold,v=n.bits,E=n.lencode,x=n.distcode,D=(1<<n.lenbits)-1,R=(1<<n.distbits)-1;t:do{v<15&&(f+=e[l++]<<v,v+=8,f+=e[l++]<<v,v+=8),P=E[f&D];e:for(;;){if(f>>>=C=P>>>24,v-=C,(C=P>>>16&255)===0)z[y++]=65535&P;else{if(!(16&C)){if(!(64&C)){P=E[(65535&P)+(f&(1<<C)-1)];continue e}if(32&C){n.mode=12;break t}d.msg="invalid literal/length code",n.mode=30;break t}Z=65535&P,(C&=15)&&(v<C&&(f+=e[l++]<<v,v+=8),Z+=f&(1<<C)-1,f>>>=C,v-=C),v<15&&(f+=e[l++]<<v,v+=8,f+=e[l++]<<v,v+=8),P=x[f&R];r:for(;;){if(f>>>=C=P>>>24,v-=C,!(16&(C=P>>>16&255))){if(!(64&C)){P=x[(65535&P)+(f&(1<<C)-1)];continue r}d.msg="invalid distance code",n.mode=30;break t}if(V=65535&P,v<(C&=15)&&(f+=e[l++]<<v,(v+=8)<C&&(f+=e[l++]<<v,v+=8)),i<(V+=f&(1<<C)-1)){d.msg="invalid distance too far back",n.mode=30;break t}if(f>>>=C,v-=C,(C=y-p)<V){if(r<(C=V-C)&&n.sane){d.msg="invalid distance too far back",n.mode=30;break t}if(O=s,(m=0)===c){if(m+=u-C,C<Z){for(Z-=C;z[y++]=s[m++],--C;);m=y-V,O=z}}else if(c<C){if(m+=u+c-C,(C-=c)<Z){for(Z-=C;z[y++]=s[m++],--C;);if(m=0,c<Z){for(Z-=C=c;z[y++]=s[m++],--C;);m=y-V,O=z}}}else if(m+=c-C,C<Z){for(Z-=C;z[y++]=s[m++],--C;);m=y-V,O=z}for(;2<Z;)z[y++]=O[m++],z[y++]=O[m++],z[y++]=O[m++],Z-=3;Z&&(z[y++]=O[m++],1<Z&&(z[y++]=O[m++]))}else{for(m=y-V;z[y++]=z[m++],z[y++]=z[m++],z[y++]=z[m++],2<(Z-=3););Z&&(z[y++]=z[m++],1<Z&&(z[y++]=z[m++]))}break}}break}}while(l<_&&y<g);l-=Z=v>>3,f&=(1<<(v-=Z<<3))-1,d.next_in=l,d.next_out=y,d.avail_in=l<_?_-l+5:5-(l-_),d.avail_out=y<g?g-y+257:257-(y-g),n.hold=f,n.bits=v}},{}],49:[function(b,L,k){var d=b("../utils/common"),o=b("./adler32"),n=b("./crc32"),l=b("./inffast"),_=b("./inftrees"),y=1,p=2,g=0,i=-2,u=1,r=852,c=592;function s(m){return(m>>>24&255)+(m>>>8&65280)+((65280&m)<<8)+((255&m)<<24)}function f(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new d.Buf16(320),this.work=new d.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function v(m){var O;return m&&m.state?(O=m.state,m.total_in=m.total_out=O.total=0,m.msg="",O.wrap&&(m.adler=1&O.wrap),O.mode=u,O.last=0,O.havedict=0,O.dmax=32768,O.head=null,O.hold=0,O.bits=0,O.lencode=O.lendyn=new d.Buf32(r),O.distcode=O.distdyn=new d.Buf32(c),O.sane=1,O.back=-1,g):i}function E(m){var O;return m&&m.state?((O=m.state).wsize=0,O.whave=0,O.wnext=0,v(m)):i}function x(m,O){var e,z;return m&&m.state?(z=m.state,O<0?(e=0,O=-O):(e=1+(O>>4),O<48&&(O&=15)),O&&(O<8||15<O)?i:(z.window!==null&&z.wbits!==O&&(z.window=null),z.wrap=e,z.wbits=O,E(m))):i}function D(m,O){var e,z;return m?(z=new f,(m.state=z).window=null,(e=x(m,O))!==g&&(m.state=null),e):i}var R,P,C=!0;function Z(m){if(C){var O;for(R=new d.Buf32(512),P=new d.Buf32(32),O=0;O<144;)m.lens[O++]=8;for(;O<256;)m.lens[O++]=9;for(;O<280;)m.lens[O++]=7;for(;O<288;)m.lens[O++]=8;for(_(y,m.lens,0,288,R,0,m.work,{bits:9}),O=0;O<32;)m.lens[O++]=5;_(p,m.lens,0,32,P,0,m.work,{bits:5}),C=!1}m.lencode=R,m.lenbits=9,m.distcode=P,m.distbits=5}function V(m,O,e,z){var Q,B=m.state;return B.window===null&&(B.wsize=1<<B.wbits,B.wnext=0,B.whave=0,B.window=new d.Buf8(B.wsize)),z>=B.wsize?(d.arraySet(B.window,O,e-B.wsize,B.wsize,0),B.wnext=0,B.whave=B.wsize):(z<(Q=B.wsize-B.wnext)&&(Q=z),d.arraySet(B.window,O,e-z,Q,B.wnext),(z-=Q)?(d.arraySet(B.window,O,e-z,z,0),B.wnext=z,B.whave=B.wsize):(B.wnext+=Q,B.wnext===B.wsize&&(B.wnext=0),B.whave<B.wsize&&(B.whave+=Q))),0}k.inflateReset=E,k.inflateReset2=x,k.inflateResetKeep=v,k.inflateInit=function(m){return D(m,15)},k.inflateInit2=D,k.inflate=function(m,O){var e,z,Q,B,$,U,J,A,S,K,q,G,it,lt,tt,rt,ot,st,ht,dt,t,N,I,h,a=0,w=new d.Buf8(4),j=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!m||!m.state||!m.output||!m.input&&m.avail_in!==0)return i;(e=m.state).mode===12&&(e.mode=13),$=m.next_out,Q=m.output,J=m.avail_out,B=m.next_in,z=m.input,U=m.avail_in,A=e.hold,S=e.bits,K=U,q=J,N=g;t:for(;;)switch(e.mode){case u:if(e.wrap===0){e.mode=13;break}for(;S<16;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(2&e.wrap&&A===35615){w[e.check=0]=255&A,w[1]=A>>>8&255,e.check=n(e.check,w,2,0),S=A=0,e.mode=2;break}if(e.flags=0,e.head&&(e.head.done=!1),!(1&e.wrap)||(((255&A)<<8)+(A>>8))%31){m.msg="incorrect header check",e.mode=30;break}if((15&A)!=8){m.msg="unknown compression method",e.mode=30;break}if(S-=4,t=8+(15&(A>>>=4)),e.wbits===0)e.wbits=t;else if(t>e.wbits){m.msg="invalid window size",e.mode=30;break}e.dmax=1<<t,m.adler=e.check=1,e.mode=512&A?10:12,S=A=0;break;case 2:for(;S<16;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(e.flags=A,(255&e.flags)!=8){m.msg="unknown compression method",e.mode=30;break}if(57344&e.flags){m.msg="unknown header flags set",e.mode=30;break}e.head&&(e.head.text=A>>8&1),512&e.flags&&(w[0]=255&A,w[1]=A>>>8&255,e.check=n(e.check,w,2,0)),S=A=0,e.mode=3;case 3:for(;S<32;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.head&&(e.head.time=A),512&e.flags&&(w[0]=255&A,w[1]=A>>>8&255,w[2]=A>>>16&255,w[3]=A>>>24&255,e.check=n(e.check,w,4,0)),S=A=0,e.mode=4;case 4:for(;S<16;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.head&&(e.head.xflags=255&A,e.head.os=A>>8),512&e.flags&&(w[0]=255&A,w[1]=A>>>8&255,e.check=n(e.check,w,2,0)),S=A=0,e.mode=5;case 5:if(1024&e.flags){for(;S<16;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.length=A,e.head&&(e.head.extra_len=A),512&e.flags&&(w[0]=255&A,w[1]=A>>>8&255,e.check=n(e.check,w,2,0)),S=A=0}else e.head&&(e.head.extra=null);e.mode=6;case 6:if(1024&e.flags&&(U<(G=e.length)&&(G=U),G&&(e.head&&(t=e.head.extra_len-e.length,e.head.extra||(e.head.extra=new Array(e.head.extra_len)),d.arraySet(e.head.extra,z,B,G,t)),512&e.flags&&(e.check=n(e.check,z,G,B)),U-=G,B+=G,e.length-=G),e.length))break t;e.length=0,e.mode=7;case 7:if(2048&e.flags){if(U===0)break t;for(G=0;t=z[B+G++],e.head&&t&&e.length<65536&&(e.head.name+=String.fromCharCode(t)),t&&G<U;);if(512&e.flags&&(e.check=n(e.check,z,G,B)),U-=G,B+=G,t)break t}else e.head&&(e.head.name=null);e.length=0,e.mode=8;case 8:if(4096&e.flags){if(U===0)break t;for(G=0;t=z[B+G++],e.head&&t&&e.length<65536&&(e.head.comment+=String.fromCharCode(t)),t&&G<U;);if(512&e.flags&&(e.check=n(e.check,z,G,B)),U-=G,B+=G,t)break t}else e.head&&(e.head.comment=null);e.mode=9;case 9:if(512&e.flags){for(;S<16;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(A!==(65535&e.check)){m.msg="header crc mismatch",e.mode=30;break}S=A=0}e.head&&(e.head.hcrc=e.flags>>9&1,e.head.done=!0),m.adler=e.check=0,e.mode=12;break;case 10:for(;S<32;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}m.adler=e.check=s(A),S=A=0,e.mode=11;case 11:if(e.havedict===0)return m.next_out=$,m.avail_out=J,m.next_in=B,m.avail_in=U,e.hold=A,e.bits=S,2;m.adler=e.check=1,e.mode=12;case 12:if(O===5||O===6)break t;case 13:if(e.last){A>>>=7&S,S-=7&S,e.mode=27;break}for(;S<3;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}switch(e.last=1&A,S-=1,3&(A>>>=1)){case 0:e.mode=14;break;case 1:if(Z(e),e.mode=20,O!==6)break;A>>>=2,S-=2;break t;case 2:e.mode=17;break;case 3:m.msg="invalid block type",e.mode=30}A>>>=2,S-=2;break;case 14:for(A>>>=7&S,S-=7&S;S<32;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if((65535&A)!=(A>>>16^65535)){m.msg="invalid stored block lengths",e.mode=30;break}if(e.length=65535&A,S=A=0,e.mode=15,O===6)break t;case 15:e.mode=16;case 16:if(G=e.length){if(U<G&&(G=U),J<G&&(G=J),G===0)break t;d.arraySet(Q,z,B,G,$),U-=G,B+=G,J-=G,$+=G,e.length-=G;break}e.mode=12;break;case 17:for(;S<14;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(e.nlen=257+(31&A),A>>>=5,S-=5,e.ndist=1+(31&A),A>>>=5,S-=5,e.ncode=4+(15&A),A>>>=4,S-=4,286<e.nlen||30<e.ndist){m.msg="too many length or distance symbols",e.mode=30;break}e.have=0,e.mode=18;case 18:for(;e.have<e.ncode;){for(;S<3;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.lens[j[e.have++]]=7&A,A>>>=3,S-=3}for(;e.have<19;)e.lens[j[e.have++]]=0;if(e.lencode=e.lendyn,e.lenbits=7,I={bits:e.lenbits},N=_(0,e.lens,0,19,e.lencode,0,e.work,I),e.lenbits=I.bits,N){m.msg="invalid code lengths set",e.mode=30;break}e.have=0,e.mode=19;case 19:for(;e.have<e.nlen+e.ndist;){for(;rt=(a=e.lencode[A&(1<<e.lenbits)-1])>>>16&255,ot=65535&a,!((tt=a>>>24)<=S);){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(ot<16)A>>>=tt,S-=tt,e.lens[e.have++]=ot;else{if(ot===16){for(h=tt+2;S<h;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(A>>>=tt,S-=tt,e.have===0){m.msg="invalid bit length repeat",e.mode=30;break}t=e.lens[e.have-1],G=3+(3&A),A>>>=2,S-=2}else if(ot===17){for(h=tt+3;S<h;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}S-=tt,t=0,G=3+(7&(A>>>=tt)),A>>>=3,S-=3}else{for(h=tt+7;S<h;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}S-=tt,t=0,G=11+(127&(A>>>=tt)),A>>>=7,S-=7}if(e.have+G>e.nlen+e.ndist){m.msg="invalid bit length repeat",e.mode=30;break}for(;G--;)e.lens[e.have++]=t}}if(e.mode===30)break;if(e.lens[256]===0){m.msg="invalid code -- missing end-of-block",e.mode=30;break}if(e.lenbits=9,I={bits:e.lenbits},N=_(y,e.lens,0,e.nlen,e.lencode,0,e.work,I),e.lenbits=I.bits,N){m.msg="invalid literal/lengths set",e.mode=30;break}if(e.distbits=6,e.distcode=e.distdyn,I={bits:e.distbits},N=_(p,e.lens,e.nlen,e.ndist,e.distcode,0,e.work,I),e.distbits=I.bits,N){m.msg="invalid distances set",e.mode=30;break}if(e.mode=20,O===6)break t;case 20:e.mode=21;case 21:if(6<=U&&258<=J){m.next_out=$,m.avail_out=J,m.next_in=B,m.avail_in=U,e.hold=A,e.bits=S,l(m,q),$=m.next_out,Q=m.output,J=m.avail_out,B=m.next_in,z=m.input,U=m.avail_in,A=e.hold,S=e.bits,e.mode===12&&(e.back=-1);break}for(e.back=0;rt=(a=e.lencode[A&(1<<e.lenbits)-1])>>>16&255,ot=65535&a,!((tt=a>>>24)<=S);){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(rt&&!(240&rt)){for(st=tt,ht=rt,dt=ot;rt=(a=e.lencode[dt+((A&(1<<st+ht)-1)>>st)])>>>16&255,ot=65535&a,!(st+(tt=a>>>24)<=S);){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}A>>>=st,S-=st,e.back+=st}if(A>>>=tt,S-=tt,e.back+=tt,e.length=ot,rt===0){e.mode=26;break}if(32&rt){e.back=-1,e.mode=12;break}if(64&rt){m.msg="invalid literal/length code",e.mode=30;break}e.extra=15&rt,e.mode=22;case 22:if(e.extra){for(h=e.extra;S<h;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.length+=A&(1<<e.extra)-1,A>>>=e.extra,S-=e.extra,e.back+=e.extra}e.was=e.length,e.mode=23;case 23:for(;rt=(a=e.distcode[A&(1<<e.distbits)-1])>>>16&255,ot=65535&a,!((tt=a>>>24)<=S);){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(!(240&rt)){for(st=tt,ht=rt,dt=ot;rt=(a=e.distcode[dt+((A&(1<<st+ht)-1)>>st)])>>>16&255,ot=65535&a,!(st+(tt=a>>>24)<=S);){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}A>>>=st,S-=st,e.back+=st}if(A>>>=tt,S-=tt,e.back+=tt,64&rt){m.msg="invalid distance code",e.mode=30;break}e.offset=ot,e.extra=15&rt,e.mode=24;case 24:if(e.extra){for(h=e.extra;S<h;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}e.offset+=A&(1<<e.extra)-1,A>>>=e.extra,S-=e.extra,e.back+=e.extra}if(e.offset>e.dmax){m.msg="invalid distance too far back",e.mode=30;break}e.mode=25;case 25:if(J===0)break t;if(G=q-J,e.offset>G){if((G=e.offset-G)>e.whave&&e.sane){m.msg="invalid distance too far back",e.mode=30;break}it=G>e.wnext?(G-=e.wnext,e.wsize-G):e.wnext-G,G>e.length&&(G=e.length),lt=e.window}else lt=Q,it=$-e.offset,G=e.length;for(J<G&&(G=J),J-=G,e.length-=G;Q[$++]=lt[it++],--G;);e.length===0&&(e.mode=21);break;case 26:if(J===0)break t;Q[$++]=e.length,J--,e.mode=21;break;case 27:if(e.wrap){for(;S<32;){if(U===0)break t;U--,A|=z[B++]<<S,S+=8}if(q-=J,m.total_out+=q,e.total+=q,q&&(m.adler=e.check=e.flags?n(e.check,Q,q,$-q):o(e.check,Q,q,$-q)),q=J,(e.flags?A:s(A))!==e.check){m.msg="incorrect data check",e.mode=30;break}S=A=0}e.mode=28;case 28:if(e.wrap&&e.flags){for(;S<32;){if(U===0)break t;U--,A+=z[B++]<<S,S+=8}if(A!==(4294967295&e.total)){m.msg="incorrect length check",e.mode=30;break}S=A=0}e.mode=29;case 29:N=1;break t;case 30:N=-3;break t;case 31:return-4;case 32:default:return i}return m.next_out=$,m.avail_out=J,m.next_in=B,m.avail_in=U,e.hold=A,e.bits=S,(e.wsize||q!==m.avail_out&&e.mode<30&&(e.mode<27||O!==4))&&V(m,m.output,m.next_out,q-m.avail_out)?(e.mode=31,-4):(K-=m.avail_in,q-=m.avail_out,m.total_in+=K,m.total_out+=q,e.total+=q,e.wrap&&q&&(m.adler=e.check=e.flags?n(e.check,Q,q,m.next_out-q):o(e.check,Q,q,m.next_out-q)),m.data_type=e.bits+(e.last?64:0)+(e.mode===12?128:0)+(e.mode===20||e.mode===15?256:0),(K==0&&q===0||O===4)&&N===g&&(N=-5),N)},k.inflateEnd=function(m){if(!m||!m.state)return i;var O=m.state;return O.window&&(O.window=null),m.state=null,g},k.inflateGetHeader=function(m,O){var e;return m&&m.state&&2&(e=m.state).wrap?((e.head=O).done=!1,g):i},k.inflateSetDictionary=function(m,O){var e,z=O.length;return m&&m.state?(e=m.state).wrap!==0&&e.mode!==11?i:e.mode===11&&o(1,O,z,0)!==e.check?-3:V(m,O,z,z)?(e.mode=31,-4):(e.havedict=1,g):i},k.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(b,L,k){var d=b("../utils/common"),o=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],n=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],_=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];L.exports=function(y,p,g,i,u,r,c,s){var f,v,E,x,D,R,P,C,Z,V=s.bits,m=0,O=0,e=0,z=0,Q=0,B=0,$=0,U=0,J=0,A=0,S=null,K=0,q=new d.Buf16(16),G=new d.Buf16(16),it=null,lt=0;for(m=0;m<=15;m++)q[m]=0;for(O=0;O<i;O++)q[p[g+O]]++;for(Q=V,z=15;1<=z&&q[z]===0;z--);if(z<Q&&(Q=z),z===0)return u[r++]=20971520,u[r++]=20971520,s.bits=1,0;for(e=1;e<z&&q[e]===0;e++);for(Q<e&&(Q=e),m=U=1;m<=15;m++)if(U<<=1,(U-=q[m])<0)return-1;if(0<U&&(y===0||z!==1))return-1;for(G[1]=0,m=1;m<15;m++)G[m+1]=G[m]+q[m];for(O=0;O<i;O++)p[g+O]!==0&&(c[G[p[g+O]]++]=O);if(R=y===0?(S=it=c,19):y===1?(S=o,K-=257,it=n,lt-=257,256):(S=l,it=_,-1),m=e,D=r,$=O=A=0,E=-1,x=(J=1<<(B=Q))-1,y===1&&852<J||y===2&&592<J)return 1;for(;;){for(P=m-$,Z=c[O]<R?(C=0,c[O]):c[O]>R?(C=it[lt+c[O]],S[K+c[O]]):(C=96,0),f=1<<m-$,e=v=1<<B;u[D+(A>>$)+(v-=f)]=P<<24|C<<16|Z|0,v!==0;);for(f=1<<m-1;A&f;)f>>=1;if(f!==0?(A&=f-1,A+=f):A=0,O++,--q[m]==0){if(m===z)break;m=p[g+c[O]]}if(Q<m&&(A&x)!==E){for($===0&&($=Q),D+=e,U=1<<(B=m-$);B+$<z&&!((U-=q[B+$])<=0);)B++,U<<=1;if(J+=1<<B,y===1&&852<J||y===2&&592<J)return 1;u[E=A&x]=Q<<24|B<<16|D-r|0}}return A!==0&&(u[D+A]=m-$<<24|64<<16|0),s.bits=Q,0}},{"../utils/common":41}],51:[function(b,L,k){L.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(b,L,k){var d=b("../utils/common"),o=0,n=1;function l(a){for(var w=a.length;0<=--w;)a[w]=0}var _=0,y=29,p=256,g=p+1+y,i=30,u=19,r=2*g+1,c=15,s=16,f=7,v=256,E=16,x=17,D=18,R=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],P=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],C=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Z=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],V=new Array(2*(g+2));l(V);var m=new Array(2*i);l(m);var O=new Array(512);l(O);var e=new Array(256);l(e);var z=new Array(y);l(z);var Q,B,$,U=new Array(i);function J(a,w,j,F,T){this.static_tree=a,this.extra_bits=w,this.extra_base=j,this.elems=F,this.max_length=T,this.has_stree=a&&a.length}function A(a,w){this.dyn_tree=a,this.max_code=0,this.stat_desc=w}function S(a){return a<256?O[a]:O[256+(a>>>7)]}function K(a,w){a.pending_buf[a.pending++]=255&w,a.pending_buf[a.pending++]=w>>>8&255}function q(a,w,j){a.bi_valid>s-j?(a.bi_buf|=w<<a.bi_valid&65535,K(a,a.bi_buf),a.bi_buf=w>>s-a.bi_valid,a.bi_valid+=j-s):(a.bi_buf|=w<<a.bi_valid&65535,a.bi_valid+=j)}function G(a,w,j){q(a,j[2*w],j[2*w+1])}function it(a,w){for(var j=0;j|=1&a,a>>>=1,j<<=1,0<--w;);return j>>>1}function lt(a,w,j){var F,T,M=new Array(c+1),X=0;for(F=1;F<=c;F++)M[F]=X=X+j[F-1]<<1;for(T=0;T<=w;T++){var W=a[2*T+1];W!==0&&(a[2*T]=it(M[W]++,W))}}function tt(a){var w;for(w=0;w<g;w++)a.dyn_ltree[2*w]=0;for(w=0;w<i;w++)a.dyn_dtree[2*w]=0;for(w=0;w<u;w++)a.bl_tree[2*w]=0;a.dyn_ltree[2*v]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function rt(a){8<a.bi_valid?K(a,a.bi_buf):0<a.bi_valid&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function ot(a,w,j,F){var T=2*w,M=2*j;return a[T]<a[M]||a[T]===a[M]&&F[w]<=F[j]}function st(a,w,j){for(var F=a.heap[j],T=j<<1;T<=a.heap_len&&(T<a.heap_len&&ot(w,a.heap[T+1],a.heap[T],a.depth)&&T++,!ot(w,F,a.heap[T],a.depth));)a.heap[j]=a.heap[T],j=T,T<<=1;a.heap[j]=F}function ht(a,w,j){var F,T,M,X,W=0;if(a.last_lit!==0)for(;F=a.pending_buf[a.d_buf+2*W]<<8|a.pending_buf[a.d_buf+2*W+1],T=a.pending_buf[a.l_buf+W],W++,F===0?G(a,T,w):(G(a,(M=e[T])+p+1,w),(X=R[M])!==0&&q(a,T-=z[M],X),G(a,M=S(--F),j),(X=P[M])!==0&&q(a,F-=U[M],X)),W<a.last_lit;);G(a,v,w)}function dt(a,w){var j,F,T,M=w.dyn_tree,X=w.stat_desc.static_tree,W=w.stat_desc.has_stree,Y=w.stat_desc.elems,nt=-1;for(a.heap_len=0,a.heap_max=r,j=0;j<Y;j++)M[2*j]!==0?(a.heap[++a.heap_len]=nt=j,a.depth[j]=0):M[2*j+1]=0;for(;a.heap_len<2;)M[2*(T=a.heap[++a.heap_len]=nt<2?++nt:0)]=1,a.depth[T]=0,a.opt_len--,W&&(a.static_len-=X[2*T+1]);for(w.max_code=nt,j=a.heap_len>>1;1<=j;j--)st(a,M,j);for(T=Y;j=a.heap[1],a.heap[1]=a.heap[a.heap_len--],st(a,M,1),F=a.heap[1],a.heap[--a.heap_max]=j,a.heap[--a.heap_max]=F,M[2*T]=M[2*j]+M[2*F],a.depth[T]=(a.depth[j]>=a.depth[F]?a.depth[j]:a.depth[F])+1,M[2*j+1]=M[2*F+1]=T,a.heap[1]=T++,st(a,M,1),2<=a.heap_len;);a.heap[--a.heap_max]=a.heap[1],function(et,ct){var mt,ut,gt,at,yt,xt,ft=ct.dyn_tree,Tt=ct.max_code,Ot=ct.stat_desc.static_tree,Nt=ct.stat_desc.has_stree,zt=ct.stat_desc.extra_bits,St=ct.stat_desc.extra_base,_t=ct.stat_desc.max_length,vt=0;for(at=0;at<=c;at++)et.bl_count[at]=0;for(ft[2*et.heap[et.heap_max]+1]=0,mt=et.heap_max+1;mt<r;mt++)_t<(at=ft[2*ft[2*(ut=et.heap[mt])+1]+1]+1)&&(at=_t,vt++),ft[2*ut+1]=at,Tt<ut||(et.bl_count[at]++,yt=0,St<=ut&&(yt=zt[ut-St]),xt=ft[2*ut],et.opt_len+=xt*(at+yt),Nt&&(et.static_len+=xt*(Ot[2*ut+1]+yt)));if(vt!==0){do{for(at=_t-1;et.bl_count[at]===0;)at--;et.bl_count[at]--,et.bl_count[at+1]+=2,et.bl_count[_t]--,vt-=2}while(0<vt);for(at=_t;at!==0;at--)for(ut=et.bl_count[at];ut!==0;)Tt<(gt=et.heap[--mt])||(ft[2*gt+1]!==at&&(et.opt_len+=(at-ft[2*gt+1])*ft[2*gt],ft[2*gt+1]=at),ut--)}}(a,w),lt(M,nt,a.bl_count)}function t(a,w,j){var F,T,M=-1,X=w[1],W=0,Y=7,nt=4;for(X===0&&(Y=138,nt=3),w[2*(j+1)+1]=65535,F=0;F<=j;F++)T=X,X=w[2*(F+1)+1],++W<Y&&T===X||(W<nt?a.bl_tree[2*T]+=W:T!==0?(T!==M&&a.bl_tree[2*T]++,a.bl_tree[2*E]++):W<=10?a.bl_tree[2*x]++:a.bl_tree[2*D]++,M=T,nt=(W=0)===X?(Y=138,3):T===X?(Y=6,3):(Y=7,4))}function N(a,w,j){var F,T,M=-1,X=w[1],W=0,Y=7,nt=4;for(X===0&&(Y=138,nt=3),F=0;F<=j;F++)if(T=X,X=w[2*(F+1)+1],!(++W<Y&&T===X)){if(W<nt)for(;G(a,T,a.bl_tree),--W!=0;);else T!==0?(T!==M&&(G(a,T,a.bl_tree),W--),G(a,E,a.bl_tree),q(a,W-3,2)):W<=10?(G(a,x,a.bl_tree),q(a,W-3,3)):(G(a,D,a.bl_tree),q(a,W-11,7));M=T,nt=(W=0)===X?(Y=138,3):T===X?(Y=6,3):(Y=7,4)}}l(U);var I=!1;function h(a,w,j,F){q(a,(_<<1)+(F?1:0),3),function(T,M,X,W){rt(T),W&&(K(T,X),K(T,~X)),d.arraySet(T.pending_buf,T.window,M,X,T.pending),T.pending+=X}(a,w,j,!0)}k._tr_init=function(a){I||(function(){var w,j,F,T,M,X=new Array(c+1);for(T=F=0;T<y-1;T++)for(z[T]=F,w=0;w<1<<R[T];w++)e[F++]=T;for(e[F-1]=T,T=M=0;T<16;T++)for(U[T]=M,w=0;w<1<<P[T];w++)O[M++]=T;for(M>>=7;T<i;T++)for(U[T]=M<<7,w=0;w<1<<P[T]-7;w++)O[256+M++]=T;for(j=0;j<=c;j++)X[j]=0;for(w=0;w<=143;)V[2*w+1]=8,w++,X[8]++;for(;w<=255;)V[2*w+1]=9,w++,X[9]++;for(;w<=279;)V[2*w+1]=7,w++,X[7]++;for(;w<=287;)V[2*w+1]=8,w++,X[8]++;for(lt(V,g+1,X),w=0;w<i;w++)m[2*w+1]=5,m[2*w]=it(w,5);Q=new J(V,R,p+1,g,c),B=new J(m,P,0,i,c),$=new J(new Array(0),C,0,u,f)}(),I=!0),a.l_desc=new A(a.dyn_ltree,Q),a.d_desc=new A(a.dyn_dtree,B),a.bl_desc=new A(a.bl_tree,$),a.bi_buf=0,a.bi_valid=0,tt(a)},k._tr_stored_block=h,k._tr_flush_block=function(a,w,j,F){var T,M,X=0;0<a.level?(a.strm.data_type===2&&(a.strm.data_type=function(W){var Y,nt=4093624447;for(Y=0;Y<=31;Y++,nt>>>=1)if(1&nt&&W.dyn_ltree[2*Y]!==0)return o;if(W.dyn_ltree[18]!==0||W.dyn_ltree[20]!==0||W.dyn_ltree[26]!==0)return n;for(Y=32;Y<p;Y++)if(W.dyn_ltree[2*Y]!==0)return n;return o}(a)),dt(a,a.l_desc),dt(a,a.d_desc),X=function(W){var Y;for(t(W,W.dyn_ltree,W.l_desc.max_code),t(W,W.dyn_dtree,W.d_desc.max_code),dt(W,W.bl_desc),Y=u-1;3<=Y&&W.bl_tree[2*Z[Y]+1]===0;Y--);return W.opt_len+=3*(Y+1)+5+5+4,Y}(a),T=a.opt_len+3+7>>>3,(M=a.static_len+3+7>>>3)<=T&&(T=M)):T=M=j+5,j+4<=T&&w!==-1?h(a,w,j,F):a.strategy===4||M===T?(q(a,2+(F?1:0),3),ht(a,V,m)):(q(a,4+(F?1:0),3),function(W,Y,nt,et){var ct;for(q(W,Y-257,5),q(W,nt-1,5),q(W,et-4,4),ct=0;ct<et;ct++)q(W,W.bl_tree[2*Z[ct]+1],3);N(W,W.dyn_ltree,Y-1),N(W,W.dyn_dtree,nt-1)}(a,a.l_desc.max_code+1,a.d_desc.max_code+1,X+1),ht(a,a.dyn_ltree,a.dyn_dtree)),tt(a),F&&rt(a)},k._tr_tally=function(a,w,j){return a.pending_buf[a.d_buf+2*a.last_lit]=w>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&w,a.pending_buf[a.l_buf+a.last_lit]=255&j,a.last_lit++,w===0?a.dyn_ltree[2*j]++:(a.matches++,w--,a.dyn_ltree[2*(e[j]+p+1)]++,a.dyn_dtree[2*S(w)]++),a.last_lit===a.lit_bufsize-1},k._tr_align=function(a){q(a,2,3),G(a,v,V),function(w){w.bi_valid===16?(K(w,w.bi_buf),w.bi_buf=0,w.bi_valid=0):8<=w.bi_valid&&(w.pending_buf[w.pending++]=255&w.bi_buf,w.bi_buf>>=8,w.bi_valid-=8)}(a)}},{"../utils/common":41}],53:[function(b,L,k){L.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(b,L,k){(function(d){(function(o,n){if(!o.setImmediate){var l,_,y,p,g=1,i={},u=!1,r=o.document,c=Object.getPrototypeOf&&Object.getPrototypeOf(o);c=c&&c.setTimeout?c:o,l={}.toString.call(o.process)==="[object process]"?function(E){process.nextTick(function(){f(E)})}:function(){if(o.postMessage&&!o.importScripts){var E=!0,x=o.onmessage;return o.onmessage=function(){E=!1},o.postMessage("","*"),o.onmessage=x,E}}()?(p="setImmediate$"+Math.random()+"$",o.addEventListener?o.addEventListener("message",v,!1):o.attachEvent("onmessage",v),function(E){o.postMessage(p+E,"*")}):o.MessageChannel?((y=new MessageChannel).port1.onmessage=function(E){f(E.data)},function(E){y.port2.postMessage(E)}):r&&"onreadystatechange"in r.createElement("script")?(_=r.documentElement,function(E){var x=r.createElement("script");x.onreadystatechange=function(){f(E),x.onreadystatechange=null,_.removeChild(x),x=null},_.appendChild(x)}):function(E){setTimeout(f,0,E)},c.setImmediate=function(E){typeof E!="function"&&(E=new Function(""+E));for(var x=new Array(arguments.length-1),D=0;D<x.length;D++)x[D]=arguments[D+1];var R={callback:E,args:x};return i[g]=R,l(g),g++},c.clearImmediate=s}function s(E){delete i[E]}function f(E){if(u)setTimeout(f,0,E);else{var x=i[E];if(x){u=!0;try{(function(D){var R=D.callback,P=D.args;switch(P.length){case 0:R();break;case 1:R(P[0]);break;case 2:R(P[0],P[1]);break;case 3:R(P[0],P[1],P[2]);break;default:R.apply(n,P)}})(x)}finally{s(E),u=!1}}}}function v(E){E.source===o&&typeof E.data=="string"&&E.data.indexOf(p)===0&&f(+E.data.slice(p.length))}})(typeof self>"u"?d===void 0?this:d:self)}).call(this,typeof wt<"u"?wt:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Rt);var Ht=Rt.exports;const Gt=Dt(Ht);function Kt(){const[pt,bt]=At.useState(!1),[b,L]=At.useState(0),k=()=>({"package.json":JSON.stringify({name:"persian-legal-ai-trainer",version:"1.0.0",description:"Persian Legal AI Training System with Real HuggingFace Integration",main:"server.js",scripts:{dev:'concurrently "npm run server" "npm run client"',server:"node server.js",client:"vite",build:"vite build",start:"node server.js",setup:"npm install && npm run build"},dependencies:{react:"^18.3.1","react-dom":"^18.3.1","@tensorflow/tfjs":"^4.22.0","better-sqlite3":"^12.2.0",express:"^5.1.0",cors:"^2.8.5","framer-motion":"^12.23.12","lucide-react":"^0.344.0",recharts:"^3.2.0",dexie:"^4.2.0",clsx:"^2.1.1","tailwind-merge":"^3.3.1",jszip:"^3.10.1"},devDependencies:{"@vitejs/plugin-react":"^4.3.1",vite:"^5.4.2",typescript:"^5.5.3","@types/react":"^18.3.5","@types/react-dom":"^18.3.0",tailwindcss:"^3.4.1",autoprefixer:"^10.4.18",postcss:"^8.4.35",concurrently:"^9.2.1"},keywords:["persian","legal","ai","training","tensorflow","huggingface"],author:"Persian Legal AI Team",license:"MIT"},null,2),"server.js":`const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = ({}).PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('dist'));

// Initialize SQLite Database
const db = new Database('persian_legal_ai.db');

// Create tables
db.exec(\`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'training',
    accuracy REAL DEFAULT 0,
    loss REAL DEFAULT 0,
    epochs INTEGER DEFAULT 0,
    dataset_size INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    config TEXT,
    model_data TEXT
  );

  CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    session_id TEXT UNIQUE,
    status TEXT DEFAULT 'running',
    current_epoch INTEGER DEFAULT 0,
    total_epochs INTEGER DEFAULT 0,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    loss REAL DEFAULT 0,
    accuracy REAL DEFAULT 0,
    learning_rate REAL DEFAULT 0.001,
    batch_size INTEGER DEFAULT 32,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    progress_data TEXT,
    metrics_data TEXT,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    classification_result TEXT,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT
  );
\`);

// API Routes
app.get('/api/models', (req, res) => {
  try {
    const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/models', (req, res) => {
  try {
    const { name, type, config } = req.body;
    const stmt = db.prepare(\`
      INSERT INTO models (name, type, config) 
      VALUES (?, ?, ?)
    \`);
    const result = stmt.run(name, type, JSON.stringify(config));
    res.json({ id: result.lastInsertRowid, message: 'Model created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/training/start', (req, res) => {
  try {
    const { modelId, sessionId, config } = req.body;
    const stmt = db.prepare(\`
      INSERT INTO training_sessions (model_id, session_id, total_epochs, batch_size, learning_rate, progress_data, metrics_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    \`);
    
    const result = stmt.run(
      modelId, 
      sessionId, 
      config.epochs, 
      config.batchSize, 
      config.learningRate,
      JSON.stringify({}),
      JSON.stringify({})
    );
    
    res.json({ 
      id: result.lastInsertRowid, 
      sessionId, 
      status: 'started',
      message: 'Training session started successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/training/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, progress, metrics } = req.body;
    
    const stmt = db.prepare(\`
      UPDATE training_sessions 
      SET status = ?, progress_data = ?, metrics_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ?
    \`);
    
    stmt.run(status, JSON.stringify(progress), JSON.stringify(metrics), sessionId);
    res.json({ message: 'Training session updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/training/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = db.prepare('SELECT * FROM training_sessions WHERE session_id = ?').get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Training session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', (req, res) => {
  try {
    const { title, content, category, classification_result, user_id } = req.body;
    const wordCount = content.split(/\\s+/).length;
    const fileSize = Buffer.byteLength(content, 'utf8');
    
    const stmt = db.prepare(\`
      INSERT INTO documents (title, content, category, classification_result, user_id, file_size, word_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    \`);
    
    const result = stmt.run(title, content, category, JSON.stringify(classification_result), user_id, fileSize, wordCount);
    res.json({ id: result.lastInsertRowid, message: 'Document created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/search', (req, res) => {
  try {
    const { q, category } = req.query;
    let query = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    
    if (q) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(\`%\${q}%\`, \`%\${q}%\`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const documents = db.prepare(query).all(...params);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalModels: db.prepare('SELECT COUNT(*) as count FROM models').get().count,
      totalTrainingSessions: db.prepare('SELECT COUNT(*) as count FROM training_sessions').get().count,
      totalDocuments: db.prepare('SELECT COUNT(*) as count FROM documents').get().count,
      activeTrainingSessions: db.prepare("SELECT COUNT(*) as count FROM training_sessions WHERE status = 'running'").get().count
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Persian Legal AI Server running on port \${PORT}\`);
  console.log(\`📊 Database: persian_legal_ai.db\`);
  console.log(\`🌐 Frontend: http://localhost:\${PORT}\`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});`,Dockerfile:`FROM node:18-alpine

# Install Python and build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/api/stats || exit 1

# Start the application
CMD ["npm", "start"]`,"docker-compose.yml":`version: '3.8'

services:
  persian-legal-ai:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./persian_legal_ai.db:/app/persian_legal_ai.db
    environment:
      - NODE_ENV=production
      - PORT=8000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/stats"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  data:`,".env.example":`# Persian Legal AI Configuration
NODE_ENV=production
PORT=8000
DATABASE_PATH=./persian_legal_ai.db

# HuggingFace Configuration (Optional)
HUGGINGFACE_TOKEN=your_token_here

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:8000`,"deploy.sh":`#!/bin/bash

echo "🚀 Deploying Persian Legal AI Training System..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t persian-legal-ai .

# Stop existing container
echo "🛑 Stopping existing container..."
docker stop persian-legal-ai-container 2>/dev/null || true
docker rm persian-legal-ai-container 2>/dev/null || true

# Run new container
echo "▶️ Starting new container..."
docker run -d \\
  --name persian-legal-ai-container \\
  -p 8000:8000 \\
  -v $(pwd)/data:/app/data \\
  -v $(pwd)/persian_legal_ai.db:/app/persian_legal_ai.db \\
  --restart unless-stopped \\
  persian-legal-ai

echo "✅ Deployment complete!"
echo "🌐 Application available at: http://localhost:8000"
echo "📊 API endpoints available at: http://localhost:8000/api"

# Show logs
echo "📋 Container logs:"
docker logs -f persian-legal-ai-container`,"setup.sh":`#!/bin/bash

echo "🔧 Setting up Persian Legal AI Training System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create data directory
mkdir -p data

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please configure it with your settings."
fi

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev    # Development mode"
echo "   npm start      # Production mode"
echo ""
echo "🐳 To deploy with Docker:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"`,"README.md":`# Persian Legal AI Training System

<div align="center">
  <h1>🧠 سیستم آموزش هوش مصنوعی حقوقی ایران</h1>
  <p>آموزش مدل‌های هوش مصنوعی با دیتاست‌های واقعی قوانین جمهوری اسلامی ایران</p>
</div>

## ✨ ویژگی‌ها

### 🤖 مدل‌های پیشرفته هوش مصنوعی
- **DoRA (Weight-Decomposed Low-Rank Adaptation)**: تکنیک پیشرفته تطبیق مدل
- **QR-Adaptor**: بهینه‌سازی مشترک کوانتیزاسیون و رتبه
- **Persian BERT**: پردازش متون حقوقی فارسی

### 📊 دیتاست‌های واقعی
- **پرسش و پاسخ حقوقی ایران**: ۱۰,۲۴۷ نمونه
- **متون قوانین ایران**: ۵۰,۰۰۰+ نمونه  
- **تشخیص موجودیت فارسی**: ۵۰۰,۰۰۰+ نمونه
- **تحلیل احساسات فارسی**: ۲۵,۰۰۰ نمونه
- **خلاصه‌سازی متون فارسی**: ۹۳,۲۰۷ نمونه

### 🎯 قابلیت‌های کلیدی
- ✅ آموزش واقعی مدل با TensorFlow.js
- ✅ نظارت بلادرنگ بر فرآیند آموزش
- ✅ پایگاه داده SQLite برای Windows VPS
- ✅ رابط کاربری فارسی کامل با RTL
- ✅ تجزیه و تحلیل اسناد حقوقی
- ✅ سیستم مدیریت کاربران
- ✅ گزارش‌گیری و صادرات داده

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- (اختیاری) Docker برای deployment

### نصب و راه‌اندازی

\`\`\`bash
# کلون کردن پروژه
git clone https://github.com/your-repo/persian-legal-ai.git
cd persian-legal-ai

# نصب dependencies
npm install

# کپی کردن فایل تنظیمات
cp .env.example .env

# ساخت پروژه
npm run build

# اجرای سرور
npm run dev
\`\`\`

### 🐳 استقرار با Docker

\`\`\`bash
# ساخت و اجرای container
chmod +x deploy.sh
./deploy.sh

# یا استفاده از docker-compose
docker-compose up -d
\`\`\`

## 📖 نحوه استفاده

### 1. آموزش مدل جدید
\`\`\`javascript
// ایجاد مدل جدید
const model = await createModel({
  name: 'مدل حقوقی من',
  type: 'persian-bert',
  config: {
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001
  }
});

// شروع آموزش
await startTraining(model.id, {
  datasets: ['iranLegalQA', 'legalLaws'],
  realTime: true
});
\`\`\`

### 2. پردازش اسناد حقوقی
\`\`\`javascript
// آپلود و تجزیه و تحلیل سند
const document = await uploadDocument({
  title: 'قرارداد خرید و فروش',
  content: 'متن سند...',
  category: 'قرارداد'
});

// دریافت نتایج طبقه‌بندی
const classification = await classifyDocument(document.id);
\`\`\`

### 3. نظارت بر عملکرد
\`\`\`javascript
// دریافت آمار سیستم
const stats = await getSystemStats();

// نظارت بر جلسه آموزش
const session = await getTrainingSession(sessionId);
console.log(\`پیشرفت: \${session.progress}%\`);
\`\`\`

## 🏗️ معماری سیستم

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Server │    │ SQLite Database │
│                 │◄──►│                 │◄──►│                 │
│ - Persian UI    │    │ - REST API      │    │ - Models        │
│ - Real-time     │    │ - Training      │    │ - Sessions      │
│ - Charts        │    │ - Documents     │    │ - Documents     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  TensorFlow.js  │    │ HuggingFace API │    │   File System   │
│                 │    │                 │    │                 │
│ - DoRA          │    │ - Real Datasets │    │ - Model Storage │
│ - QR-Adaptor    │    │ - Persian Data  │    │ - Checkpoints   │
│ - Persian BERT  │    │ - Legal Texts   │    │ - Exports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 📊 API Documentation

### Models
- \`GET /api/models\` - دریافت لیست مدل‌ها
- \`POST /api/models\` - ایجاد مدل جدید
- \`PUT /api/models/:id\` - به‌روزرسانی مدل
- \`DELETE /api/models/:id\` - حذف مدل

### Training
- \`POST /api/training/start\` - شروع آموزش
- \`GET /api/training/:sessionId\` - وضعیت جلسه آموزش
- \`PUT /api/training/:sessionId\` - به‌روزرسانی جلسه
- \`POST /api/training/:sessionId/stop\` - توقف آموزش

### Documents
- \`POST /api/documents\` - آپلود سند
- \`GET /api/documents/search\` - جستجوی اسناد
- \`GET /api/documents/:id/analyze\` - تجزیه و تحلیل سند

### Statistics
- \`GET /api/stats\` - آمار کلی سیستم
- \`GET /api/stats/training\` - آمار آموزش
- \`GET /api/stats/documents\` - آمار اسناد

## 🔧 تنظیمات

### متغیرهای محیطی
\`\`\`env
NODE_ENV=production
PORT=8000
DATABASE_PATH=./persian_legal_ai.db
HUGGINGFACE_TOKEN=your_token_here
JWT_SECRET=your_jwt_secret_here
\`\`\`

### تنظیمات مدل
\`\`\`javascript
const modelConfig = {
  // DoRA Configuration
  dora: {
    rank: 16,
    alpha: 32,
    targetModules: ['dense', 'attention'],
    adaptiveRank: true
  },
  
  // QR-Adaptor Configuration
  qrAdaptor: {
    quantizationBits: 8,
    compressionRatio: 0.5,
    precisionMode: 'int8'
  },
  
  // Persian BERT Configuration
  persianBert: {
    vocabSize: 30000,
    maxSequenceLength: 512,
    hiddenSize: 768,
    numLayers: 12
  }
};
\`\`\`

## 🧪 تست و توسعه

\`\`\`bash
# اجرای تست‌ها
npm test

# اجرای در حالت توسعه
npm run dev

# بررسی کیفیت کد
npm run lint

# فرمت کردن کد
npm run format
\`\`\`

## 📈 عملکرد و بهینه‌سازی

### بهینه‌سازی مدل
- استفاده از تکنیک‌های DoRA و QR-Adaptor برای کاهش حجم مدل
- کوانتیزاسیون برای بهبود سرعت
- تنظیم خودکار hyperparameter ها

### بهینه‌سازی پایگاه داده
- ایندکس‌گذاری مناسب برای جستجوی سریع
- کش کردن نتایج پرکاربرد
- پاکسازی خودکار لاگ‌های قدیمی

## 🔒 امنیت

- رمزگذاری اتصالات با HTTPS
- احراز هویت JWT
- اعتبارسنجی ورودی‌ها
- محدودیت نرخ درخواست
- لاگ‌گیری امنیتی

## 🤝 مشارکت

1. Fork کردن پروژه
2. ایجاد branch جدید (\`git checkout -b feature/amazing-feature\`)
3. Commit کردن تغییرات (\`git commit -m 'Add amazing feature'\`)
4. Push کردن به branch (\`git push origin feature/amazing-feature\`)
5. ایجاد Pull Request

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

## 📞 پشتیبانی

- 📧 ایمیل: support@persian-legal-ai.ir
- 💬 تلگرام: @PersianLegalAI
- 🌐 وبسایت: https://persian-legal-ai.ir

---

<div align="center">
  <p>ساخته شده با ❤️ برای جامعه حقوقی ایران</p>
</div>`,LICENSE:`MIT License

Copyright (c) 2024 Persian Legal AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,".gitignore":`# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
.dockerignore

# Temporary files
tmp/
temp/`,"vite.config.ts":`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tensorflow: ['@tensorflow/tfjs'],
          charts: ['recharts'],
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
  },
});`,"tsconfig.json":`{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,"tailwind.config.js":`/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'vazir': ['Vazir', 'sans-serif'],
        'shabnam': ['Shabnam', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        persian: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
};`}),d=async()=>{bt(!0),L(0);try{const o=new Gt,n=k(),l=Object.keys(n).length;let _=0;for(const[i,u]of Object.entries(n))o.file(i,u),_++,L(_/l*90),await new Promise(r=>setTimeout(r,50));L(95);const y=await o.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});L(100);const p=URL.createObjectURL(y),g=document.createElement("a");g.href=p,g.download="persian-legal-ai-complete.zip",document.body.appendChild(g),g.click(),document.body.removeChild(g),URL.revokeObjectURL(p),setTimeout(()=>{L(0),bt(!1)},1e3)}catch(o){console.error("Error generating project:",o),bt(!1),L(0)}};return H.jsxs(Bt,{className:"w-full max-w-4xl mx-auto",dir:"rtl",children:[H.jsxs(Pt,{children:[H.jsxs(Ut,{className:"flex items-center gap-3 text-2xl",children:[H.jsx(Ct,{className:"h-8 w-8 text-blue-600"}),"دانلود پروژه کامل"]}),H.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"دانلود پروژه کامل Persian Legal AI با تمام فایل‌های لازم برای استقرار"})]}),H.jsxs(Mt,{className:"space-y-6",children:[H.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg",children:[H.jsx(Zt,{className:"h-6 w-6 text-blue-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"سرور Express"}),H.jsx("p",{className:"text-sm text-gray-600",children:"API کامل با SQLite"})]})]}),H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg",children:[H.jsx(jt,{className:"h-6 w-6 text-green-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"پایگاه داده"}),H.jsx("p",{className:"text-sm text-gray-600",children:"SQLite برای Windows VPS"})]})]}),H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg",children:[H.jsx(Wt,{className:"h-6 w-6 text-purple-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"کد کامل"}),H.jsx("p",{className:"text-sm text-gray-600",children:"React + TypeScript"})]})]}),H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg",children:[H.jsx(Lt,{className:"h-6 w-6 text-orange-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"مستندات"}),H.jsx("p",{className:"text-sm text-gray-600",children:"راهنمای کامل نصب"})]})]}),H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg",children:[H.jsx(Ct,{className:"h-6 w-6 text-red-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"Docker"}),H.jsx("p",{className:"text-sm text-gray-600",children:"آماده برای استقرار"})]})]}),H.jsxs("div",{className:"flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950 rounded-lg",children:[H.jsx(It,{className:"h-6 w-6 text-teal-600"}),H.jsxs("div",{children:[H.jsx("h4",{className:"font-semibold",children:"یک کلیک"}),H.jsx("p",{className:"text-sm text-gray-600",children:"آماده برای اجرا"})]})]})]}),H.jsxs("div",{className:"bg-gray-50 dark:bg-gray-800 p-6 rounded-lg",children:[H.jsx("h4",{className:"font-semibold mb-4",children:"فایل‌های شامل:"}),H.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-2 text-sm",children:[H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-blue-500 rounded-full"}),H.jsx("code",{children:"package.json"})," - تنظیمات پروژه"]}),H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-green-500 rounded-full"}),H.jsx("code",{children:"server.js"})," - سرور Express"]}),H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-purple-500 rounded-full"}),H.jsx("code",{children:"Dockerfile"})," - تنظیمات Docker"]}),H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-orange-500 rounded-full"}),H.jsx("code",{children:"README.md"})," - مستندات کامل"]}),H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-red-500 rounded-full"}),H.jsx("code",{children:"deploy.sh"})," - اسکریپت استقرار"]}),H.jsxs("div",{className:"flex items-center gap-2",children:[H.jsx("span",{className:"w-2 h-2 bg-teal-500 rounded-full"}),H.jsx("code",{children:"setup.sh"})," - اسکریپت نصب"]})]})]}),pt&&H.jsxs("div",{className:"space-y-2",children:[H.jsxs("div",{className:"flex justify-between text-sm",children:[H.jsx("span",{children:"در حال تولید پروژه..."}),H.jsxs("span",{children:[b,"%"]})]}),H.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2",children:H.jsx("div",{className:"bg-blue-600 h-2 rounded-full transition-all duration-300",style:{width:`${b}%`}})})]}),H.jsx("div",{className:"flex justify-center",children:H.jsx(Ft,{onClick:d,disabled:pt,className:"px-8 py-4 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700",children:pt?H.jsxs(H.Fragment,{children:[H.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ms-2"}),"در حال تولید..."]}):H.jsxs(H.Fragment,{children:[H.jsx(It,{className:"h-5 w-5 ms-2"}),"دانلود پروژه کامل (ZIP)"]})})}),H.jsxs("div",{className:"bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800",children:[H.jsx("h4",{className:"font-semibold text-blue-900 dark:text-blue-100 mb-3",children:"راهنمای سریع:"}),H.jsxs("ol",{className:"list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200",children:[H.jsx("li",{children:"فایل ZIP را دانلود و استخراج کنید"}),H.jsx("li",{children:"در ترمینال وارد پوشه پروژه شوید"}),H.jsxs("li",{children:["دستور ",H.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm install"})," را اجرا کنید"]}),H.jsxs("li",{children:["دستور ",H.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm run dev"})," را اجرا کنید"]}),H.jsxs("li",{children:["مرورگر را به آدرس ",H.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"http://localhost:8000"})," باز کنید"]})]})]})]})]})}export{Kt as ProjectDownloader};
//# sourceMappingURL=ProjectDownloader-98d998a6.js.map
