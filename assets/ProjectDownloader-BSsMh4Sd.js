import{c as Zt,q as Yt,N as Et,r as bt,j as C,C as Ot,e as jt,f as zt,a as Dt,D as Lt,F as Pt,p as Ft,t as Kt,b as Vt,h as Bt,Z as Jt}from"./index-CWY8UKKK.js";import{B as It}from"./Badge-CFxG-JkT.js";import{P as $t}from"./Progress-k7YRRXUJ.js";import{j as gt,b as _t,a as Tt}from"./api-config-CoogvJlO.js";import{S as Ut}from"./server-CZepxw15.js";import{C as Qt}from"./clock-BNhs-wvs.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=Zt("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=Zt("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);function St(nt){throw new Error('Could not dynamically require "'+nt+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Ht={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/(function(nt,st){(function(m){nt.exports=m()})(function(){return function m(z,w,d){function l(_,y){if(!w[_]){if(!z[_]){var p=typeof St=="function"&&St;if(!y&&p)return p(_,!0);if(n)return n(_,!0);var b=new Error("Cannot find module '"+_+"'");throw b.code="MODULE_NOT_FOUND",b}var s=w[_]={exports:{}};z[_][0].call(s.exports,function(h){var r=z[_][1][h];return l(r||h)},s,s.exports,m,z,w,d)}return w[_].exports}for(var n=typeof St=="function"&&St,c=0;c<d.length;c++)l(d[c]);return l}({1:[function(m,z,w){var d=m("./utils"),l=m("./support"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";w.encode=function(c){for(var _,y,p,b,s,h,r,i=[],a=0,f=c.length,v=f,E=d.getTypeOf(c)!=="string";a<c.length;)v=f-a,p=E?(_=c[a++],y=a<f?c[a++]:0,a<f?c[a++]:0):(_=c.charCodeAt(a++),y=a<f?c.charCodeAt(a++):0,a<f?c.charCodeAt(a++):0),b=_>>2,s=(3&_)<<4|y>>4,h=1<v?(15&y)<<2|p>>6:64,r=2<v?63&p:64,i.push(n.charAt(b)+n.charAt(s)+n.charAt(h)+n.charAt(r));return i.join("")},w.decode=function(c){var _,y,p,b,s,h,r=0,i=0,a="data:";if(c.substr(0,a.length)===a)throw new Error("Invalid base64 input, it looks like a data url.");var f,v=3*(c=c.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(c.charAt(c.length-1)===n.charAt(64)&&v--,c.charAt(c.length-2)===n.charAt(64)&&v--,v%1!=0)throw new Error("Invalid base64 input, bad content length.");for(f=l.uint8array?new Uint8Array(0|v):new Array(0|v);r<c.length;)_=n.indexOf(c.charAt(r++))<<2|(b=n.indexOf(c.charAt(r++)))>>4,y=(15&b)<<4|(s=n.indexOf(c.charAt(r++)))>>2,p=(3&s)<<6|(h=n.indexOf(c.charAt(r++))),f[i++]=_,s!==64&&(f[i++]=y),h!==64&&(f[i++]=p);return f}},{"./support":30,"./utils":32}],2:[function(m,z,w){var d=m("./external"),l=m("./stream/DataWorker"),n=m("./stream/Crc32Probe"),c=m("./stream/DataLengthProbe");function _(y,p,b,s,h){this.compressedSize=y,this.uncompressedSize=p,this.crc32=b,this.compression=s,this.compressedContent=h}_.prototype={getContentWorker:function(){var y=new l(d.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new c("data_length")),p=this;return y.on("end",function(){if(this.streamInfo.data_length!==p.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),y},getCompressedWorker:function(){return new l(d.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},_.createWorkerFrom=function(y,p,b){return y.pipe(new n).pipe(new c("uncompressedSize")).pipe(p.compressWorker(b)).pipe(new c("compressedSize")).withStreamInfo("compression",p)},z.exports=_},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(m,z,w){var d=m("./stream/GenericWorker");w.STORE={magic:"\0\0",compressWorker:function(){return new d("STORE compression")},uncompressWorker:function(){return new d("STORE decompression")}},w.DEFLATE=m("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(m,z,w){var d=m("./utils"),l=function(){for(var n,c=[],_=0;_<256;_++){n=_;for(var y=0;y<8;y++)n=1&n?3988292384^n>>>1:n>>>1;c[_]=n}return c}();z.exports=function(n,c){return n!==void 0&&n.length?d.getTypeOf(n)!=="string"?function(_,y,p,b){var s=l,h=b+p;_^=-1;for(var r=b;r<h;r++)_=_>>>8^s[255&(_^y[r])];return-1^_}(0|c,n,n.length,0):function(_,y,p,b){var s=l,h=b+p;_^=-1;for(var r=b;r<h;r++)_=_>>>8^s[255&(_^y.charCodeAt(r))];return-1^_}(0|c,n,n.length,0):0}},{"./utils":32}],5:[function(m,z,w){w.base64=!1,w.binary=!1,w.dir=!1,w.createFolders=!0,w.date=null,w.compression=null,w.compressionOptions=null,w.comment=null,w.unixPermissions=null,w.dosPermissions=null},{}],6:[function(m,z,w){var d=null;d=typeof Promise<"u"?Promise:m("lie"),z.exports={Promise:d}},{lie:37}],7:[function(m,z,w){var d=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",l=m("pako"),n=m("./utils"),c=m("./stream/GenericWorker"),_=d?"uint8array":"array";function y(p,b){c.call(this,"FlateWorker/"+p),this._pako=null,this._pakoAction=p,this._pakoOptions=b,this.meta={}}w.magic="\b\0",n.inherits(y,c),y.prototype.processChunk=function(p){this.meta=p.meta,this._pako===null&&this._createPako(),this._pako.push(n.transformTo(_,p.data),!1)},y.prototype.flush=function(){c.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},y.prototype.cleanUp=function(){c.prototype.cleanUp.call(this),this._pako=null},y.prototype._createPako=function(){this._pako=new l[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var p=this;this._pako.onData=function(b){p.push({data:b,meta:p.meta})}},w.compressWorker=function(p){return new y("Deflate",p)},w.uncompressWorker=function(){return new y("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(m,z,w){function d(s,h){var r,i="";for(r=0;r<h;r++)i+=String.fromCharCode(255&s),s>>>=8;return i}function l(s,h,r,i,a,f){var v,E,k=s.file,L=s.compression,R=f!==_.utf8encode,B=n.transformTo("string",f(k.name)),N=n.transformTo("string",_.utf8encode(k.name)),Z=k.comment,V=n.transformTo("string",f(Z)),g=n.transformTo("string",_.utf8encode(Z)),O=N.length!==k.name.length,e=g.length!==Z.length,D="",$="",U="",Q=k.dir,M=k.date,J={crc32:0,compressedSize:0,uncompressedSize:0};h&&!r||(J.crc32=s.crc32,J.compressedSize=s.compressedSize,J.uncompressedSize=s.uncompressedSize);var A=0;h&&(A|=8),R||!O&&!e||(A|=2048);var S=0,K=0;Q&&(S|=16),a==="UNIX"?(K=798,S|=function(G,at){var dt=G;return G||(dt=at?16893:33204),(65535&dt)<<16}(k.unixPermissions,Q)):(K=20,S|=function(G){return 63&(G||0)}(k.dosPermissions)),v=M.getUTCHours(),v<<=6,v|=M.getUTCMinutes(),v<<=5,v|=M.getUTCSeconds()/2,E=M.getUTCFullYear()-1980,E<<=4,E|=M.getUTCMonth()+1,E<<=5,E|=M.getUTCDate(),O&&($=d(1,1)+d(y(B),4)+N,D+="up"+d($.length,2)+$),e&&(U=d(1,1)+d(y(V),4)+g,D+="uc"+d(U.length,2)+U);var q="";return q+=`
\0`,q+=d(A,2),q+=L.magic,q+=d(v,2),q+=d(E,2),q+=d(J.crc32,4),q+=d(J.compressedSize,4),q+=d(J.uncompressedSize,4),q+=d(B.length,2),q+=d(D.length,2),{fileRecord:p.LOCAL_FILE_HEADER+q+B+D,dirRecord:p.CENTRAL_FILE_HEADER+d(K,2)+q+d(V.length,2)+"\0\0\0\0"+d(S,4)+d(i,4)+B+D+V}}var n=m("../utils"),c=m("../stream/GenericWorker"),_=m("../utf8"),y=m("../crc32"),p=m("../signature");function b(s,h,r,i){c.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=h,this.zipPlatform=r,this.encodeFileName=i,this.streamFiles=s,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}n.inherits(b,c),b.prototype.push=function(s){var h=s.meta.percent||0,r=this.entriesCount,i=this._sources.length;this.accumulate?this.contentBuffer.push(s):(this.bytesWritten+=s.data.length,c.prototype.push.call(this,{data:s.data,meta:{currentFile:this.currentFile,percent:r?(h+100*(r-i-1))/r:100}}))},b.prototype.openedSource=function(s){this.currentSourceOffset=this.bytesWritten,this.currentFile=s.file.name;var h=this.streamFiles&&!s.file.dir;if(h){var r=l(s,h,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},b.prototype.closedSource=function(s){this.accumulate=!1;var h=this.streamFiles&&!s.file.dir,r=l(s,h,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),h)this.push({data:function(i){return p.DATA_DESCRIPTOR+d(i.crc32,4)+d(i.compressedSize,4)+d(i.uncompressedSize,4)}(s),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},b.prototype.flush=function(){for(var s=this.bytesWritten,h=0;h<this.dirRecords.length;h++)this.push({data:this.dirRecords[h],meta:{percent:100}});var r=this.bytesWritten-s,i=function(a,f,v,E,k){var L=n.transformTo("string",k(E));return p.CENTRAL_DIRECTORY_END+"\0\0\0\0"+d(a,2)+d(a,2)+d(f,4)+d(v,4)+d(L.length,2)+L}(this.dirRecords.length,r,s,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}})},b.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},b.prototype.registerPrevious=function(s){this._sources.push(s);var h=this;return s.on("data",function(r){h.processChunk(r)}),s.on("end",function(){h.closedSource(h.previous.streamInfo),h._sources.length?h.prepareNextSource():h.end()}),s.on("error",function(r){h.error(r)}),this},b.prototype.resume=function(){return!!c.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},b.prototype.error=function(s){var h=this._sources;if(!c.prototype.error.call(this,s))return!1;for(var r=0;r<h.length;r++)try{h[r].error(s)}catch{}return!0},b.prototype.lock=function(){c.prototype.lock.call(this);for(var s=this._sources,h=0;h<s.length;h++)s[h].lock()},z.exports=b},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(m,z,w){var d=m("../compressions"),l=m("./ZipFileWorker");w.generateWorker=function(n,c,_){var y=new l(c.streamFiles,_,c.platform,c.encodeFileName),p=0;try{n.forEach(function(b,s){p++;var h=function(f,v){var E=f||v,k=d[E];if(!k)throw new Error(E+" is not a valid compression method !");return k}(s.options.compression,c.compression),r=s.options.compressionOptions||c.compressionOptions||{},i=s.dir,a=s.date;s._compressWorker(h,r).withStreamInfo("file",{name:b,dir:i,date:a,comment:s.comment||"",unixPermissions:s.unixPermissions,dosPermissions:s.dosPermissions}).pipe(y)}),y.entriesCount=p}catch(b){y.error(b)}return y}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(m,z,w){function d(){if(!(this instanceof d))return new d;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var l=new d;for(var n in this)typeof this[n]!="function"&&(l[n]=this[n]);return l}}(d.prototype=m("./object")).loadAsync=m("./load"),d.support=m("./support"),d.defaults=m("./defaults"),d.version="3.10.1",d.loadAsync=function(l,n){return new d().loadAsync(l,n)},d.external=m("./external"),z.exports=d},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(m,z,w){var d=m("./utils"),l=m("./external"),n=m("./utf8"),c=m("./zipEntries"),_=m("./stream/Crc32Probe"),y=m("./nodejsUtils");function p(b){return new l.Promise(function(s,h){var r=b.decompressed.getContentWorker().pipe(new _);r.on("error",function(i){h(i)}).on("end",function(){r.streamInfo.crc32!==b.decompressed.crc32?h(new Error("Corrupted zip : CRC32 mismatch")):s()}).resume()})}z.exports=function(b,s){var h=this;return s=d.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),y.isNode&&y.isStream(b)?l.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):d.prepareContent("the loaded zip file",b,!0,s.optimizedBinaryString,s.base64).then(function(r){var i=new c(s);return i.load(r),i}).then(function(r){var i=[l.Promise.resolve(r)],a=r.files;if(s.checkCRC32)for(var f=0;f<a.length;f++)i.push(p(a[f]));return l.Promise.all(i)}).then(function(r){for(var i=r.shift(),a=i.files,f=0;f<a.length;f++){var v=a[f],E=v.fileNameStr,k=d.resolve(v.fileNameStr);h.file(k,v.decompressed,{binary:!0,optimizedBinaryString:!0,date:v.date,dir:v.dir,comment:v.fileCommentStr.length?v.fileCommentStr:null,unixPermissions:v.unixPermissions,dosPermissions:v.dosPermissions,createFolders:s.createFolders}),v.dir||(h.file(k).unsafeOriginalName=E)}return i.zipComment.length&&(h.comment=i.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(m,z,w){var d=m("../utils"),l=m("../stream/GenericWorker");function n(c,_){l.call(this,"Nodejs stream input adapter for "+c),this._upstreamEnded=!1,this._bindStream(_)}d.inherits(n,l),n.prototype._bindStream=function(c){var _=this;(this._stream=c).pause(),c.on("data",function(y){_.push({data:y,meta:{percent:0}})}).on("error",function(y){_.isPaused?this.generatedError=y:_.error(y)}).on("end",function(){_.isPaused?_._upstreamEnded=!0:_.end()})},n.prototype.pause=function(){return!!l.prototype.pause.call(this)&&(this._stream.pause(),!0)},n.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},z.exports=n},{"../stream/GenericWorker":28,"../utils":32}],13:[function(m,z,w){var d=m("readable-stream").Readable;function l(n,c,_){d.call(this,c),this._helper=n;var y=this;n.on("data",function(p,b){y.push(p)||y._helper.pause(),_&&_(b)}).on("error",function(p){y.emit("error",p)}).on("end",function(){y.push(null)})}m("../utils").inherits(l,d),l.prototype._read=function(){this._helper.resume()},z.exports=l},{"../utils":32,"readable-stream":16}],14:[function(m,z,w){z.exports={isNode:typeof Buffer<"u",newBufferFrom:function(d,l){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(d,l);if(typeof d=="number")throw new Error('The "data" argument must not be a number');return new Buffer(d,l)},allocBuffer:function(d){if(Buffer.alloc)return Buffer.alloc(d);var l=new Buffer(d);return l.fill(0),l},isBuffer:function(d){return Buffer.isBuffer(d)},isStream:function(d){return d&&typeof d.on=="function"&&typeof d.pause=="function"&&typeof d.resume=="function"}}},{}],15:[function(m,z,w){function d(k,L,R){var B,N=n.getTypeOf(L),Z=n.extend(R||{},y);Z.date=Z.date||new Date,Z.compression!==null&&(Z.compression=Z.compression.toUpperCase()),typeof Z.unixPermissions=="string"&&(Z.unixPermissions=parseInt(Z.unixPermissions,8)),Z.unixPermissions&&16384&Z.unixPermissions&&(Z.dir=!0),Z.dosPermissions&&16&Z.dosPermissions&&(Z.dir=!0),Z.dir&&(k=a(k)),Z.createFolders&&(B=i(k))&&f.call(this,B,!0);var V=N==="string"&&Z.binary===!1&&Z.base64===!1;R&&R.binary!==void 0||(Z.binary=!V),(L instanceof p&&L.uncompressedSize===0||Z.dir||!L||L.length===0)&&(Z.base64=!1,Z.binary=!0,L="",Z.compression="STORE",N="string");var g=null;g=L instanceof p||L instanceof c?L:h.isNode&&h.isStream(L)?new r(k,L):n.prepareContent(k,L,Z.binary,Z.optimizedBinaryString,Z.base64);var O=new b(k,g,Z);this.files[k]=O}var l=m("./utf8"),n=m("./utils"),c=m("./stream/GenericWorker"),_=m("./stream/StreamHelper"),y=m("./defaults"),p=m("./compressedObject"),b=m("./zipObject"),s=m("./generate"),h=m("./nodejsUtils"),r=m("./nodejs/NodejsStreamInputAdapter"),i=function(k){k.slice(-1)==="/"&&(k=k.substring(0,k.length-1));var L=k.lastIndexOf("/");return 0<L?k.substring(0,L):""},a=function(k){return k.slice(-1)!=="/"&&(k+="/"),k},f=function(k,L){return L=L!==void 0?L:y.createFolders,k=a(k),this.files[k]||d.call(this,k,null,{dir:!0,createFolders:L}),this.files[k]};function v(k){return Object.prototype.toString.call(k)==="[object RegExp]"}var E={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(k){var L,R,B;for(L in this.files)B=this.files[L],(R=L.slice(this.root.length,L.length))&&L.slice(0,this.root.length)===this.root&&k(R,B)},filter:function(k){var L=[];return this.forEach(function(R,B){k(R,B)&&L.push(B)}),L},file:function(k,L,R){if(arguments.length!==1)return k=this.root+k,d.call(this,k,L,R),this;if(v(k)){var B=k;return this.filter(function(Z,V){return!V.dir&&B.test(Z)})}var N=this.files[this.root+k];return N&&!N.dir?N:null},folder:function(k){if(!k)return this;if(v(k))return this.filter(function(N,Z){return Z.dir&&k.test(N)});var L=this.root+k,R=f.call(this,L),B=this.clone();return B.root=R.name,B},remove:function(k){k=this.root+k;var L=this.files[k];if(L||(k.slice(-1)!=="/"&&(k+="/"),L=this.files[k]),L&&!L.dir)delete this.files[k];else for(var R=this.filter(function(N,Z){return Z.name.slice(0,k.length)===k}),B=0;B<R.length;B++)delete this.files[R[B].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(k){var L,R={};try{if((R=n.extend(k||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:l.utf8encode})).type=R.type.toLowerCase(),R.compression=R.compression.toUpperCase(),R.type==="binarystring"&&(R.type="string"),!R.type)throw new Error("No output type specified.");n.checkSupport(R.type),R.platform!=="darwin"&&R.platform!=="freebsd"&&R.platform!=="linux"&&R.platform!=="sunos"||(R.platform="UNIX"),R.platform==="win32"&&(R.platform="DOS");var B=R.comment||this.comment||"";L=s.generateWorker(this,R,B)}catch(N){(L=new c("error")).error(N)}return new _(L,R.type||"string",R.mimeType)},generateAsync:function(k,L){return this.generateInternalStream(k).accumulate(L)},generateNodeStream:function(k,L){return(k=k||{}).type||(k.type="nodebuffer"),this.generateInternalStream(k).toNodejsStream(L)}};z.exports=E},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(m,z,w){z.exports=m("stream")},{stream:void 0}],17:[function(m,z,w){var d=m("./DataReader");function l(n){d.call(this,n);for(var c=0;c<this.data.length;c++)n[c]=255&n[c]}m("../utils").inherits(l,d),l.prototype.byteAt=function(n){return this.data[this.zero+n]},l.prototype.lastIndexOfSignature=function(n){for(var c=n.charCodeAt(0),_=n.charCodeAt(1),y=n.charCodeAt(2),p=n.charCodeAt(3),b=this.length-4;0<=b;--b)if(this.data[b]===c&&this.data[b+1]===_&&this.data[b+2]===y&&this.data[b+3]===p)return b-this.zero;return-1},l.prototype.readAndCheckSignature=function(n){var c=n.charCodeAt(0),_=n.charCodeAt(1),y=n.charCodeAt(2),p=n.charCodeAt(3),b=this.readData(4);return c===b[0]&&_===b[1]&&y===b[2]&&p===b[3]},l.prototype.readData=function(n){if(this.checkOffset(n),n===0)return[];var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},z.exports=l},{"../utils":32,"./DataReader":18}],18:[function(m,z,w){var d=m("../utils");function l(n){this.data=n,this.length=n.length,this.index=0,this.zero=0}l.prototype={checkOffset:function(n){this.checkIndex(this.index+n)},checkIndex:function(n){if(this.length<this.zero+n||n<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+n+"). Corrupted zip ?")},setIndex:function(n){this.checkIndex(n),this.index=n},skip:function(n){this.setIndex(this.index+n)},byteAt:function(){},readInt:function(n){var c,_=0;for(this.checkOffset(n),c=this.index+n-1;c>=this.index;c--)_=(_<<8)+this.byteAt(c);return this.index+=n,_},readString:function(n){return d.transformTo("string",this.readData(n))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var n=this.readInt(4);return new Date(Date.UTC(1980+(n>>25&127),(n>>21&15)-1,n>>16&31,n>>11&31,n>>5&63,(31&n)<<1))}},z.exports=l},{"../utils":32}],19:[function(m,z,w){var d=m("./Uint8ArrayReader");function l(n){d.call(this,n)}m("../utils").inherits(l,d),l.prototype.readData=function(n){this.checkOffset(n);var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},z.exports=l},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(m,z,w){var d=m("./DataReader");function l(n){d.call(this,n)}m("../utils").inherits(l,d),l.prototype.byteAt=function(n){return this.data.charCodeAt(this.zero+n)},l.prototype.lastIndexOfSignature=function(n){return this.data.lastIndexOf(n)-this.zero},l.prototype.readAndCheckSignature=function(n){return n===this.readData(4)},l.prototype.readData=function(n){this.checkOffset(n);var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},z.exports=l},{"../utils":32,"./DataReader":18}],21:[function(m,z,w){var d=m("./ArrayReader");function l(n){d.call(this,n)}m("../utils").inherits(l,d),l.prototype.readData=function(n){if(this.checkOffset(n),n===0)return new Uint8Array(0);var c=this.data.subarray(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},z.exports=l},{"../utils":32,"./ArrayReader":17}],22:[function(m,z,w){var d=m("../utils"),l=m("../support"),n=m("./ArrayReader"),c=m("./StringReader"),_=m("./NodeBufferReader"),y=m("./Uint8ArrayReader");z.exports=function(p){var b=d.getTypeOf(p);return d.checkSupport(b),b!=="string"||l.uint8array?b==="nodebuffer"?new _(p):l.uint8array?new y(d.transformTo("uint8array",p)):new n(d.transformTo("array",p)):new c(p)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(m,z,w){w.LOCAL_FILE_HEADER="PK",w.CENTRAL_FILE_HEADER="PK",w.CENTRAL_DIRECTORY_END="PK",w.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",w.ZIP64_CENTRAL_DIRECTORY_END="PK",w.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(m,z,w){var d=m("./GenericWorker"),l=m("../utils");function n(c){d.call(this,"ConvertWorker to "+c),this.destType=c}l.inherits(n,d),n.prototype.processChunk=function(c){this.push({data:l.transformTo(this.destType,c.data),meta:c.meta})},z.exports=n},{"../utils":32,"./GenericWorker":28}],25:[function(m,z,w){var d=m("./GenericWorker"),l=m("../crc32");function n(){d.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}m("../utils").inherits(n,d),n.prototype.processChunk=function(c){this.streamInfo.crc32=l(c.data,this.streamInfo.crc32||0),this.push(c)},z.exports=n},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(m,z,w){var d=m("../utils"),l=m("./GenericWorker");function n(c){l.call(this,"DataLengthProbe for "+c),this.propName=c,this.withStreamInfo(c,0)}d.inherits(n,l),n.prototype.processChunk=function(c){if(c){var _=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=_+c.data.length}l.prototype.processChunk.call(this,c)},z.exports=n},{"../utils":32,"./GenericWorker":28}],27:[function(m,z,w){var d=m("../utils"),l=m("./GenericWorker");function n(c){l.call(this,"DataWorker");var _=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,c.then(function(y){_.dataIsReady=!0,_.data=y,_.max=y&&y.length||0,_.type=d.getTypeOf(y),_.isPaused||_._tickAndRepeat()},function(y){_.error(y)})}d.inherits(n,l),n.prototype.cleanUp=function(){l.prototype.cleanUp.call(this),this.data=null},n.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,d.delay(this._tickAndRepeat,[],this)),!0)},n.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(d.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},n.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var c=null,_=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":c=this.data.substring(this.index,_);break;case"uint8array":c=this.data.subarray(this.index,_);break;case"array":case"nodebuffer":c=this.data.slice(this.index,_)}return this.index=_,this.push({data:c,meta:{percent:this.max?this.index/this.max*100:0}})},z.exports=n},{"../utils":32,"./GenericWorker":28}],28:[function(m,z,w){function d(l){this.name=l||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}d.prototype={push:function(l){this.emit("data",l)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(l){this.emit("error",l)}return!0},error:function(l){return!this.isFinished&&(this.isPaused?this.generatedError=l:(this.isFinished=!0,this.emit("error",l),this.previous&&this.previous.error(l),this.cleanUp()),!0)},on:function(l,n){return this._listeners[l].push(n),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(l,n){if(this._listeners[l])for(var c=0;c<this._listeners[l].length;c++)this._listeners[l][c].call(this,n)},pipe:function(l){return l.registerPrevious(this)},registerPrevious:function(l){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=l.streamInfo,this.mergeStreamInfo(),this.previous=l;var n=this;return l.on("data",function(c){n.processChunk(c)}),l.on("end",function(){n.end()}),l.on("error",function(c){n.error(c)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var l=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),l=!0),this.previous&&this.previous.resume(),!l},flush:function(){},processChunk:function(l){this.push(l)},withStreamInfo:function(l,n){return this.extraStreamInfo[l]=n,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var l in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,l)&&(this.streamInfo[l]=this.extraStreamInfo[l])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var l="Worker "+this.name;return this.previous?this.previous+" -> "+l:l}},z.exports=d},{}],29:[function(m,z,w){var d=m("../utils"),l=m("./ConvertWorker"),n=m("./GenericWorker"),c=m("../base64"),_=m("../support"),y=m("../external"),p=null;if(_.nodestream)try{p=m("../nodejs/NodejsStreamOutputAdapter")}catch{}function b(h,r){return new y.Promise(function(i,a){var f=[],v=h._internalType,E=h._outputType,k=h._mimeType;h.on("data",function(L,R){f.push(L),r&&r(R)}).on("error",function(L){f=[],a(L)}).on("end",function(){try{var L=function(R,B,N){switch(R){case"blob":return d.newBlob(d.transformTo("arraybuffer",B),N);case"base64":return c.encode(B);default:return d.transformTo(R,B)}}(E,function(R,B){var N,Z=0,V=null,g=0;for(N=0;N<B.length;N++)g+=B[N].length;switch(R){case"string":return B.join("");case"array":return Array.prototype.concat.apply([],B);case"uint8array":for(V=new Uint8Array(g),N=0;N<B.length;N++)V.set(B[N],Z),Z+=B[N].length;return V;case"nodebuffer":return Buffer.concat(B);default:throw new Error("concat : unsupported type '"+R+"'")}}(v,f),k);i(L)}catch(R){a(R)}f=[]}).resume()})}function s(h,r,i){var a=r;switch(r){case"blob":case"arraybuffer":a="uint8array";break;case"base64":a="string"}try{this._internalType=a,this._outputType=r,this._mimeType=i,d.checkSupport(a),this._worker=h.pipe(new l(a)),h.lock()}catch(f){this._worker=new n("error"),this._worker.error(f)}}s.prototype={accumulate:function(h){return b(this,h)},on:function(h,r){var i=this;return h==="data"?this._worker.on(h,function(a){r.call(i,a.data,a.meta)}):this._worker.on(h,function(){d.delay(r,arguments,i)}),this},resume:function(){return d.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(h){if(d.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new p(this,{objectMode:this._outputType!=="nodebuffer"},h)}},z.exports=s},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(m,z,w){if(w.base64=!0,w.array=!0,w.string=!0,w.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",w.nodebuffer=typeof Buffer<"u",w.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")w.blob=!1;else{var d=new ArrayBuffer(0);try{w.blob=new Blob([d],{type:"application/zip"}).size===0}catch{try{var l=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);l.append(d),w.blob=l.getBlob("application/zip").size===0}catch{w.blob=!1}}}try{w.nodestream=!!m("readable-stream").Readable}catch{w.nodestream=!1}},{"readable-stream":16}],31:[function(m,z,w){for(var d=m("./utils"),l=m("./support"),n=m("./nodejsUtils"),c=m("./stream/GenericWorker"),_=new Array(256),y=0;y<256;y++)_[y]=252<=y?6:248<=y?5:240<=y?4:224<=y?3:192<=y?2:1;_[254]=_[254]=1;function p(){c.call(this,"utf-8 decode"),this.leftOver=null}function b(){c.call(this,"utf-8 encode")}w.utf8encode=function(s){return l.nodebuffer?n.newBufferFrom(s,"utf-8"):function(h){var r,i,a,f,v,E=h.length,k=0;for(f=0;f<E;f++)(64512&(i=h.charCodeAt(f)))==55296&&f+1<E&&(64512&(a=h.charCodeAt(f+1)))==56320&&(i=65536+(i-55296<<10)+(a-56320),f++),k+=i<128?1:i<2048?2:i<65536?3:4;for(r=l.uint8array?new Uint8Array(k):new Array(k),f=v=0;v<k;f++)(64512&(i=h.charCodeAt(f)))==55296&&f+1<E&&(64512&(a=h.charCodeAt(f+1)))==56320&&(i=65536+(i-55296<<10)+(a-56320),f++),i<128?r[v++]=i:(i<2048?r[v++]=192|i>>>6:(i<65536?r[v++]=224|i>>>12:(r[v++]=240|i>>>18,r[v++]=128|i>>>12&63),r[v++]=128|i>>>6&63),r[v++]=128|63&i);return r}(s)},w.utf8decode=function(s){return l.nodebuffer?d.transformTo("nodebuffer",s).toString("utf-8"):function(h){var r,i,a,f,v=h.length,E=new Array(2*v);for(r=i=0;r<v;)if((a=h[r++])<128)E[i++]=a;else if(4<(f=_[a]))E[i++]=65533,r+=f-1;else{for(a&=f===2?31:f===3?15:7;1<f&&r<v;)a=a<<6|63&h[r++],f--;1<f?E[i++]=65533:a<65536?E[i++]=a:(a-=65536,E[i++]=55296|a>>10&1023,E[i++]=56320|1023&a)}return E.length!==i&&(E.subarray?E=E.subarray(0,i):E.length=i),d.applyFromCharCode(E)}(s=d.transformTo(l.uint8array?"uint8array":"array",s))},d.inherits(p,c),p.prototype.processChunk=function(s){var h=d.transformTo(l.uint8array?"uint8array":"array",s.data);if(this.leftOver&&this.leftOver.length){if(l.uint8array){var r=h;(h=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),h.set(r,this.leftOver.length)}else h=this.leftOver.concat(h);this.leftOver=null}var i=function(f,v){var E;for((v=v||f.length)>f.length&&(v=f.length),E=v-1;0<=E&&(192&f[E])==128;)E--;return E<0||E===0?v:E+_[f[E]]>v?E:v}(h),a=h;i!==h.length&&(l.uint8array?(a=h.subarray(0,i),this.leftOver=h.subarray(i,h.length)):(a=h.slice(0,i),this.leftOver=h.slice(i,h.length))),this.push({data:w.utf8decode(a),meta:s.meta})},p.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:w.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},w.Utf8DecodeWorker=p,d.inherits(b,c),b.prototype.processChunk=function(s){this.push({data:w.utf8encode(s.data),meta:s.meta})},w.Utf8EncodeWorker=b},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(m,z,w){var d=m("./support"),l=m("./base64"),n=m("./nodejsUtils"),c=m("./external");function _(r){return r}function y(r,i){for(var a=0;a<r.length;++a)i[a]=255&r.charCodeAt(a);return i}m("setimmediate"),w.newBlob=function(r,i){w.checkSupport("blob");try{return new Blob([r],{type:i})}catch{try{var a=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return a.append(r),a.getBlob(i)}catch{throw new Error("Bug : can't construct the Blob.")}}};var p={stringifyByChunk:function(r,i,a){var f=[],v=0,E=r.length;if(E<=a)return String.fromCharCode.apply(null,r);for(;v<E;)i==="array"||i==="nodebuffer"?f.push(String.fromCharCode.apply(null,r.slice(v,Math.min(v+a,E)))):f.push(String.fromCharCode.apply(null,r.subarray(v,Math.min(v+a,E)))),v+=a;return f.join("")},stringifyByChar:function(r){for(var i="",a=0;a<r.length;a++)i+=String.fromCharCode(r[a]);return i},applyCanBeUsed:{uint8array:function(){try{return d.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return d.nodebuffer&&String.fromCharCode.apply(null,n.allocBuffer(1)).length===1}catch{return!1}}()}};function b(r){var i=65536,a=w.getTypeOf(r),f=!0;if(a==="uint8array"?f=p.applyCanBeUsed.uint8array:a==="nodebuffer"&&(f=p.applyCanBeUsed.nodebuffer),f)for(;1<i;)try{return p.stringifyByChunk(r,a,i)}catch{i=Math.floor(i/2)}return p.stringifyByChar(r)}function s(r,i){for(var a=0;a<r.length;a++)i[a]=r[a];return i}w.applyFromCharCode=b;var h={};h.string={string:_,array:function(r){return y(r,new Array(r.length))},arraybuffer:function(r){return h.string.uint8array(r).buffer},uint8array:function(r){return y(r,new Uint8Array(r.length))},nodebuffer:function(r){return y(r,n.allocBuffer(r.length))}},h.array={string:b,array:_,arraybuffer:function(r){return new Uint8Array(r).buffer},uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(r)}},h.arraybuffer={string:function(r){return b(new Uint8Array(r))},array:function(r){return s(new Uint8Array(r),new Array(r.byteLength))},arraybuffer:_,uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(new Uint8Array(r))}},h.uint8array={string:b,array:function(r){return s(r,new Array(r.length))},arraybuffer:function(r){return r.buffer},uint8array:_,nodebuffer:function(r){return n.newBufferFrom(r)}},h.nodebuffer={string:b,array:function(r){return s(r,new Array(r.length))},arraybuffer:function(r){return h.nodebuffer.uint8array(r).buffer},uint8array:function(r){return s(r,new Uint8Array(r.length))},nodebuffer:_},w.transformTo=function(r,i){if(i=i||"",!r)return i;w.checkSupport(r);var a=w.getTypeOf(i);return h[a][r](i)},w.resolve=function(r){for(var i=r.split("/"),a=[],f=0;f<i.length;f++){var v=i[f];v==="."||v===""&&f!==0&&f!==i.length-1||(v===".."?a.pop():a.push(v))}return a.join("/")},w.getTypeOf=function(r){return typeof r=="string"?"string":Object.prototype.toString.call(r)==="[object Array]"?"array":d.nodebuffer&&n.isBuffer(r)?"nodebuffer":d.uint8array&&r instanceof Uint8Array?"uint8array":d.arraybuffer&&r instanceof ArrayBuffer?"arraybuffer":void 0},w.checkSupport=function(r){if(!d[r.toLowerCase()])throw new Error(r+" is not supported by this platform")},w.MAX_VALUE_16BITS=65535,w.MAX_VALUE_32BITS=-1,w.pretty=function(r){var i,a,f="";for(a=0;a<(r||"").length;a++)f+="\\x"+((i=r.charCodeAt(a))<16?"0":"")+i.toString(16).toUpperCase();return f},w.delay=function(r,i,a){setImmediate(function(){r.apply(a||null,i||[])})},w.inherits=function(r,i){function a(){}a.prototype=i.prototype,r.prototype=new a},w.extend=function(){var r,i,a={};for(r=0;r<arguments.length;r++)for(i in arguments[r])Object.prototype.hasOwnProperty.call(arguments[r],i)&&a[i]===void 0&&(a[i]=arguments[r][i]);return a},w.prepareContent=function(r,i,a,f,v){return c.Promise.resolve(i).then(function(E){return d.blob&&(E instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(E))!==-1)&&typeof FileReader<"u"?new c.Promise(function(k,L){var R=new FileReader;R.onload=function(B){k(B.target.result)},R.onerror=function(B){L(B.target.error)},R.readAsArrayBuffer(E)}):E}).then(function(E){var k=w.getTypeOf(E);return k?(k==="arraybuffer"?E=w.transformTo("uint8array",E):k==="string"&&(v?E=l.decode(E):a&&f!==!0&&(E=function(L){return y(L,d.uint8array?new Uint8Array(L.length):new Array(L.length))}(E))),E):c.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(m,z,w){var d=m("./reader/readerFor"),l=m("./utils"),n=m("./signature"),c=m("./zipEntry"),_=m("./support");function y(p){this.files=[],this.loadOptions=p}y.prototype={checkSignature:function(p){if(!this.reader.readAndCheckSignature(p)){this.reader.index-=4;var b=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+l.pretty(b)+", expected "+l.pretty(p)+")")}},isSignature:function(p,b){var s=this.reader.index;this.reader.setIndex(p);var h=this.reader.readString(4)===b;return this.reader.setIndex(s),h},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var p=this.reader.readData(this.zipCommentLength),b=_.uint8array?"uint8array":"array",s=l.transformTo(b,p);this.zipComment=this.loadOptions.decodeFileName(s)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var p,b,s,h=this.zip64EndOfCentralSize-44;0<h;)p=this.reader.readInt(2),b=this.reader.readInt(4),s=this.reader.readData(b),this.zip64ExtensibleData[p]={id:p,length:b,value:s}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var p,b;for(p=0;p<this.files.length;p++)b=this.files[p],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8(),b.processAttributes()},readCentralDir:function(){var p;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(n.CENTRAL_FILE_HEADER);)(p=new c({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(p);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var p=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(p<0)throw this.isSignature(0,n.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(p);var b=p;if(this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===l.MAX_VALUE_16BITS||this.diskWithCentralDirStart===l.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===l.MAX_VALUE_16BITS||this.centralDirRecords===l.MAX_VALUE_16BITS||this.centralDirSize===l.MAX_VALUE_32BITS||this.centralDirOffset===l.MAX_VALUE_32BITS){if(this.zip64=!0,(p=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(p),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,n.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var s=this.centralDirOffset+this.centralDirSize;this.zip64&&(s+=20,s+=12+this.zip64EndOfCentralSize);var h=b-s;if(0<h)this.isSignature(b,n.CENTRAL_FILE_HEADER)||(this.reader.zero=h);else if(h<0)throw new Error("Corrupted zip: missing "+Math.abs(h)+" bytes.")},prepareReader:function(p){this.reader=d(p)},load:function(p){this.prepareReader(p),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},z.exports=y},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(m,z,w){var d=m("./reader/readerFor"),l=m("./utils"),n=m("./compressedObject"),c=m("./crc32"),_=m("./utf8"),y=m("./compressions"),p=m("./support");function b(s,h){this.options=s,this.loadOptions=h}b.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(s){var h,r;if(s.skip(22),this.fileNameLength=s.readInt(2),r=s.readInt(2),this.fileName=s.readData(this.fileNameLength),s.skip(r),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((h=function(i){for(var a in y)if(Object.prototype.hasOwnProperty.call(y,a)&&y[a].magic===i)return y[a];return null}(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+l.pretty(this.compressionMethod)+" unknown (inner file : "+l.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,h,s.readData(this.compressedSize))},readCentralPart:function(s){this.versionMadeBy=s.readInt(2),s.skip(2),this.bitFlag=s.readInt(2),this.compressionMethod=s.readString(2),this.date=s.readDate(),this.crc32=s.readInt(4),this.compressedSize=s.readInt(4),this.uncompressedSize=s.readInt(4);var h=s.readInt(2);if(this.extraFieldsLength=s.readInt(2),this.fileCommentLength=s.readInt(2),this.diskNumberStart=s.readInt(2),this.internalFileAttributes=s.readInt(2),this.externalFileAttributes=s.readInt(4),this.localHeaderOffset=s.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");s.skip(h),this.readExtraFields(s),this.parseZIP64ExtraField(s),this.fileComment=s.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var s=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),s==0&&(this.dosPermissions=63&this.externalFileAttributes),s==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var s=d(this.extraFields[1].value);this.uncompressedSize===l.MAX_VALUE_32BITS&&(this.uncompressedSize=s.readInt(8)),this.compressedSize===l.MAX_VALUE_32BITS&&(this.compressedSize=s.readInt(8)),this.localHeaderOffset===l.MAX_VALUE_32BITS&&(this.localHeaderOffset=s.readInt(8)),this.diskNumberStart===l.MAX_VALUE_32BITS&&(this.diskNumberStart=s.readInt(4))}},readExtraFields:function(s){var h,r,i,a=s.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});s.index+4<a;)h=s.readInt(2),r=s.readInt(2),i=s.readData(r),this.extraFields[h]={id:h,length:r,value:i};s.setIndex(a)},handleUTF8:function(){var s=p.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=_.utf8decode(this.fileName),this.fileCommentStr=_.utf8decode(this.fileComment);else{var h=this.findExtraFieldUnicodePath();if(h!==null)this.fileNameStr=h;else{var r=l.transformTo(s,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var i=this.findExtraFieldUnicodeComment();if(i!==null)this.fileCommentStr=i;else{var a=l.transformTo(s,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(a)}}},findExtraFieldUnicodePath:function(){var s=this.extraFields[28789];if(s){var h=d(s.value);return h.readInt(1)!==1||c(this.fileName)!==h.readInt(4)?null:_.utf8decode(h.readData(s.length-5))}return null},findExtraFieldUnicodeComment:function(){var s=this.extraFields[25461];if(s){var h=d(s.value);return h.readInt(1)!==1||c(this.fileComment)!==h.readInt(4)?null:_.utf8decode(h.readData(s.length-5))}return null}},z.exports=b},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(m,z,w){function d(h,r,i){this.name=h,this.dir=i.dir,this.date=i.date,this.comment=i.comment,this.unixPermissions=i.unixPermissions,this.dosPermissions=i.dosPermissions,this._data=r,this._dataBinary=i.binary,this.options={compression:i.compression,compressionOptions:i.compressionOptions}}var l=m("./stream/StreamHelper"),n=m("./stream/DataWorker"),c=m("./utf8"),_=m("./compressedObject"),y=m("./stream/GenericWorker");d.prototype={internalStream:function(h){var r=null,i="string";try{if(!h)throw new Error("No output type specified.");var a=(i=h.toLowerCase())==="string"||i==="text";i!=="binarystring"&&i!=="text"||(i="string"),r=this._decompressWorker();var f=!this._dataBinary;f&&!a&&(r=r.pipe(new c.Utf8EncodeWorker)),!f&&a&&(r=r.pipe(new c.Utf8DecodeWorker))}catch(v){(r=new y("error")).error(v)}return new l(r,i,"")},async:function(h,r){return this.internalStream(h).accumulate(r)},nodeStream:function(h,r){return this.internalStream(h||"nodebuffer").toNodejsStream(r)},_compressWorker:function(h,r){if(this._data instanceof _&&this._data.compression.magic===h.magic)return this._data.getCompressedWorker();var i=this._decompressWorker();return this._dataBinary||(i=i.pipe(new c.Utf8EncodeWorker)),_.createWorkerFrom(i,h,r)},_decompressWorker:function(){return this._data instanceof _?this._data.getContentWorker():this._data instanceof y?this._data:new n(this._data)}};for(var p=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],b=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},s=0;s<p.length;s++)d.prototype[p[s]]=b;z.exports=d},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(m,z,w){(function(d){var l,n,c=d.MutationObserver||d.WebKitMutationObserver;if(c){var _=0,y=new c(h),p=d.document.createTextNode("");y.observe(p,{characterData:!0}),l=function(){p.data=_=++_%2}}else if(d.setImmediate||d.MessageChannel===void 0)l="document"in d&&"onreadystatechange"in d.document.createElement("script")?function(){var r=d.document.createElement("script");r.onreadystatechange=function(){h(),r.onreadystatechange=null,r.parentNode.removeChild(r),r=null},d.document.documentElement.appendChild(r)}:function(){setTimeout(h,0)};else{var b=new d.MessageChannel;b.port1.onmessage=h,l=function(){b.port2.postMessage(0)}}var s=[];function h(){var r,i;n=!0;for(var a=s.length;a;){for(i=s,s=[],r=-1;++r<a;)i[r]();a=s.length}n=!1}z.exports=function(r){s.push(r)!==1||n||l()}}).call(this,typeof Et<"u"?Et:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(m,z,w){var d=m("immediate");function l(){}var n={},c=["REJECTED"],_=["FULFILLED"],y=["PENDING"];function p(a){if(typeof a!="function")throw new TypeError("resolver must be a function");this.state=y,this.queue=[],this.outcome=void 0,a!==l&&r(this,a)}function b(a,f,v){this.promise=a,typeof f=="function"&&(this.onFulfilled=f,this.callFulfilled=this.otherCallFulfilled),typeof v=="function"&&(this.onRejected=v,this.callRejected=this.otherCallRejected)}function s(a,f,v){d(function(){var E;try{E=f(v)}catch(k){return n.reject(a,k)}E===a?n.reject(a,new TypeError("Cannot resolve promise with itself")):n.resolve(a,E)})}function h(a){var f=a&&a.then;if(a&&(typeof a=="object"||typeof a=="function")&&typeof f=="function")return function(){f.apply(a,arguments)}}function r(a,f){var v=!1;function E(R){v||(v=!0,n.reject(a,R))}function k(R){v||(v=!0,n.resolve(a,R))}var L=i(function(){f(k,E)});L.status==="error"&&E(L.value)}function i(a,f){var v={};try{v.value=a(f),v.status="success"}catch(E){v.status="error",v.value=E}return v}(z.exports=p).prototype.finally=function(a){if(typeof a!="function")return this;var f=this.constructor;return this.then(function(v){return f.resolve(a()).then(function(){return v})},function(v){return f.resolve(a()).then(function(){throw v})})},p.prototype.catch=function(a){return this.then(null,a)},p.prototype.then=function(a,f){if(typeof a!="function"&&this.state===_||typeof f!="function"&&this.state===c)return this;var v=new this.constructor(l);return this.state!==y?s(v,this.state===_?a:f,this.outcome):this.queue.push(new b(v,a,f)),v},b.prototype.callFulfilled=function(a){n.resolve(this.promise,a)},b.prototype.otherCallFulfilled=function(a){s(this.promise,this.onFulfilled,a)},b.prototype.callRejected=function(a){n.reject(this.promise,a)},b.prototype.otherCallRejected=function(a){s(this.promise,this.onRejected,a)},n.resolve=function(a,f){var v=i(h,f);if(v.status==="error")return n.reject(a,v.value);var E=v.value;if(E)r(a,E);else{a.state=_,a.outcome=f;for(var k=-1,L=a.queue.length;++k<L;)a.queue[k].callFulfilled(f)}return a},n.reject=function(a,f){a.state=c,a.outcome=f;for(var v=-1,E=a.queue.length;++v<E;)a.queue[v].callRejected(f);return a},p.resolve=function(a){return a instanceof this?a:n.resolve(new this(l),a)},p.reject=function(a){var f=new this(l);return n.reject(f,a)},p.all=function(a){var f=this;if(Object.prototype.toString.call(a)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=a.length,E=!1;if(!v)return this.resolve([]);for(var k=new Array(v),L=0,R=-1,B=new this(l);++R<v;)N(a[R],R);return B;function N(Z,V){f.resolve(Z).then(function(g){k[V]=g,++L!==v||E||(E=!0,n.resolve(B,k))},function(g){E||(E=!0,n.reject(B,g))})}},p.race=function(a){var f=this;if(Object.prototype.toString.call(a)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=a.length,E=!1;if(!v)return this.resolve([]);for(var k=-1,L=new this(l);++k<v;)R=a[k],f.resolve(R).then(function(B){E||(E=!0,n.resolve(L,B))},function(B){E||(E=!0,n.reject(L,B))});var R;return L}},{immediate:36}],38:[function(m,z,w){var d={};(0,m("./lib/utils/common").assign)(d,m("./lib/deflate"),m("./lib/inflate"),m("./lib/zlib/constants")),z.exports=d},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(m,z,w){var d=m("./zlib/deflate"),l=m("./utils/common"),n=m("./utils/strings"),c=m("./zlib/messages"),_=m("./zlib/zstream"),y=Object.prototype.toString,p=0,b=-1,s=0,h=8;function r(a){if(!(this instanceof r))return new r(a);this.options=l.assign({level:b,method:h,chunkSize:16384,windowBits:15,memLevel:8,strategy:s,to:""},a||{});var f=this.options;f.raw&&0<f.windowBits?f.windowBits=-f.windowBits:f.gzip&&0<f.windowBits&&f.windowBits<16&&(f.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new _,this.strm.avail_out=0;var v=d.deflateInit2(this.strm,f.level,f.method,f.windowBits,f.memLevel,f.strategy);if(v!==p)throw new Error(c[v]);if(f.header&&d.deflateSetHeader(this.strm,f.header),f.dictionary){var E;if(E=typeof f.dictionary=="string"?n.string2buf(f.dictionary):y.call(f.dictionary)==="[object ArrayBuffer]"?new Uint8Array(f.dictionary):f.dictionary,(v=d.deflateSetDictionary(this.strm,E))!==p)throw new Error(c[v]);this._dict_set=!0}}function i(a,f){var v=new r(f);if(v.push(a,!0),v.err)throw v.msg||c[v.err];return v.result}r.prototype.push=function(a,f){var v,E,k=this.strm,L=this.options.chunkSize;if(this.ended)return!1;E=f===~~f?f:f===!0?4:0,typeof a=="string"?k.input=n.string2buf(a):y.call(a)==="[object ArrayBuffer]"?k.input=new Uint8Array(a):k.input=a,k.next_in=0,k.avail_in=k.input.length;do{if(k.avail_out===0&&(k.output=new l.Buf8(L),k.next_out=0,k.avail_out=L),(v=d.deflate(k,E))!==1&&v!==p)return this.onEnd(v),!(this.ended=!0);k.avail_out!==0&&(k.avail_in!==0||E!==4&&E!==2)||(this.options.to==="string"?this.onData(n.buf2binstring(l.shrinkBuf(k.output,k.next_out))):this.onData(l.shrinkBuf(k.output,k.next_out)))}while((0<k.avail_in||k.avail_out===0)&&v!==1);return E===4?(v=d.deflateEnd(this.strm),this.onEnd(v),this.ended=!0,v===p):E!==2||(this.onEnd(p),!(k.avail_out=0))},r.prototype.onData=function(a){this.chunks.push(a)},r.prototype.onEnd=function(a){a===p&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},w.Deflate=r,w.deflate=i,w.deflateRaw=function(a,f){return(f=f||{}).raw=!0,i(a,f)},w.gzip=function(a,f){return(f=f||{}).gzip=!0,i(a,f)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(m,z,w){var d=m("./zlib/inflate"),l=m("./utils/common"),n=m("./utils/strings"),c=m("./zlib/constants"),_=m("./zlib/messages"),y=m("./zlib/zstream"),p=m("./zlib/gzheader"),b=Object.prototype.toString;function s(r){if(!(this instanceof s))return new s(r);this.options=l.assign({chunkSize:16384,windowBits:0,to:""},r||{});var i=this.options;i.raw&&0<=i.windowBits&&i.windowBits<16&&(i.windowBits=-i.windowBits,i.windowBits===0&&(i.windowBits=-15)),!(0<=i.windowBits&&i.windowBits<16)||r&&r.windowBits||(i.windowBits+=32),15<i.windowBits&&i.windowBits<48&&!(15&i.windowBits)&&(i.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new y,this.strm.avail_out=0;var a=d.inflateInit2(this.strm,i.windowBits);if(a!==c.Z_OK)throw new Error(_[a]);this.header=new p,d.inflateGetHeader(this.strm,this.header)}function h(r,i){var a=new s(i);if(a.push(r,!0),a.err)throw a.msg||_[a.err];return a.result}s.prototype.push=function(r,i){var a,f,v,E,k,L,R=this.strm,B=this.options.chunkSize,N=this.options.dictionary,Z=!1;if(this.ended)return!1;f=i===~~i?i:i===!0?c.Z_FINISH:c.Z_NO_FLUSH,typeof r=="string"?R.input=n.binstring2buf(r):b.call(r)==="[object ArrayBuffer]"?R.input=new Uint8Array(r):R.input=r,R.next_in=0,R.avail_in=R.input.length;do{if(R.avail_out===0&&(R.output=new l.Buf8(B),R.next_out=0,R.avail_out=B),(a=d.inflate(R,c.Z_NO_FLUSH))===c.Z_NEED_DICT&&N&&(L=typeof N=="string"?n.string2buf(N):b.call(N)==="[object ArrayBuffer]"?new Uint8Array(N):N,a=d.inflateSetDictionary(this.strm,L)),a===c.Z_BUF_ERROR&&Z===!0&&(a=c.Z_OK,Z=!1),a!==c.Z_STREAM_END&&a!==c.Z_OK)return this.onEnd(a),!(this.ended=!0);R.next_out&&(R.avail_out!==0&&a!==c.Z_STREAM_END&&(R.avail_in!==0||f!==c.Z_FINISH&&f!==c.Z_SYNC_FLUSH)||(this.options.to==="string"?(v=n.utf8border(R.output,R.next_out),E=R.next_out-v,k=n.buf2string(R.output,v),R.next_out=E,R.avail_out=B-E,E&&l.arraySet(R.output,R.output,v,E,0),this.onData(k)):this.onData(l.shrinkBuf(R.output,R.next_out)))),R.avail_in===0&&R.avail_out===0&&(Z=!0)}while((0<R.avail_in||R.avail_out===0)&&a!==c.Z_STREAM_END);return a===c.Z_STREAM_END&&(f=c.Z_FINISH),f===c.Z_FINISH?(a=d.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===c.Z_OK):f!==c.Z_SYNC_FLUSH||(this.onEnd(c.Z_OK),!(R.avail_out=0))},s.prototype.onData=function(r){this.chunks.push(r)},s.prototype.onEnd=function(r){r===c.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=r,this.msg=this.strm.msg},w.Inflate=s,w.inflate=h,w.inflateRaw=function(r,i){return(i=i||{}).raw=!0,h(r,i)},w.ungzip=h},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(m,z,w){var d=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";w.assign=function(c){for(var _=Array.prototype.slice.call(arguments,1);_.length;){var y=_.shift();if(y){if(typeof y!="object")throw new TypeError(y+"must be non-object");for(var p in y)y.hasOwnProperty(p)&&(c[p]=y[p])}}return c},w.shrinkBuf=function(c,_){return c.length===_?c:c.subarray?c.subarray(0,_):(c.length=_,c)};var l={arraySet:function(c,_,y,p,b){if(_.subarray&&c.subarray)c.set(_.subarray(y,y+p),b);else for(var s=0;s<p;s++)c[b+s]=_[y+s]},flattenChunks:function(c){var _,y,p,b,s,h;for(_=p=0,y=c.length;_<y;_++)p+=c[_].length;for(h=new Uint8Array(p),_=b=0,y=c.length;_<y;_++)s=c[_],h.set(s,b),b+=s.length;return h}},n={arraySet:function(c,_,y,p,b){for(var s=0;s<p;s++)c[b+s]=_[y+s]},flattenChunks:function(c){return[].concat.apply([],c)}};w.setTyped=function(c){c?(w.Buf8=Uint8Array,w.Buf16=Uint16Array,w.Buf32=Int32Array,w.assign(w,l)):(w.Buf8=Array,w.Buf16=Array,w.Buf32=Array,w.assign(w,n))},w.setTyped(d)},{}],42:[function(m,z,w){var d=m("./common"),l=!0,n=!0;try{String.fromCharCode.apply(null,[0])}catch{l=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{n=!1}for(var c=new d.Buf8(256),_=0;_<256;_++)c[_]=252<=_?6:248<=_?5:240<=_?4:224<=_?3:192<=_?2:1;function y(p,b){if(b<65537&&(p.subarray&&n||!p.subarray&&l))return String.fromCharCode.apply(null,d.shrinkBuf(p,b));for(var s="",h=0;h<b;h++)s+=String.fromCharCode(p[h]);return s}c[254]=c[254]=1,w.string2buf=function(p){var b,s,h,r,i,a=p.length,f=0;for(r=0;r<a;r++)(64512&(s=p.charCodeAt(r)))==55296&&r+1<a&&(64512&(h=p.charCodeAt(r+1)))==56320&&(s=65536+(s-55296<<10)+(h-56320),r++),f+=s<128?1:s<2048?2:s<65536?3:4;for(b=new d.Buf8(f),r=i=0;i<f;r++)(64512&(s=p.charCodeAt(r)))==55296&&r+1<a&&(64512&(h=p.charCodeAt(r+1)))==56320&&(s=65536+(s-55296<<10)+(h-56320),r++),s<128?b[i++]=s:(s<2048?b[i++]=192|s>>>6:(s<65536?b[i++]=224|s>>>12:(b[i++]=240|s>>>18,b[i++]=128|s>>>12&63),b[i++]=128|s>>>6&63),b[i++]=128|63&s);return b},w.buf2binstring=function(p){return y(p,p.length)},w.binstring2buf=function(p){for(var b=new d.Buf8(p.length),s=0,h=b.length;s<h;s++)b[s]=p.charCodeAt(s);return b},w.buf2string=function(p,b){var s,h,r,i,a=b||p.length,f=new Array(2*a);for(s=h=0;s<a;)if((r=p[s++])<128)f[h++]=r;else if(4<(i=c[r]))f[h++]=65533,s+=i-1;else{for(r&=i===2?31:i===3?15:7;1<i&&s<a;)r=r<<6|63&p[s++],i--;1<i?f[h++]=65533:r<65536?f[h++]=r:(r-=65536,f[h++]=55296|r>>10&1023,f[h++]=56320|1023&r)}return y(f,h)},w.utf8border=function(p,b){var s;for((b=b||p.length)>p.length&&(b=p.length),s=b-1;0<=s&&(192&p[s])==128;)s--;return s<0||s===0?b:s+c[p[s]]>b?s:b}},{"./common":41}],43:[function(m,z,w){z.exports=function(d,l,n,c){for(var _=65535&d|0,y=d>>>16&65535|0,p=0;n!==0;){for(n-=p=2e3<n?2e3:n;y=y+(_=_+l[c++]|0)|0,--p;);_%=65521,y%=65521}return _|y<<16|0}},{}],44:[function(m,z,w){z.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(m,z,w){var d=function(){for(var l,n=[],c=0;c<256;c++){l=c;for(var _=0;_<8;_++)l=1&l?3988292384^l>>>1:l>>>1;n[c]=l}return n}();z.exports=function(l,n,c,_){var y=d,p=_+c;l^=-1;for(var b=_;b<p;b++)l=l>>>8^y[255&(l^n[b])];return-1^l}},{}],46:[function(m,z,w){var d,l=m("../utils/common"),n=m("./trees"),c=m("./adler32"),_=m("./crc32"),y=m("./messages"),p=0,b=4,s=0,h=-2,r=-1,i=4,a=2,f=8,v=9,E=286,k=30,L=19,R=2*E+1,B=15,N=3,Z=258,V=Z+N+1,g=42,O=113,e=1,D=2,$=3,U=4;function Q(t,j){return t.msg=y[j],j}function M(t){return(t<<1)-(4<t?9:0)}function J(t){for(var j=t.length;0<=--j;)t[j]=0}function A(t){var j=t.state,I=j.pending;I>t.avail_out&&(I=t.avail_out),I!==0&&(l.arraySet(t.output,j.pending_buf,j.pending_out,I,t.next_out),t.next_out+=I,j.pending_out+=I,t.total_out+=I,t.avail_out-=I,j.pending-=I,j.pending===0&&(j.pending_out=0))}function S(t,j){n._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,j),t.block_start=t.strstart,A(t.strm)}function K(t,j){t.pending_buf[t.pending++]=j}function q(t,j){t.pending_buf[t.pending++]=j>>>8&255,t.pending_buf[t.pending++]=255&j}function G(t,j){var I,u,o=t.max_chain_length,x=t.strstart,P=t.prev_length,F=t.nice_match,T=t.strstart>t.w_size-V?t.strstart-(t.w_size-V):0,W=t.window,X=t.w_mask,H=t.prev,Y=t.strstart+Z,it=W[x+P-1],et=W[x+P];t.prev_length>=t.good_match&&(o>>=2),F>t.lookahead&&(F=t.lookahead);do if(W[(I=j)+P]===et&&W[I+P-1]===it&&W[I]===W[x]&&W[++I]===W[x+1]){x+=2,I++;do;while(W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&W[++x]===W[++I]&&x<Y);if(u=Z-(Y-x),x=Y-Z,P<u){if(t.match_start=j,F<=(P=u))break;it=W[x+P-1],et=W[x+P]}}while((j=H[j&X])>T&&--o!=0);return P<=t.lookahead?P:t.lookahead}function at(t){var j,I,u,o,x,P,F,T,W,X,H=t.w_size;do{if(o=t.window_size-t.lookahead-t.strstart,t.strstart>=H+(H-V)){for(l.arraySet(t.window,t.window,H,H,0),t.match_start-=H,t.strstart-=H,t.block_start-=H,j=I=t.hash_size;u=t.head[--j],t.head[j]=H<=u?u-H:0,--I;);for(j=I=H;u=t.prev[--j],t.prev[j]=H<=u?u-H:0,--I;);o+=H}if(t.strm.avail_in===0)break;if(P=t.strm,F=t.window,T=t.strstart+t.lookahead,W=o,X=void 0,X=P.avail_in,W<X&&(X=W),I=X===0?0:(P.avail_in-=X,l.arraySet(F,P.input,P.next_in,X,T),P.state.wrap===1?P.adler=c(P.adler,F,X,T):P.state.wrap===2&&(P.adler=_(P.adler,F,X,T)),P.next_in+=X,P.total_in+=X,X),t.lookahead+=I,t.lookahead+t.insert>=N)for(x=t.strstart-t.insert,t.ins_h=t.window[x],t.ins_h=(t.ins_h<<t.hash_shift^t.window[x+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[x+N-1])&t.hash_mask,t.prev[x&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=x,x++,t.insert--,!(t.lookahead+t.insert<N)););}while(t.lookahead<V&&t.strm.avail_in!==0)}function dt(t,j){for(var I,u;;){if(t.lookahead<V){if(at(t),t.lookahead<V&&j===p)return e;if(t.lookahead===0)break}if(I=0,t.lookahead>=N&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+N-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),I!==0&&t.strstart-I<=t.w_size-V&&(t.match_length=G(t,I)),t.match_length>=N)if(u=n._tr_tally(t,t.strstart-t.match_start,t.match_length-N),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=N){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+N-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,--t.match_length!=0;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else u=n._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(u&&(S(t,!1),t.strm.avail_out===0))return e}return t.insert=t.strstart<N-1?t.strstart:N-1,j===b?(S(t,!0),t.strm.avail_out===0?$:U):t.last_lit&&(S(t,!1),t.strm.avail_out===0)?e:D}function tt(t,j){for(var I,u,o;;){if(t.lookahead<V){if(at(t),t.lookahead<V&&j===p)return e;if(t.lookahead===0)break}if(I=0,t.lookahead>=N&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+N-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=N-1,I!==0&&t.prev_length<t.max_lazy_match&&t.strstart-I<=t.w_size-V&&(t.match_length=G(t,I),t.match_length<=5&&(t.strategy===1||t.match_length===N&&4096<t.strstart-t.match_start)&&(t.match_length=N-1)),t.prev_length>=N&&t.match_length<=t.prev_length){for(o=t.strstart+t.lookahead-N,u=n._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-N),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=o&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+N-1])&t.hash_mask,I=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),--t.prev_length!=0;);if(t.match_available=0,t.match_length=N-1,t.strstart++,u&&(S(t,!1),t.strm.avail_out===0))return e}else if(t.match_available){if((u=n._tr_tally(t,0,t.window[t.strstart-1]))&&S(t,!1),t.strstart++,t.lookahead--,t.strm.avail_out===0)return e}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(u=n._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<N-1?t.strstart:N-1,j===b?(S(t,!0),t.strm.avail_out===0?$:U):t.last_lit&&(S(t,!1),t.strm.avail_out===0)?e:D}function rt(t,j,I,u,o){this.good_length=t,this.max_lazy=j,this.nice_length=I,this.max_chain=u,this.func=o}function ct(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=f,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new l.Buf16(2*R),this.dyn_dtree=new l.Buf16(2*(2*k+1)),this.bl_tree=new l.Buf16(2*(2*L+1)),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new l.Buf16(B+1),this.heap=new l.Buf16(2*E+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new l.Buf16(2*E+1),J(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function ot(t){var j;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=a,(j=t.state).pending=0,j.pending_out=0,j.wrap<0&&(j.wrap=-j.wrap),j.status=j.wrap?g:O,t.adler=j.wrap===2?0:1,j.last_flush=p,n._tr_init(j),s):Q(t,h)}function ft(t){var j=ot(t);return j===s&&function(I){I.window_size=2*I.w_size,J(I.head),I.max_lazy_match=d[I.level].max_lazy,I.good_match=d[I.level].good_length,I.nice_match=d[I.level].nice_length,I.max_chain_length=d[I.level].max_chain,I.strstart=0,I.block_start=0,I.lookahead=0,I.insert=0,I.match_length=I.prev_length=N-1,I.match_available=0,I.ins_h=0}(t.state),j}function ht(t,j,I,u,o,x){if(!t)return h;var P=1;if(j===r&&(j=6),u<0?(P=0,u=-u):15<u&&(P=2,u-=16),o<1||v<o||I!==f||u<8||15<u||j<0||9<j||x<0||i<x)return Q(t,h);u===8&&(u=9);var F=new ct;return(t.state=F).strm=t,F.wrap=P,F.gzhead=null,F.w_bits=u,F.w_size=1<<F.w_bits,F.w_mask=F.w_size-1,F.hash_bits=o+7,F.hash_size=1<<F.hash_bits,F.hash_mask=F.hash_size-1,F.hash_shift=~~((F.hash_bits+N-1)/N),F.window=new l.Buf8(2*F.w_size),F.head=new l.Buf16(F.hash_size),F.prev=new l.Buf16(F.w_size),F.lit_bufsize=1<<o+6,F.pending_buf_size=4*F.lit_bufsize,F.pending_buf=new l.Buf8(F.pending_buf_size),F.d_buf=1*F.lit_bufsize,F.l_buf=3*F.lit_bufsize,F.level=j,F.strategy=x,F.method=I,ft(t)}d=[new rt(0,0,0,0,function(t,j){var I=65535;for(I>t.pending_buf_size-5&&(I=t.pending_buf_size-5);;){if(t.lookahead<=1){if(at(t),t.lookahead===0&&j===p)return e;if(t.lookahead===0)break}t.strstart+=t.lookahead,t.lookahead=0;var u=t.block_start+I;if((t.strstart===0||t.strstart>=u)&&(t.lookahead=t.strstart-u,t.strstart=u,S(t,!1),t.strm.avail_out===0)||t.strstart-t.block_start>=t.w_size-V&&(S(t,!1),t.strm.avail_out===0))return e}return t.insert=0,j===b?(S(t,!0),t.strm.avail_out===0?$:U):(t.strstart>t.block_start&&(S(t,!1),t.strm.avail_out),e)}),new rt(4,4,8,4,dt),new rt(4,5,16,8,dt),new rt(4,6,32,32,dt),new rt(4,4,16,16,tt),new rt(8,16,32,32,tt),new rt(8,16,128,128,tt),new rt(8,32,128,256,tt),new rt(32,128,258,1024,tt),new rt(32,258,258,4096,tt)],w.deflateInit=function(t,j){return ht(t,j,f,15,8,0)},w.deflateInit2=ht,w.deflateReset=ft,w.deflateResetKeep=ot,w.deflateSetHeader=function(t,j){return t&&t.state?t.state.wrap!==2?h:(t.state.gzhead=j,s):h},w.deflate=function(t,j){var I,u,o,x;if(!t||!t.state||5<j||j<0)return t?Q(t,h):h;if(u=t.state,!t.output||!t.input&&t.avail_in!==0||u.status===666&&j!==b)return Q(t,t.avail_out===0?-5:h);if(u.strm=t,I=u.last_flush,u.last_flush=j,u.status===g)if(u.wrap===2)t.adler=0,K(u,31),K(u,139),K(u,8),u.gzhead?(K(u,(u.gzhead.text?1:0)+(u.gzhead.hcrc?2:0)+(u.gzhead.extra?4:0)+(u.gzhead.name?8:0)+(u.gzhead.comment?16:0)),K(u,255&u.gzhead.time),K(u,u.gzhead.time>>8&255),K(u,u.gzhead.time>>16&255),K(u,u.gzhead.time>>24&255),K(u,u.level===9?2:2<=u.strategy||u.level<2?4:0),K(u,255&u.gzhead.os),u.gzhead.extra&&u.gzhead.extra.length&&(K(u,255&u.gzhead.extra.length),K(u,u.gzhead.extra.length>>8&255)),u.gzhead.hcrc&&(t.adler=_(t.adler,u.pending_buf,u.pending,0)),u.gzindex=0,u.status=69):(K(u,0),K(u,0),K(u,0),K(u,0),K(u,0),K(u,u.level===9?2:2<=u.strategy||u.level<2?4:0),K(u,3),u.status=O);else{var P=f+(u.w_bits-8<<4)<<8;P|=(2<=u.strategy||u.level<2?0:u.level<6?1:u.level===6?2:3)<<6,u.strstart!==0&&(P|=32),P+=31-P%31,u.status=O,q(u,P),u.strstart!==0&&(q(u,t.adler>>>16),q(u,65535&t.adler)),t.adler=1}if(u.status===69)if(u.gzhead.extra){for(o=u.pending;u.gzindex<(65535&u.gzhead.extra.length)&&(u.pending!==u.pending_buf_size||(u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),A(t),o=u.pending,u.pending!==u.pending_buf_size));)K(u,255&u.gzhead.extra[u.gzindex]),u.gzindex++;u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),u.gzindex===u.gzhead.extra.length&&(u.gzindex=0,u.status=73)}else u.status=73;if(u.status===73)if(u.gzhead.name){o=u.pending;do{if(u.pending===u.pending_buf_size&&(u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),A(t),o=u.pending,u.pending===u.pending_buf_size)){x=1;break}x=u.gzindex<u.gzhead.name.length?255&u.gzhead.name.charCodeAt(u.gzindex++):0,K(u,x)}while(x!==0);u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),x===0&&(u.gzindex=0,u.status=91)}else u.status=91;if(u.status===91)if(u.gzhead.comment){o=u.pending;do{if(u.pending===u.pending_buf_size&&(u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),A(t),o=u.pending,u.pending===u.pending_buf_size)){x=1;break}x=u.gzindex<u.gzhead.comment.length?255&u.gzhead.comment.charCodeAt(u.gzindex++):0,K(u,x)}while(x!==0);u.gzhead.hcrc&&u.pending>o&&(t.adler=_(t.adler,u.pending_buf,u.pending-o,o)),x===0&&(u.status=103)}else u.status=103;if(u.status===103&&(u.gzhead.hcrc?(u.pending+2>u.pending_buf_size&&A(t),u.pending+2<=u.pending_buf_size&&(K(u,255&t.adler),K(u,t.adler>>8&255),t.adler=0,u.status=O)):u.status=O),u.pending!==0){if(A(t),t.avail_out===0)return u.last_flush=-1,s}else if(t.avail_in===0&&M(j)<=M(I)&&j!==b)return Q(t,-5);if(u.status===666&&t.avail_in!==0)return Q(t,-5);if(t.avail_in!==0||u.lookahead!==0||j!==p&&u.status!==666){var F=u.strategy===2?function(T,W){for(var X;;){if(T.lookahead===0&&(at(T),T.lookahead===0)){if(W===p)return e;break}if(T.match_length=0,X=n._tr_tally(T,0,T.window[T.strstart]),T.lookahead--,T.strstart++,X&&(S(T,!1),T.strm.avail_out===0))return e}return T.insert=0,W===b?(S(T,!0),T.strm.avail_out===0?$:U):T.last_lit&&(S(T,!1),T.strm.avail_out===0)?e:D}(u,j):u.strategy===3?function(T,W){for(var X,H,Y,it,et=T.window;;){if(T.lookahead<=Z){if(at(T),T.lookahead<=Z&&W===p)return e;if(T.lookahead===0)break}if(T.match_length=0,T.lookahead>=N&&0<T.strstart&&(H=et[Y=T.strstart-1])===et[++Y]&&H===et[++Y]&&H===et[++Y]){it=T.strstart+Z;do;while(H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&H===et[++Y]&&Y<it);T.match_length=Z-(it-Y),T.match_length>T.lookahead&&(T.match_length=T.lookahead)}if(T.match_length>=N?(X=n._tr_tally(T,1,T.match_length-N),T.lookahead-=T.match_length,T.strstart+=T.match_length,T.match_length=0):(X=n._tr_tally(T,0,T.window[T.strstart]),T.lookahead--,T.strstart++),X&&(S(T,!1),T.strm.avail_out===0))return e}return T.insert=0,W===b?(S(T,!0),T.strm.avail_out===0?$:U):T.last_lit&&(S(T,!1),T.strm.avail_out===0)?e:D}(u,j):d[u.level].func(u,j);if(F!==$&&F!==U||(u.status=666),F===e||F===$)return t.avail_out===0&&(u.last_flush=-1),s;if(F===D&&(j===1?n._tr_align(u):j!==5&&(n._tr_stored_block(u,0,0,!1),j===3&&(J(u.head),u.lookahead===0&&(u.strstart=0,u.block_start=0,u.insert=0))),A(t),t.avail_out===0))return u.last_flush=-1,s}return j!==b?s:u.wrap<=0?1:(u.wrap===2?(K(u,255&t.adler),K(u,t.adler>>8&255),K(u,t.adler>>16&255),K(u,t.adler>>24&255),K(u,255&t.total_in),K(u,t.total_in>>8&255),K(u,t.total_in>>16&255),K(u,t.total_in>>24&255)):(q(u,t.adler>>>16),q(u,65535&t.adler)),A(t),0<u.wrap&&(u.wrap=-u.wrap),u.pending!==0?s:1)},w.deflateEnd=function(t){var j;return t&&t.state?(j=t.state.status)!==g&&j!==69&&j!==73&&j!==91&&j!==103&&j!==O&&j!==666?Q(t,h):(t.state=null,j===O?Q(t,-3):s):h},w.deflateSetDictionary=function(t,j){var I,u,o,x,P,F,T,W,X=j.length;if(!t||!t.state||(x=(I=t.state).wrap)===2||x===1&&I.status!==g||I.lookahead)return h;for(x===1&&(t.adler=c(t.adler,j,X,0)),I.wrap=0,X>=I.w_size&&(x===0&&(J(I.head),I.strstart=0,I.block_start=0,I.insert=0),W=new l.Buf8(I.w_size),l.arraySet(W,j,X-I.w_size,I.w_size,0),j=W,X=I.w_size),P=t.avail_in,F=t.next_in,T=t.input,t.avail_in=X,t.next_in=0,t.input=j,at(I);I.lookahead>=N;){for(u=I.strstart,o=I.lookahead-(N-1);I.ins_h=(I.ins_h<<I.hash_shift^I.window[u+N-1])&I.hash_mask,I.prev[u&I.w_mask]=I.head[I.ins_h],I.head[I.ins_h]=u,u++,--o;);I.strstart=u,I.lookahead=N-1,at(I)}return I.strstart+=I.lookahead,I.block_start=I.strstart,I.insert=I.lookahead,I.lookahead=0,I.match_length=I.prev_length=N-1,I.match_available=0,t.next_in=F,t.input=T,t.avail_in=P,I.wrap=x,s},w.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(m,z,w){z.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(m,z,w){z.exports=function(d,l){var n,c,_,y,p,b,s,h,r,i,a,f,v,E,k,L,R,B,N,Z,V,g,O,e,D;n=d.state,c=d.next_in,e=d.input,_=c+(d.avail_in-5),y=d.next_out,D=d.output,p=y-(l-d.avail_out),b=y+(d.avail_out-257),s=n.dmax,h=n.wsize,r=n.whave,i=n.wnext,a=n.window,f=n.hold,v=n.bits,E=n.lencode,k=n.distcode,L=(1<<n.lenbits)-1,R=(1<<n.distbits)-1;t:do{v<15&&(f+=e[c++]<<v,v+=8,f+=e[c++]<<v,v+=8),B=E[f&L];e:for(;;){if(f>>>=N=B>>>24,v-=N,(N=B>>>16&255)===0)D[y++]=65535&B;else{if(!(16&N)){if(!(64&N)){B=E[(65535&B)+(f&(1<<N)-1)];continue e}if(32&N){n.mode=12;break t}d.msg="invalid literal/length code",n.mode=30;break t}Z=65535&B,(N&=15)&&(v<N&&(f+=e[c++]<<v,v+=8),Z+=f&(1<<N)-1,f>>>=N,v-=N),v<15&&(f+=e[c++]<<v,v+=8,f+=e[c++]<<v,v+=8),B=k[f&R];r:for(;;){if(f>>>=N=B>>>24,v-=N,!(16&(N=B>>>16&255))){if(!(64&N)){B=k[(65535&B)+(f&(1<<N)-1)];continue r}d.msg="invalid distance code",n.mode=30;break t}if(V=65535&B,v<(N&=15)&&(f+=e[c++]<<v,(v+=8)<N&&(f+=e[c++]<<v,v+=8)),s<(V+=f&(1<<N)-1)){d.msg="invalid distance too far back",n.mode=30;break t}if(f>>>=N,v-=N,(N=y-p)<V){if(r<(N=V-N)&&n.sane){d.msg="invalid distance too far back",n.mode=30;break t}if(O=a,(g=0)===i){if(g+=h-N,N<Z){for(Z-=N;D[y++]=a[g++],--N;);g=y-V,O=D}}else if(i<N){if(g+=h+i-N,(N-=i)<Z){for(Z-=N;D[y++]=a[g++],--N;);if(g=0,i<Z){for(Z-=N=i;D[y++]=a[g++],--N;);g=y-V,O=D}}}else if(g+=i-N,N<Z){for(Z-=N;D[y++]=a[g++],--N;);g=y-V,O=D}for(;2<Z;)D[y++]=O[g++],D[y++]=O[g++],D[y++]=O[g++],Z-=3;Z&&(D[y++]=O[g++],1<Z&&(D[y++]=O[g++]))}else{for(g=y-V;D[y++]=D[g++],D[y++]=D[g++],D[y++]=D[g++],2<(Z-=3););Z&&(D[y++]=D[g++],1<Z&&(D[y++]=D[g++]))}break}}break}}while(c<_&&y<b);c-=Z=v>>3,f&=(1<<(v-=Z<<3))-1,d.next_in=c,d.next_out=y,d.avail_in=c<_?_-c+5:5-(c-_),d.avail_out=y<b?b-y+257:257-(y-b),n.hold=f,n.bits=v}},{}],49:[function(m,z,w){var d=m("../utils/common"),l=m("./adler32"),n=m("./crc32"),c=m("./inffast"),_=m("./inftrees"),y=1,p=2,b=0,s=-2,h=1,r=852,i=592;function a(g){return(g>>>24&255)+(g>>>8&65280)+((65280&g)<<8)+((255&g)<<24)}function f(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new d.Buf16(320),this.work=new d.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function v(g){var O;return g&&g.state?(O=g.state,g.total_in=g.total_out=O.total=0,g.msg="",O.wrap&&(g.adler=1&O.wrap),O.mode=h,O.last=0,O.havedict=0,O.dmax=32768,O.head=null,O.hold=0,O.bits=0,O.lencode=O.lendyn=new d.Buf32(r),O.distcode=O.distdyn=new d.Buf32(i),O.sane=1,O.back=-1,b):s}function E(g){var O;return g&&g.state?((O=g.state).wsize=0,O.whave=0,O.wnext=0,v(g)):s}function k(g,O){var e,D;return g&&g.state?(D=g.state,O<0?(e=0,O=-O):(e=1+(O>>4),O<48&&(O&=15)),O&&(O<8||15<O)?s:(D.window!==null&&D.wbits!==O&&(D.window=null),D.wrap=e,D.wbits=O,E(g))):s}function L(g,O){var e,D;return g?(D=new f,(g.state=D).window=null,(e=k(g,O))!==b&&(g.state=null),e):s}var R,B,N=!0;function Z(g){if(N){var O;for(R=new d.Buf32(512),B=new d.Buf32(32),O=0;O<144;)g.lens[O++]=8;for(;O<256;)g.lens[O++]=9;for(;O<280;)g.lens[O++]=7;for(;O<288;)g.lens[O++]=8;for(_(y,g.lens,0,288,R,0,g.work,{bits:9}),O=0;O<32;)g.lens[O++]=5;_(p,g.lens,0,32,B,0,g.work,{bits:5}),N=!1}g.lencode=R,g.lenbits=9,g.distcode=B,g.distbits=5}function V(g,O,e,D){var $,U=g.state;return U.window===null&&(U.wsize=1<<U.wbits,U.wnext=0,U.whave=0,U.window=new d.Buf8(U.wsize)),D>=U.wsize?(d.arraySet(U.window,O,e-U.wsize,U.wsize,0),U.wnext=0,U.whave=U.wsize):(D<($=U.wsize-U.wnext)&&($=D),d.arraySet(U.window,O,e-D,$,U.wnext),(D-=$)?(d.arraySet(U.window,O,e-D,D,0),U.wnext=D,U.whave=U.wsize):(U.wnext+=$,U.wnext===U.wsize&&(U.wnext=0),U.whave<U.wsize&&(U.whave+=$))),0}w.inflateReset=E,w.inflateReset2=k,w.inflateResetKeep=v,w.inflateInit=function(g){return L(g,15)},w.inflateInit2=L,w.inflate=function(g,O){var e,D,$,U,Q,M,J,A,S,K,q,G,at,dt,tt,rt,ct,ot,ft,ht,t,j,I,u,o=0,x=new d.Buf8(4),P=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!g||!g.state||!g.output||!g.input&&g.avail_in!==0)return s;(e=g.state).mode===12&&(e.mode=13),Q=g.next_out,$=g.output,J=g.avail_out,U=g.next_in,D=g.input,M=g.avail_in,A=e.hold,S=e.bits,K=M,q=J,j=b;t:for(;;)switch(e.mode){case h:if(e.wrap===0){e.mode=13;break}for(;S<16;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(2&e.wrap&&A===35615){x[e.check=0]=255&A,x[1]=A>>>8&255,e.check=n(e.check,x,2,0),S=A=0,e.mode=2;break}if(e.flags=0,e.head&&(e.head.done=!1),!(1&e.wrap)||(((255&A)<<8)+(A>>8))%31){g.msg="incorrect header check",e.mode=30;break}if((15&A)!=8){g.msg="unknown compression method",e.mode=30;break}if(S-=4,t=8+(15&(A>>>=4)),e.wbits===0)e.wbits=t;else if(t>e.wbits){g.msg="invalid window size",e.mode=30;break}e.dmax=1<<t,g.adler=e.check=1,e.mode=512&A?10:12,S=A=0;break;case 2:for(;S<16;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(e.flags=A,(255&e.flags)!=8){g.msg="unknown compression method",e.mode=30;break}if(57344&e.flags){g.msg="unknown header flags set",e.mode=30;break}e.head&&(e.head.text=A>>8&1),512&e.flags&&(x[0]=255&A,x[1]=A>>>8&255,e.check=n(e.check,x,2,0)),S=A=0,e.mode=3;case 3:for(;S<32;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.head&&(e.head.time=A),512&e.flags&&(x[0]=255&A,x[1]=A>>>8&255,x[2]=A>>>16&255,x[3]=A>>>24&255,e.check=n(e.check,x,4,0)),S=A=0,e.mode=4;case 4:for(;S<16;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.head&&(e.head.xflags=255&A,e.head.os=A>>8),512&e.flags&&(x[0]=255&A,x[1]=A>>>8&255,e.check=n(e.check,x,2,0)),S=A=0,e.mode=5;case 5:if(1024&e.flags){for(;S<16;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.length=A,e.head&&(e.head.extra_len=A),512&e.flags&&(x[0]=255&A,x[1]=A>>>8&255,e.check=n(e.check,x,2,0)),S=A=0}else e.head&&(e.head.extra=null);e.mode=6;case 6:if(1024&e.flags&&(M<(G=e.length)&&(G=M),G&&(e.head&&(t=e.head.extra_len-e.length,e.head.extra||(e.head.extra=new Array(e.head.extra_len)),d.arraySet(e.head.extra,D,U,G,t)),512&e.flags&&(e.check=n(e.check,D,G,U)),M-=G,U+=G,e.length-=G),e.length))break t;e.length=0,e.mode=7;case 7:if(2048&e.flags){if(M===0)break t;for(G=0;t=D[U+G++],e.head&&t&&e.length<65536&&(e.head.name+=String.fromCharCode(t)),t&&G<M;);if(512&e.flags&&(e.check=n(e.check,D,G,U)),M-=G,U+=G,t)break t}else e.head&&(e.head.name=null);e.length=0,e.mode=8;case 8:if(4096&e.flags){if(M===0)break t;for(G=0;t=D[U+G++],e.head&&t&&e.length<65536&&(e.head.comment+=String.fromCharCode(t)),t&&G<M;);if(512&e.flags&&(e.check=n(e.check,D,G,U)),M-=G,U+=G,t)break t}else e.head&&(e.head.comment=null);e.mode=9;case 9:if(512&e.flags){for(;S<16;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(A!==(65535&e.check)){g.msg="header crc mismatch",e.mode=30;break}S=A=0}e.head&&(e.head.hcrc=e.flags>>9&1,e.head.done=!0),g.adler=e.check=0,e.mode=12;break;case 10:for(;S<32;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}g.adler=e.check=a(A),S=A=0,e.mode=11;case 11:if(e.havedict===0)return g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=M,e.hold=A,e.bits=S,2;g.adler=e.check=1,e.mode=12;case 12:if(O===5||O===6)break t;case 13:if(e.last){A>>>=7&S,S-=7&S,e.mode=27;break}for(;S<3;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}switch(e.last=1&A,S-=1,3&(A>>>=1)){case 0:e.mode=14;break;case 1:if(Z(e),e.mode=20,O!==6)break;A>>>=2,S-=2;break t;case 2:e.mode=17;break;case 3:g.msg="invalid block type",e.mode=30}A>>>=2,S-=2;break;case 14:for(A>>>=7&S,S-=7&S;S<32;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if((65535&A)!=(A>>>16^65535)){g.msg="invalid stored block lengths",e.mode=30;break}if(e.length=65535&A,S=A=0,e.mode=15,O===6)break t;case 15:e.mode=16;case 16:if(G=e.length){if(M<G&&(G=M),J<G&&(G=J),G===0)break t;d.arraySet($,D,U,G,Q),M-=G,U+=G,J-=G,Q+=G,e.length-=G;break}e.mode=12;break;case 17:for(;S<14;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(e.nlen=257+(31&A),A>>>=5,S-=5,e.ndist=1+(31&A),A>>>=5,S-=5,e.ncode=4+(15&A),A>>>=4,S-=4,286<e.nlen||30<e.ndist){g.msg="too many length or distance symbols",e.mode=30;break}e.have=0,e.mode=18;case 18:for(;e.have<e.ncode;){for(;S<3;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.lens[P[e.have++]]=7&A,A>>>=3,S-=3}for(;e.have<19;)e.lens[P[e.have++]]=0;if(e.lencode=e.lendyn,e.lenbits=7,I={bits:e.lenbits},j=_(0,e.lens,0,19,e.lencode,0,e.work,I),e.lenbits=I.bits,j){g.msg="invalid code lengths set",e.mode=30;break}e.have=0,e.mode=19;case 19:for(;e.have<e.nlen+e.ndist;){for(;rt=(o=e.lencode[A&(1<<e.lenbits)-1])>>>16&255,ct=65535&o,!((tt=o>>>24)<=S);){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(ct<16)A>>>=tt,S-=tt,e.lens[e.have++]=ct;else{if(ct===16){for(u=tt+2;S<u;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(A>>>=tt,S-=tt,e.have===0){g.msg="invalid bit length repeat",e.mode=30;break}t=e.lens[e.have-1],G=3+(3&A),A>>>=2,S-=2}else if(ct===17){for(u=tt+3;S<u;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}S-=tt,t=0,G=3+(7&(A>>>=tt)),A>>>=3,S-=3}else{for(u=tt+7;S<u;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}S-=tt,t=0,G=11+(127&(A>>>=tt)),A>>>=7,S-=7}if(e.have+G>e.nlen+e.ndist){g.msg="invalid bit length repeat",e.mode=30;break}for(;G--;)e.lens[e.have++]=t}}if(e.mode===30)break;if(e.lens[256]===0){g.msg="invalid code -- missing end-of-block",e.mode=30;break}if(e.lenbits=9,I={bits:e.lenbits},j=_(y,e.lens,0,e.nlen,e.lencode,0,e.work,I),e.lenbits=I.bits,j){g.msg="invalid literal/lengths set",e.mode=30;break}if(e.distbits=6,e.distcode=e.distdyn,I={bits:e.distbits},j=_(p,e.lens,e.nlen,e.ndist,e.distcode,0,e.work,I),e.distbits=I.bits,j){g.msg="invalid distances set",e.mode=30;break}if(e.mode=20,O===6)break t;case 20:e.mode=21;case 21:if(6<=M&&258<=J){g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=M,e.hold=A,e.bits=S,c(g,q),Q=g.next_out,$=g.output,J=g.avail_out,U=g.next_in,D=g.input,M=g.avail_in,A=e.hold,S=e.bits,e.mode===12&&(e.back=-1);break}for(e.back=0;rt=(o=e.lencode[A&(1<<e.lenbits)-1])>>>16&255,ct=65535&o,!((tt=o>>>24)<=S);){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(rt&&!(240&rt)){for(ot=tt,ft=rt,ht=ct;rt=(o=e.lencode[ht+((A&(1<<ot+ft)-1)>>ot)])>>>16&255,ct=65535&o,!(ot+(tt=o>>>24)<=S);){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}A>>>=ot,S-=ot,e.back+=ot}if(A>>>=tt,S-=tt,e.back+=tt,e.length=ct,rt===0){e.mode=26;break}if(32&rt){e.back=-1,e.mode=12;break}if(64&rt){g.msg="invalid literal/length code",e.mode=30;break}e.extra=15&rt,e.mode=22;case 22:if(e.extra){for(u=e.extra;S<u;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.length+=A&(1<<e.extra)-1,A>>>=e.extra,S-=e.extra,e.back+=e.extra}e.was=e.length,e.mode=23;case 23:for(;rt=(o=e.distcode[A&(1<<e.distbits)-1])>>>16&255,ct=65535&o,!((tt=o>>>24)<=S);){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(!(240&rt)){for(ot=tt,ft=rt,ht=ct;rt=(o=e.distcode[ht+((A&(1<<ot+ft)-1)>>ot)])>>>16&255,ct=65535&o,!(ot+(tt=o>>>24)<=S);){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}A>>>=ot,S-=ot,e.back+=ot}if(A>>>=tt,S-=tt,e.back+=tt,64&rt){g.msg="invalid distance code",e.mode=30;break}e.offset=ct,e.extra=15&rt,e.mode=24;case 24:if(e.extra){for(u=e.extra;S<u;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}e.offset+=A&(1<<e.extra)-1,A>>>=e.extra,S-=e.extra,e.back+=e.extra}if(e.offset>e.dmax){g.msg="invalid distance too far back",e.mode=30;break}e.mode=25;case 25:if(J===0)break t;if(G=q-J,e.offset>G){if((G=e.offset-G)>e.whave&&e.sane){g.msg="invalid distance too far back",e.mode=30;break}at=G>e.wnext?(G-=e.wnext,e.wsize-G):e.wnext-G,G>e.length&&(G=e.length),dt=e.window}else dt=$,at=Q-e.offset,G=e.length;for(J<G&&(G=J),J-=G,e.length-=G;$[Q++]=dt[at++],--G;);e.length===0&&(e.mode=21);break;case 26:if(J===0)break t;$[Q++]=e.length,J--,e.mode=21;break;case 27:if(e.wrap){for(;S<32;){if(M===0)break t;M--,A|=D[U++]<<S,S+=8}if(q-=J,g.total_out+=q,e.total+=q,q&&(g.adler=e.check=e.flags?n(e.check,$,q,Q-q):l(e.check,$,q,Q-q)),q=J,(e.flags?A:a(A))!==e.check){g.msg="incorrect data check",e.mode=30;break}S=A=0}e.mode=28;case 28:if(e.wrap&&e.flags){for(;S<32;){if(M===0)break t;M--,A+=D[U++]<<S,S+=8}if(A!==(4294967295&e.total)){g.msg="incorrect length check",e.mode=30;break}S=A=0}e.mode=29;case 29:j=1;break t;case 30:j=-3;break t;case 31:return-4;case 32:default:return s}return g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=M,e.hold=A,e.bits=S,(e.wsize||q!==g.avail_out&&e.mode<30&&(e.mode<27||O!==4))&&V(g,g.output,g.next_out,q-g.avail_out)?(e.mode=31,-4):(K-=g.avail_in,q-=g.avail_out,g.total_in+=K,g.total_out+=q,e.total+=q,e.wrap&&q&&(g.adler=e.check=e.flags?n(e.check,$,q,g.next_out-q):l(e.check,$,q,g.next_out-q)),g.data_type=e.bits+(e.last?64:0)+(e.mode===12?128:0)+(e.mode===20||e.mode===15?256:0),(K==0&&q===0||O===4)&&j===b&&(j=-5),j)},w.inflateEnd=function(g){if(!g||!g.state)return s;var O=g.state;return O.window&&(O.window=null),g.state=null,b},w.inflateGetHeader=function(g,O){var e;return g&&g.state&&2&(e=g.state).wrap?((e.head=O).done=!1,b):s},w.inflateSetDictionary=function(g,O){var e,D=O.length;return g&&g.state?(e=g.state).wrap!==0&&e.mode!==11?s:e.mode===11&&l(1,O,D,0)!==e.check?-3:V(g,O,D,D)?(e.mode=31,-4):(e.havedict=1,b):s},w.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(m,z,w){var d=m("../utils/common"),l=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],n=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],c=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],_=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];z.exports=function(y,p,b,s,h,r,i,a){var f,v,E,k,L,R,B,N,Z,V=a.bits,g=0,O=0,e=0,D=0,$=0,U=0,Q=0,M=0,J=0,A=0,S=null,K=0,q=new d.Buf16(16),G=new d.Buf16(16),at=null,dt=0;for(g=0;g<=15;g++)q[g]=0;for(O=0;O<s;O++)q[p[b+O]]++;for($=V,D=15;1<=D&&q[D]===0;D--);if(D<$&&($=D),D===0)return h[r++]=20971520,h[r++]=20971520,a.bits=1,0;for(e=1;e<D&&q[e]===0;e++);for($<e&&($=e),g=M=1;g<=15;g++)if(M<<=1,(M-=q[g])<0)return-1;if(0<M&&(y===0||D!==1))return-1;for(G[1]=0,g=1;g<15;g++)G[g+1]=G[g]+q[g];for(O=0;O<s;O++)p[b+O]!==0&&(i[G[p[b+O]]++]=O);if(R=y===0?(S=at=i,19):y===1?(S=l,K-=257,at=n,dt-=257,256):(S=c,at=_,-1),g=e,L=r,Q=O=A=0,E=-1,k=(J=1<<(U=$))-1,y===1&&852<J||y===2&&592<J)return 1;for(;;){for(B=g-Q,Z=i[O]<R?(N=0,i[O]):i[O]>R?(N=at[dt+i[O]],S[K+i[O]]):(N=96,0),f=1<<g-Q,e=v=1<<U;h[L+(A>>Q)+(v-=f)]=B<<24|N<<16|Z|0,v!==0;);for(f=1<<g-1;A&f;)f>>=1;if(f!==0?(A&=f-1,A+=f):A=0,O++,--q[g]==0){if(g===D)break;g=p[b+i[O]]}if($<g&&(A&k)!==E){for(Q===0&&(Q=$),L+=e,M=1<<(U=g-Q);U+Q<D&&!((M-=q[U+Q])<=0);)U++,M<<=1;if(J+=1<<U,y===1&&852<J||y===2&&592<J)return 1;h[E=A&k]=$<<24|U<<16|L-r|0}}return A!==0&&(h[L+A]=g-Q<<24|64<<16|0),a.bits=$,0}},{"../utils/common":41}],51:[function(m,z,w){z.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(m,z,w){var d=m("../utils/common"),l=0,n=1;function c(o){for(var x=o.length;0<=--x;)o[x]=0}var _=0,y=29,p=256,b=p+1+y,s=30,h=19,r=2*b+1,i=15,a=16,f=7,v=256,E=16,k=17,L=18,R=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],B=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],N=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Z=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],V=new Array(2*(b+2));c(V);var g=new Array(2*s);c(g);var O=new Array(512);c(O);var e=new Array(256);c(e);var D=new Array(y);c(D);var $,U,Q,M=new Array(s);function J(o,x,P,F,T){this.static_tree=o,this.extra_bits=x,this.extra_base=P,this.elems=F,this.max_length=T,this.has_stree=o&&o.length}function A(o,x){this.dyn_tree=o,this.max_code=0,this.stat_desc=x}function S(o){return o<256?O[o]:O[256+(o>>>7)]}function K(o,x){o.pending_buf[o.pending++]=255&x,o.pending_buf[o.pending++]=x>>>8&255}function q(o,x,P){o.bi_valid>a-P?(o.bi_buf|=x<<o.bi_valid&65535,K(o,o.bi_buf),o.bi_buf=x>>a-o.bi_valid,o.bi_valid+=P-a):(o.bi_buf|=x<<o.bi_valid&65535,o.bi_valid+=P)}function G(o,x,P){q(o,P[2*x],P[2*x+1])}function at(o,x){for(var P=0;P|=1&o,o>>>=1,P<<=1,0<--x;);return P>>>1}function dt(o,x,P){var F,T,W=new Array(i+1),X=0;for(F=1;F<=i;F++)W[F]=X=X+P[F-1]<<1;for(T=0;T<=x;T++){var H=o[2*T+1];H!==0&&(o[2*T]=at(W[H]++,H))}}function tt(o){var x;for(x=0;x<b;x++)o.dyn_ltree[2*x]=0;for(x=0;x<s;x++)o.dyn_dtree[2*x]=0;for(x=0;x<h;x++)o.bl_tree[2*x]=0;o.dyn_ltree[2*v]=1,o.opt_len=o.static_len=0,o.last_lit=o.matches=0}function rt(o){8<o.bi_valid?K(o,o.bi_buf):0<o.bi_valid&&(o.pending_buf[o.pending++]=o.bi_buf),o.bi_buf=0,o.bi_valid=0}function ct(o,x,P,F){var T=2*x,W=2*P;return o[T]<o[W]||o[T]===o[W]&&F[x]<=F[P]}function ot(o,x,P){for(var F=o.heap[P],T=P<<1;T<=o.heap_len&&(T<o.heap_len&&ct(x,o.heap[T+1],o.heap[T],o.depth)&&T++,!ct(x,F,o.heap[T],o.depth));)o.heap[P]=o.heap[T],P=T,T<<=1;o.heap[P]=F}function ft(o,x,P){var F,T,W,X,H=0;if(o.last_lit!==0)for(;F=o.pending_buf[o.d_buf+2*H]<<8|o.pending_buf[o.d_buf+2*H+1],T=o.pending_buf[o.l_buf+H],H++,F===0?G(o,T,x):(G(o,(W=e[T])+p+1,x),(X=R[W])!==0&&q(o,T-=D[W],X),G(o,W=S(--F),P),(X=B[W])!==0&&q(o,F-=M[W],X)),H<o.last_lit;);G(o,v,x)}function ht(o,x){var P,F,T,W=x.dyn_tree,X=x.stat_desc.static_tree,H=x.stat_desc.has_stree,Y=x.stat_desc.elems,it=-1;for(o.heap_len=0,o.heap_max=r,P=0;P<Y;P++)W[2*P]!==0?(o.heap[++o.heap_len]=it=P,o.depth[P]=0):W[2*P+1]=0;for(;o.heap_len<2;)W[2*(T=o.heap[++o.heap_len]=it<2?++it:0)]=1,o.depth[T]=0,o.opt_len--,H&&(o.static_len-=X[2*T+1]);for(x.max_code=it,P=o.heap_len>>1;1<=P;P--)ot(o,W,P);for(T=Y;P=o.heap[1],o.heap[1]=o.heap[o.heap_len--],ot(o,W,1),F=o.heap[1],o.heap[--o.heap_max]=P,o.heap[--o.heap_max]=F,W[2*T]=W[2*P]+W[2*F],o.depth[T]=(o.depth[P]>=o.depth[F]?o.depth[P]:o.depth[F])+1,W[2*P+1]=W[2*F+1]=T,o.heap[1]=T++,ot(o,W,1),2<=o.heap_len;);o.heap[--o.heap_max]=o.heap[1],function(et,ut){var yt,pt,vt,lt,xt,At,mt=ut.dyn_tree,Nt=ut.max_code,Gt=ut.stat_desc.static_tree,qt=ut.stat_desc.has_stree,Xt=ut.stat_desc.extra_bits,Rt=ut.stat_desc.extra_base,wt=ut.stat_desc.max_length,kt=0;for(lt=0;lt<=i;lt++)et.bl_count[lt]=0;for(mt[2*et.heap[et.heap_max]+1]=0,yt=et.heap_max+1;yt<r;yt++)wt<(lt=mt[2*mt[2*(pt=et.heap[yt])+1]+1]+1)&&(lt=wt,kt++),mt[2*pt+1]=lt,Nt<pt||(et.bl_count[lt]++,xt=0,Rt<=pt&&(xt=Xt[pt-Rt]),At=mt[2*pt],et.opt_len+=At*(lt+xt),qt&&(et.static_len+=At*(Gt[2*pt+1]+xt)));if(kt!==0){do{for(lt=wt-1;et.bl_count[lt]===0;)lt--;et.bl_count[lt]--,et.bl_count[lt+1]+=2,et.bl_count[wt]--,kt-=2}while(0<kt);for(lt=wt;lt!==0;lt--)for(pt=et.bl_count[lt];pt!==0;)Nt<(vt=et.heap[--yt])||(mt[2*vt+1]!==lt&&(et.opt_len+=(lt-mt[2*vt+1])*mt[2*vt],mt[2*vt+1]=lt),pt--)}}(o,x),dt(W,it,o.bl_count)}function t(o,x,P){var F,T,W=-1,X=x[1],H=0,Y=7,it=4;for(X===0&&(Y=138,it=3),x[2*(P+1)+1]=65535,F=0;F<=P;F++)T=X,X=x[2*(F+1)+1],++H<Y&&T===X||(H<it?o.bl_tree[2*T]+=H:T!==0?(T!==W&&o.bl_tree[2*T]++,o.bl_tree[2*E]++):H<=10?o.bl_tree[2*k]++:o.bl_tree[2*L]++,W=T,it=(H=0)===X?(Y=138,3):T===X?(Y=6,3):(Y=7,4))}function j(o,x,P){var F,T,W=-1,X=x[1],H=0,Y=7,it=4;for(X===0&&(Y=138,it=3),F=0;F<=P;F++)if(T=X,X=x[2*(F+1)+1],!(++H<Y&&T===X)){if(H<it)for(;G(o,T,o.bl_tree),--H!=0;);else T!==0?(T!==W&&(G(o,T,o.bl_tree),H--),G(o,E,o.bl_tree),q(o,H-3,2)):H<=10?(G(o,k,o.bl_tree),q(o,H-3,3)):(G(o,L,o.bl_tree),q(o,H-11,7));W=T,it=(H=0)===X?(Y=138,3):T===X?(Y=6,3):(Y=7,4)}}c(M);var I=!1;function u(o,x,P,F){q(o,(_<<1)+(F?1:0),3),function(T,W,X,H){rt(T),K(T,X),K(T,~X),d.arraySet(T.pending_buf,T.window,W,X,T.pending),T.pending+=X}(o,x,P)}w._tr_init=function(o){I||(function(){var x,P,F,T,W,X=new Array(i+1);for(T=F=0;T<y-1;T++)for(D[T]=F,x=0;x<1<<R[T];x++)e[F++]=T;for(e[F-1]=T,T=W=0;T<16;T++)for(M[T]=W,x=0;x<1<<B[T];x++)O[W++]=T;for(W>>=7;T<s;T++)for(M[T]=W<<7,x=0;x<1<<B[T]-7;x++)O[256+W++]=T;for(P=0;P<=i;P++)X[P]=0;for(x=0;x<=143;)V[2*x+1]=8,x++,X[8]++;for(;x<=255;)V[2*x+1]=9,x++,X[9]++;for(;x<=279;)V[2*x+1]=7,x++,X[7]++;for(;x<=287;)V[2*x+1]=8,x++,X[8]++;for(dt(V,b+1,X),x=0;x<s;x++)g[2*x+1]=5,g[2*x]=at(x,5);$=new J(V,R,p+1,b,i),U=new J(g,B,0,s,i),Q=new J(new Array(0),N,0,h,f)}(),I=!0),o.l_desc=new A(o.dyn_ltree,$),o.d_desc=new A(o.dyn_dtree,U),o.bl_desc=new A(o.bl_tree,Q),o.bi_buf=0,o.bi_valid=0,tt(o)},w._tr_stored_block=u,w._tr_flush_block=function(o,x,P,F){var T,W,X=0;0<o.level?(o.strm.data_type===2&&(o.strm.data_type=function(H){var Y,it=4093624447;for(Y=0;Y<=31;Y++,it>>>=1)if(1&it&&H.dyn_ltree[2*Y]!==0)return l;if(H.dyn_ltree[18]!==0||H.dyn_ltree[20]!==0||H.dyn_ltree[26]!==0)return n;for(Y=32;Y<p;Y++)if(H.dyn_ltree[2*Y]!==0)return n;return l}(o)),ht(o,o.l_desc),ht(o,o.d_desc),X=function(H){var Y;for(t(H,H.dyn_ltree,H.l_desc.max_code),t(H,H.dyn_dtree,H.d_desc.max_code),ht(H,H.bl_desc),Y=h-1;3<=Y&&H.bl_tree[2*Z[Y]+1]===0;Y--);return H.opt_len+=3*(Y+1)+5+5+4,Y}(o),T=o.opt_len+3+7>>>3,(W=o.static_len+3+7>>>3)<=T&&(T=W)):T=W=P+5,P+4<=T&&x!==-1?u(o,x,P,F):o.strategy===4||W===T?(q(o,2+(F?1:0),3),ft(o,V,g)):(q(o,4+(F?1:0),3),function(H,Y,it,et){var ut;for(q(H,Y-257,5),q(H,it-1,5),q(H,et-4,4),ut=0;ut<et;ut++)q(H,H.bl_tree[2*Z[ut]+1],3);j(H,H.dyn_ltree,Y-1),j(H,H.dyn_dtree,it-1)}(o,o.l_desc.max_code+1,o.d_desc.max_code+1,X+1),ft(o,o.dyn_ltree,o.dyn_dtree)),tt(o),F&&rt(o)},w._tr_tally=function(o,x,P){return o.pending_buf[o.d_buf+2*o.last_lit]=x>>>8&255,o.pending_buf[o.d_buf+2*o.last_lit+1]=255&x,o.pending_buf[o.l_buf+o.last_lit]=255&P,o.last_lit++,x===0?o.dyn_ltree[2*P]++:(o.matches++,x--,o.dyn_ltree[2*(e[P]+p+1)]++,o.dyn_dtree[2*S(x)]++),o.last_lit===o.lit_bufsize-1},w._tr_align=function(o){q(o,2,3),G(o,v,V),function(x){x.bi_valid===16?(K(x,x.bi_buf),x.bi_buf=0,x.bi_valid=0):8<=x.bi_valid&&(x.pending_buf[x.pending++]=255&x.bi_buf,x.bi_buf>>=8,x.bi_valid-=8)}(o)}},{"../utils/common":41}],53:[function(m,z,w){z.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(m,z,w){(function(d){(function(l,n){if(!l.setImmediate){var c,_,y,p,b=1,s={},h=!1,r=l.document,i=Object.getPrototypeOf&&Object.getPrototypeOf(l);i=i&&i.setTimeout?i:l,c={}.toString.call(l.process)==="[object process]"?function(E){process.nextTick(function(){f(E)})}:function(){if(l.postMessage&&!l.importScripts){var E=!0,k=l.onmessage;return l.onmessage=function(){E=!1},l.postMessage("","*"),l.onmessage=k,E}}()?(p="setImmediate$"+Math.random()+"$",l.addEventListener?l.addEventListener("message",v,!1):l.attachEvent("onmessage",v),function(E){l.postMessage(p+E,"*")}):l.MessageChannel?((y=new MessageChannel).port1.onmessage=function(E){f(E.data)},function(E){y.port2.postMessage(E)}):r&&"onreadystatechange"in r.createElement("script")?(_=r.documentElement,function(E){var k=r.createElement("script");k.onreadystatechange=function(){f(E),k.onreadystatechange=null,_.removeChild(k),k=null},_.appendChild(k)}):function(E){setTimeout(f,0,E)},i.setImmediate=function(E){typeof E!="function"&&(E=new Function(""+E));for(var k=new Array(arguments.length-1),L=0;L<k.length;L++)k[L]=arguments[L+1];var R={callback:E,args:k};return s[b]=R,c(b),b++},i.clearImmediate=a}function a(E){delete s[E]}function f(E){if(h)setTimeout(f,0,E);else{var k=s[E];if(k){h=!0;try{(function(L){var R=L.callback,B=L.args;switch(B.length){case 0:R();break;case 1:R(B[0]);break;case 2:R(B[0],B[1]);break;case 3:R(B[0],B[1],B[2]);break;default:R.apply(n,B)}})(k)}finally{a(E),h=!1}}}}function v(E){E.source===l&&typeof E.data=="string"&&E.data.indexOf(p)===0&&f(+E.data.slice(p.length))}})(typeof self>"u"?d===void 0?this:d:self)}).call(this,typeof Et<"u"?Et:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Ht);var te=Ht.exports;const ee=Yt(te),Wt={async exportProject(nt={format:"zip"}){try{return await Tt(gt(_t,"/export/project"),{method:"POST",body:JSON.stringify(nt)})}catch(st){throw console.error("Export project failed:",st),new Error("خطا در صادرات پروژه")}},async exportModel(nt,st="tensorflow"){try{return await Tt(gt(_t,`/models/${nt}/export`),{method:"POST",body:JSON.stringify({format:st})})}catch(m){throw console.error("Export model failed:",m),new Error("خطا در صادرات مدل")}},async getExportStatus(nt){try{return await Tt(gt(_t,`/export/${nt}/status`))}catch(st){throw console.error("Get export status failed:",st),new Error("خطا در دریافت وضعیت صادرات")}},async downloadExport(nt){try{const st=await fetch(gt(_t,`/export/${nt}/download`));if(!st.ok)throw new Error(`HTTP error! status: ${st.status}`);return await st.blob()}catch(st){throw console.error("Download export failed:",st),new Error("خطا در دانلود فایل صادرات")}},async getProjectStructure(){try{return await Tt(gt(_t,"/export/structure"))}catch(nt){return console.error("Get project structure failed:",nt),{name:"persian-legal-ai",version:"1.0.0",description:"Persian Legal AI Training System",files:{},dependencies:{react:"^18.3.1",typescript:"^5.5.3",express:"^4.19.2","better-sqlite3":"^12.2.0"},scripts:{dev:'concurrently "npm run server" "npm run client"',build:"vite build",start:"node server.js"}}}},async generateProjectZip(){try{const nt=await this.getProjectStructure(),st=await fetch(gt(_t,"/export/generate-zip"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(nt)});if(!st.ok)throw new Error(`HTTP error! status: ${st.status}`);return await st.blob()}catch(nt){throw console.error("Generate project ZIP failed:",nt),new Error("خطا در تولید فایل ZIP پروژه")}},async exportLogs(nt,st="json"){try{const m=new URLSearchParams({format:st});nt&&m.append("modelId",nt.toString());const z=await fetch(gt(_t,`/export/logs?${m.toString()}`));if(!z.ok)throw new Error(`HTTP error! status: ${z.status}`);return await z.blob()}catch(m){throw console.error("Export logs failed:",m),new Error("خطا در صادرات لاگ‌ها")}},async exportDataset(nt,st="json"){try{const m=await fetch(gt(_t,`/datasets/${nt}/export?format=${st}`));if(!m.ok)throw new Error(`HTTP error! status: ${m.status}`);return await m.blob()}catch(m){throw console.error("Export dataset failed:",m),new Error("خطا در صادرات مجموعه داده")}}};typeof process<"u"&&process.platform;function le(){const[nt,st]=bt.useState(!1),[m,z]=bt.useState(0),[w,d]=bt.useState("idle"),[l,n]=bt.useState(null),[c,_]=bt.useState({format:"zip",includeModels:!0,includeData:!0,includeLogs:!0,includeConfig:!0}),[y,p]=bt.useState(null);bt.useEffect(()=>{let r;return l&&w==="processing"&&(r=setInterval(async()=>{try{const i=await Wt.getExportStatus(l);d(i.status),z(i.progress||0),(i.status==="completed"||i.status==="failed")&&(clearInterval(r),i.status==="failed"&&p(i.message||"خطا در صادرات پروژه"))}catch(i){console.error("Error polling export status:",i),clearInterval(r),d("failed"),p("خطا در دریافت وضعیت صادرات")}},1e3)),()=>{r&&clearInterval(r)}},[l,w]);const b=()=>({"package.json":JSON.stringify({name:"persian-legal-ai-trainer",version:"1.0.0",description:"Persian Legal AI Training System with Real HuggingFace Integration",main:"server.js",scripts:{dev:'concurrently "npm run server" "npm run client"',server:"node server.js",client:"vite",build:"vite build",start:"node server.js",setup:"npm install && npm run build"},dependencies:{react:"^18.3.1","react-dom":"^18.3.1","@tensorflow/tfjs":"^4.22.0","better-sqlite3":"^12.2.0",express:"^5.1.0",cors:"^2.8.5","framer-motion":"^12.23.12","lucide-react":"^0.344.0",recharts:"^3.2.0",dexie:"^4.2.0",clsx:"^2.1.1","tailwind-merge":"^3.3.1",jszip:"^3.10.1"},devDependencies:{"@vitejs/plugin-react":"^4.3.1",vite:"^5.4.2",typescript:"^5.5.3","@types/react":"^18.3.5","@types/react-dom":"^18.3.0",tailwindcss:"^3.4.1",autoprefixer:"^10.4.18",postcss:"^8.4.35",concurrently:"^9.2.1"},keywords:["persian","legal","ai","training","tensorflow","huggingface"],author:"Persian Legal AI Team",license:"MIT"},null,2),"server.js":`const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

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
};`}),s=async()=>{st(!0),z(0),p(null),d("processing");try{const r=await Wt.exportProject(c);if(r.success){if(n(r.exportId),r.downloadUrl){const i=document.createElement("a");i.href=r.downloadUrl,i.download="persian-legal-ai-complete.zip",document.body.appendChild(i),i.click(),document.body.removeChild(i),d("completed"),z(100)}}else throw new Error(r.message||"خطا در شروع صادرات")}catch(r){console.error("Export failed:",r),p(r instanceof Error?r.message:"خطا در صادرات پروژه"),d("failed")}finally{st(!1),setTimeout(()=>{z(0),d("idle"),n(null),p(null)},3e3)}},h=async()=>{st(!0),z(0),p(null);try{const r=new ee,i=b(),a=Object.keys(i).length;let f=0;for(const[L,R]of Object.entries(i))r.file(L,R),f++,z(f/a*90),await new Promise(B=>setTimeout(B,50));z(95);const v=await r.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});z(100);const E=URL.createObjectURL(v),k=document.createElement("a");k.href=E,k.download="persian-legal-ai-complete.zip",document.body.appendChild(k),k.click(),document.body.removeChild(k),URL.revokeObjectURL(E),setTimeout(()=>{z(0),st(!1)},1e3)}catch(r){console.error("Error generating project:",r),st(!1),z(0),p("خطا در تولید فایل پروژه")}};return C.jsxs("div",{className:"space-y-6",dir:"rtl",children:[C.jsxs("div",{className:"text-center",children:[C.jsx("h1",{className:"text-3xl font-bold text-gray-900 dark:text-white mb-2",children:"دانلود پروژه کامل"}),C.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"دانلود پروژه کامل Persian Legal AI با تمام فایل‌های لازم برای استقرار"})]}),C.jsxs(Ot,{className:"w-full max-w-4xl mx-auto",children:[C.jsx(jt,{children:C.jsxs(zt,{className:"flex items-center gap-3",children:[C.jsx(Ct,{className:"h-6 w-6 text-blue-600"}),"گزینه‌های صادرات"]})}),C.jsx(Dt,{children:C.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[C.jsxs("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[C.jsx("input",{type:"checkbox",checked:c.includeModels,onChange:r=>_(i=>({...i,includeModels:r.target.checked})),className:"text-blue-600"}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Mt,{className:"h-4 w-4 text-purple-600"}),C.jsx("span",{className:"text-sm",children:"مدل‌ها"})]})]}),C.jsxs("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[C.jsx("input",{type:"checkbox",checked:c.includeData,onChange:r=>_(i=>({...i,includeData:r.target.checked})),className:"text-blue-600"}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Lt,{className:"h-4 w-4 text-green-600"}),C.jsx("span",{className:"text-sm",children:"داده‌ها"})]})]}),C.jsxs("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[C.jsx("input",{type:"checkbox",checked:c.includeLogs,onChange:r=>_(i=>({...i,includeLogs:r.target.checked})),className:"text-blue-600"}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Pt,{className:"h-4 w-4 text-orange-600"}),C.jsx("span",{className:"text-sm",children:"لاگ‌ها"})]})]}),C.jsxs("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[C.jsx("input",{type:"checkbox",checked:c.includeConfig,onChange:r=>_(i=>({...i,includeConfig:r.target.checked})),className:"text-blue-600"}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Ut,{className:"h-4 w-4 text-blue-600"}),C.jsx("span",{className:"text-sm",children:"تنظیمات"})]})]})]})})]}),C.jsxs(Ot,{className:"w-full max-w-4xl mx-auto",children:[C.jsx(jt,{children:C.jsxs(zt,{className:"flex items-center gap-3 text-2xl",children:[C.jsx(Ct,{className:"h-8 w-8 text-blue-600"}),"دانلود پروژه کامل",w==="completed"&&C.jsx(It,{className:"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",children:"تکمیل شده"}),w==="processing"&&C.jsx(It,{className:"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",children:"در حال پردازش"}),w==="failed"&&C.jsx(It,{className:"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",children:"ناموفق"})]})}),C.jsxs(Dt,{className:"space-y-6",children:[C.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg",children:[C.jsx(Ut,{className:"h-6 w-6 text-blue-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"سرور Express"}),C.jsx("p",{className:"text-sm text-gray-600",children:"API کامل با SQLite"})]})]}),C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg",children:[C.jsx(Lt,{className:"h-6 w-6 text-green-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"پایگاه داده"}),C.jsx("p",{className:"text-sm text-gray-600",children:"SQLite برای Windows VPS"})]})]}),C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg",children:[C.jsx(Mt,{className:"h-6 w-6 text-purple-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"کد کامل"}),C.jsx("p",{className:"text-sm text-gray-600",children:"React + TypeScript"})]})]}),C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg",children:[C.jsx(Pt,{className:"h-6 w-6 text-orange-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"مستندات"}),C.jsx("p",{className:"text-sm text-gray-600",children:"راهنمای کامل نصب"})]})]}),C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg",children:[C.jsx(Ct,{className:"h-6 w-6 text-red-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"Docker"}),C.jsx("p",{className:"text-sm text-gray-600",children:"آماده برای استقرار"})]})]}),C.jsxs("div",{className:"flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950 rounded-lg",children:[C.jsx(Ft,{className:"h-6 w-6 text-teal-600"}),C.jsxs("div",{children:[C.jsx("h4",{className:"font-semibold",children:"یک کلیک"}),C.jsx("p",{className:"text-sm text-gray-600",children:"آماده برای اجرا"})]})]})]}),C.jsxs("div",{className:"bg-gray-50 dark:bg-gray-800 p-6 rounded-lg",children:[C.jsx("h4",{className:"font-semibold mb-4",children:"فایل‌های شامل:"}),C.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-2 text-sm",children:[C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-blue-500 rounded-full"}),C.jsx("code",{children:"package.json"})," - تنظیمات پروژه"]}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-green-500 rounded-full"}),C.jsx("code",{children:"server.js"})," - سرور Express"]}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-purple-500 rounded-full"}),C.jsx("code",{children:"Dockerfile"})," - تنظیمات Docker"]}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-orange-500 rounded-full"}),C.jsx("code",{children:"README.md"})," - مستندات کامل"]}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-red-500 rounded-full"}),C.jsx("code",{children:"deploy.sh"})," - اسکریپت استقرار"]}),C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx("span",{className:"w-2 h-2 bg-teal-500 rounded-full"}),C.jsx("code",{children:"setup.sh"})," - اسکریپت نصب"]})]})]}),y&&C.jsx("div",{className:"p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mb-6",children:C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Kt,{className:"h-5 w-5 text-red-600"}),C.jsx("p",{className:"text-red-800 dark:text-red-200",children:y})]})}),w==="completed"&&C.jsx("div",{className:"p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mb-6",children:C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Vt,{className:"h-5 w-5 text-green-600"}),C.jsx("p",{className:"text-green-800 dark:text-green-200",children:"صادرات با موفقیت تکمیل شد!"})]})}),(nt||w==="processing")&&C.jsxs("div",{className:"space-y-3 mb-6",children:[C.jsxs("div",{className:"flex justify-between items-center text-sm",children:[C.jsxs("div",{className:"flex items-center gap-2",children:[C.jsx(Qt,{className:"h-4 w-4 text-blue-600 animate-pulse"}),C.jsxs("span",{children:["در حال ",w==="processing"?"پردازش":"تولید"," پروژه..."]})]}),C.jsxs("span",{className:"font-medium",children:[m.toFixed(0),"%"]})]}),C.jsx($t,{value:m,className:"h-3"}),C.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400 text-center",children:w==="processing"?"سرور در حال آماده‌سازی فایل‌ها است":"در حال ایجاد فایل ZIP"})]}),C.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center items-center",children:[C.jsx(Bt,{onClick:s,disabled:nt||w==="processing",className:"px-8 py-4 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50",children:nt||w==="processing"?C.jsxs(C.Fragment,{children:[C.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ms-2"}),"در حال پردازش..."]}):C.jsxs(C.Fragment,{children:[C.jsx(Jt,{className:"h-5 w-5 ms-2"}),"دانلود از سرور (پیشنهادی)"]})}),C.jsxs(Bt,{onClick:h,disabled:nt||w==="processing",variant:"outline",className:"px-6 py-4",children:[C.jsx(Ft,{className:"h-4 w-4 ms-2"}),"دانلود محلی (ZIP)"]})]}),C.jsxs("div",{className:"text-center text-sm text-gray-500 dark:text-gray-400 mt-4",children:[C.jsx("p",{children:"دانلود از سرور: سریع‌تر و شامل داده‌های به‌روز"}),C.jsx("p",{children:"دانلود محلی: بدون نیاز به اتصال مداوم به سرور"})]}),C.jsxs("div",{className:"bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800",children:[C.jsx("h4",{className:"font-semibold text-blue-900 dark:text-blue-100 mb-3",children:"راهنمای سریع:"}),C.jsxs("ol",{className:"list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200",children:[C.jsx("li",{children:"فایل ZIP را دانلود و استخراج کنید"}),C.jsx("li",{children:"در ترمینال وارد پوشه پروژه شوید"}),C.jsxs("li",{children:["دستور ",C.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm install"})," را اجرا کنید"]}),C.jsxs("li",{children:["دستور ",C.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm run dev"})," را اجرا کنید"]}),C.jsxs("li",{children:["مرورگر را به آدرس ",C.jsx("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"http://localhost:8000"})," باز کنید"]})]})]})]})]})]})}export{le as ProjectDownloader};
//# sourceMappingURL=ProjectDownloader-BSsMh4Sd.js.map
