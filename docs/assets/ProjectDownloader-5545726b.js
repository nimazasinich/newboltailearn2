import{f as We,a4 as ke,a5 as Xe,w as Ee,x as ge,y as be,r as _e,j as S,D as Ce,F as Pe,U as Re,e as Ye,b as Ke,c as Oe,Z as Je}from"./index-77f7cea8.js";import{C as ze,b as Le,c as Fe,a as Be,B as je}from"./Card-1b26f8f8.js";import{P as $e}from"./Progress-bffeb65d.js";import{D as Ue}from"./download-c5263276.js";import{C as Qe}from"./clock-092a8097.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=We("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=We("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);function De(ne){throw new Error('Could not dynamically require "'+ne+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Ze={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/(function(ne,re){(function(p){ne.exports=p()})(function(){return function p(R,x,u){function l(b,w){if(!x[b]){if(!R[b]){var m=typeof De=="function"&&De;if(!w&&m)return m(b,!0);if(n)return n(b,!0);var _=new Error("Cannot find module '"+b+"'");throw _.code="MODULE_NOT_FOUND",_}var s=x[b]={exports:{}};R[b][0].call(s.exports,function(h){var r=R[b][1][h];return l(r||h)},s,s.exports,p,R,x,u)}return x[b].exports}for(var n=typeof De=="function"&&De,c=0;c<u.length;c++)l(u[c]);return l}({1:[function(p,R,x){var u=p("./utils"),l=p("./support"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";x.encode=function(c){for(var b,w,m,_,s,h,r,i=[],a=0,f=c.length,v=f,k=u.getTypeOf(c)!=="string";a<c.length;)v=f-a,m=k?(b=c[a++],w=a<f?c[a++]:0,a<f?c[a++]:0):(b=c.charCodeAt(a++),w=a<f?c.charCodeAt(a++):0,a<f?c.charCodeAt(a++):0),_=b>>2,s=(3&b)<<4|w>>4,h=1<v?(15&w)<<2|m>>6:64,r=2<v?63&m:64,i.push(n.charAt(_)+n.charAt(s)+n.charAt(h)+n.charAt(r));return i.join("")},x.decode=function(c){var b,w,m,_,s,h,r=0,i=0,a="data:";if(c.substr(0,a.length)===a)throw new Error("Invalid base64 input, it looks like a data url.");var f,v=3*(c=c.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(c.charAt(c.length-1)===n.charAt(64)&&v--,c.charAt(c.length-2)===n.charAt(64)&&v--,v%1!=0)throw new Error("Invalid base64 input, bad content length.");for(f=l.uint8array?new Uint8Array(0|v):new Array(0|v);r<c.length;)b=n.indexOf(c.charAt(r++))<<2|(_=n.indexOf(c.charAt(r++)))>>4,w=(15&_)<<4|(s=n.indexOf(c.charAt(r++)))>>2,m=(3&s)<<6|(h=n.indexOf(c.charAt(r++))),f[i++]=b,s!==64&&(f[i++]=w),h!==64&&(f[i++]=m);return f}},{"./support":30,"./utils":32}],2:[function(p,R,x){var u=p("./external"),l=p("./stream/DataWorker"),n=p("./stream/Crc32Probe"),c=p("./stream/DataLengthProbe");function b(w,m,_,s,h){this.compressedSize=w,this.uncompressedSize=m,this.crc32=_,this.compression=s,this.compressedContent=h}b.prototype={getContentWorker:function(){var w=new l(u.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new c("data_length")),m=this;return w.on("end",function(){if(this.streamInfo.data_length!==m.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),w},getCompressedWorker:function(){return new l(u.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},b.createWorkerFrom=function(w,m,_){return w.pipe(new n).pipe(new c("uncompressedSize")).pipe(m.compressWorker(_)).pipe(new c("compressedSize")).withStreamInfo("compression",m)},R.exports=b},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(p,R,x){var u=p("./stream/GenericWorker");x.STORE={magic:"\0\0",compressWorker:function(){return new u("STORE compression")},uncompressWorker:function(){return new u("STORE decompression")}},x.DEFLATE=p("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(p,R,x){var u=p("./utils"),l=function(){for(var n,c=[],b=0;b<256;b++){n=b;for(var w=0;w<8;w++)n=1&n?3988292384^n>>>1:n>>>1;c[b]=n}return c}();R.exports=function(n,c){return n!==void 0&&n.length?u.getTypeOf(n)!=="string"?function(b,w,m,_){var s=l,h=_+m;b^=-1;for(var r=_;r<h;r++)b=b>>>8^s[255&(b^w[r])];return-1^b}(0|c,n,n.length,0):function(b,w,m,_){var s=l,h=_+m;b^=-1;for(var r=_;r<h;r++)b=b>>>8^s[255&(b^w.charCodeAt(r))];return-1^b}(0|c,n,n.length,0):0}},{"./utils":32}],5:[function(p,R,x){x.base64=!1,x.binary=!1,x.dir=!1,x.createFolders=!0,x.date=null,x.compression=null,x.compressionOptions=null,x.comment=null,x.unixPermissions=null,x.dosPermissions=null},{}],6:[function(p,R,x){var u=null;u=typeof Promise<"u"?Promise:p("lie"),R.exports={Promise:u}},{lie:37}],7:[function(p,R,x){var u=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",l=p("pako"),n=p("./utils"),c=p("./stream/GenericWorker"),b=u?"uint8array":"array";function w(m,_){c.call(this,"FlateWorker/"+m),this._pako=null,this._pakoAction=m,this._pakoOptions=_,this.meta={}}x.magic="\b\0",n.inherits(w,c),w.prototype.processChunk=function(m){this.meta=m.meta,this._pako===null&&this._createPako(),this._pako.push(n.transformTo(b,m.data),!1)},w.prototype.flush=function(){c.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},w.prototype.cleanUp=function(){c.prototype.cleanUp.call(this),this._pako=null},w.prototype._createPako=function(){this._pako=new l[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var m=this;this._pako.onData=function(_){m.push({data:_,meta:m.meta})}},x.compressWorker=function(m){return new w("Deflate",m)},x.uncompressWorker=function(){return new w("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(p,R,x){function u(s,h){var r,i="";for(r=0;r<h;r++)i+=String.fromCharCode(255&s),s>>>=8;return i}function l(s,h,r,i,a,f){var v,k,N=s.file,z=s.compression,I=f!==b.utf8encode,B=n.transformTo("string",f(N.name)),A=n.transformTo("string",b.utf8encode(N.name)),Z=N.comment,K=n.transformTo("string",f(Z)),g=n.transformTo("string",b.utf8encode(Z)),C=A.length!==N.name.length,t=g.length!==Z.length,O="",$="",U="",Q=N.dir,V=N.date,J={crc32:0,compressedSize:0,uncompressedSize:0};h&&!r||(J.crc32=s.crc32,J.compressedSize=s.compressedSize,J.uncompressedSize=s.uncompressedSize);var T=0;h&&(T|=8),I||!C&&!t||(T|=2048);var D=0,Y=0;Q&&(D|=16),a==="UNIX"?(Y=798,D|=function(H,ae){var ue=H;return H||(ue=ae?16893:33204),(65535&ue)<<16}(N.unixPermissions,Q)):(Y=20,D|=function(H){return 63&(H||0)}(N.dosPermissions)),v=V.getUTCHours(),v<<=6,v|=V.getUTCMinutes(),v<<=5,v|=V.getUTCSeconds()/2,k=V.getUTCFullYear()-1980,k<<=4,k|=V.getUTCMonth()+1,k<<=5,k|=V.getUTCDate(),C&&($=u(1,1)+u(w(B),4)+A,O+="up"+u($.length,2)+$),t&&(U=u(1,1)+u(w(K),4)+g,O+="uc"+u(U.length,2)+U);var G="";return G+=`
\0`,G+=u(T,2),G+=z.magic,G+=u(v,2),G+=u(k,2),G+=u(J.crc32,4),G+=u(J.compressedSize,4),G+=u(J.uncompressedSize,4),G+=u(B.length,2),G+=u(O.length,2),{fileRecord:m.LOCAL_FILE_HEADER+G+B+O,dirRecord:m.CENTRAL_FILE_HEADER+u(Y,2)+G+u(K.length,2)+"\0\0\0\0"+u(D,4)+u(i,4)+B+O+K}}var n=p("../utils"),c=p("../stream/GenericWorker"),b=p("../utf8"),w=p("../crc32"),m=p("../signature");function _(s,h,r,i){c.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=h,this.zipPlatform=r,this.encodeFileName=i,this.streamFiles=s,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}n.inherits(_,c),_.prototype.push=function(s){var h=s.meta.percent||0,r=this.entriesCount,i=this._sources.length;this.accumulate?this.contentBuffer.push(s):(this.bytesWritten+=s.data.length,c.prototype.push.call(this,{data:s.data,meta:{currentFile:this.currentFile,percent:r?(h+100*(r-i-1))/r:100}}))},_.prototype.openedSource=function(s){this.currentSourceOffset=this.bytesWritten,this.currentFile=s.file.name;var h=this.streamFiles&&!s.file.dir;if(h){var r=l(s,h,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},_.prototype.closedSource=function(s){this.accumulate=!1;var h=this.streamFiles&&!s.file.dir,r=l(s,h,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),h)this.push({data:function(i){return m.DATA_DESCRIPTOR+u(i.crc32,4)+u(i.compressedSize,4)+u(i.uncompressedSize,4)}(s),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},_.prototype.flush=function(){for(var s=this.bytesWritten,h=0;h<this.dirRecords.length;h++)this.push({data:this.dirRecords[h],meta:{percent:100}});var r=this.bytesWritten-s,i=function(a,f,v,k,N){var z=n.transformTo("string",N(k));return m.CENTRAL_DIRECTORY_END+"\0\0\0\0"+u(a,2)+u(a,2)+u(f,4)+u(v,4)+u(z.length,2)+z}(this.dirRecords.length,r,s,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}})},_.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},_.prototype.registerPrevious=function(s){this._sources.push(s);var h=this;return s.on("data",function(r){h.processChunk(r)}),s.on("end",function(){h.closedSource(h.previous.streamInfo),h._sources.length?h.prepareNextSource():h.end()}),s.on("error",function(r){h.error(r)}),this},_.prototype.resume=function(){return!!c.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},_.prototype.error=function(s){var h=this._sources;if(!c.prototype.error.call(this,s))return!1;for(var r=0;r<h.length;r++)try{h[r].error(s)}catch{}return!0},_.prototype.lock=function(){c.prototype.lock.call(this);for(var s=this._sources,h=0;h<s.length;h++)s[h].lock()},R.exports=_},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(p,R,x){var u=p("../compressions"),l=p("./ZipFileWorker");x.generateWorker=function(n,c,b){var w=new l(c.streamFiles,b,c.platform,c.encodeFileName),m=0;try{n.forEach(function(_,s){m++;var h=function(f,v){var k=f||v,N=u[k];if(!N)throw new Error(k+" is not a valid compression method !");return N}(s.options.compression,c.compression),r=s.options.compressionOptions||c.compressionOptions||{},i=s.dir,a=s.date;s._compressWorker(h,r).withStreamInfo("file",{name:_,dir:i,date:a,comment:s.comment||"",unixPermissions:s.unixPermissions,dosPermissions:s.dosPermissions}).pipe(w)}),w.entriesCount=m}catch(_){w.error(_)}return w}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(p,R,x){function u(){if(!(this instanceof u))return new u;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var l=new u;for(var n in this)typeof this[n]!="function"&&(l[n]=this[n]);return l}}(u.prototype=p("./object")).loadAsync=p("./load"),u.support=p("./support"),u.defaults=p("./defaults"),u.version="3.10.1",u.loadAsync=function(l,n){return new u().loadAsync(l,n)},u.external=p("./external"),R.exports=u},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(p,R,x){var u=p("./utils"),l=p("./external"),n=p("./utf8"),c=p("./zipEntries"),b=p("./stream/Crc32Probe"),w=p("./nodejsUtils");function m(_){return new l.Promise(function(s,h){var r=_.decompressed.getContentWorker().pipe(new b);r.on("error",function(i){h(i)}).on("end",function(){r.streamInfo.crc32!==_.decompressed.crc32?h(new Error("Corrupted zip : CRC32 mismatch")):s()}).resume()})}R.exports=function(_,s){var h=this;return s=u.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),w.isNode&&w.isStream(_)?l.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",_,!0,s.optimizedBinaryString,s.base64).then(function(r){var i=new c(s);return i.load(r),i}).then(function(r){var i=[l.Promise.resolve(r)],a=r.files;if(s.checkCRC32)for(var f=0;f<a.length;f++)i.push(m(a[f]));return l.Promise.all(i)}).then(function(r){for(var i=r.shift(),a=i.files,f=0;f<a.length;f++){var v=a[f],k=v.fileNameStr,N=u.resolve(v.fileNameStr);h.file(N,v.decompressed,{binary:!0,optimizedBinaryString:!0,date:v.date,dir:v.dir,comment:v.fileCommentStr.length?v.fileCommentStr:null,unixPermissions:v.unixPermissions,dosPermissions:v.dosPermissions,createFolders:s.createFolders}),v.dir||(h.file(N).unsafeOriginalName=k)}return i.zipComment.length&&(h.comment=i.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(p,R,x){var u=p("../utils"),l=p("../stream/GenericWorker");function n(c,b){l.call(this,"Nodejs stream input adapter for "+c),this._upstreamEnded=!1,this._bindStream(b)}u.inherits(n,l),n.prototype._bindStream=function(c){var b=this;(this._stream=c).pause(),c.on("data",function(w){b.push({data:w,meta:{percent:0}})}).on("error",function(w){b.isPaused?this.generatedError=w:b.error(w)}).on("end",function(){b.isPaused?b._upstreamEnded=!0:b.end()})},n.prototype.pause=function(){return!!l.prototype.pause.call(this)&&(this._stream.pause(),!0)},n.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},R.exports=n},{"../stream/GenericWorker":28,"../utils":32}],13:[function(p,R,x){var u=p("readable-stream").Readable;function l(n,c,b){u.call(this,c),this._helper=n;var w=this;n.on("data",function(m,_){w.push(m)||w._helper.pause(),b&&b(_)}).on("error",function(m){w.emit("error",m)}).on("end",function(){w.push(null)})}p("../utils").inherits(l,u),l.prototype._read=function(){this._helper.resume()},R.exports=l},{"../utils":32,"readable-stream":16}],14:[function(p,R,x){R.exports={isNode:typeof Buffer<"u",newBufferFrom:function(u,l){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(u,l);if(typeof u=="number")throw new Error('The "data" argument must not be a number');return new Buffer(u,l)},allocBuffer:function(u){if(Buffer.alloc)return Buffer.alloc(u);var l=new Buffer(u);return l.fill(0),l},isBuffer:function(u){return Buffer.isBuffer(u)},isStream:function(u){return u&&typeof u.on=="function"&&typeof u.pause=="function"&&typeof u.resume=="function"}}},{}],15:[function(p,R,x){function u(N,z,I){var B,A=n.getTypeOf(z),Z=n.extend(I||{},w);Z.date=Z.date||new Date,Z.compression!==null&&(Z.compression=Z.compression.toUpperCase()),typeof Z.unixPermissions=="string"&&(Z.unixPermissions=parseInt(Z.unixPermissions,8)),Z.unixPermissions&&16384&Z.unixPermissions&&(Z.dir=!0),Z.dosPermissions&&16&Z.dosPermissions&&(Z.dir=!0),Z.dir&&(N=a(N)),Z.createFolders&&(B=i(N))&&f.call(this,B,!0);var K=A==="string"&&Z.binary===!1&&Z.base64===!1;I&&I.binary!==void 0||(Z.binary=!K),(z instanceof m&&z.uncompressedSize===0||Z.dir||!z||z.length===0)&&(Z.base64=!1,Z.binary=!0,z="",Z.compression="STORE",A="string");var g=null;g=z instanceof m||z instanceof c?z:h.isNode&&h.isStream(z)?new r(N,z):n.prepareContent(N,z,Z.binary,Z.optimizedBinaryString,Z.base64);var C=new _(N,g,Z);this.files[N]=C}var l=p("./utf8"),n=p("./utils"),c=p("./stream/GenericWorker"),b=p("./stream/StreamHelper"),w=p("./defaults"),m=p("./compressedObject"),_=p("./zipObject"),s=p("./generate"),h=p("./nodejsUtils"),r=p("./nodejs/NodejsStreamInputAdapter"),i=function(N){N.slice(-1)==="/"&&(N=N.substring(0,N.length-1));var z=N.lastIndexOf("/");return 0<z?N.substring(0,z):""},a=function(N){return N.slice(-1)!=="/"&&(N+="/"),N},f=function(N,z){return z=z!==void 0?z:w.createFolders,N=a(N),this.files[N]||u.call(this,N,null,{dir:!0,createFolders:z}),this.files[N]};function v(N){return Object.prototype.toString.call(N)==="[object RegExp]"}var k={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(N){var z,I,B;for(z in this.files)B=this.files[z],(I=z.slice(this.root.length,z.length))&&z.slice(0,this.root.length)===this.root&&N(I,B)},filter:function(N){var z=[];return this.forEach(function(I,B){N(I,B)&&z.push(B)}),z},file:function(N,z,I){if(arguments.length!==1)return N=this.root+N,u.call(this,N,z,I),this;if(v(N)){var B=N;return this.filter(function(Z,K){return!K.dir&&B.test(Z)})}var A=this.files[this.root+N];return A&&!A.dir?A:null},folder:function(N){if(!N)return this;if(v(N))return this.filter(function(A,Z){return Z.dir&&N.test(A)});var z=this.root+N,I=f.call(this,z),B=this.clone();return B.root=I.name,B},remove:function(N){N=this.root+N;var z=this.files[N];if(z||(N.slice(-1)!=="/"&&(N+="/"),z=this.files[N]),z&&!z.dir)delete this.files[N];else for(var I=this.filter(function(A,Z){return Z.name.slice(0,N.length)===N}),B=0;B<I.length;B++)delete this.files[I[B].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(N){var z,I={};try{if((I=n.extend(N||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:l.utf8encode})).type=I.type.toLowerCase(),I.compression=I.compression.toUpperCase(),I.type==="binarystring"&&(I.type="string"),!I.type)throw new Error("No output type specified.");n.checkSupport(I.type),I.platform!=="darwin"&&I.platform!=="freebsd"&&I.platform!=="linux"&&I.platform!=="sunos"||(I.platform="UNIX"),I.platform==="win32"&&(I.platform="DOS");var B=I.comment||this.comment||"";z=s.generateWorker(this,I,B)}catch(A){(z=new c("error")).error(A)}return new b(z,I.type||"string",I.mimeType)},generateAsync:function(N,z){return this.generateInternalStream(N).accumulate(z)},generateNodeStream:function(N,z){return(N=N||{}).type||(N.type="nodebuffer"),this.generateInternalStream(N).toNodejsStream(z)}};R.exports=k},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(p,R,x){R.exports=p("stream")},{stream:void 0}],17:[function(p,R,x){var u=p("./DataReader");function l(n){u.call(this,n);for(var c=0;c<this.data.length;c++)n[c]=255&n[c]}p("../utils").inherits(l,u),l.prototype.byteAt=function(n){return this.data[this.zero+n]},l.prototype.lastIndexOfSignature=function(n){for(var c=n.charCodeAt(0),b=n.charCodeAt(1),w=n.charCodeAt(2),m=n.charCodeAt(3),_=this.length-4;0<=_;--_)if(this.data[_]===c&&this.data[_+1]===b&&this.data[_+2]===w&&this.data[_+3]===m)return _-this.zero;return-1},l.prototype.readAndCheckSignature=function(n){var c=n.charCodeAt(0),b=n.charCodeAt(1),w=n.charCodeAt(2),m=n.charCodeAt(3),_=this.readData(4);return c===_[0]&&b===_[1]&&w===_[2]&&m===_[3]},l.prototype.readData=function(n){if(this.checkOffset(n),n===0)return[];var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},R.exports=l},{"../utils":32,"./DataReader":18}],18:[function(p,R,x){var u=p("../utils");function l(n){this.data=n,this.length=n.length,this.index=0,this.zero=0}l.prototype={checkOffset:function(n){this.checkIndex(this.index+n)},checkIndex:function(n){if(this.length<this.zero+n||n<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+n+"). Corrupted zip ?")},setIndex:function(n){this.checkIndex(n),this.index=n},skip:function(n){this.setIndex(this.index+n)},byteAt:function(){},readInt:function(n){var c,b=0;for(this.checkOffset(n),c=this.index+n-1;c>=this.index;c--)b=(b<<8)+this.byteAt(c);return this.index+=n,b},readString:function(n){return u.transformTo("string",this.readData(n))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var n=this.readInt(4);return new Date(Date.UTC(1980+(n>>25&127),(n>>21&15)-1,n>>16&31,n>>11&31,n>>5&63,(31&n)<<1))}},R.exports=l},{"../utils":32}],19:[function(p,R,x){var u=p("./Uint8ArrayReader");function l(n){u.call(this,n)}p("../utils").inherits(l,u),l.prototype.readData=function(n){this.checkOffset(n);var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},R.exports=l},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(p,R,x){var u=p("./DataReader");function l(n){u.call(this,n)}p("../utils").inherits(l,u),l.prototype.byteAt=function(n){return this.data.charCodeAt(this.zero+n)},l.prototype.lastIndexOfSignature=function(n){return this.data.lastIndexOf(n)-this.zero},l.prototype.readAndCheckSignature=function(n){return n===this.readData(4)},l.prototype.readData=function(n){this.checkOffset(n);var c=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},R.exports=l},{"../utils":32,"./DataReader":18}],21:[function(p,R,x){var u=p("./ArrayReader");function l(n){u.call(this,n)}p("../utils").inherits(l,u),l.prototype.readData=function(n){if(this.checkOffset(n),n===0)return new Uint8Array(0);var c=this.data.subarray(this.zero+this.index,this.zero+this.index+n);return this.index+=n,c},R.exports=l},{"../utils":32,"./ArrayReader":17}],22:[function(p,R,x){var u=p("../utils"),l=p("../support"),n=p("./ArrayReader"),c=p("./StringReader"),b=p("./NodeBufferReader"),w=p("./Uint8ArrayReader");R.exports=function(m){var _=u.getTypeOf(m);return u.checkSupport(_),_!=="string"||l.uint8array?_==="nodebuffer"?new b(m):l.uint8array?new w(u.transformTo("uint8array",m)):new n(u.transformTo("array",m)):new c(m)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(p,R,x){x.LOCAL_FILE_HEADER="PK",x.CENTRAL_FILE_HEADER="PK",x.CENTRAL_DIRECTORY_END="PK",x.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",x.ZIP64_CENTRAL_DIRECTORY_END="PK",x.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(p,R,x){var u=p("./GenericWorker"),l=p("../utils");function n(c){u.call(this,"ConvertWorker to "+c),this.destType=c}l.inherits(n,u),n.prototype.processChunk=function(c){this.push({data:l.transformTo(this.destType,c.data),meta:c.meta})},R.exports=n},{"../utils":32,"./GenericWorker":28}],25:[function(p,R,x){var u=p("./GenericWorker"),l=p("../crc32");function n(){u.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}p("../utils").inherits(n,u),n.prototype.processChunk=function(c){this.streamInfo.crc32=l(c.data,this.streamInfo.crc32||0),this.push(c)},R.exports=n},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(p,R,x){var u=p("../utils"),l=p("./GenericWorker");function n(c){l.call(this,"DataLengthProbe for "+c),this.propName=c,this.withStreamInfo(c,0)}u.inherits(n,l),n.prototype.processChunk=function(c){if(c){var b=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=b+c.data.length}l.prototype.processChunk.call(this,c)},R.exports=n},{"../utils":32,"./GenericWorker":28}],27:[function(p,R,x){var u=p("../utils"),l=p("./GenericWorker");function n(c){l.call(this,"DataWorker");var b=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,c.then(function(w){b.dataIsReady=!0,b.data=w,b.max=w&&w.length||0,b.type=u.getTypeOf(w),b.isPaused||b._tickAndRepeat()},function(w){b.error(w)})}u.inherits(n,l),n.prototype.cleanUp=function(){l.prototype.cleanUp.call(this),this.data=null},n.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,u.delay(this._tickAndRepeat,[],this)),!0)},n.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(u.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},n.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var c=null,b=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":c=this.data.substring(this.index,b);break;case"uint8array":c=this.data.subarray(this.index,b);break;case"array":case"nodebuffer":c=this.data.slice(this.index,b)}return this.index=b,this.push({data:c,meta:{percent:this.max?this.index/this.max*100:0}})},R.exports=n},{"../utils":32,"./GenericWorker":28}],28:[function(p,R,x){function u(l){this.name=l||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}u.prototype={push:function(l){this.emit("data",l)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(l){this.emit("error",l)}return!0},error:function(l){return!this.isFinished&&(this.isPaused?this.generatedError=l:(this.isFinished=!0,this.emit("error",l),this.previous&&this.previous.error(l),this.cleanUp()),!0)},on:function(l,n){return this._listeners[l].push(n),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(l,n){if(this._listeners[l])for(var c=0;c<this._listeners[l].length;c++)this._listeners[l][c].call(this,n)},pipe:function(l){return l.registerPrevious(this)},registerPrevious:function(l){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=l.streamInfo,this.mergeStreamInfo(),this.previous=l;var n=this;return l.on("data",function(c){n.processChunk(c)}),l.on("end",function(){n.end()}),l.on("error",function(c){n.error(c)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var l=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),l=!0),this.previous&&this.previous.resume(),!l},flush:function(){},processChunk:function(l){this.push(l)},withStreamInfo:function(l,n){return this.extraStreamInfo[l]=n,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var l in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,l)&&(this.streamInfo[l]=this.extraStreamInfo[l])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var l="Worker "+this.name;return this.previous?this.previous+" -> "+l:l}},R.exports=u},{}],29:[function(p,R,x){var u=p("../utils"),l=p("./ConvertWorker"),n=p("./GenericWorker"),c=p("../base64"),b=p("../support"),w=p("../external"),m=null;if(b.nodestream)try{m=p("../nodejs/NodejsStreamOutputAdapter")}catch{}function _(h,r){return new w.Promise(function(i,a){var f=[],v=h._internalType,k=h._outputType,N=h._mimeType;h.on("data",function(z,I){f.push(z),r&&r(I)}).on("error",function(z){f=[],a(z)}).on("end",function(){try{var z=function(I,B,A){switch(I){case"blob":return u.newBlob(u.transformTo("arraybuffer",B),A);case"base64":return c.encode(B);default:return u.transformTo(I,B)}}(k,function(I,B){var A,Z=0,K=null,g=0;for(A=0;A<B.length;A++)g+=B[A].length;switch(I){case"string":return B.join("");case"array":return Array.prototype.concat.apply([],B);case"uint8array":for(K=new Uint8Array(g),A=0;A<B.length;A++)K.set(B[A],Z),Z+=B[A].length;return K;case"nodebuffer":return Buffer.concat(B);default:throw new Error("concat : unsupported type '"+I+"'")}}(v,f),N);i(z)}catch(I){a(I)}f=[]}).resume()})}function s(h,r,i){var a=r;switch(r){case"blob":case"arraybuffer":a="uint8array";break;case"base64":a="string"}try{this._internalType=a,this._outputType=r,this._mimeType=i,u.checkSupport(a),this._worker=h.pipe(new l(a)),h.lock()}catch(f){this._worker=new n("error"),this._worker.error(f)}}s.prototype={accumulate:function(h){return _(this,h)},on:function(h,r){var i=this;return h==="data"?this._worker.on(h,function(a){r.call(i,a.data,a.meta)}):this._worker.on(h,function(){u.delay(r,arguments,i)}),this},resume:function(){return u.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(h){if(u.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new m(this,{objectMode:this._outputType!=="nodebuffer"},h)}},R.exports=s},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(p,R,x){if(x.base64=!0,x.array=!0,x.string=!0,x.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",x.nodebuffer=typeof Buffer<"u",x.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")x.blob=!1;else{var u=new ArrayBuffer(0);try{x.blob=new Blob([u],{type:"application/zip"}).size===0}catch{try{var l=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);l.append(u),x.blob=l.getBlob("application/zip").size===0}catch{x.blob=!1}}}try{x.nodestream=!!p("readable-stream").Readable}catch{x.nodestream=!1}},{"readable-stream":16}],31:[function(p,R,x){for(var u=p("./utils"),l=p("./support"),n=p("./nodejsUtils"),c=p("./stream/GenericWorker"),b=new Array(256),w=0;w<256;w++)b[w]=252<=w?6:248<=w?5:240<=w?4:224<=w?3:192<=w?2:1;b[254]=b[254]=1;function m(){c.call(this,"utf-8 decode"),this.leftOver=null}function _(){c.call(this,"utf-8 encode")}x.utf8encode=function(s){return l.nodebuffer?n.newBufferFrom(s,"utf-8"):function(h){var r,i,a,f,v,k=h.length,N=0;for(f=0;f<k;f++)(64512&(i=h.charCodeAt(f)))==55296&&f+1<k&&(64512&(a=h.charCodeAt(f+1)))==56320&&(i=65536+(i-55296<<10)+(a-56320),f++),N+=i<128?1:i<2048?2:i<65536?3:4;for(r=l.uint8array?new Uint8Array(N):new Array(N),f=v=0;v<N;f++)(64512&(i=h.charCodeAt(f)))==55296&&f+1<k&&(64512&(a=h.charCodeAt(f+1)))==56320&&(i=65536+(i-55296<<10)+(a-56320),f++),i<128?r[v++]=i:(i<2048?r[v++]=192|i>>>6:(i<65536?r[v++]=224|i>>>12:(r[v++]=240|i>>>18,r[v++]=128|i>>>12&63),r[v++]=128|i>>>6&63),r[v++]=128|63&i);return r}(s)},x.utf8decode=function(s){return l.nodebuffer?u.transformTo("nodebuffer",s).toString("utf-8"):function(h){var r,i,a,f,v=h.length,k=new Array(2*v);for(r=i=0;r<v;)if((a=h[r++])<128)k[i++]=a;else if(4<(f=b[a]))k[i++]=65533,r+=f-1;else{for(a&=f===2?31:f===3?15:7;1<f&&r<v;)a=a<<6|63&h[r++],f--;1<f?k[i++]=65533:a<65536?k[i++]=a:(a-=65536,k[i++]=55296|a>>10&1023,k[i++]=56320|1023&a)}return k.length!==i&&(k.subarray?k=k.subarray(0,i):k.length=i),u.applyFromCharCode(k)}(s=u.transformTo(l.uint8array?"uint8array":"array",s))},u.inherits(m,c),m.prototype.processChunk=function(s){var h=u.transformTo(l.uint8array?"uint8array":"array",s.data);if(this.leftOver&&this.leftOver.length){if(l.uint8array){var r=h;(h=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),h.set(r,this.leftOver.length)}else h=this.leftOver.concat(h);this.leftOver=null}var i=function(f,v){var k;for((v=v||f.length)>f.length&&(v=f.length),k=v-1;0<=k&&(192&f[k])==128;)k--;return k<0||k===0?v:k+b[f[k]]>v?k:v}(h),a=h;i!==h.length&&(l.uint8array?(a=h.subarray(0,i),this.leftOver=h.subarray(i,h.length)):(a=h.slice(0,i),this.leftOver=h.slice(i,h.length))),this.push({data:x.utf8decode(a),meta:s.meta})},m.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:x.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},x.Utf8DecodeWorker=m,u.inherits(_,c),_.prototype.processChunk=function(s){this.push({data:x.utf8encode(s.data),meta:s.meta})},x.Utf8EncodeWorker=_},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(p,R,x){var u=p("./support"),l=p("./base64"),n=p("./nodejsUtils"),c=p("./external");function b(r){return r}function w(r,i){for(var a=0;a<r.length;++a)i[a]=255&r.charCodeAt(a);return i}p("setimmediate"),x.newBlob=function(r,i){x.checkSupport("blob");try{return new Blob([r],{type:i})}catch{try{var a=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return a.append(r),a.getBlob(i)}catch{throw new Error("Bug : can't construct the Blob.")}}};var m={stringifyByChunk:function(r,i,a){var f=[],v=0,k=r.length;if(k<=a)return String.fromCharCode.apply(null,r);for(;v<k;)i==="array"||i==="nodebuffer"?f.push(String.fromCharCode.apply(null,r.slice(v,Math.min(v+a,k)))):f.push(String.fromCharCode.apply(null,r.subarray(v,Math.min(v+a,k)))),v+=a;return f.join("")},stringifyByChar:function(r){for(var i="",a=0;a<r.length;a++)i+=String.fromCharCode(r[a]);return i},applyCanBeUsed:{uint8array:function(){try{return u.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return u.nodebuffer&&String.fromCharCode.apply(null,n.allocBuffer(1)).length===1}catch{return!1}}()}};function _(r){var i=65536,a=x.getTypeOf(r),f=!0;if(a==="uint8array"?f=m.applyCanBeUsed.uint8array:a==="nodebuffer"&&(f=m.applyCanBeUsed.nodebuffer),f)for(;1<i;)try{return m.stringifyByChunk(r,a,i)}catch{i=Math.floor(i/2)}return m.stringifyByChar(r)}function s(r,i){for(var a=0;a<r.length;a++)i[a]=r[a];return i}x.applyFromCharCode=_;var h={};h.string={string:b,array:function(r){return w(r,new Array(r.length))},arraybuffer:function(r){return h.string.uint8array(r).buffer},uint8array:function(r){return w(r,new Uint8Array(r.length))},nodebuffer:function(r){return w(r,n.allocBuffer(r.length))}},h.array={string:_,array:b,arraybuffer:function(r){return new Uint8Array(r).buffer},uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(r)}},h.arraybuffer={string:function(r){return _(new Uint8Array(r))},array:function(r){return s(new Uint8Array(r),new Array(r.byteLength))},arraybuffer:b,uint8array:function(r){return new Uint8Array(r)},nodebuffer:function(r){return n.newBufferFrom(new Uint8Array(r))}},h.uint8array={string:_,array:function(r){return s(r,new Array(r.length))},arraybuffer:function(r){return r.buffer},uint8array:b,nodebuffer:function(r){return n.newBufferFrom(r)}},h.nodebuffer={string:_,array:function(r){return s(r,new Array(r.length))},arraybuffer:function(r){return h.nodebuffer.uint8array(r).buffer},uint8array:function(r){return s(r,new Uint8Array(r.length))},nodebuffer:b},x.transformTo=function(r,i){if(i=i||"",!r)return i;x.checkSupport(r);var a=x.getTypeOf(i);return h[a][r](i)},x.resolve=function(r){for(var i=r.split("/"),a=[],f=0;f<i.length;f++){var v=i[f];v==="."||v===""&&f!==0&&f!==i.length-1||(v===".."?a.pop():a.push(v))}return a.join("/")},x.getTypeOf=function(r){return typeof r=="string"?"string":Object.prototype.toString.call(r)==="[object Array]"?"array":u.nodebuffer&&n.isBuffer(r)?"nodebuffer":u.uint8array&&r instanceof Uint8Array?"uint8array":u.arraybuffer&&r instanceof ArrayBuffer?"arraybuffer":void 0},x.checkSupport=function(r){if(!u[r.toLowerCase()])throw new Error(r+" is not supported by this platform")},x.MAX_VALUE_16BITS=65535,x.MAX_VALUE_32BITS=-1,x.pretty=function(r){var i,a,f="";for(a=0;a<(r||"").length;a++)f+="\\x"+((i=r.charCodeAt(a))<16?"0":"")+i.toString(16).toUpperCase();return f},x.delay=function(r,i,a){setImmediate(function(){r.apply(a||null,i||[])})},x.inherits=function(r,i){function a(){}a.prototype=i.prototype,r.prototype=new a},x.extend=function(){var r,i,a={};for(r=0;r<arguments.length;r++)for(i in arguments[r])Object.prototype.hasOwnProperty.call(arguments[r],i)&&a[i]===void 0&&(a[i]=arguments[r][i]);return a},x.prepareContent=function(r,i,a,f,v){return c.Promise.resolve(i).then(function(k){return u.blob&&(k instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(k))!==-1)&&typeof FileReader<"u"?new c.Promise(function(N,z){var I=new FileReader;I.onload=function(B){N(B.target.result)},I.onerror=function(B){z(B.target.error)},I.readAsArrayBuffer(k)}):k}).then(function(k){var N=x.getTypeOf(k);return N?(N==="arraybuffer"?k=x.transformTo("uint8array",k):N==="string"&&(v?k=l.decode(k):a&&f!==!0&&(k=function(z){return w(z,u.uint8array?new Uint8Array(z.length):new Array(z.length))}(k))),k):c.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(p,R,x){var u=p("./reader/readerFor"),l=p("./utils"),n=p("./signature"),c=p("./zipEntry"),b=p("./support");function w(m){this.files=[],this.loadOptions=m}w.prototype={checkSignature:function(m){if(!this.reader.readAndCheckSignature(m)){this.reader.index-=4;var _=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+l.pretty(_)+", expected "+l.pretty(m)+")")}},isSignature:function(m,_){var s=this.reader.index;this.reader.setIndex(m);var h=this.reader.readString(4)===_;return this.reader.setIndex(s),h},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var m=this.reader.readData(this.zipCommentLength),_=b.uint8array?"uint8array":"array",s=l.transformTo(_,m);this.zipComment=this.loadOptions.decodeFileName(s)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var m,_,s,h=this.zip64EndOfCentralSize-44;0<h;)m=this.reader.readInt(2),_=this.reader.readInt(4),s=this.reader.readData(_),this.zip64ExtensibleData[m]={id:m,length:_,value:s}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var m,_;for(m=0;m<this.files.length;m++)_=this.files[m],this.reader.setIndex(_.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),_.readLocalPart(this.reader),_.handleUTF8(),_.processAttributes()},readCentralDir:function(){var m;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(n.CENTRAL_FILE_HEADER);)(m=new c({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(m);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var m=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(m<0)throw this.isSignature(0,n.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(m);var _=m;if(this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===l.MAX_VALUE_16BITS||this.diskWithCentralDirStart===l.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===l.MAX_VALUE_16BITS||this.centralDirRecords===l.MAX_VALUE_16BITS||this.centralDirSize===l.MAX_VALUE_32BITS||this.centralDirOffset===l.MAX_VALUE_32BITS){if(this.zip64=!0,(m=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(m),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,n.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var s=this.centralDirOffset+this.centralDirSize;this.zip64&&(s+=20,s+=12+this.zip64EndOfCentralSize);var h=_-s;if(0<h)this.isSignature(_,n.CENTRAL_FILE_HEADER)||(this.reader.zero=h);else if(h<0)throw new Error("Corrupted zip: missing "+Math.abs(h)+" bytes.")},prepareReader:function(m){this.reader=u(m)},load:function(m){this.prepareReader(m),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},R.exports=w},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(p,R,x){var u=p("./reader/readerFor"),l=p("./utils"),n=p("./compressedObject"),c=p("./crc32"),b=p("./utf8"),w=p("./compressions"),m=p("./support");function _(s,h){this.options=s,this.loadOptions=h}_.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(s){var h,r;if(s.skip(22),this.fileNameLength=s.readInt(2),r=s.readInt(2),this.fileName=s.readData(this.fileNameLength),s.skip(r),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((h=function(i){for(var a in w)if(Object.prototype.hasOwnProperty.call(w,a)&&w[a].magic===i)return w[a];return null}(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+l.pretty(this.compressionMethod)+" unknown (inner file : "+l.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,h,s.readData(this.compressedSize))},readCentralPart:function(s){this.versionMadeBy=s.readInt(2),s.skip(2),this.bitFlag=s.readInt(2),this.compressionMethod=s.readString(2),this.date=s.readDate(),this.crc32=s.readInt(4),this.compressedSize=s.readInt(4),this.uncompressedSize=s.readInt(4);var h=s.readInt(2);if(this.extraFieldsLength=s.readInt(2),this.fileCommentLength=s.readInt(2),this.diskNumberStart=s.readInt(2),this.internalFileAttributes=s.readInt(2),this.externalFileAttributes=s.readInt(4),this.localHeaderOffset=s.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");s.skip(h),this.readExtraFields(s),this.parseZIP64ExtraField(s),this.fileComment=s.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var s=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),s==0&&(this.dosPermissions=63&this.externalFileAttributes),s==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var s=u(this.extraFields[1].value);this.uncompressedSize===l.MAX_VALUE_32BITS&&(this.uncompressedSize=s.readInt(8)),this.compressedSize===l.MAX_VALUE_32BITS&&(this.compressedSize=s.readInt(8)),this.localHeaderOffset===l.MAX_VALUE_32BITS&&(this.localHeaderOffset=s.readInt(8)),this.diskNumberStart===l.MAX_VALUE_32BITS&&(this.diskNumberStart=s.readInt(4))}},readExtraFields:function(s){var h,r,i,a=s.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});s.index+4<a;)h=s.readInt(2),r=s.readInt(2),i=s.readData(r),this.extraFields[h]={id:h,length:r,value:i};s.setIndex(a)},handleUTF8:function(){var s=m.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=b.utf8decode(this.fileName),this.fileCommentStr=b.utf8decode(this.fileComment);else{var h=this.findExtraFieldUnicodePath();if(h!==null)this.fileNameStr=h;else{var r=l.transformTo(s,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var i=this.findExtraFieldUnicodeComment();if(i!==null)this.fileCommentStr=i;else{var a=l.transformTo(s,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(a)}}},findExtraFieldUnicodePath:function(){var s=this.extraFields[28789];if(s){var h=u(s.value);return h.readInt(1)!==1||c(this.fileName)!==h.readInt(4)?null:b.utf8decode(h.readData(s.length-5))}return null},findExtraFieldUnicodeComment:function(){var s=this.extraFields[25461];if(s){var h=u(s.value);return h.readInt(1)!==1||c(this.fileComment)!==h.readInt(4)?null:b.utf8decode(h.readData(s.length-5))}return null}},R.exports=_},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(p,R,x){function u(h,r,i){this.name=h,this.dir=i.dir,this.date=i.date,this.comment=i.comment,this.unixPermissions=i.unixPermissions,this.dosPermissions=i.dosPermissions,this._data=r,this._dataBinary=i.binary,this.options={compression:i.compression,compressionOptions:i.compressionOptions}}var l=p("./stream/StreamHelper"),n=p("./stream/DataWorker"),c=p("./utf8"),b=p("./compressedObject"),w=p("./stream/GenericWorker");u.prototype={internalStream:function(h){var r=null,i="string";try{if(!h)throw new Error("No output type specified.");var a=(i=h.toLowerCase())==="string"||i==="text";i!=="binarystring"&&i!=="text"||(i="string"),r=this._decompressWorker();var f=!this._dataBinary;f&&!a&&(r=r.pipe(new c.Utf8EncodeWorker)),!f&&a&&(r=r.pipe(new c.Utf8DecodeWorker))}catch(v){(r=new w("error")).error(v)}return new l(r,i,"")},async:function(h,r){return this.internalStream(h).accumulate(r)},nodeStream:function(h,r){return this.internalStream(h||"nodebuffer").toNodejsStream(r)},_compressWorker:function(h,r){if(this._data instanceof b&&this._data.compression.magic===h.magic)return this._data.getCompressedWorker();var i=this._decompressWorker();return this._dataBinary||(i=i.pipe(new c.Utf8EncodeWorker)),b.createWorkerFrom(i,h,r)},_decompressWorker:function(){return this._data instanceof b?this._data.getContentWorker():this._data instanceof w?this._data:new n(this._data)}};for(var m=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],_=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},s=0;s<m.length;s++)u.prototype[m[s]]=_;R.exports=u},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(p,R,x){(function(u){var l,n,c=u.MutationObserver||u.WebKitMutationObserver;if(c){var b=0,w=new c(h),m=u.document.createTextNode("");w.observe(m,{characterData:!0}),l=function(){m.data=b=++b%2}}else if(u.setImmediate||u.MessageChannel===void 0)l="document"in u&&"onreadystatechange"in u.document.createElement("script")?function(){var r=u.document.createElement("script");r.onreadystatechange=function(){h(),r.onreadystatechange=null,r.parentNode.removeChild(r),r=null},u.document.documentElement.appendChild(r)}:function(){setTimeout(h,0)};else{var _=new u.MessageChannel;_.port1.onmessage=h,l=function(){_.port2.postMessage(0)}}var s=[];function h(){var r,i;n=!0;for(var a=s.length;a;){for(i=s,s=[],r=-1;++r<a;)i[r]();a=s.length}n=!1}R.exports=function(r){s.push(r)!==1||n||l()}}).call(this,typeof ke<"u"?ke:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(p,R,x){var u=p("immediate");function l(){}var n={},c=["REJECTED"],b=["FULFILLED"],w=["PENDING"];function m(a){if(typeof a!="function")throw new TypeError("resolver must be a function");this.state=w,this.queue=[],this.outcome=void 0,a!==l&&r(this,a)}function _(a,f,v){this.promise=a,typeof f=="function"&&(this.onFulfilled=f,this.callFulfilled=this.otherCallFulfilled),typeof v=="function"&&(this.onRejected=v,this.callRejected=this.otherCallRejected)}function s(a,f,v){u(function(){var k;try{k=f(v)}catch(N){return n.reject(a,N)}k===a?n.reject(a,new TypeError("Cannot resolve promise with itself")):n.resolve(a,k)})}function h(a){var f=a&&a.then;if(a&&(typeof a=="object"||typeof a=="function")&&typeof f=="function")return function(){f.apply(a,arguments)}}function r(a,f){var v=!1;function k(I){v||(v=!0,n.reject(a,I))}function N(I){v||(v=!0,n.resolve(a,I))}var z=i(function(){f(N,k)});z.status==="error"&&k(z.value)}function i(a,f){var v={};try{v.value=a(f),v.status="success"}catch(k){v.status="error",v.value=k}return v}(R.exports=m).prototype.finally=function(a){if(typeof a!="function")return this;var f=this.constructor;return this.then(function(v){return f.resolve(a()).then(function(){return v})},function(v){return f.resolve(a()).then(function(){throw v})})},m.prototype.catch=function(a){return this.then(null,a)},m.prototype.then=function(a,f){if(typeof a!="function"&&this.state===b||typeof f!="function"&&this.state===c)return this;var v=new this.constructor(l);return this.state!==w?s(v,this.state===b?a:f,this.outcome):this.queue.push(new _(v,a,f)),v},_.prototype.callFulfilled=function(a){n.resolve(this.promise,a)},_.prototype.otherCallFulfilled=function(a){s(this.promise,this.onFulfilled,a)},_.prototype.callRejected=function(a){n.reject(this.promise,a)},_.prototype.otherCallRejected=function(a){s(this.promise,this.onRejected,a)},n.resolve=function(a,f){var v=i(h,f);if(v.status==="error")return n.reject(a,v.value);var k=v.value;if(k)r(a,k);else{a.state=b,a.outcome=f;for(var N=-1,z=a.queue.length;++N<z;)a.queue[N].callFulfilled(f)}return a},n.reject=function(a,f){a.state=c,a.outcome=f;for(var v=-1,k=a.queue.length;++v<k;)a.queue[v].callRejected(f);return a},m.resolve=function(a){return a instanceof this?a:n.resolve(new this(l),a)},m.reject=function(a){var f=new this(l);return n.reject(f,a)},m.all=function(a){var f=this;if(Object.prototype.toString.call(a)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=a.length,k=!1;if(!v)return this.resolve([]);for(var N=new Array(v),z=0,I=-1,B=new this(l);++I<v;)A(a[I],I);return B;function A(Z,K){f.resolve(Z).then(function(g){N[K]=g,++z!==v||k||(k=!0,n.resolve(B,N))},function(g){k||(k=!0,n.reject(B,g))})}},m.race=function(a){var f=this;if(Object.prototype.toString.call(a)!=="[object Array]")return this.reject(new TypeError("must be an array"));var v=a.length,k=!1;if(!v)return this.resolve([]);for(var N=-1,z=new this(l);++N<v;)I=a[N],f.resolve(I).then(function(B){k||(k=!0,n.resolve(z,B))},function(B){k||(k=!0,n.reject(z,B))});var I;return z}},{immediate:36}],38:[function(p,R,x){var u={};(0,p("./lib/utils/common").assign)(u,p("./lib/deflate"),p("./lib/inflate"),p("./lib/zlib/constants")),R.exports=u},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(p,R,x){var u=p("./zlib/deflate"),l=p("./utils/common"),n=p("./utils/strings"),c=p("./zlib/messages"),b=p("./zlib/zstream"),w=Object.prototype.toString,m=0,_=-1,s=0,h=8;function r(a){if(!(this instanceof r))return new r(a);this.options=l.assign({level:_,method:h,chunkSize:16384,windowBits:15,memLevel:8,strategy:s,to:""},a||{});var f=this.options;f.raw&&0<f.windowBits?f.windowBits=-f.windowBits:f.gzip&&0<f.windowBits&&f.windowBits<16&&(f.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new b,this.strm.avail_out=0;var v=u.deflateInit2(this.strm,f.level,f.method,f.windowBits,f.memLevel,f.strategy);if(v!==m)throw new Error(c[v]);if(f.header&&u.deflateSetHeader(this.strm,f.header),f.dictionary){var k;if(k=typeof f.dictionary=="string"?n.string2buf(f.dictionary):w.call(f.dictionary)==="[object ArrayBuffer]"?new Uint8Array(f.dictionary):f.dictionary,(v=u.deflateSetDictionary(this.strm,k))!==m)throw new Error(c[v]);this._dict_set=!0}}function i(a,f){var v=new r(f);if(v.push(a,!0),v.err)throw v.msg||c[v.err];return v.result}r.prototype.push=function(a,f){var v,k,N=this.strm,z=this.options.chunkSize;if(this.ended)return!1;k=f===~~f?f:f===!0?4:0,typeof a=="string"?N.input=n.string2buf(a):w.call(a)==="[object ArrayBuffer]"?N.input=new Uint8Array(a):N.input=a,N.next_in=0,N.avail_in=N.input.length;do{if(N.avail_out===0&&(N.output=new l.Buf8(z),N.next_out=0,N.avail_out=z),(v=u.deflate(N,k))!==1&&v!==m)return this.onEnd(v),!(this.ended=!0);N.avail_out!==0&&(N.avail_in!==0||k!==4&&k!==2)||(this.options.to==="string"?this.onData(n.buf2binstring(l.shrinkBuf(N.output,N.next_out))):this.onData(l.shrinkBuf(N.output,N.next_out)))}while((0<N.avail_in||N.avail_out===0)&&v!==1);return k===4?(v=u.deflateEnd(this.strm),this.onEnd(v),this.ended=!0,v===m):k!==2||(this.onEnd(m),!(N.avail_out=0))},r.prototype.onData=function(a){this.chunks.push(a)},r.prototype.onEnd=function(a){a===m&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},x.Deflate=r,x.deflate=i,x.deflateRaw=function(a,f){return(f=f||{}).raw=!0,i(a,f)},x.gzip=function(a,f){return(f=f||{}).gzip=!0,i(a,f)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(p,R,x){var u=p("./zlib/inflate"),l=p("./utils/common"),n=p("./utils/strings"),c=p("./zlib/constants"),b=p("./zlib/messages"),w=p("./zlib/zstream"),m=p("./zlib/gzheader"),_=Object.prototype.toString;function s(r){if(!(this instanceof s))return new s(r);this.options=l.assign({chunkSize:16384,windowBits:0,to:""},r||{});var i=this.options;i.raw&&0<=i.windowBits&&i.windowBits<16&&(i.windowBits=-i.windowBits,i.windowBits===0&&(i.windowBits=-15)),!(0<=i.windowBits&&i.windowBits<16)||r&&r.windowBits||(i.windowBits+=32),15<i.windowBits&&i.windowBits<48&&!(15&i.windowBits)&&(i.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new w,this.strm.avail_out=0;var a=u.inflateInit2(this.strm,i.windowBits);if(a!==c.Z_OK)throw new Error(b[a]);this.header=new m,u.inflateGetHeader(this.strm,this.header)}function h(r,i){var a=new s(i);if(a.push(r,!0),a.err)throw a.msg||b[a.err];return a.result}s.prototype.push=function(r,i){var a,f,v,k,N,z,I=this.strm,B=this.options.chunkSize,A=this.options.dictionary,Z=!1;if(this.ended)return!1;f=i===~~i?i:i===!0?c.Z_FINISH:c.Z_NO_FLUSH,typeof r=="string"?I.input=n.binstring2buf(r):_.call(r)==="[object ArrayBuffer]"?I.input=new Uint8Array(r):I.input=r,I.next_in=0,I.avail_in=I.input.length;do{if(I.avail_out===0&&(I.output=new l.Buf8(B),I.next_out=0,I.avail_out=B),(a=u.inflate(I,c.Z_NO_FLUSH))===c.Z_NEED_DICT&&A&&(z=typeof A=="string"?n.string2buf(A):_.call(A)==="[object ArrayBuffer]"?new Uint8Array(A):A,a=u.inflateSetDictionary(this.strm,z)),a===c.Z_BUF_ERROR&&Z===!0&&(a=c.Z_OK,Z=!1),a!==c.Z_STREAM_END&&a!==c.Z_OK)return this.onEnd(a),!(this.ended=!0);I.next_out&&(I.avail_out!==0&&a!==c.Z_STREAM_END&&(I.avail_in!==0||f!==c.Z_FINISH&&f!==c.Z_SYNC_FLUSH)||(this.options.to==="string"?(v=n.utf8border(I.output,I.next_out),k=I.next_out-v,N=n.buf2string(I.output,v),I.next_out=k,I.avail_out=B-k,k&&l.arraySet(I.output,I.output,v,k,0),this.onData(N)):this.onData(l.shrinkBuf(I.output,I.next_out)))),I.avail_in===0&&I.avail_out===0&&(Z=!0)}while((0<I.avail_in||I.avail_out===0)&&a!==c.Z_STREAM_END);return a===c.Z_STREAM_END&&(f=c.Z_FINISH),f===c.Z_FINISH?(a=u.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===c.Z_OK):f!==c.Z_SYNC_FLUSH||(this.onEnd(c.Z_OK),!(I.avail_out=0))},s.prototype.onData=function(r){this.chunks.push(r)},s.prototype.onEnd=function(r){r===c.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=r,this.msg=this.strm.msg},x.Inflate=s,x.inflate=h,x.inflateRaw=function(r,i){return(i=i||{}).raw=!0,h(r,i)},x.ungzip=h},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(p,R,x){var u=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";x.assign=function(c){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var w=b.shift();if(w){if(typeof w!="object")throw new TypeError(w+"must be non-object");for(var m in w)w.hasOwnProperty(m)&&(c[m]=w[m])}}return c},x.shrinkBuf=function(c,b){return c.length===b?c:c.subarray?c.subarray(0,b):(c.length=b,c)};var l={arraySet:function(c,b,w,m,_){if(b.subarray&&c.subarray)c.set(b.subarray(w,w+m),_);else for(var s=0;s<m;s++)c[_+s]=b[w+s]},flattenChunks:function(c){var b,w,m,_,s,h;for(b=m=0,w=c.length;b<w;b++)m+=c[b].length;for(h=new Uint8Array(m),b=_=0,w=c.length;b<w;b++)s=c[b],h.set(s,_),_+=s.length;return h}},n={arraySet:function(c,b,w,m,_){for(var s=0;s<m;s++)c[_+s]=b[w+s]},flattenChunks:function(c){return[].concat.apply([],c)}};x.setTyped=function(c){c?(x.Buf8=Uint8Array,x.Buf16=Uint16Array,x.Buf32=Int32Array,x.assign(x,l)):(x.Buf8=Array,x.Buf16=Array,x.Buf32=Array,x.assign(x,n))},x.setTyped(u)},{}],42:[function(p,R,x){var u=p("./common"),l=!0,n=!0;try{String.fromCharCode.apply(null,[0])}catch{l=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{n=!1}for(var c=new u.Buf8(256),b=0;b<256;b++)c[b]=252<=b?6:248<=b?5:240<=b?4:224<=b?3:192<=b?2:1;function w(m,_){if(_<65537&&(m.subarray&&n||!m.subarray&&l))return String.fromCharCode.apply(null,u.shrinkBuf(m,_));for(var s="",h=0;h<_;h++)s+=String.fromCharCode(m[h]);return s}c[254]=c[254]=1,x.string2buf=function(m){var _,s,h,r,i,a=m.length,f=0;for(r=0;r<a;r++)(64512&(s=m.charCodeAt(r)))==55296&&r+1<a&&(64512&(h=m.charCodeAt(r+1)))==56320&&(s=65536+(s-55296<<10)+(h-56320),r++),f+=s<128?1:s<2048?2:s<65536?3:4;for(_=new u.Buf8(f),r=i=0;i<f;r++)(64512&(s=m.charCodeAt(r)))==55296&&r+1<a&&(64512&(h=m.charCodeAt(r+1)))==56320&&(s=65536+(s-55296<<10)+(h-56320),r++),s<128?_[i++]=s:(s<2048?_[i++]=192|s>>>6:(s<65536?_[i++]=224|s>>>12:(_[i++]=240|s>>>18,_[i++]=128|s>>>12&63),_[i++]=128|s>>>6&63),_[i++]=128|63&s);return _},x.buf2binstring=function(m){return w(m,m.length)},x.binstring2buf=function(m){for(var _=new u.Buf8(m.length),s=0,h=_.length;s<h;s++)_[s]=m.charCodeAt(s);return _},x.buf2string=function(m,_){var s,h,r,i,a=_||m.length,f=new Array(2*a);for(s=h=0;s<a;)if((r=m[s++])<128)f[h++]=r;else if(4<(i=c[r]))f[h++]=65533,s+=i-1;else{for(r&=i===2?31:i===3?15:7;1<i&&s<a;)r=r<<6|63&m[s++],i--;1<i?f[h++]=65533:r<65536?f[h++]=r:(r-=65536,f[h++]=55296|r>>10&1023,f[h++]=56320|1023&r)}return w(f,h)},x.utf8border=function(m,_){var s;for((_=_||m.length)>m.length&&(_=m.length),s=_-1;0<=s&&(192&m[s])==128;)s--;return s<0||s===0?_:s+c[m[s]]>_?s:_}},{"./common":41}],43:[function(p,R,x){R.exports=function(u,l,n,c){for(var b=65535&u|0,w=u>>>16&65535|0,m=0;n!==0;){for(n-=m=2e3<n?2e3:n;w=w+(b=b+l[c++]|0)|0,--m;);b%=65521,w%=65521}return b|w<<16|0}},{}],44:[function(p,R,x){R.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(p,R,x){var u=function(){for(var l,n=[],c=0;c<256;c++){l=c;for(var b=0;b<8;b++)l=1&l?3988292384^l>>>1:l>>>1;n[c]=l}return n}();R.exports=function(l,n,c,b){var w=u,m=b+c;l^=-1;for(var _=b;_<m;_++)l=l>>>8^w[255&(l^n[_])];return-1^l}},{}],46:[function(p,R,x){var u,l=p("../utils/common"),n=p("./trees"),c=p("./adler32"),b=p("./crc32"),w=p("./messages"),m=0,_=4,s=0,h=-2,r=-1,i=4,a=2,f=8,v=9,k=286,N=30,z=19,I=2*k+1,B=15,A=3,Z=258,K=Z+A+1,g=42,C=113,t=1,O=2,$=3,U=4;function Q(e,P){return e.msg=w[P],P}function V(e){return(e<<1)-(4<e?9:0)}function J(e){for(var P=e.length;0<=--P;)e[P]=0}function T(e){var P=e.state,j=P.pending;j>e.avail_out&&(j=e.avail_out),j!==0&&(l.arraySet(e.output,P.pending_buf,P.pending_out,j,e.next_out),e.next_out+=j,P.pending_out+=j,e.total_out+=j,e.avail_out-=j,P.pending-=j,P.pending===0&&(P.pending_out=0))}function D(e,P){n._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,P),e.block_start=e.strstart,T(e.strm)}function Y(e,P){e.pending_buf[e.pending++]=P}function G(e,P){e.pending_buf[e.pending++]=P>>>8&255,e.pending_buf[e.pending++]=255&P}function H(e,P){var j,d,o=e.max_chain_length,y=e.strstart,L=e.prev_length,F=e.nice_match,E=e.strstart>e.w_size-K?e.strstart-(e.w_size-K):0,M=e.window,q=e.w_mask,W=e.prev,X=e.strstart+Z,ie=M[y+L-1],te=M[y+L];e.prev_length>=e.good_match&&(o>>=2),F>e.lookahead&&(F=e.lookahead);do if(M[(j=P)+L]===te&&M[j+L-1]===ie&&M[j]===M[y]&&M[++j]===M[y+1]){y+=2,j++;do;while(M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&M[++y]===M[++j]&&y<X);if(d=Z-(X-y),y=X-Z,L<d){if(e.match_start=P,F<=(L=d))break;ie=M[y+L-1],te=M[y+L]}}while((P=W[P&q])>E&&--o!=0);return L<=e.lookahead?L:e.lookahead}function ae(e){var P,j,d,o,y,L,F,E,M,q,W=e.w_size;do{if(o=e.window_size-e.lookahead-e.strstart,e.strstart>=W+(W-K)){for(l.arraySet(e.window,e.window,W,W,0),e.match_start-=W,e.strstart-=W,e.block_start-=W,P=j=e.hash_size;d=e.head[--P],e.head[P]=W<=d?d-W:0,--j;);for(P=j=W;d=e.prev[--P],e.prev[P]=W<=d?d-W:0,--j;);o+=W}if(e.strm.avail_in===0)break;if(L=e.strm,F=e.window,E=e.strstart+e.lookahead,M=o,q=void 0,q=L.avail_in,M<q&&(q=M),j=q===0?0:(L.avail_in-=q,l.arraySet(F,L.input,L.next_in,q,E),L.state.wrap===1?L.adler=c(L.adler,F,q,E):L.state.wrap===2&&(L.adler=b(L.adler,F,q,E)),L.next_in+=q,L.total_in+=q,q),e.lookahead+=j,e.lookahead+e.insert>=A)for(y=e.strstart-e.insert,e.ins_h=e.window[y],e.ins_h=(e.ins_h<<e.hash_shift^e.window[y+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[y+A-1])&e.hash_mask,e.prev[y&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=y,y++,e.insert--,!(e.lookahead+e.insert<A)););}while(e.lookahead<K&&e.strm.avail_in!==0)}function ue(e,P){for(var j,d;;){if(e.lookahead<K){if(ae(e),e.lookahead<K&&P===m)return t;if(e.lookahead===0)break}if(j=0,e.lookahead>=A&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+A-1])&e.hash_mask,j=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),j!==0&&e.strstart-j<=e.w_size-K&&(e.match_length=H(e,j)),e.match_length>=A)if(d=n._tr_tally(e,e.strstart-e.match_start,e.match_length-A),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=A){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+A-1])&e.hash_mask,j=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,--e.match_length!=0;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else d=n._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(d&&(D(e,!1),e.strm.avail_out===0))return t}return e.insert=e.strstart<A-1?e.strstart:A-1,P===_?(D(e,!0),e.strm.avail_out===0?$:U):e.last_lit&&(D(e,!1),e.strm.avail_out===0)?t:O}function ee(e,P){for(var j,d,o;;){if(e.lookahead<K){if(ae(e),e.lookahead<K&&P===m)return t;if(e.lookahead===0)break}if(j=0,e.lookahead>=A&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+A-1])&e.hash_mask,j=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=A-1,j!==0&&e.prev_length<e.max_lazy_match&&e.strstart-j<=e.w_size-K&&(e.match_length=H(e,j),e.match_length<=5&&(e.strategy===1||e.match_length===A&&4096<e.strstart-e.match_start)&&(e.match_length=A-1)),e.prev_length>=A&&e.match_length<=e.prev_length){for(o=e.strstart+e.lookahead-A,d=n._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-A),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=o&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+A-1])&e.hash_mask,j=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),--e.prev_length!=0;);if(e.match_available=0,e.match_length=A-1,e.strstart++,d&&(D(e,!1),e.strm.avail_out===0))return t}else if(e.match_available){if((d=n._tr_tally(e,0,e.window[e.strstart-1]))&&D(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return t}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(d=n._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<A-1?e.strstart:A-1,P===_?(D(e,!0),e.strm.avail_out===0?$:U):e.last_lit&&(D(e,!1),e.strm.avail_out===0)?t:O}function se(e,P,j,d,o){this.good_length=e,this.max_lazy=P,this.nice_length=j,this.max_chain=d,this.func=o}function ce(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=f,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new l.Buf16(2*I),this.dyn_dtree=new l.Buf16(2*(2*N+1)),this.bl_tree=new l.Buf16(2*(2*z+1)),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new l.Buf16(B+1),this.heap=new l.Buf16(2*k+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new l.Buf16(2*k+1),J(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function oe(e){var P;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=a,(P=e.state).pending=0,P.pending_out=0,P.wrap<0&&(P.wrap=-P.wrap),P.status=P.wrap?g:C,e.adler=P.wrap===2?0:1,P.last_flush=m,n._tr_init(P),s):Q(e,h)}function fe(e){var P=oe(e);return P===s&&function(j){j.window_size=2*j.w_size,J(j.head),j.max_lazy_match=u[j.level].max_lazy,j.good_match=u[j.level].good_length,j.nice_match=u[j.level].nice_length,j.max_chain_length=u[j.level].max_chain,j.strstart=0,j.block_start=0,j.lookahead=0,j.insert=0,j.match_length=j.prev_length=A-1,j.match_available=0,j.ins_h=0}(e.state),P}function he(e,P,j,d,o,y){if(!e)return h;var L=1;if(P===r&&(P=6),d<0?(L=0,d=-d):15<d&&(L=2,d-=16),o<1||v<o||j!==f||d<8||15<d||P<0||9<P||y<0||i<y)return Q(e,h);d===8&&(d=9);var F=new ce;return(e.state=F).strm=e,F.wrap=L,F.gzhead=null,F.w_bits=d,F.w_size=1<<F.w_bits,F.w_mask=F.w_size-1,F.hash_bits=o+7,F.hash_size=1<<F.hash_bits,F.hash_mask=F.hash_size-1,F.hash_shift=~~((F.hash_bits+A-1)/A),F.window=new l.Buf8(2*F.w_size),F.head=new l.Buf16(F.hash_size),F.prev=new l.Buf16(F.w_size),F.lit_bufsize=1<<o+6,F.pending_buf_size=4*F.lit_bufsize,F.pending_buf=new l.Buf8(F.pending_buf_size),F.d_buf=1*F.lit_bufsize,F.l_buf=3*F.lit_bufsize,F.level=P,F.strategy=y,F.method=j,fe(e)}u=[new se(0,0,0,0,function(e,P){var j=65535;for(j>e.pending_buf_size-5&&(j=e.pending_buf_size-5);;){if(e.lookahead<=1){if(ae(e),e.lookahead===0&&P===m)return t;if(e.lookahead===0)break}e.strstart+=e.lookahead,e.lookahead=0;var d=e.block_start+j;if((e.strstart===0||e.strstart>=d)&&(e.lookahead=e.strstart-d,e.strstart=d,D(e,!1),e.strm.avail_out===0)||e.strstart-e.block_start>=e.w_size-K&&(D(e,!1),e.strm.avail_out===0))return t}return e.insert=0,P===_?(D(e,!0),e.strm.avail_out===0?$:U):(e.strstart>e.block_start&&(D(e,!1),e.strm.avail_out),t)}),new se(4,4,8,4,ue),new se(4,5,16,8,ue),new se(4,6,32,32,ue),new se(4,4,16,16,ee),new se(8,16,32,32,ee),new se(8,16,128,128,ee),new se(8,32,128,256,ee),new se(32,128,258,1024,ee),new se(32,258,258,4096,ee)],x.deflateInit=function(e,P){return he(e,P,f,15,8,0)},x.deflateInit2=he,x.deflateReset=fe,x.deflateResetKeep=oe,x.deflateSetHeader=function(e,P){return e&&e.state?e.state.wrap!==2?h:(e.state.gzhead=P,s):h},x.deflate=function(e,P){var j,d,o,y;if(!e||!e.state||5<P||P<0)return e?Q(e,h):h;if(d=e.state,!e.output||!e.input&&e.avail_in!==0||d.status===666&&P!==_)return Q(e,e.avail_out===0?-5:h);if(d.strm=e,j=d.last_flush,d.last_flush=P,d.status===g)if(d.wrap===2)e.adler=0,Y(d,31),Y(d,139),Y(d,8),d.gzhead?(Y(d,(d.gzhead.text?1:0)+(d.gzhead.hcrc?2:0)+(d.gzhead.extra?4:0)+(d.gzhead.name?8:0)+(d.gzhead.comment?16:0)),Y(d,255&d.gzhead.time),Y(d,d.gzhead.time>>8&255),Y(d,d.gzhead.time>>16&255),Y(d,d.gzhead.time>>24&255),Y(d,d.level===9?2:2<=d.strategy||d.level<2?4:0),Y(d,255&d.gzhead.os),d.gzhead.extra&&d.gzhead.extra.length&&(Y(d,255&d.gzhead.extra.length),Y(d,d.gzhead.extra.length>>8&255)),d.gzhead.hcrc&&(e.adler=b(e.adler,d.pending_buf,d.pending,0)),d.gzindex=0,d.status=69):(Y(d,0),Y(d,0),Y(d,0),Y(d,0),Y(d,0),Y(d,d.level===9?2:2<=d.strategy||d.level<2?4:0),Y(d,3),d.status=C);else{var L=f+(d.w_bits-8<<4)<<8;L|=(2<=d.strategy||d.level<2?0:d.level<6?1:d.level===6?2:3)<<6,d.strstart!==0&&(L|=32),L+=31-L%31,d.status=C,G(d,L),d.strstart!==0&&(G(d,e.adler>>>16),G(d,65535&e.adler)),e.adler=1}if(d.status===69)if(d.gzhead.extra){for(o=d.pending;d.gzindex<(65535&d.gzhead.extra.length)&&(d.pending!==d.pending_buf_size||(d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),T(e),o=d.pending,d.pending!==d.pending_buf_size));)Y(d,255&d.gzhead.extra[d.gzindex]),d.gzindex++;d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),d.gzindex===d.gzhead.extra.length&&(d.gzindex=0,d.status=73)}else d.status=73;if(d.status===73)if(d.gzhead.name){o=d.pending;do{if(d.pending===d.pending_buf_size&&(d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),T(e),o=d.pending,d.pending===d.pending_buf_size)){y=1;break}y=d.gzindex<d.gzhead.name.length?255&d.gzhead.name.charCodeAt(d.gzindex++):0,Y(d,y)}while(y!==0);d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),y===0&&(d.gzindex=0,d.status=91)}else d.status=91;if(d.status===91)if(d.gzhead.comment){o=d.pending;do{if(d.pending===d.pending_buf_size&&(d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),T(e),o=d.pending,d.pending===d.pending_buf_size)){y=1;break}y=d.gzindex<d.gzhead.comment.length?255&d.gzhead.comment.charCodeAt(d.gzindex++):0,Y(d,y)}while(y!==0);d.gzhead.hcrc&&d.pending>o&&(e.adler=b(e.adler,d.pending_buf,d.pending-o,o)),y===0&&(d.status=103)}else d.status=103;if(d.status===103&&(d.gzhead.hcrc?(d.pending+2>d.pending_buf_size&&T(e),d.pending+2<=d.pending_buf_size&&(Y(d,255&e.adler),Y(d,e.adler>>8&255),e.adler=0,d.status=C)):d.status=C),d.pending!==0){if(T(e),e.avail_out===0)return d.last_flush=-1,s}else if(e.avail_in===0&&V(P)<=V(j)&&P!==_)return Q(e,-5);if(d.status===666&&e.avail_in!==0)return Q(e,-5);if(e.avail_in!==0||d.lookahead!==0||P!==m&&d.status!==666){var F=d.strategy===2?function(E,M){for(var q;;){if(E.lookahead===0&&(ae(E),E.lookahead===0)){if(M===m)return t;break}if(E.match_length=0,q=n._tr_tally(E,0,E.window[E.strstart]),E.lookahead--,E.strstart++,q&&(D(E,!1),E.strm.avail_out===0))return t}return E.insert=0,M===_?(D(E,!0),E.strm.avail_out===0?$:U):E.last_lit&&(D(E,!1),E.strm.avail_out===0)?t:O}(d,P):d.strategy===3?function(E,M){for(var q,W,X,ie,te=E.window;;){if(E.lookahead<=Z){if(ae(E),E.lookahead<=Z&&M===m)return t;if(E.lookahead===0)break}if(E.match_length=0,E.lookahead>=A&&0<E.strstart&&(W=te[X=E.strstart-1])===te[++X]&&W===te[++X]&&W===te[++X]){ie=E.strstart+Z;do;while(W===te[++X]&&W===te[++X]&&W===te[++X]&&W===te[++X]&&W===te[++X]&&W===te[++X]&&W===te[++X]&&W===te[++X]&&X<ie);E.match_length=Z-(ie-X),E.match_length>E.lookahead&&(E.match_length=E.lookahead)}if(E.match_length>=A?(q=n._tr_tally(E,1,E.match_length-A),E.lookahead-=E.match_length,E.strstart+=E.match_length,E.match_length=0):(q=n._tr_tally(E,0,E.window[E.strstart]),E.lookahead--,E.strstart++),q&&(D(E,!1),E.strm.avail_out===0))return t}return E.insert=0,M===_?(D(E,!0),E.strm.avail_out===0?$:U):E.last_lit&&(D(E,!1),E.strm.avail_out===0)?t:O}(d,P):u[d.level].func(d,P);if(F!==$&&F!==U||(d.status=666),F===t||F===$)return e.avail_out===0&&(d.last_flush=-1),s;if(F===O&&(P===1?n._tr_align(d):P!==5&&(n._tr_stored_block(d,0,0,!1),P===3&&(J(d.head),d.lookahead===0&&(d.strstart=0,d.block_start=0,d.insert=0))),T(e),e.avail_out===0))return d.last_flush=-1,s}return P!==_?s:d.wrap<=0?1:(d.wrap===2?(Y(d,255&e.adler),Y(d,e.adler>>8&255),Y(d,e.adler>>16&255),Y(d,e.adler>>24&255),Y(d,255&e.total_in),Y(d,e.total_in>>8&255),Y(d,e.total_in>>16&255),Y(d,e.total_in>>24&255)):(G(d,e.adler>>>16),G(d,65535&e.adler)),T(e),0<d.wrap&&(d.wrap=-d.wrap),d.pending!==0?s:1)},x.deflateEnd=function(e){var P;return e&&e.state?(P=e.state.status)!==g&&P!==69&&P!==73&&P!==91&&P!==103&&P!==C&&P!==666?Q(e,h):(e.state=null,P===C?Q(e,-3):s):h},x.deflateSetDictionary=function(e,P){var j,d,o,y,L,F,E,M,q=P.length;if(!e||!e.state||(y=(j=e.state).wrap)===2||y===1&&j.status!==g||j.lookahead)return h;for(y===1&&(e.adler=c(e.adler,P,q,0)),j.wrap=0,q>=j.w_size&&(y===0&&(J(j.head),j.strstart=0,j.block_start=0,j.insert=0),M=new l.Buf8(j.w_size),l.arraySet(M,P,q-j.w_size,j.w_size,0),P=M,q=j.w_size),L=e.avail_in,F=e.next_in,E=e.input,e.avail_in=q,e.next_in=0,e.input=P,ae(j);j.lookahead>=A;){for(d=j.strstart,o=j.lookahead-(A-1);j.ins_h=(j.ins_h<<j.hash_shift^j.window[d+A-1])&j.hash_mask,j.prev[d&j.w_mask]=j.head[j.ins_h],j.head[j.ins_h]=d,d++,--o;);j.strstart=d,j.lookahead=A-1,ae(j)}return j.strstart+=j.lookahead,j.block_start=j.strstart,j.insert=j.lookahead,j.lookahead=0,j.match_length=j.prev_length=A-1,j.match_available=0,e.next_in=F,e.input=E,e.avail_in=L,j.wrap=y,s},x.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(p,R,x){R.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(p,R,x){R.exports=function(u,l){var n,c,b,w,m,_,s,h,r,i,a,f,v,k,N,z,I,B,A,Z,K,g,C,t,O;n=u.state,c=u.next_in,t=u.input,b=c+(u.avail_in-5),w=u.next_out,O=u.output,m=w-(l-u.avail_out),_=w+(u.avail_out-257),s=n.dmax,h=n.wsize,r=n.whave,i=n.wnext,a=n.window,f=n.hold,v=n.bits,k=n.lencode,N=n.distcode,z=(1<<n.lenbits)-1,I=(1<<n.distbits)-1;e:do{v<15&&(f+=t[c++]<<v,v+=8,f+=t[c++]<<v,v+=8),B=k[f&z];t:for(;;){if(f>>>=A=B>>>24,v-=A,(A=B>>>16&255)===0)O[w++]=65535&B;else{if(!(16&A)){if(!(64&A)){B=k[(65535&B)+(f&(1<<A)-1)];continue t}if(32&A){n.mode=12;break e}u.msg="invalid literal/length code",n.mode=30;break e}Z=65535&B,(A&=15)&&(v<A&&(f+=t[c++]<<v,v+=8),Z+=f&(1<<A)-1,f>>>=A,v-=A),v<15&&(f+=t[c++]<<v,v+=8,f+=t[c++]<<v,v+=8),B=N[f&I];r:for(;;){if(f>>>=A=B>>>24,v-=A,!(16&(A=B>>>16&255))){if(!(64&A)){B=N[(65535&B)+(f&(1<<A)-1)];continue r}u.msg="invalid distance code",n.mode=30;break e}if(K=65535&B,v<(A&=15)&&(f+=t[c++]<<v,(v+=8)<A&&(f+=t[c++]<<v,v+=8)),s<(K+=f&(1<<A)-1)){u.msg="invalid distance too far back",n.mode=30;break e}if(f>>>=A,v-=A,(A=w-m)<K){if(r<(A=K-A)&&n.sane){u.msg="invalid distance too far back",n.mode=30;break e}if(C=a,(g=0)===i){if(g+=h-A,A<Z){for(Z-=A;O[w++]=a[g++],--A;);g=w-K,C=O}}else if(i<A){if(g+=h+i-A,(A-=i)<Z){for(Z-=A;O[w++]=a[g++],--A;);if(g=0,i<Z){for(Z-=A=i;O[w++]=a[g++],--A;);g=w-K,C=O}}}else if(g+=i-A,A<Z){for(Z-=A;O[w++]=a[g++],--A;);g=w-K,C=O}for(;2<Z;)O[w++]=C[g++],O[w++]=C[g++],O[w++]=C[g++],Z-=3;Z&&(O[w++]=C[g++],1<Z&&(O[w++]=C[g++]))}else{for(g=w-K;O[w++]=O[g++],O[w++]=O[g++],O[w++]=O[g++],2<(Z-=3););Z&&(O[w++]=O[g++],1<Z&&(O[w++]=O[g++]))}break}}break}}while(c<b&&w<_);c-=Z=v>>3,f&=(1<<(v-=Z<<3))-1,u.next_in=c,u.next_out=w,u.avail_in=c<b?b-c+5:5-(c-b),u.avail_out=w<_?_-w+257:257-(w-_),n.hold=f,n.bits=v}},{}],49:[function(p,R,x){var u=p("../utils/common"),l=p("./adler32"),n=p("./crc32"),c=p("./inffast"),b=p("./inftrees"),w=1,m=2,_=0,s=-2,h=1,r=852,i=592;function a(g){return(g>>>24&255)+(g>>>8&65280)+((65280&g)<<8)+((255&g)<<24)}function f(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new u.Buf16(320),this.work=new u.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function v(g){var C;return g&&g.state?(C=g.state,g.total_in=g.total_out=C.total=0,g.msg="",C.wrap&&(g.adler=1&C.wrap),C.mode=h,C.last=0,C.havedict=0,C.dmax=32768,C.head=null,C.hold=0,C.bits=0,C.lencode=C.lendyn=new u.Buf32(r),C.distcode=C.distdyn=new u.Buf32(i),C.sane=1,C.back=-1,_):s}function k(g){var C;return g&&g.state?((C=g.state).wsize=0,C.whave=0,C.wnext=0,v(g)):s}function N(g,C){var t,O;return g&&g.state?(O=g.state,C<0?(t=0,C=-C):(t=1+(C>>4),C<48&&(C&=15)),C&&(C<8||15<C)?s:(O.window!==null&&O.wbits!==C&&(O.window=null),O.wrap=t,O.wbits=C,k(g))):s}function z(g,C){var t,O;return g?(O=new f,(g.state=O).window=null,(t=N(g,C))!==_&&(g.state=null),t):s}var I,B,A=!0;function Z(g){if(A){var C;for(I=new u.Buf32(512),B=new u.Buf32(32),C=0;C<144;)g.lens[C++]=8;for(;C<256;)g.lens[C++]=9;for(;C<280;)g.lens[C++]=7;for(;C<288;)g.lens[C++]=8;for(b(w,g.lens,0,288,I,0,g.work,{bits:9}),C=0;C<32;)g.lens[C++]=5;b(m,g.lens,0,32,B,0,g.work,{bits:5}),A=!1}g.lencode=I,g.lenbits=9,g.distcode=B,g.distbits=5}function K(g,C,t,O){var $,U=g.state;return U.window===null&&(U.wsize=1<<U.wbits,U.wnext=0,U.whave=0,U.window=new u.Buf8(U.wsize)),O>=U.wsize?(u.arraySet(U.window,C,t-U.wsize,U.wsize,0),U.wnext=0,U.whave=U.wsize):(O<($=U.wsize-U.wnext)&&($=O),u.arraySet(U.window,C,t-O,$,U.wnext),(O-=$)?(u.arraySet(U.window,C,t-O,O,0),U.wnext=O,U.whave=U.wsize):(U.wnext+=$,U.wnext===U.wsize&&(U.wnext=0),U.whave<U.wsize&&(U.whave+=$))),0}x.inflateReset=k,x.inflateReset2=N,x.inflateResetKeep=v,x.inflateInit=function(g){return z(g,15)},x.inflateInit2=z,x.inflate=function(g,C){var t,O,$,U,Q,V,J,T,D,Y,G,H,ae,ue,ee,se,ce,oe,fe,he,e,P,j,d,o=0,y=new u.Buf8(4),L=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!g||!g.state||!g.output||!g.input&&g.avail_in!==0)return s;(t=g.state).mode===12&&(t.mode=13),Q=g.next_out,$=g.output,J=g.avail_out,U=g.next_in,O=g.input,V=g.avail_in,T=t.hold,D=t.bits,Y=V,G=J,P=_;e:for(;;)switch(t.mode){case h:if(t.wrap===0){t.mode=13;break}for(;D<16;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(2&t.wrap&&T===35615){y[t.check=0]=255&T,y[1]=T>>>8&255,t.check=n(t.check,y,2,0),D=T=0,t.mode=2;break}if(t.flags=0,t.head&&(t.head.done=!1),!(1&t.wrap)||(((255&T)<<8)+(T>>8))%31){g.msg="incorrect header check",t.mode=30;break}if((15&T)!=8){g.msg="unknown compression method",t.mode=30;break}if(D-=4,e=8+(15&(T>>>=4)),t.wbits===0)t.wbits=e;else if(e>t.wbits){g.msg="invalid window size",t.mode=30;break}t.dmax=1<<e,g.adler=t.check=1,t.mode=512&T?10:12,D=T=0;break;case 2:for(;D<16;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(t.flags=T,(255&t.flags)!=8){g.msg="unknown compression method",t.mode=30;break}if(57344&t.flags){g.msg="unknown header flags set",t.mode=30;break}t.head&&(t.head.text=T>>8&1),512&t.flags&&(y[0]=255&T,y[1]=T>>>8&255,t.check=n(t.check,y,2,0)),D=T=0,t.mode=3;case 3:for(;D<32;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.head&&(t.head.time=T),512&t.flags&&(y[0]=255&T,y[1]=T>>>8&255,y[2]=T>>>16&255,y[3]=T>>>24&255,t.check=n(t.check,y,4,0)),D=T=0,t.mode=4;case 4:for(;D<16;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.head&&(t.head.xflags=255&T,t.head.os=T>>8),512&t.flags&&(y[0]=255&T,y[1]=T>>>8&255,t.check=n(t.check,y,2,0)),D=T=0,t.mode=5;case 5:if(1024&t.flags){for(;D<16;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.length=T,t.head&&(t.head.extra_len=T),512&t.flags&&(y[0]=255&T,y[1]=T>>>8&255,t.check=n(t.check,y,2,0)),D=T=0}else t.head&&(t.head.extra=null);t.mode=6;case 6:if(1024&t.flags&&(V<(H=t.length)&&(H=V),H&&(t.head&&(e=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Array(t.head.extra_len)),u.arraySet(t.head.extra,O,U,H,e)),512&t.flags&&(t.check=n(t.check,O,H,U)),V-=H,U+=H,t.length-=H),t.length))break e;t.length=0,t.mode=7;case 7:if(2048&t.flags){if(V===0)break e;for(H=0;e=O[U+H++],t.head&&e&&t.length<65536&&(t.head.name+=String.fromCharCode(e)),e&&H<V;);if(512&t.flags&&(t.check=n(t.check,O,H,U)),V-=H,U+=H,e)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=8;case 8:if(4096&t.flags){if(V===0)break e;for(H=0;e=O[U+H++],t.head&&e&&t.length<65536&&(t.head.comment+=String.fromCharCode(e)),e&&H<V;);if(512&t.flags&&(t.check=n(t.check,O,H,U)),V-=H,U+=H,e)break e}else t.head&&(t.head.comment=null);t.mode=9;case 9:if(512&t.flags){for(;D<16;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(T!==(65535&t.check)){g.msg="header crc mismatch",t.mode=30;break}D=T=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),g.adler=t.check=0,t.mode=12;break;case 10:for(;D<32;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}g.adler=t.check=a(T),D=T=0,t.mode=11;case 11:if(t.havedict===0)return g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=V,t.hold=T,t.bits=D,2;g.adler=t.check=1,t.mode=12;case 12:if(C===5||C===6)break e;case 13:if(t.last){T>>>=7&D,D-=7&D,t.mode=27;break}for(;D<3;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}switch(t.last=1&T,D-=1,3&(T>>>=1)){case 0:t.mode=14;break;case 1:if(Z(t),t.mode=20,C!==6)break;T>>>=2,D-=2;break e;case 2:t.mode=17;break;case 3:g.msg="invalid block type",t.mode=30}T>>>=2,D-=2;break;case 14:for(T>>>=7&D,D-=7&D;D<32;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if((65535&T)!=(T>>>16^65535)){g.msg="invalid stored block lengths",t.mode=30;break}if(t.length=65535&T,D=T=0,t.mode=15,C===6)break e;case 15:t.mode=16;case 16:if(H=t.length){if(V<H&&(H=V),J<H&&(H=J),H===0)break e;u.arraySet($,O,U,H,Q),V-=H,U+=H,J-=H,Q+=H,t.length-=H;break}t.mode=12;break;case 17:for(;D<14;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(t.nlen=257+(31&T),T>>>=5,D-=5,t.ndist=1+(31&T),T>>>=5,D-=5,t.ncode=4+(15&T),T>>>=4,D-=4,286<t.nlen||30<t.ndist){g.msg="too many length or distance symbols",t.mode=30;break}t.have=0,t.mode=18;case 18:for(;t.have<t.ncode;){for(;D<3;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.lens[L[t.have++]]=7&T,T>>>=3,D-=3}for(;t.have<19;)t.lens[L[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,j={bits:t.lenbits},P=b(0,t.lens,0,19,t.lencode,0,t.work,j),t.lenbits=j.bits,P){g.msg="invalid code lengths set",t.mode=30;break}t.have=0,t.mode=19;case 19:for(;t.have<t.nlen+t.ndist;){for(;se=(o=t.lencode[T&(1<<t.lenbits)-1])>>>16&255,ce=65535&o,!((ee=o>>>24)<=D);){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(ce<16)T>>>=ee,D-=ee,t.lens[t.have++]=ce;else{if(ce===16){for(d=ee+2;D<d;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(T>>>=ee,D-=ee,t.have===0){g.msg="invalid bit length repeat",t.mode=30;break}e=t.lens[t.have-1],H=3+(3&T),T>>>=2,D-=2}else if(ce===17){for(d=ee+3;D<d;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}D-=ee,e=0,H=3+(7&(T>>>=ee)),T>>>=3,D-=3}else{for(d=ee+7;D<d;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}D-=ee,e=0,H=11+(127&(T>>>=ee)),T>>>=7,D-=7}if(t.have+H>t.nlen+t.ndist){g.msg="invalid bit length repeat",t.mode=30;break}for(;H--;)t.lens[t.have++]=e}}if(t.mode===30)break;if(t.lens[256]===0){g.msg="invalid code -- missing end-of-block",t.mode=30;break}if(t.lenbits=9,j={bits:t.lenbits},P=b(w,t.lens,0,t.nlen,t.lencode,0,t.work,j),t.lenbits=j.bits,P){g.msg="invalid literal/lengths set",t.mode=30;break}if(t.distbits=6,t.distcode=t.distdyn,j={bits:t.distbits},P=b(m,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,j),t.distbits=j.bits,P){g.msg="invalid distances set",t.mode=30;break}if(t.mode=20,C===6)break e;case 20:t.mode=21;case 21:if(6<=V&&258<=J){g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=V,t.hold=T,t.bits=D,c(g,G),Q=g.next_out,$=g.output,J=g.avail_out,U=g.next_in,O=g.input,V=g.avail_in,T=t.hold,D=t.bits,t.mode===12&&(t.back=-1);break}for(t.back=0;se=(o=t.lencode[T&(1<<t.lenbits)-1])>>>16&255,ce=65535&o,!((ee=o>>>24)<=D);){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(se&&!(240&se)){for(oe=ee,fe=se,he=ce;se=(o=t.lencode[he+((T&(1<<oe+fe)-1)>>oe)])>>>16&255,ce=65535&o,!(oe+(ee=o>>>24)<=D);){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}T>>>=oe,D-=oe,t.back+=oe}if(T>>>=ee,D-=ee,t.back+=ee,t.length=ce,se===0){t.mode=26;break}if(32&se){t.back=-1,t.mode=12;break}if(64&se){g.msg="invalid literal/length code",t.mode=30;break}t.extra=15&se,t.mode=22;case 22:if(t.extra){for(d=t.extra;D<d;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.length+=T&(1<<t.extra)-1,T>>>=t.extra,D-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=23;case 23:for(;se=(o=t.distcode[T&(1<<t.distbits)-1])>>>16&255,ce=65535&o,!((ee=o>>>24)<=D);){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(!(240&se)){for(oe=ee,fe=se,he=ce;se=(o=t.distcode[he+((T&(1<<oe+fe)-1)>>oe)])>>>16&255,ce=65535&o,!(oe+(ee=o>>>24)<=D);){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}T>>>=oe,D-=oe,t.back+=oe}if(T>>>=ee,D-=ee,t.back+=ee,64&se){g.msg="invalid distance code",t.mode=30;break}t.offset=ce,t.extra=15&se,t.mode=24;case 24:if(t.extra){for(d=t.extra;D<d;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}t.offset+=T&(1<<t.extra)-1,T>>>=t.extra,D-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){g.msg="invalid distance too far back",t.mode=30;break}t.mode=25;case 25:if(J===0)break e;if(H=G-J,t.offset>H){if((H=t.offset-H)>t.whave&&t.sane){g.msg="invalid distance too far back",t.mode=30;break}ae=H>t.wnext?(H-=t.wnext,t.wsize-H):t.wnext-H,H>t.length&&(H=t.length),ue=t.window}else ue=$,ae=Q-t.offset,H=t.length;for(J<H&&(H=J),J-=H,t.length-=H;$[Q++]=ue[ae++],--H;);t.length===0&&(t.mode=21);break;case 26:if(J===0)break e;$[Q++]=t.length,J--,t.mode=21;break;case 27:if(t.wrap){for(;D<32;){if(V===0)break e;V--,T|=O[U++]<<D,D+=8}if(G-=J,g.total_out+=G,t.total+=G,G&&(g.adler=t.check=t.flags?n(t.check,$,G,Q-G):l(t.check,$,G,Q-G)),G=J,(t.flags?T:a(T))!==t.check){g.msg="incorrect data check",t.mode=30;break}D=T=0}t.mode=28;case 28:if(t.wrap&&t.flags){for(;D<32;){if(V===0)break e;V--,T+=O[U++]<<D,D+=8}if(T!==(4294967295&t.total)){g.msg="incorrect length check",t.mode=30;break}D=T=0}t.mode=29;case 29:P=1;break e;case 30:P=-3;break e;case 31:return-4;case 32:default:return s}return g.next_out=Q,g.avail_out=J,g.next_in=U,g.avail_in=V,t.hold=T,t.bits=D,(t.wsize||G!==g.avail_out&&t.mode<30&&(t.mode<27||C!==4))&&K(g,g.output,g.next_out,G-g.avail_out)?(t.mode=31,-4):(Y-=g.avail_in,G-=g.avail_out,g.total_in+=Y,g.total_out+=G,t.total+=G,t.wrap&&G&&(g.adler=t.check=t.flags?n(t.check,$,G,g.next_out-G):l(t.check,$,G,g.next_out-G)),g.data_type=t.bits+(t.last?64:0)+(t.mode===12?128:0)+(t.mode===20||t.mode===15?256:0),(Y==0&&G===0||C===4)&&P===_&&(P=-5),P)},x.inflateEnd=function(g){if(!g||!g.state)return s;var C=g.state;return C.window&&(C.window=null),g.state=null,_},x.inflateGetHeader=function(g,C){var t;return g&&g.state&&2&(t=g.state).wrap?((t.head=C).done=!1,_):s},x.inflateSetDictionary=function(g,C){var t,O=C.length;return g&&g.state?(t=g.state).wrap!==0&&t.mode!==11?s:t.mode===11&&l(1,C,O,0)!==t.check?-3:K(g,C,O,O)?(t.mode=31,-4):(t.havedict=1,_):s},x.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(p,R,x){var u=p("../utils/common"),l=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],n=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],c=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],b=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];R.exports=function(w,m,_,s,h,r,i,a){var f,v,k,N,z,I,B,A,Z,K=a.bits,g=0,C=0,t=0,O=0,$=0,U=0,Q=0,V=0,J=0,T=0,D=null,Y=0,G=new u.Buf16(16),H=new u.Buf16(16),ae=null,ue=0;for(g=0;g<=15;g++)G[g]=0;for(C=0;C<s;C++)G[m[_+C]]++;for($=K,O=15;1<=O&&G[O]===0;O--);if(O<$&&($=O),O===0)return h[r++]=20971520,h[r++]=20971520,a.bits=1,0;for(t=1;t<O&&G[t]===0;t++);for($<t&&($=t),g=V=1;g<=15;g++)if(V<<=1,(V-=G[g])<0)return-1;if(0<V&&(w===0||O!==1))return-1;for(H[1]=0,g=1;g<15;g++)H[g+1]=H[g]+G[g];for(C=0;C<s;C++)m[_+C]!==0&&(i[H[m[_+C]]++]=C);if(I=w===0?(D=ae=i,19):w===1?(D=l,Y-=257,ae=n,ue-=257,256):(D=c,ae=b,-1),g=t,z=r,Q=C=T=0,k=-1,N=(J=1<<(U=$))-1,w===1&&852<J||w===2&&592<J)return 1;for(;;){for(B=g-Q,Z=i[C]<I?(A=0,i[C]):i[C]>I?(A=ae[ue+i[C]],D[Y+i[C]]):(A=96,0),f=1<<g-Q,t=v=1<<U;h[z+(T>>Q)+(v-=f)]=B<<24|A<<16|Z|0,v!==0;);for(f=1<<g-1;T&f;)f>>=1;if(f!==0?(T&=f-1,T+=f):T=0,C++,--G[g]==0){if(g===O)break;g=m[_+i[C]]}if($<g&&(T&N)!==k){for(Q===0&&(Q=$),z+=t,V=1<<(U=g-Q);U+Q<O&&!((V-=G[U+Q])<=0);)U++,V<<=1;if(J+=1<<U,w===1&&852<J||w===2&&592<J)return 1;h[k=T&N]=$<<24|U<<16|z-r|0}}return T!==0&&(h[z+T]=g-Q<<24|64<<16|0),a.bits=$,0}},{"../utils/common":41}],51:[function(p,R,x){R.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(p,R,x){var u=p("../utils/common"),l=0,n=1;function c(o){for(var y=o.length;0<=--y;)o[y]=0}var b=0,w=29,m=256,_=m+1+w,s=30,h=19,r=2*_+1,i=15,a=16,f=7,v=256,k=16,N=17,z=18,I=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],B=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],A=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Z=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],K=new Array(2*(_+2));c(K);var g=new Array(2*s);c(g);var C=new Array(512);c(C);var t=new Array(256);c(t);var O=new Array(w);c(O);var $,U,Q,V=new Array(s);function J(o,y,L,F,E){this.static_tree=o,this.extra_bits=y,this.extra_base=L,this.elems=F,this.max_length=E,this.has_stree=o&&o.length}function T(o,y){this.dyn_tree=o,this.max_code=0,this.stat_desc=y}function D(o){return o<256?C[o]:C[256+(o>>>7)]}function Y(o,y){o.pending_buf[o.pending++]=255&y,o.pending_buf[o.pending++]=y>>>8&255}function G(o,y,L){o.bi_valid>a-L?(o.bi_buf|=y<<o.bi_valid&65535,Y(o,o.bi_buf),o.bi_buf=y>>a-o.bi_valid,o.bi_valid+=L-a):(o.bi_buf|=y<<o.bi_valid&65535,o.bi_valid+=L)}function H(o,y,L){G(o,L[2*y],L[2*y+1])}function ae(o,y){for(var L=0;L|=1&o,o>>>=1,L<<=1,0<--y;);return L>>>1}function ue(o,y,L){var F,E,M=new Array(i+1),q=0;for(F=1;F<=i;F++)M[F]=q=q+L[F-1]<<1;for(E=0;E<=y;E++){var W=o[2*E+1];W!==0&&(o[2*E]=ae(M[W]++,W))}}function ee(o){var y;for(y=0;y<_;y++)o.dyn_ltree[2*y]=0;for(y=0;y<s;y++)o.dyn_dtree[2*y]=0;for(y=0;y<h;y++)o.bl_tree[2*y]=0;o.dyn_ltree[2*v]=1,o.opt_len=o.static_len=0,o.last_lit=o.matches=0}function se(o){8<o.bi_valid?Y(o,o.bi_buf):0<o.bi_valid&&(o.pending_buf[o.pending++]=o.bi_buf),o.bi_buf=0,o.bi_valid=0}function ce(o,y,L,F){var E=2*y,M=2*L;return o[E]<o[M]||o[E]===o[M]&&F[y]<=F[L]}function oe(o,y,L){for(var F=o.heap[L],E=L<<1;E<=o.heap_len&&(E<o.heap_len&&ce(y,o.heap[E+1],o.heap[E],o.depth)&&E++,!ce(y,F,o.heap[E],o.depth));)o.heap[L]=o.heap[E],L=E,E<<=1;o.heap[L]=F}function fe(o,y,L){var F,E,M,q,W=0;if(o.last_lit!==0)for(;F=o.pending_buf[o.d_buf+2*W]<<8|o.pending_buf[o.d_buf+2*W+1],E=o.pending_buf[o.l_buf+W],W++,F===0?H(o,E,y):(H(o,(M=t[E])+m+1,y),(q=I[M])!==0&&G(o,E-=O[M],q),H(o,M=D(--F),L),(q=B[M])!==0&&G(o,F-=V[M],q)),W<o.last_lit;);H(o,v,y)}function he(o,y){var L,F,E,M=y.dyn_tree,q=y.stat_desc.static_tree,W=y.stat_desc.has_stree,X=y.stat_desc.elems,ie=-1;for(o.heap_len=0,o.heap_max=r,L=0;L<X;L++)M[2*L]!==0?(o.heap[++o.heap_len]=ie=L,o.depth[L]=0):M[2*L+1]=0;for(;o.heap_len<2;)M[2*(E=o.heap[++o.heap_len]=ie<2?++ie:0)]=1,o.depth[E]=0,o.opt_len--,W&&(o.static_len-=q[2*E+1]);for(y.max_code=ie,L=o.heap_len>>1;1<=L;L--)oe(o,M,L);for(E=X;L=o.heap[1],o.heap[1]=o.heap[o.heap_len--],oe(o,M,1),F=o.heap[1],o.heap[--o.heap_max]=L,o.heap[--o.heap_max]=F,M[2*E]=M[2*L]+M[2*F],o.depth[E]=(o.depth[L]>=o.depth[F]?o.depth[L]:o.depth[F])+1,M[2*L+1]=M[2*F+1]=E,o.heap[1]=E++,oe(o,M,1),2<=o.heap_len;);o.heap[--o.heap_max]=o.heap[1],function(te,de){var we,me,ve,le,ye,Te,pe=de.dyn_tree,Ae=de.max_code,He=de.stat_desc.static_tree,Ge=de.stat_desc.has_stree,qe=de.stat_desc.extra_bits,Ie=de.stat_desc.extra_base,xe=de.stat_desc.max_length,Ne=0;for(le=0;le<=i;le++)te.bl_count[le]=0;for(pe[2*te.heap[te.heap_max]+1]=0,we=te.heap_max+1;we<r;we++)xe<(le=pe[2*pe[2*(me=te.heap[we])+1]+1]+1)&&(le=xe,Ne++),pe[2*me+1]=le,Ae<me||(te.bl_count[le]++,ye=0,Ie<=me&&(ye=qe[me-Ie]),Te=pe[2*me],te.opt_len+=Te*(le+ye),Ge&&(te.static_len+=Te*(He[2*me+1]+ye)));if(Ne!==0){do{for(le=xe-1;te.bl_count[le]===0;)le--;te.bl_count[le]--,te.bl_count[le+1]+=2,te.bl_count[xe]--,Ne-=2}while(0<Ne);for(le=xe;le!==0;le--)for(me=te.bl_count[le];me!==0;)Ae<(ve=te.heap[--we])||(pe[2*ve+1]!==le&&(te.opt_len+=(le-pe[2*ve+1])*pe[2*ve],pe[2*ve+1]=le),me--)}}(o,y),ue(M,ie,o.bl_count)}function e(o,y,L){var F,E,M=-1,q=y[1],W=0,X=7,ie=4;for(q===0&&(X=138,ie=3),y[2*(L+1)+1]=65535,F=0;F<=L;F++)E=q,q=y[2*(F+1)+1],++W<X&&E===q||(W<ie?o.bl_tree[2*E]+=W:E!==0?(E!==M&&o.bl_tree[2*E]++,o.bl_tree[2*k]++):W<=10?o.bl_tree[2*N]++:o.bl_tree[2*z]++,M=E,ie=(W=0)===q?(X=138,3):E===q?(X=6,3):(X=7,4))}function P(o,y,L){var F,E,M=-1,q=y[1],W=0,X=7,ie=4;for(q===0&&(X=138,ie=3),F=0;F<=L;F++)if(E=q,q=y[2*(F+1)+1],!(++W<X&&E===q)){if(W<ie)for(;H(o,E,o.bl_tree),--W!=0;);else E!==0?(E!==M&&(H(o,E,o.bl_tree),W--),H(o,k,o.bl_tree),G(o,W-3,2)):W<=10?(H(o,N,o.bl_tree),G(o,W-3,3)):(H(o,z,o.bl_tree),G(o,W-11,7));M=E,ie=(W=0)===q?(X=138,3):E===q?(X=6,3):(X=7,4)}}c(V);var j=!1;function d(o,y,L,F){G(o,(b<<1)+(F?1:0),3),function(E,M,q,W){se(E),W&&(Y(E,q),Y(E,~q)),u.arraySet(E.pending_buf,E.window,M,q,E.pending),E.pending+=q}(o,y,L,!0)}x._tr_init=function(o){j||(function(){var y,L,F,E,M,q=new Array(i+1);for(E=F=0;E<w-1;E++)for(O[E]=F,y=0;y<1<<I[E];y++)t[F++]=E;for(t[F-1]=E,E=M=0;E<16;E++)for(V[E]=M,y=0;y<1<<B[E];y++)C[M++]=E;for(M>>=7;E<s;E++)for(V[E]=M<<7,y=0;y<1<<B[E]-7;y++)C[256+M++]=E;for(L=0;L<=i;L++)q[L]=0;for(y=0;y<=143;)K[2*y+1]=8,y++,q[8]++;for(;y<=255;)K[2*y+1]=9,y++,q[9]++;for(;y<=279;)K[2*y+1]=7,y++,q[7]++;for(;y<=287;)K[2*y+1]=8,y++,q[8]++;for(ue(K,_+1,q),y=0;y<s;y++)g[2*y+1]=5,g[2*y]=ae(y,5);$=new J(K,I,m+1,_,i),U=new J(g,B,0,s,i),Q=new J(new Array(0),A,0,h,f)}(),j=!0),o.l_desc=new T(o.dyn_ltree,$),o.d_desc=new T(o.dyn_dtree,U),o.bl_desc=new T(o.bl_tree,Q),o.bi_buf=0,o.bi_valid=0,ee(o)},x._tr_stored_block=d,x._tr_flush_block=function(o,y,L,F){var E,M,q=0;0<o.level?(o.strm.data_type===2&&(o.strm.data_type=function(W){var X,ie=4093624447;for(X=0;X<=31;X++,ie>>>=1)if(1&ie&&W.dyn_ltree[2*X]!==0)return l;if(W.dyn_ltree[18]!==0||W.dyn_ltree[20]!==0||W.dyn_ltree[26]!==0)return n;for(X=32;X<m;X++)if(W.dyn_ltree[2*X]!==0)return n;return l}(o)),he(o,o.l_desc),he(o,o.d_desc),q=function(W){var X;for(e(W,W.dyn_ltree,W.l_desc.max_code),e(W,W.dyn_dtree,W.d_desc.max_code),he(W,W.bl_desc),X=h-1;3<=X&&W.bl_tree[2*Z[X]+1]===0;X--);return W.opt_len+=3*(X+1)+5+5+4,X}(o),E=o.opt_len+3+7>>>3,(M=o.static_len+3+7>>>3)<=E&&(E=M)):E=M=L+5,L+4<=E&&y!==-1?d(o,y,L,F):o.strategy===4||M===E?(G(o,2+(F?1:0),3),fe(o,K,g)):(G(o,4+(F?1:0),3),function(W,X,ie,te){var de;for(G(W,X-257,5),G(W,ie-1,5),G(W,te-4,4),de=0;de<te;de++)G(W,W.bl_tree[2*Z[de]+1],3);P(W,W.dyn_ltree,X-1),P(W,W.dyn_dtree,ie-1)}(o,o.l_desc.max_code+1,o.d_desc.max_code+1,q+1),fe(o,o.dyn_ltree,o.dyn_dtree)),ee(o),F&&se(o)},x._tr_tally=function(o,y,L){return o.pending_buf[o.d_buf+2*o.last_lit]=y>>>8&255,o.pending_buf[o.d_buf+2*o.last_lit+1]=255&y,o.pending_buf[o.l_buf+o.last_lit]=255&L,o.last_lit++,y===0?o.dyn_ltree[2*L]++:(o.matches++,y--,o.dyn_ltree[2*(t[L]+m+1)]++,o.dyn_dtree[2*D(y)]++),o.last_lit===o.lit_bufsize-1},x._tr_align=function(o){G(o,2,3),H(o,v,K),function(y){y.bi_valid===16?(Y(y,y.bi_buf),y.bi_buf=0,y.bi_valid=0):8<=y.bi_valid&&(y.pending_buf[y.pending++]=255&y.bi_buf,y.bi_buf>>=8,y.bi_valid-=8)}(o)}},{"../utils/common":41}],53:[function(p,R,x){R.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(p,R,x){(function(u){(function(l,n){if(!l.setImmediate){var c,b,w,m,_=1,s={},h=!1,r=l.document,i=Object.getPrototypeOf&&Object.getPrototypeOf(l);i=i&&i.setTimeout?i:l,c={}.toString.call(l.process)==="[object process]"?function(k){process.nextTick(function(){f(k)})}:function(){if(l.postMessage&&!l.importScripts){var k=!0,N=l.onmessage;return l.onmessage=function(){k=!1},l.postMessage("","*"),l.onmessage=N,k}}()?(m="setImmediate$"+Math.random()+"$",l.addEventListener?l.addEventListener("message",v,!1):l.attachEvent("onmessage",v),function(k){l.postMessage(m+k,"*")}):l.MessageChannel?((w=new MessageChannel).port1.onmessage=function(k){f(k.data)},function(k){w.port2.postMessage(k)}):r&&"onreadystatechange"in r.createElement("script")?(b=r.documentElement,function(k){var N=r.createElement("script");N.onreadystatechange=function(){f(k),N.onreadystatechange=null,b.removeChild(N),N=null},b.appendChild(N)}):function(k){setTimeout(f,0,k)},i.setImmediate=function(k){typeof k!="function"&&(k=new Function(""+k));for(var N=new Array(arguments.length-1),z=0;z<N.length;z++)N[z]=arguments[z+1];var I={callback:k,args:N};return s[_]=I,c(_),_++},i.clearImmediate=a}function a(k){delete s[k]}function f(k){if(h)setTimeout(f,0,k);else{var N=s[k];if(N){h=!0;try{(function(z){var I=z.callback,B=z.args;switch(B.length){case 0:I();break;case 1:I(B[0]);break;case 2:I(B[0],B[1]);break;case 3:I(B[0],B[1],B[2]);break;default:I.apply(n,B)}})(N)}finally{a(k),h=!1}}}}function v(k){k.source===l&&typeof k.data=="string"&&k.data.indexOf(m)===0&&f(+k.data.slice(m.length))}})(typeof self>"u"?u===void 0?this:u:self)}).call(this,typeof ke<"u"?ke:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Ze);var et=Ze.exports;const tt=Xe(et),Me={async exportProject(ne={format:"zip"}){try{const re=await Ee(ge(be,"/export/project"),{method:"POST",body:JSON.stringify(ne)});return{success:re.ok,exportId:`export_${Date.now()}`,status:re.ok?"completed":"failed"}}catch(re){throw console.error("Export project failed:",re),new Error("خطا در صادرات پروژه")}},async exportModel(ne,re="tensorflow"){try{const p=await Ee(ge(be,`/models/${ne}/export`),{method:"POST",body:JSON.stringify({format:re})});return{success:p.ok,exportId:`model_export_${ne}_${Date.now()}`,status:p.ok?"completed":"failed"}}catch(p){throw console.error("Export model failed:",p),new Error("خطا در صادرات مدل")}},async getExportStatus(ne){try{const re=await Ee(ge(be,`/export/${ne}/status`));return{success:re.ok,exportId:ne,status:re.ok?"completed":"failed"}}catch(re){throw console.error("Get export status failed:",re),new Error("خطا در دریافت وضعیت صادرات")}},async downloadExport(ne){try{const re=await fetch(ge(be,`/export/${ne}/download`));if(!re.ok)throw new Error(`HTTP error! status: ${re.status}`);return await re.blob()}catch(re){throw console.error("Download export failed:",re),new Error("خطا در دانلود فایل صادرات")}},async getProjectStructure(){try{const ne=await Ee(ge(be,"/export/structure"));return{name:"Persian Legal AI Dashboard",version:"1.0.0",description:"Persian Legal Document Archive System",files:{},dependencies:{},scripts:{}}}catch(ne){return console.error("Get project structure failed:",ne),{name:"persian-legal-ai",version:"1.0.0",description:"Persian Legal AI Training System",files:{},dependencies:{react:"^18.3.1",typescript:"^5.5.3",express:"^4.19.2","better-sqlite3":"^12.2.0"},scripts:{dev:'concurrently "npm run server" "npm run client"',build:"vite build",start:"node server.js"}}}},async generateProjectZip(){try{const ne=await this.getProjectStructure(),re=await fetch(ge(be,"/export/generate-zip"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ne)});if(!re.ok)throw new Error(`HTTP error! status: ${re.status}`);return await re.blob()}catch(ne){throw console.error("Generate project ZIP failed:",ne),new Error("خطا در تولید فایل ZIP پروژه")}},async exportLogs(ne,re="json"){try{const p=new URLSearchParams({format:re});ne&&p.append("modelId",ne.toString());const R=await fetch(ge(be,`/export/logs?${p.toString()}`));if(!R.ok)throw new Error(`HTTP error! status: ${R.status}`);return await R.blob()}catch(p){throw console.error("Export logs failed:",p),new Error("خطا در صادرات لاگ‌ها")}},async exportDataset(ne,re="json"){try{const p=await fetch(ge(be,`/datasets/${ne}/export?format=${re}`));if(!p.ok)throw new Error(`HTTP error! status: ${p.status}`);return await p.blob()}catch(p){throw console.error("Export dataset failed:",p),new Error("خطا در صادرات مجموعه داده")}}};typeof process<"u"&&process.platform;function ot(){const[ne,re]=_e.useState(!1),[p,R]=_e.useState(0),[x,u]=_e.useState("idle"),[l,n]=_e.useState(null),[c,b]=_e.useState({format:"zip",includeModels:!0,includeData:!0,includeLogs:!0,includeConfig:!0}),[w,m]=_e.useState(null);_e.useEffect(()=>{let r;return l&&x==="processing"&&(r=setInterval(async()=>{try{const i=await Me.getExportStatus(l);u(i.status),R(i.progress||0),(i.status==="completed"||i.status==="failed")&&(clearInterval(r),i.status==="failed"&&m(i.message||"خطا در صادرات پروژه"))}catch(i){console.error("Error polling export status:",i),clearInterval(r),u("failed"),m("خطا در دریافت وضعیت صادرات")}},1e3)),()=>{r&&clearInterval(r)}},[l,x]);const _=()=>({"package.json":JSON.stringify({name:"persian-legal-ai-trainer",version:"1.0.0",description:"Persian Legal AI Training System with Real HuggingFace Integration",main:"server.js",scripts:{dev:'concurrently "npm run server" "npm run client"',server:"node server.js",client:"vite",build:"vite build",start:"node server.js",setup:"npm install && npm run build"},dependencies:{react:"^18.3.1","react-dom":"^18.3.1","@tensorflow/tfjs":"^4.22.0","better-sqlite3":"^12.2.0",express:"^5.1.0",cors:"^2.8.5","framer-motion":"^12.23.12","lucide-react":"^0.344.0",recharts:"^3.2.0",dexie:"^4.2.0",clsx:"^2.1.1","tailwind-merge":"^3.3.1",jszip:"^3.10.1"},devDependencies:{"@vitejs/plugin-react":"^4.3.1",vite:"^5.4.2",typescript:"^5.5.3","@types/react":"^18.3.5","@types/react-dom":"^18.3.0",tailwindcss:"^3.4.1",autoprefixer:"^10.4.18",postcss:"^8.4.35",concurrently:"^9.2.1"},keywords:["persian","legal","ai","training","tensorflow","huggingface"],author:"Persian Legal AI Team",license:"MIT"},null,2),"server.js":`const express = require('express');
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
};`}),s=async()=>{re(!0),R(0),m(null),u("processing");try{const r=await Me.exportProject(c);if(r.success){if(n(r.exportId),r.downloadUrl){const i=document.createElement("a");i.href=r.downloadUrl,i.download="persian-legal-ai-complete.zip",document.body.appendChild(i),i.click(),document.body.removeChild(i),u("completed"),R(100)}}else throw new Error(r.message||"خطا در شروع صادرات")}catch(r){console.error("Export failed:",r),m(r instanceof Error?r.message:"خطا در صادرات پروژه"),u("failed")}finally{re(!1),setTimeout(()=>{R(0),u("idle"),n(null),m(null)},3e3)}},h=async()=>{re(!0),R(0),m(null);try{const r=new tt,i=_(),a=Object.keys(i).length;let f=0;for(const[z,I]of Object.entries(i))r.file(z,I),f++,R(f/a*90),await new Promise(B=>setTimeout(B,50));R(95);const v=await r.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});R(100);const k=URL.createObjectURL(v),N=document.createElement("a");N.href=k,N.download="persian-legal-ai-complete.zip",document.body.appendChild(N),N.click(),document.body.removeChild(N),URL.revokeObjectURL(k),setTimeout(()=>{R(0),re(!1)},1e3)}catch(r){console.error("Error generating project:",r),re(!1),R(0),m("خطا در تولید فایل پروژه")}};return S.jsxDEV("div",{className:"space-y-6",dir:"rtl",children:[S.jsxDEV("div",{className:"text-center",children:[S.jsxDEV("h1",{className:"text-3xl font-bold text-gray-900 dark:text-white mb-2",children:"دانلود پروژه کامل"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1019,columnNumber:9},this),S.jsxDEV("p",{className:"text-gray-600 dark:text-gray-400",children:"دانلود پروژه کامل Persian Legal AI با تمام فایل‌های لازم برای استقرار"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1022,columnNumber:9},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1018,columnNumber:7},this),S.jsxDEV(ze,{className:"w-full max-w-4xl mx-auto",children:[S.jsxDEV(Le,{children:S.jsxDEV(Fe,{className:"flex items-center gap-3",children:[S.jsxDEV(Se,{className:"h-6 w-6 text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1031,columnNumber:13},this),"گزینه‌های صادرات"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1030,columnNumber:11},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1029,columnNumber:9},this),S.jsxDEV(Be,{children:S.jsxDEV("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:[S.jsxDEV("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[S.jsxDEV("input",{type:"checkbox",checked:c.includeModels,onChange:r=>b(i=>({...i,includeModels:r.target.checked})),className:"text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1038,columnNumber:15},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Ve,{className:"h-4 w-4 text-purple-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1045,columnNumber:17},this),S.jsxDEV("span",{className:"text-sm",children:"مدل‌ها"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1046,columnNumber:17},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1044,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1037,columnNumber:13},this),S.jsxDEV("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[S.jsxDEV("input",{type:"checkbox",checked:c.includeData,onChange:r=>b(i=>({...i,includeData:r.target.checked})),className:"text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1051,columnNumber:15},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Ce,{className:"h-4 w-4 text-green-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1058,columnNumber:17},this),S.jsxDEV("span",{className:"text-sm",children:"داده‌ها"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1059,columnNumber:17},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1057,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1050,columnNumber:13},this),S.jsxDEV("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[S.jsxDEV("input",{type:"checkbox",checked:c.includeLogs,onChange:r=>b(i=>({...i,includeLogs:r.target.checked})),className:"text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1064,columnNumber:15},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Pe,{className:"h-4 w-4 text-orange-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1071,columnNumber:17},this),S.jsxDEV("span",{className:"text-sm",children:"لاگ‌ها"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1072,columnNumber:17},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1070,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1063,columnNumber:13},this),S.jsxDEV("label",{className:"flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",children:[S.jsxDEV("input",{type:"checkbox",checked:c.includeConfig,onChange:r=>b(i=>({...i,includeConfig:r.target.checked})),className:"text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1077,columnNumber:15},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Re,{className:"h-4 w-4 text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1084,columnNumber:17},this),S.jsxDEV("span",{className:"text-sm",children:"تنظیمات"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1085,columnNumber:17},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1083,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1076,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1036,columnNumber:11},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1035,columnNumber:9},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1028,columnNumber:7},this),S.jsxDEV(ze,{className:"w-full max-w-4xl mx-auto",children:[S.jsxDEV(Le,{children:S.jsxDEV(Fe,{className:"flex items-center gap-3 text-2xl",children:[S.jsxDEV(Se,{className:"h-8 w-8 text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1096,columnNumber:13},this),"دانلود پروژه کامل",x==="completed"&&S.jsxDEV(je,{className:"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",children:"تکمیل شده"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1098,columnNumber:46},this),x==="processing"&&S.jsxDEV(je,{className:"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",children:"در حال پردازش"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1099,columnNumber:47},this),x==="failed"&&S.jsxDEV(je,{className:"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",children:"ناموفق"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1100,columnNumber:43},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1095,columnNumber:11},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1094,columnNumber:9},this),S.jsxDEV(Be,{className:"space-y-6",children:[S.jsxDEV("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg",children:[S.jsxDEV(Re,{className:"h-6 w-6 text-blue-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1108,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"سرور Express"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1110,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"API کامل با SQLite"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1111,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1109,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1107,columnNumber:11},this),S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg",children:[S.jsxDEV(Ce,{className:"h-6 w-6 text-green-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1116,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"پایگاه داده"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1118,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"SQLite برای Windows VPS"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1119,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1117,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1115,columnNumber:11},this),S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg",children:[S.jsxDEV(Ve,{className:"h-6 w-6 text-purple-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1124,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"کد کامل"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1126,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"React + TypeScript"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1127,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1125,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1123,columnNumber:11},this),S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg",children:[S.jsxDEV(Pe,{className:"h-6 w-6 text-orange-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1132,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"مستندات"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1134,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"راهنمای کامل نصب"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1135,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1133,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1131,columnNumber:11},this),S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg",children:[S.jsxDEV(Se,{className:"h-6 w-6 text-red-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1140,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"Docker"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1142,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"آماده برای استقرار"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1143,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1141,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1139,columnNumber:11},this),S.jsxDEV("div",{className:"flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950 rounded-lg",children:[S.jsxDEV(Ue,{className:"h-6 w-6 text-teal-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1148,columnNumber:13},this),S.jsxDEV("div",{children:[S.jsxDEV("h4",{className:"font-semibold",children:"یک کلیک"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1150,columnNumber:15},this),S.jsxDEV("p",{className:"text-sm text-gray-600",children:"آماده برای اجرا"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1151,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1149,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1147,columnNumber:11},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1106,columnNumber:9},this),S.jsxDEV("div",{className:"bg-gray-50 dark:bg-gray-800 p-6 rounded-lg",children:[S.jsxDEV("h4",{className:"font-semibold mb-4",children:"فایل‌های شامل:"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1158,columnNumber:11},this),S.jsxDEV("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-2 text-sm",children:[S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-blue-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1161,columnNumber:15},this),S.jsxDEV("code",{children:"package.json"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1162,columnNumber:15},this)," - تنظیمات پروژه"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1160,columnNumber:13},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-green-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1165,columnNumber:15},this),S.jsxDEV("code",{children:"server.js"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1166,columnNumber:15},this)," - سرور Express"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1164,columnNumber:13},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-purple-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1169,columnNumber:15},this),S.jsxDEV("code",{children:"Dockerfile"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1170,columnNumber:15},this)," - تنظیمات Docker"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1168,columnNumber:13},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-orange-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1173,columnNumber:15},this),S.jsxDEV("code",{children:"README.md"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1174,columnNumber:15},this)," - مستندات کامل"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1172,columnNumber:13},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-red-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1177,columnNumber:15},this),S.jsxDEV("code",{children:"deploy.sh"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1178,columnNumber:15},this)," - اسکریپت استقرار"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1176,columnNumber:13},this),S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV("span",{className:"w-2 h-2 bg-teal-500 rounded-full"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1181,columnNumber:15},this),S.jsxDEV("code",{children:"setup.sh"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1182,columnNumber:15},this)," - اسکریپت نصب"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1180,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1159,columnNumber:11},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1157,columnNumber:9},this),w&&S.jsxDEV("div",{className:"p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mb-6",children:S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Ye,{className:"h-5 w-5 text-red-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1191,columnNumber:15},this),S.jsxDEV("p",{className:"text-red-800 dark:text-red-200",children:w},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1192,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1190,columnNumber:13},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1189,columnNumber:11},this),x==="completed"&&S.jsxDEV("div",{className:"p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mb-6",children:S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Ke,{className:"h-5 w-5 text-green-600"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1200,columnNumber:15},this),S.jsxDEV("p",{className:"text-green-800 dark:text-green-200",children:"صادرات با موفقیت تکمیل شد!"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1201,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1199,columnNumber:13},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1198,columnNumber:11},this),(ne||x==="processing")&&S.jsxDEV("div",{className:"space-y-3 mb-6",children:[S.jsxDEV("div",{className:"flex justify-between items-center text-sm",children:[S.jsxDEV("div",{className:"flex items-center gap-2",children:[S.jsxDEV(Qe,{className:"h-4 w-4 text-blue-600 animate-pulse"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1211,columnNumber:17},this),S.jsxDEV("span",{children:["در حال ",x==="processing"?"پردازش":"تولید"," پروژه..."]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1212,columnNumber:17},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1210,columnNumber:15},this),S.jsxDEV("span",{className:"font-medium",children:[p.toFixed(0),"%"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1214,columnNumber:15},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1209,columnNumber:13},this),S.jsxDEV($e,{value:p,className:"h-3"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1216,columnNumber:13},this),S.jsxDEV("div",{className:"text-xs text-gray-500 dark:text-gray-400 text-center",children:x==="processing"?"سرور در حال آماده‌سازی فایل‌ها است":"در حال ایجاد فایل ZIP"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1217,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1208,columnNumber:11},this),S.jsxDEV("div",{className:"flex flex-col sm:flex-row gap-4 justify-center items-center",children:[S.jsxDEV(Oe,{onClick:s,disabled:ne||x==="processing",className:"px-8 py-4 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50",children:ne||x==="processing"?S.jsxDEV(S.Fragment,{children:[S.jsxDEV("div",{className:"animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ms-2"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1232,columnNumber:17},this),"در حال پردازش..."]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1231,columnNumber:15},this):S.jsxDEV(S.Fragment,{children:[S.jsxDEV(Je,{className:"h-5 w-5 ms-2"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1237,columnNumber:17},this),"دانلود از سرور (پیشنهادی)"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1236,columnNumber:15},this)},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1225,columnNumber:11},this),S.jsxDEV(Oe,{onClick:h,disabled:ne||x==="processing",variant:"outline",className:"px-6 py-4",children:[S.jsxDEV(Ue,{className:"h-4 w-4 ms-2"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1249,columnNumber:13},this),"دانلود محلی (ZIP)"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1243,columnNumber:11},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1224,columnNumber:9},this),S.jsxDEV("div",{className:"text-center text-sm text-gray-500 dark:text-gray-400 mt-4",children:[S.jsxDEV("p",{children:"دانلود از سرور: سریع‌تر و شامل داده‌های به‌روز"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1255,columnNumber:11},this),S.jsxDEV("p",{children:"دانلود محلی: بدون نیاز به اتصال مداوم به سرور"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1256,columnNumber:11},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1254,columnNumber:9},this),S.jsxDEV("div",{className:"bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800",children:[S.jsxDEV("h4",{className:"font-semibold text-blue-900 dark:text-blue-100 mb-3",children:"راهنمای سریع:"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1261,columnNumber:11},this),S.jsxDEV("ol",{className:"list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200",children:[S.jsxDEV("li",{children:"فایل ZIP را دانلود و استخراج کنید"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1265,columnNumber:13},this),S.jsxDEV("li",{children:"در ترمینال وارد پوشه پروژه شوید"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1266,columnNumber:13},this),S.jsxDEV("li",{children:["دستور ",S.jsxDEV("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm install"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1267,columnNumber:23},this)," را اجرا کنید"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1267,columnNumber:13},this),S.jsxDEV("li",{children:["دستور ",S.jsxDEV("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"npm run dev"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1268,columnNumber:23},this)," را اجرا کنید"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1268,columnNumber:13},this),S.jsxDEV("li",{children:["مرورگر را به آدرس ",S.jsxDEV("code",{className:"bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded",children:"http://localhost:8000"},void 0,!1,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1269,columnNumber:35},this)," باز کنید"]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1269,columnNumber:13},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1264,columnNumber:11},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1260,columnNumber:9},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1104,columnNumber:7},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1093,columnNumber:7},this)]},void 0,!0,{fileName:"/workspace/src/components/ProjectDownloader.tsx",lineNumber:1016,columnNumber:5},this)}export{ot as ProjectDownloader};
