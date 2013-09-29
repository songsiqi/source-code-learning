/*!
 * jQuery JavaScript Library v1.6.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Thu May 12 15:04:36 2011 -0400
 *
 * songsiqi - 源码学习 注释
 */

// 自调用匿名函数，不会破坏全局的命名空间
// 传入参数window，使得window由全局变量变为局部变量，作用：①在jQuery代码块中访问window时，不需要将作用域链回退到顶层作用域，这样可以更快的访问window；②window可以作为局部变量名被压缩，减小压缩后的代码长度
// 传入参数undefined，防止undefined被重写
(function( window, undefined ) {

    /*! 第1部分：构造jQuery对象及其工具函数 */

    // 缓存js全局变量的副本
    var document = window.document,
        navigator = window.navigator,
        location = window.location;

    // 构造jQuery对象
    var jQuery = (function() {

        // 构造jQuery对象的本地拷贝
        var jQuery = function( selector, context ) {
                // 返回由init工厂方法构造的jQuery实例
                return new jQuery.fn.init( selector, context, rootjQuery );
            },

            // 临时保存window的jQuery和$属性，在处理命名冲突时使用
            // 注：虽然在引入jQuery库的时候window的jQuery和$属性是jQuery库的，但引入其他库可能导致window的jQuery和$属性可能不是jQuery库的
            _jQuery = window.jQuery,
            _$ = window.$,

            // 根据选择器创建jQuery对象时的根上下文，默认值是对root，即jQuery(document)的引用
            rootjQuery, // 这个在900多行的地方有赋值：rootjQuery = jQuery(document)

            // 匹配HTML标签或ID字符串
            quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

            // 匹配非空白符
            rnotwhite = /\S/,

            // 匹配左右空白符
            trimLeft = /^\s+/,
            trimRight = /\s+$/,

            // 匹配数字
            rdigit = /\d/,

            // 匹配单独的标签
            rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

            // JSON相关的正则表达式（借鉴自json2.js），在parseJSON中使用
            rvalidchars = /^[\],:{}\s]*$/,
            rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

            // UserAgent字段正则表达式
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

            // userAgent字段副本
            userAgent = navigator.userAgent,

            // 匹配浏览器及版本
            browserMatch,

            // DOM ready时的异步队列，在bindReady中初始化
            readyList,

            // 900多行的地方定义了DOMContentLoaded如何做扫尾处理，主要内容是删除绑定的DOMContentLoaded或onreadystatechange事件代码，和调用静态jQuery.ready函数，触发回调函数
            DOMContentLoaded,

            // 缓存一些js对象、数组核心方法的引用（后面经常用到）
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,

            // 将[[Class]] 转换为小写的类型 type pairs
            // [[Class]]信息可以通过Object.prototype.toString.call(obj)获得，其中内置类的名称首字母将大写
            class2type = {}; // 在900多行有具体的赋值

        // 定义jQuery的原型
        // 同时用jQuery.fn缓存了jQuery.prototype
        // 原型中定义的是包装集函数
        jQuery.fn = jQuery.prototype = {
            constructor: jQuery,
			
			// 实际上init是jQuery对象的构造函数，selector是jQuery的选择器，context是上下文，rootjQuery是根上下文（默认是jQuery(document)，也可在创建jQuery对象时自己传入一个上下文）
            init: function( selector, context, rootjQuery ) {
                var match, elem, ret, doc;

                // init构造器的this有selector、context、length属性和一个数组（包装集）

                // 处理 $(""), $(null), 或 $(undefined)
                if ( !selector ) {
                    return this;
                }

                // 处理 $(DOMElement)
                if ( selector.nodeType ) { // 有nodeType属性，为DOM元素
                    this.context = this[0] = selector;
                    this.length = 1;
                    return this;
                }

                // 处理body（优化）
                if ( selector === "body" && !context && document.body ) {
                    this.context = document;
                    this[0] = document.body;
                    this.selector = selector;
                    this.length = 1;
                    return this;
                }

                // 处理HTML字符串，可能是HTML字符串或者ID串
                if ( typeof selector === "string" ) {
                    // 若开头结尾为 < > 则默认为HTML字符串，跳过正则表达式检查
                    // 注：match[0]为整个匹配串，match[1]为匹配的HTML字符串捕获组，match[2]为匹配的ID字符串捕获组
                    if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
                        // Assume that strings that start and end with <> are HTML and skip the regex check
                        match = [ null, selector, null ];

                    } else { // 用上面定义的正则表达式去匹配HTML字符串或者ID串
                        match = quickExpr.exec( selector );
                    }

                    // 处理匹配到的HTML字符串或#id，且没有指定上下文
                    if ( match && (match[1] || !context) ) {

                        // 处理: $(html) -> $(array)
                        if ( match[1] ) {
                            context = context instanceof jQuery ? context[0] : context;
                            doc = (context ? context.ownerDocument || context : document);

                            // 匹配传入的单独HTML标签
                            ret = rsingleTag.exec( selector );

                            if ( ret ) { // 单独的标签，形如 $("<div>") 或 $("<a></a>")
                                if ( jQuery.isPlainObject( context ) ) { // 纯对象
                                    selector = [ document.createElement( ret[1] ) ];
                                    jQuery.fn.attr.call( selector, context, true ); // 在创建HTML代码时，context用来为创建的对象设置其指定的属性

                                } else {
                                    selector = [ doc.createElement( ret[1] ) ]; // 使用document.createElement创建元素
                                }

                            } else { // 一段HTML片段
                                ret = jQuery.buildFragment( [ match[1] ], [ doc ] ); // 创建HTML片段，buildFragment函数在6000行左右定义
                                selector = (ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment).childNodes; // selector中为片段中的元素（片段的子节点）
                            }

                            // 返回合并后的数组（包装集）
                            return jQuery.merge( this, selector ); // 把selector合并到jQuery对象上，见700多行的merge定义，就是把selector附加到this[0..n]上，并修正length

                        // 处理: $("#id")
                        } else {
                            elem = document.getElementById( match[2] ); // 第2个捕获组为ID，使用document.getElementById

                            // 检测父节点，因为Blackberry 4.6会返回不在文档中的节点，见#6963
                            if ( elem && elem.parentNode ) {
                                // 某些版本的IE和Opera会根据name返回元素而不是ID，而IE8(Q)及较低版本中的getElementById不区分ID大小写，这种情况则调用find方法查找元素（会使用Sizzle）
                                if ( elem.id !== match[2] ) {
                                    return rootjQuery.find( selector );
                                }

                                // 将根据ID获取的元素放入jQuery对象中
                                this.length = 1;
                                this[0] = elem;
                            }

                            this.context = document;
                            this.selector = selector;
                            return this;
                        }

                    // 使用Sizzle，处理CSS选择器
                    // 处理: $(expr, $(...))，即content为jQuery对象的情况
                    } else if ( !context || context.jquery ) {
                        return (context || rootjQuery).find( selector ); // jQuery包装集上的find方法在“DOM操作”部分中定义，而它会调用Sizzle（即jQuery.find）

                    // 处理: $(expr, context)，等价于$(context).find(expr)
                    } else {
                        return this.constructor( context ).find( selector ); // 此处不用jQuery而用this.constructor的目的就是为了不再生成新的实例
                    }

                // 处理 $(function)
                // 即$(document).ready(function)的简写
                } else if ( jQuery.isFunction( selector ) ) {
                    return rootjQuery.ready( selector );
                }

                // 处理jQuery对象（伪数组）
                if (selector.selector !== undefined) {
                    this.selector = selector.selector;
                    this.context = selector.context;
                }

                // 返回包装集的数组
                return jQuery.makeArray( selector, this ); // 第二个参数为上下文，仅内部使用
            }, // init工厂方法结束

            // 选择器：初始化为空
            selector: "",

            // 当前jQuery版本
            jquery: "1.6.1",

            // jQuery实例（包装集数组）的长度
            length: 0,

            // 返回jQuery实例（包装集数组）的长度
            size: function() {
                return this.length;
            },

            // jQuery包装集数组转换为Array数组
            toArray: function() {
                return slice.call( this, 0 );
            },

            // 获取jQuery包装集数组中的DOM元素
            get: function( num ) {
                return num == null ?

                    // 若没有指定num，返回Array数组
                    this.toArray() :

                    // 返回num处的元素
                    ( num < 0 ? this[ this.length + num ] : this[ num ] );
            },

            // jQuery包装集栈入栈，返回新的包装集
            // 后两个可选参数
            // name：用来生成元素数组的jQuery方法
            // selector：传入name方法的参数
            pushStack: function( elems, name, selector ) {
                // 创建一个新的jQuery匹配元素集合，包含elems
                var ret = this.constructor();

                if ( jQuery.isArray( elems ) ) { // elems是真正的数组，则直接用push添加数组项
                    push.apply( ret, elems );

                } else { // elems是伪数组（如jQuery包装集），则用merge合并
                    jQuery.merge( ret, elems );
                }

                // 原jQuery对象作为引用压入jQuery包装集栈中
                ret.prevObject = this;
                ret.context = this.context;

                // name是内部的操作，它和传入的参数用于设置操作后结果包装集的selector（具体看“DOM操作”部分中的写法）
                // 一般API只用第一个参数
                if ( name === "find" ) {
                    ret.selector = this.selector + (this.selector ? " " : "") + selector;
                } else if ( name ) {
                    ret.selector = this.selector + "." + name + "(" + selector + ")";
                }

                // 返回新的包装集
                return ret;
            },

            // 在jQuery包装集中的匹配元素上调用回调函数
            // args仅用于内部使用
            each: function( callback, args ) {
                // 调用jQuery静态工具函数$.each，把上下文this作为参数传入静态方法
                // 其实在包装集上调用each的时候没有传入args，所以callback的参数就为默认的i(下标), n(当前元素)，见下面each的定义
                return jQuery.each( this, callback, args );
            },

            // jQuery的ready包装集方法，例如$(document).ready
            ready: function( fn ) {
                // 绑定ready事件
                jQuery.bindReady();

                // 将fn加入回调函数到执行列表中，等待执行
                readyList.done( fn );

                return this;
            },

            eq: function( i ) { // 从0开始计
                return i === -1 ? // -1为最后一个
                    this.slice( i ) :
                    this.slice( i, +i + 1 );
            },

            first: function() {
                return this.eq( 0 );
            },

            last: function() {
                return this.eq( -1 );
            },

            // 包装集的节选操作
            // 对于类似的这种链式操作，必须使选出前的jQuery包装集入栈
            slice: function() {
                return this.pushStack( slice.apply( this, arguments ),
                    "slice", slice.call(arguments).join(",") );
            },

            // 包装集的映射操作
            map: function( callback ) {
                // 调用jQuery工具函数$.map，把map返回的jQuery包装集入栈
                return this.pushStack( jQuery.map(this, function( elem, i ) {
                    return callback.call( elem, i, elem ); // 在elem上调用回调函数，回调函数传入的参数分别是下标i和项item
                }));
            },

            // jQuery包装集栈出栈，和pushStack方法相对应
            end: function() {
                return this.prevObject || this.constructor(null);
            },

            // For internal use only.
            // Behaves like an Array's method, not like a jQuery method.
            push: push,
            sort: [].sort,
            splice: [].splice
        };

        // 用jQuery的原型覆盖jQuery.init的原型，这样使用jQuery.init创建的对象就能继承jQuery原型定义的方法了
        jQuery.fn.init.prototype = jQuery.fn;

        // jQuery扩展的定义：
        // 使用扩展而不是直接修改原型的好处是避免后期维护中破坏jQuery框架的原型结构，方便管理

        // 合并两个或更多对象的属性到第一个对象中，jQuery后续的大部分功能都通过该函数扩展
        // 如果传入两个或多个对象，所有对象的属性会被添加到第一个对象target里面
        // 如果只传入一个对象，则将对象的属性添加到jQuery对象中。用这种方式，可以为jQuery命名空间增加新的方法。可以用于编写jQuery插件。（后面的扩展工具函数都是用的这个！）
        // 如果不想改变传入的对象，可以传入一个空对象：$.extend({}, object1, object2);
        // 默认合并操作是浅复制，相同属性若值对象或数组会被完全覆盖。如果第一个参数是true，则进行深复制，相同属性若值为对象或数组则会被合并
        // 从object原型继承的属性会被拷贝，undefined值不会被拷贝，因为性能原因JavaScript自带类型的属性不会合并
        // jQuery.extend( target, [ object1 ], [ objectN ] )
        // jQuery.extend( [ deep ], target, object1, [ objectN ] )
        jQuery.extend = jQuery.fn.extend = function() {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1, // 跳过target
                length = arguments.length,
                deep = false; // 深度标记：true深复制，false浅复制

            // 如果第一个参数为Boolean类型
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                i = 2; // 跳过deep和target
            }

            // 修正target，确保target是一个可以迭代属性的对象。target也可以为函数对象
            if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
                target = {};
            }

            // 如果只有一个参数（可能前面还有一个Boolean），则把属性赋值给jQuery或者jQuery.fn，用于扩展jQuery库
            if ( length === i ) {
                target = this;
                --i; // 重新修正循环起始位置
            }

            for ( ; i < length; i++ ) { // 遍历后面的每个对象
                // 只复制非null和undefined值
                if ( (options = arguments[ i ]) != null ) {
                    // 扩展target对象
                    for ( name in options ) { // 遍历对象的每个属性
                        src = target[ name ];
                        copy = options[ name ];

                        // 避免循环引用
                        if ( target === copy ) {
                            continue;
                        }

                        // 深复制，且为纯对象或数组
                        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                            if ( copyIsArray ) { // copy是数组
                                copyIsArray = false;
                                clone = src && jQuery.isArray(src) ? src : []; // clone为src的修正值，防止在copy为纯对象或数组的时候target为undefined

                            } else { // copy是对象
                                clone = src && jQuery.isPlainObject(src) ? src : {}; // clone为src的修正值，防止在copy为纯对象或数组的时候target为undefined
                            }

                            // 递归调用jQuery.extend
                            target[ name ] = jQuery.extend( deep, clone, copy );

                        // 浅复制，或深复制只有值的情况：直接赋值，但不引入undefined值
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            return target; // 返回合并后的对象
        };

        // 使用jQuery扩展函数来扩展jQuery对象的静态方法
        // 只能使用jQuery主对象而不是实例调用 - $.调用的函数
        jQuery.extend({
            // 放弃对$的控制权，若传入的deep为true，接着放弃jQuery的控制权
            // _$和_jQuery的定义见50行左右，保存了window.jQuery和window.$，多库并存的情况下不一定是jQuery的
			// 参考资料：http://ued.taobao.com/blog/2013/03/jquery-noconflict/
            noConflict: function( deep ) {
                if ( window.$ === jQuery ) {
                    window.$ = _$;
                }

                if ( deep && window.jQuery === jQuery ) {
                    window.jQuery = _jQuery;
                }

                return jQuery; // 返回原jQuery对象
            },

            // 标记DOM是否ready
            isReady: false,

            // ready被触发前被延迟的次数。See #6781
            readyWait: 1,

            // 允许延迟ready事件的触发，延迟时传入false，触发时传入true，必须成对调用
            // 例如延迟触发ready，直到加载了插件：$.holdReady(true);  $.getScript("myplugin.js", function() { $.holdReady(false); });
            holdReady: function( hold ) {
                if ( hold ) { // 延迟
                    jQuery.readyWait++;
                } else { // 触发
                    jQuery.ready( true );
                }
            },

            // （内部方法）当DOM ready时，触发回调函数
            ready: function( wait ) { // wait为true表示ready被手动延迟过
                // Either a released hold or an DOMready/load event and not yet ready
                // 设置过延迟 && 延迟次数递减后已经为0  ||  没有设置延迟（或解除延迟后IE调用到了下面这条setTimeout） && isReady还没有标记为true（大多数情况）
                if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
                    // 针对IE，至少确保body存在(ticket #5443).
                    if ( !document.body ) {
                        return setTimeout( jQuery.ready, 1 ); // 否则调用自身，直到body存在了才有可能触发回调函数
                    }

                    // 标记DOM状态为已经ready
                    jQuery.isReady = true;

                    // 防御性检测，如果等待计数器在自减后仍然大于0，结束ready调用
                    if ( wait !== true && --jQuery.readyWait > 0 ) {
                        return;
                    }

                    // 将绑定的回调函数一个一个出队，并触发
                    // [ jQuery ]指定了ready事件回调函数的第一个参数，这样即使调用$.noConflict()交出了$的控制权，依然可以将回调函数的第一个参数命名为$，继续在函数内部使用$符号，如$(document).ready(function($){...})
                    readyList.resolveWith( document, [ jQuery ] ); // resolveWith参数：上下文context、参数args

                    // 触发ready事件，并移除ready事件处理函数（这里ready是个自定义事件）
                    if ( jQuery.fn.trigger ) {
                        jQuery( document ).trigger( "ready" ).unbind( "ready" );
                    }
                }
            },

            // （内部方法）绑定ready事件，初始化readyList事件处理函数队列，兼容不同浏览对绑定事件的区别
            bindReady: function() {
                if ( readyList ) { // 若已经创建了异步队列，则返回（多个ready的情况）
                    return;
                }

                readyList = jQuery._Deferred(); // 创建异步队列

                // Catch cases where $(document).ready() is called after the
                // browser event has already occurred.
                // 根据document.readyState直接判断文档加载情况。若为complete，则立即调用jQuery.ready
                if ( document.readyState === "complete" ) {
                    // Handle it asynchronously to allow scripts the opportunity to delay ready
                    return setTimeout( jQuery.ready, 1 );
                }

                // 900多行的地方定义了DOMContentLoaded如何做扫尾处理，主要内容是删除下面绑定的DOMContentLoaded或onreadystatechange事件代码，和调用静态jQuery.ready函数，触发回调函数
                // 对于Mozilla、Opera和webkit
                if ( document.addEventListener ) {
                    // 直接绑定DOMContentLoaded事件
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

                    // 回退到window.onload，它总是会执行
                    window.addEventListener( "load", jQuery.ready, false );

                // 对于IE
                } else if ( document.attachEvent ) {
                    // 确保在onload之前触发onreadystatechange，可能慢一些但是对iframes更安全
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );

                    // 回退到window.onload，它总是会执行
                    window.attachEvent( "onload", jQuery.ready );

                    var toplevel = false;

                    try {
                        toplevel = window.frameElement == null; // 是否为顶层窗口
                    } catch(e) {}

                    // hack：如果是IE并且不是frame（因为onreadystatechange对于ifame很可靠），不断检测窗口向左滚动
					// 因为在IE下，DOM的某些方法只有在DOM解析完成后才可以调用，doScroll就是这样一个方法，反过来当能调用doScroll的时候即是DOM解析完成之时
                    if ( document.documentElement.doScroll && toplevel ) {
                        doScrollCheck();
                    }
                }
            },

            // See test/unit/core.js for details concerning isFunction.
            // Since version 1.3, DOM methods and functions like alert
            // aren't supported. They return false on IE (#2968).
            isFunction: function( obj ) {
                return jQuery.type(obj) === "function";
            },

            isArray: Array.isArray || function( obj ) {
                return jQuery.type(obj) === "array";
            },

            // 判断对象是否是window，通过是否有setInterval方法来判断
            isWindow: function( obj ) {
                return obj && typeof obj === "object" && "setInterval" in obj;
            },

            // 是否是保留字NaN：等于null、不是数字、调用window.isNaN判断
            isNaN: function( obj ) {
                return obj == null || !rdigit.test( obj ) || isNaN( obj );
            },

            // 获取对象的类型
            type: function( obj ) {
                return obj == null ?
                    String( obj ) : // null
                    class2type[ toString.call(obj) ] || "object"; // 用900多行定义的class2type定义的对象返回对应的type小写，默认为object
            },

            // 判断对象否为纯粹的对象
            // 纯粹的对象：通过{}定义的对象、由new Object创建的对象
            // 注：new Object时传入参数创建的对象不是纯粹的对象，例如new Object(3)创建的是Number类型的对象
            isPlainObject: function( obj ) {
                // Because of IE, we also have to check the presence of the constructor property.
                // DOM元素和window不是纯对象
                if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
                    return false;
                }

                // 没有constructor一定是纯对象
                // 除去自定义对象和内置对象的判断，如function Person(){} var p = new Person();、String、Number等
                // 具有constructor，而且constructor是在原型中定义的，原型中没有isPrototypeOf方法（isPrototypeOf在Object的原型上定义），不是纯对象
                if ( obj.constructor &&
                    !hasOwn.call(obj, "constructor") &&
                    !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                    return false;
                }

                // 判断是否有继承关系
                // 实例属性会被首先遍历。若最后一个属性是实例属性，则所有属性都是实例属性
                var key;
                for ( key in obj ) {}

                return key === undefined || hasOwn.call( obj, key );
            },

            // 判断空对象
            isEmptyObject: function( obj ) {
                for ( var name in obj ) {
                    return false;
                }
                return true;
            },

            // 抛出一个异常
            error: function( msg ) {
                throw msg;
            },

            // 解析JSON，通用方法，没有使用eval，看来它被当作了最后的手段
            parseJSON: function( data ) {
                if ( typeof data !== "string" || !data ) {
                    return null;
                }

                // Make sure leading/trailing whitespace is removed (IE can't handle it)
                data = jQuery.trim( data );

                // 首先尝试原生的JSON解析
                if ( window.JSON && window.JSON.parse ) {
                    return window.JSON.parse( data );
                }

                // 确保传入的是JSON字符串，借鉴json2.js的逻辑
                if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                    .replace( rvalidtokens, "]" )
                    .replace( rvalidbraces, "")) ) {

                    return (new Function( "return " + data ))();

                }
                jQuery.error( "Invalid JSON: " + data );
            },

            // xml解析，(xml和tmp仅内部使用)
            parseXML: function( data , xml , tmp ) {

                if ( window.DOMParser ) { // Standard
                    tmp = new DOMParser();
                    xml = tmp.parseFromString( data , "text/xml" );
                } else { // IE
                    xml = new ActiveXObject( "Microsoft.XMLDOM" );
                    xml.async = "false";
                    xml.loadXML( data );
                }

                tmp = xml.documentElement;

                if ( ! tmp || ! tmp.nodeName || tmp.nodeName === "parsererror" ) {
                    jQuery.error( "Invalid XML: " + data );
                }

                return xml;
            },

            // 无操作的空函数
            // 这对一些插件作者很有用，当插件提供了一个可选的回调函数接口，那么如果调用的时候没有传递这个回调函数，就用jQuery.noop来代替执行
            noop: function() {},

            // 把一段脚本加载到全局window
            // 因为整个jQuery代码都是一整个匿名函数，当前的context是jQuery
            globalEval: function( data ) {
                if ( data && rnotwhite.test( data ) ) {
                    // 在IE中使用window.execScript
                    // 在这里使用匿名函数是为了使context为window，否则在Firefox中是jQuery
                    ( window.execScript || function( data ) {
                        window[ "eval" ].call( window, data );
                    } )( data );
                }
            },

            // 判断节点名称是否与指定的name相同
            nodeName: function( elem, name ) {
                return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
            },

            // 遍历对象或数组
            // args表示callback的参数（仅内部使用）
            each: function( object, callback, args ) {
                var name, i = 0, // 对象属性名、数组下标
                    length = object.length,
                    // isObj判断object是单个对象还是数组
                    // length没有定义，为对象 || 函数有length属性（希望接收的命名参数个数），函数也是对象
                    isObj = length === undefined || jQuery.isFunction( object );
                // 如果有参数args（内部使用），调用apply，上下文设置为当前遍历到的对象，callback的参数使用args
                if ( args ) {
                    if ( isObj ) { // 单个对象
                        for ( name in object ) {
                            if ( callback.apply( object[ name ], args ) === false ) { // 如果想break循环，则回调函数返回false既可
                                break;
                            }
                        }
                    } else { // 数组
                        for ( ; i < length; ) {
                            if ( callback.apply( object[ i++ ], args ) === false ) {
                                break;
                            }
                        }
                    }

                // 不传入args（作为API使用）
                } else {
                    if ( isObj ) { // 单个对象，callback的参数就为默认的key(键)、value(值)
                        for ( name in object ) {
                            if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                                break;
                            }
                        }
                    } else { // 数组，callback的参数就为默认的i(下标)、n(当前元素)
                        for ( ; i < length; ) {
                            if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
                                break;
                            }
                        }
                    }
                }

                return object;
            },

            // 去掉字符串前后的空白字符
            trim: trim ?
                // 原生的trim
                function( text ) {
                    return text == null ?
                        "" :
                        trim.call( text );
                } :

                // 使用正则表达式替换
                function( text ) {
                    return text == null ?
                        "" :
                        text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
                },

            // 将伪数组转换为js数组Array，因为转换成了纯粹意义上的数组，转换后jQuery的方法就没有了
            // 伪数组包括jQuery包装集、NodeList等，它们类似数组（如有[]和length），但是缺少一些内置方法
            // results为创建数组的上下文，只用于内部使用
            makeArray: function( array, results ) {
                var ret = results || [];

                if ( array != null ) {
                    // The window, strings (and functions) also have 'length'
                    // The extra typeof function check is to prevent crashes
                    // in Safari 2 (See: #3039)
                    // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
                    var type = jQuery.type( array );

                    // 没有length属性、字符串、函数、正则表达式、window，不是数组，连伪数组都不是
                    if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
                        push.call( ret, array ); // 直接push进数组
                    } else { // 是数组：调用jQuery.merge合并
                        jQuery.merge( ret, array ); // ret一般情况下为[]，在库的内部使用中可以为jQuery
                    }
                }

                return ret;
            },

            // 判断元素是否在数组中
            inArray: function( elem, array ) {
                if ( indexOf ) { // 新增的原生方法：Array.prototype.indexOf
                    return indexOf.call( array, elem );
                }

                for ( var i = 0, length = array.length; i < length; i++ ) { // 没有原生的方法就用土办法一个一个找
                    if ( array[ i ] === elem ) {
                        return i;
                    }
                }

                return -1;
            },

            // 合并数组：把second合并到first，这里使用了循环赋值合并
            merge: function( first, second ) {
                var i = first.length,
                    j = 0;

                if ( typeof second.length === "number" ) { // 如果second的length属性是Number类型，则把second当作数组处理
                    for ( var l = second.length; j < l; j++ ) {
                        first[ i++ ] = second[ j ];
                    }

                } else {
                    while ( second[j] !== undefined ) { // 遍历second，将非undefined的值添加到first中
                        first[ i++ ] = second[ j++ ];
                    }
                }

                first.length = i; // 修正first的length属性，因为first可能不是真正的数组（例如jQuery包装集this，对于selector为包装集数组的情况下就使用了这个）

                return first;
            },

            // 过滤数组，返回新数组
            // 如果inv省略或为false，callback返回true时保留；如果inv为true，callback返回false时保留
            // callback的参数分别为数组项和下标
            grep: function( elems, callback, inv ) {
                var ret = [], retVal;
                inv = !!inv; // 强制转换为Boolean类型（省略inv参数时，!!undefined === false）

                // 遍历数组，只保留通过验证函数callback的元素
                for ( var i = 0, length = elems.length; i < length; i++ ) {
                    retVal = !!callback( elems[ i ], i );
                    if ( inv !== retVal ) { // 保留过滤项的规则：callback的返回值与inv相反
                        ret.push( elems[ i ] );
                    }
                }

                return ret; // 返回过滤后的数组，原数组不会被修改
            },

            // 将数组/对象elems的元素/属性，转化成新的数组
            // callback的参数分别为元素/属性和下标/键，arg为callback的额外参数，仅内部使用
            map: function( elems, callback, arg ) {
                var value, key, ret = [],
                    i = 0,
                    length = elems.length,
                    // 被当作数组：jQuery对象、length为数字且第一个和最后一个元素是否存在、length等于0、或是真正的Array数组（用jQuery.isArray判断）
                    isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

                // 遍历数组，对每一个元素调用callback，将返回值不为null的值，存入ret
                if ( isArray ) {
                    for ( ; i < length; i++ ) {
                        value = callback( elems[ i ], i, arg );

                        if ( value != null ) {
                            ret[ ret.length ] = value;
                        }
                    }

                // 遍历对象，对每一个属性调用callback，将返回值不为null的值，存入ret
                } else {
                    for ( key in elems ) {
                        value = callback( elems[ key ], key, arg );

                        if ( value != null ) {
                            ret[ ret.length ] = value;
                        }
                    }
                }

                // Flatten any nested arrays
                return ret.concat.apply( [], ret ); // apply把ret分割为多个参数传递给concat，可以把嵌套的二维数组转化为一维的
            },

            // 全局的GUID计数器，绑定事件处理器的时候使用
            guid: 1,

            // 代理方法，将fn的上下文this被设置为context，有两种用法：
            // jQuery.proxy( fn, context ) ：即可以这么用：$("#test").click( jQuery.proxy( obj.test, obj ) );
            // jQuery.proxy( context, name ) ：也可以这么用：$("#test").click( jQuery.proxy( obj, "test" ) );
            // 另外，jQuery 能够确保即使你绑定的函数是经过 jQuery.proxy() 处理过的函数，你依然可以用原先的函数来正确地取消绑定
            proxy: function( fn, context ) {
                // 针对jQuery.proxy( context, name )的情形，首先转换为jQuery.proxy( fn, context )的情形，然后再进行绑定处理
                // 注：此处 fn -> context，context -> name
                // context：函数的上下文语境会被设置成context这个object对象；name：将要改变上下文语境的函数名，前提：必须存在context[name]
                if ( typeof context === "string" ) { // typeof name === "string"，函数名name为字符串
                    var tmp = fn[ context ];
                    context = fn;
                    fn = tmp;
                }

                // 快速测试fn是否是可调用的（即函数），在文档说明中，会抛出一个TypeError，但是这里仅返回undefined
                if ( !jQuery.isFunction( fn ) ) {
                    return undefined;
                }

                // 函数绑定（运用了函数柯里化），可以看《精通JavaScript》总结4 - 函数式编程 中的五、函数绑定
                var args = slice.call( arguments, 2 ), // 从参数列表中去掉fn和context，之后的参数才是调用proxy代理时预先传入的参数
                    proxy = function() {
                        return fn.apply( context, args.concat( slice.call( arguments ) ) ); // arguments是调用proxy后返回的柯里化函数在调用时被传入的参数，将这两部分的参数组合构成了fn的最终参数
                    };

                // 统一guid，使得proxy能够被移除
                proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

                return proxy; // 返回代理方法
            },

            // （内部方法）多功能函数，读取或设置集合的属性值；值为函数时会被执行
            // fn：jQuery.fn.css, jQuery.fn.attr, jQuery.fn.prop
            access: function( elems, key, value, exec, fn, pass ) {
                var length = elems.length;

                // 设置多个属性
                if ( typeof key === "object" ) {
                    for ( var k in key ) {
                        jQuery.access( elems, k, key[k], exec, fn, value );
                    }
                    return elems;
                }

                // 设置一个属性
                if ( value !== undefined ) {
                    // 可选, 若exec是true，函数被执行
                    exec = !pass && exec && jQuery.isFunction(value);

                    for ( var i = 0; i < length; i++ ) {
                        fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
                    }

                    return elems;
                }

                // 读取属性
                return length ? fn( elems[0], key ) : undefined;
            },

            // 获取当前时间
            now: function() {
                return (new Date()).getTime();
            },

            // （内部方法）不赞成使用原先的jQuery.browser进行客户端检测（因为仅基于User Agent，不准确），推荐使用jQuery.support进行特性检测
            uaMatch: function( ua ) {
                ua = ua.toLowerCase();

                var match = rwebkit.exec( ua ) ||
                    ropera.exec( ua ) ||
                    rmsie.exec( ua ) ||
                    ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
                    [];

                return { browser: match[1] || "", version: match[2] || "0" }; // match[1]是浏览器类型，match[2]是对应版本号
            },

            // 创建一个新的jQuery副本，副本的属性和方法可以被改变，但是不会影响原始的jQuery对象。有两种用法：
            // 1、覆盖jQuery的方法，而不破坏原始的方法
            // 2、封装，避免命名空间冲突，可以用来开发jQuery插件
            // 值得注意的是，jQuery.sub()函数并不提供真正的隔离，所有的属性、方法依然指向原始的jQuery，sub已在jQuery 1.9中被移除
            // 如果使用这个方法来开发插件，建议优先考虑jQuery UI widget工程
            sub: function() {
                function jQuerySub( selector, context ) { // jQuerySub的构造函数，和jQuery一样，都是通过init
                    return new jQuerySub.fn.init( selector, context );
                }
                jQuery.extend( true, jQuerySub, this ); // 深度拷贝，将jQuery的所有属性和方法拷贝到jQuerySub
                jQuerySub.superclass = this;
                jQuerySub.fn = jQuerySub.prototype = this();
                jQuerySub.fn.constructor = jQuerySub;
                jQuerySub.sub = this.sub;
                jQuerySub.fn.init = function init( selector, context ) {
                    if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
                        context = jQuerySub( context );
                    }

                    return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
                };
                jQuerySub.fn.init.prototype = jQuerySub.fn;
                var rootjQuerySub = jQuerySub(document);
                return jQuerySub;
            },

            // 浏览器类型和版本：
            // $.browser.msie/mozilla/webkit/opera
            // $.browser.version
            browser: {}
        });

        // 将[[Class]] 转换为小写的类型 type pairs，保存在class2type中
        jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
            class2type[ "[object " + name + "]" ] = name.toLowerCase();
        });

        browserMatch = jQuery.uaMatch( userAgent ); // 检测浏览器种类和版本
        if ( browserMatch.browser ) {
            jQuery.browser[ browserMatch.browser ] = true; // 把种类对应的关联数组项设置为true
            jQuery.browser.version = browserMatch.version;
        }

        if ( jQuery.browser.webkit ) {
            jQuery.browser.safari = true; // safari被弃用，用jQuery.browser.webkit代替
        }

        // IE doesn't match non-breaking spaces with \s
        if ( rnotwhite.test( "\xA0" ) ) {
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }

        // All jQuery objects should point back to these
        rootjQuery = jQuery(document);

        // DOMContentLoaded的定义：做扫尾处理，主要内容是删除绑定的DOMContentLoaded或onreadystatechange事件代码，和调用静态jQuery.ready函数，触发回调函数
        if ( document.addEventListener ) {
            DOMContentLoaded = function() {
                document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                jQuery.ready();
            };

        } else if ( document.attachEvent ) {
            DOMContentLoaded = function() {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( document.readyState === "complete" ) {
                    document.detachEvent( "onreadystatechange", DOMContentLoaded );
                    jQuery.ready();
                }
            };
        }

        // IE的DOM ready检测方法，不断检测窗口向左滚动
        function doScrollCheck() {
            if ( jQuery.isReady ) {
                return;
            }

            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch(e) {
                setTimeout( doScrollCheck, 1 ); // 设置定时器不断检测窗口向左滚动
                return;
            }

            // 检测滚动成功后调用ready，执行队列中等待的函数
            jQuery.ready();
        }

        // 返回构造的jQuery对象，暴露给全局
        return jQuery;

    })();


    /*! 第2部分：异步队列Deferred */

    // Deferred异步队列是一个jQuery库内部使用的基础设施
    // 具体应用：DOM Ready（只使用到了_Deferred）、Ajax（使用了Deferred）

    var // 允许调用的方法。注意没有以下方法：resolveWith、resolve、rejectWith、reject、when、cancel，即不允许调用这些方法
        promiseMethods = "done fail isResolved isRejected promise then always pipe".split( " " ),
        // 数组slice方法的静态引用
        sliceDeferred = [].slice;

    jQuery.extend({
        // 创建异步回调函数队列（只含单个队列）
        // _Deferred没有成功状态或失败状态，只有四种状态：初始化、执行中、执行完毕、已取消
        _Deferred: function() {
            var // 回调函数数组
                callbacks = [],
                // 存储 [上下文context, 参数args] ，同时还可以标识是否执行完成（fired非空即表示已完成）
                // 这里的“完成”指回调函数队列中“已有”的函数都已执行完成
                // 但是可以再次调用done添加回调函数，添加时fired会被重置为0
                fired,
                // 如果已经触发执行，避免再次被触发
                firing,
                // 标识异步队列是否已被取消，取消后将忽略对done、resolve、resolveWith的调用
                cancelled,
                // 异步队列对象定义
                deferred = {

                    // 注册回调函数，状态为成功（resolved）时立即调用
                    done: function() {
                        if ( !cancelled ) { // 如果已取消，则忽略本次调用
                            var args = arguments, // 添加的回调函数数组 done( f1, f2, ...)
                                i,
                                length,
                                elem,
                                type,
                                _fired; // 用于临时备份fired（fired中存储了上下文context和参数args）

                            // 如果已执行完成（即fired中保留了上下文和参数），则备份上下文和参数到_fired，同时将fired置为0，以便以后继续调用done()函数
                            if ( fired ) {
                                _fired = fired;
                                fired = 0;
                            }
                            // 添加arguments中的函数到回调函数数组callbacks中
                            for ( i = 0, length = args.length; i < length; i++ ) {
                                elem = args[ i ];
                                type = jQuery.type( elem );
                                if ( type === "array" ) { // 如果是数组，则递归调用
                                    deferred.done.apply( deferred, elem );
                                } else if ( type === "function" ) { // 如果是函数
                                    callbacks.push( elem );
                                }
                            }
                            // 如果已执行完成（前面已把fired赋值给_fired），则立即执行新添加的函数，使用之前指定的上下文context和参数args
                            if ( _fired ) {
                                deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] ); // 上下文context和参数args
                            }
                        }
                        return this;
                    },

                    // 使用指定的上下文和参数执行回调函数队列中的所有回调函数
                    resolveWith: function( context, args ) {
                        // 满足以下全部条件，才会执行：没有取消、没有正在执行、没有执行完成
                        // 即如果已取消、已执行完成、正在执行，则忽略本次调用
                        if ( !cancelled && !fired && !firing ) {
                            args = args || []; // 确保args可用
                            firing = 1;
                            try {
                                while( callbacks[ 0 ] ) {
                                    // 回调函数出队，调用（使用context和args）
                                    // ready触发时的context为document，args为[jQuery]，它指定了ready事件回调函数的第一个参数，这样即使调用$.noConflict()交出了$的控制权，依然可以将回调函数的第一个参数命名为$，继续在函数内部使用$符号，如$(document).ready(function($){...})
                                    callbacks.shift().apply( context, args );
                                }
                            }
                            finally {
                                fired = [ context, args ]; // 队列中的所有回调函数执行完之后，fired被赋值为 [上下文context, 参数args]
                                firing = 0;
                            }
                        }
                        return this;
                    },

                    // 使用this和arguments作为上下文和参数执行所有回调函数
                    resolve: function() {
                        deferred.resolveWith( this, arguments );
                        return this;
                    },

                    // 判断是否已执行
                    isResolved: function() {
                        return !!( firing || fired ); //正在执行或已执行
                    },

                    // 取消异步队列：设置标记位，清空函数队列
                    cancel: function() {
                        cancelled = 1;
                        callbacks = [];
                        return this;
                    }
                };

            return deferred; // 返回异步队列对象
        },

        // Deferred创建了一个完整的异步队列（包含成功和失败两个异步回调函数队列）
        // 为了代码复用，内部先实现了一个_Deferred，然后根据它扩展出fail、reject等方法
        // Deferred有三种状态：初始化（unresolved）、成功（resolved）、失败（rejected），执行哪些回调函数依赖于状态
        // 而_Deferred没有成功状态或失败状态，只有四种状态：初始化、执行中、执行完毕、已取消
        Deferred: function( func ) {
            var deferred = jQuery._Deferred(), // 创建成功回调函数队列
                failDeferred = jQuery._Deferred(), // 创建失败回调函数队列
                promise;

            // Add errorDeferred methods, then and promise
            jQuery.extend( deferred, {

                // 向队列注册成功回调函数（或数组） 和 失败回调函数（或数组）
                then: function( doneCallbacks, failCallbacks ) {
                    // 注：此处存在上下文切换：虽然deferred的done返回的是deferred，但是fail指向failDeferred.done，执行fail的上下文变为failDeferred
                    // 调用done时向deferred添加回调函数doneCallbacks，调用fail时向failDeferred添加回调函数failCallbacks
                    // 因此这行执行完之后，返回的是failDeferred
                    deferred.done( doneCallbacks ).fail( failCallbacks ); // 闭包引用了deferred和failDeferred
                    return this; // 强制返回deferred
                },

                // 注册回调函数，无论是成功或者失败时都会被调用
                always: function() {
                    // 设置this是为了返回deferred，实现链式调用；failDeferred.done的上下文虽然被改为deferred，但不影响其在failDeferred上执行
                    return deferred.done.apply( deferred, arguments ).fail.apply( this, arguments );
                    // 因为always的行为与then基本相同，区别只是always方法同时向两个队列添加相同的回调函数，所以这个方法可以改为：
                    // deferred.done( arguments ).fail( arguments );
                    // return this;
                },

                fail: failDeferred.done, // 注册失败回调函数

                rejectWith: failDeferred.resolveWith, // 使用指定的上下文和参数执行失败回调函数队列（注：失败调用的是失败队列需要执行的方法）

                reject: failDeferred.resolve, // 执行失败回调函数队列，此时上下文为this，参数为arguments

                isRejected: failDeferred.isResolved, // 判断状态是否为成功（resolved）

                // “管道”：把传入的成功过滤函数fnDone和失败过滤函数fnFail放到成功队列和失败队列的数组头部，在调用成功和失败的回调函数前先调用pipe指定的过滤函数
                // 并将过滤函数的返回值作为回调函数的参数，最终返回一个只读视图（调用promise实现）
                pipe: function( fnDone, fnFail ) {
                    return jQuery.Deferred(function( newDefer ) {
                        jQuery.each( {
                            done: [ fnDone, "resolve" ],
                            fail: [ fnFail, "reject" ]
                        }, function( handler, data ) { // 这里each回调函数的参数分别为对象的key和value，即handler为done或fail，data为数组
                            var fn = data[ 0 ], // 数组的第1个元素：成功或失败的过滤函数
                                action = data[ 1 ],  // 数组的第2个元素：成功或失败时调用的异步队列方法名
                                returned;
                            if ( jQuery.isFunction( fn ) ) {
                                deferred[ handler ](function() { // 调用done或fail将回调函数传入队列中
                                    returned = fn.apply( this, arguments );
                                    if ( returned && jQuery.isFunction( returned.promise ) ) {
                                        returned.promise().then( newDefer.resolve, newDefer.reject );
                                    } else {
                                        newDefer[ action ]( returned );
                                    }
                                });
                            } else {
                                deferred[ handler ]( newDefer[ action ] );
                            }
                        });
                    }).promise(); // 最终用promise返回一个视图
                },

                // promise返回的是一个不完整的Deferred的接口，可以看作是一种只读视图
                // 允许调用的方法：done、fail、isResolved、isRejected、promise、then、always、pipe
                // 不允许调用的方法：resolveWith、resolve、rejectWith、reject、when、cancel
                promise: function( obj ) {
                    if ( obj == null ) { // 若传入了obj则在上面叠加
                        if ( promise ) {
                            return promise; // 返回已存在的promise视图对象
                        }
                        promise = obj = {}; // 若不存在promise则创建一个空对象
                    }
                    var i = promiseMethods.length;
                    while( i-- ) {
                        obj[ promiseMethods[i] ] = deferred[ promiseMethods[i] ]; // 复制deferred中允许调用的方法
                    }
                    return obj;
                }
            });

            // 成功队列执行完成后，会执行失败带列的取消方法；失败队列执行完成后，会执行成功队列的取消方法
            // 只要有一个函数队列被执行，另一个就会被取消
            deferred.done( failDeferred.cancel ).fail( deferred.cancel );

            // 隐藏cancel接口，即无法从外部取消成功函数队列
            delete deferred.cancel;

            // 如果有函数func传进来则立即执行，传入deferred对象，调用函数func，如def = $.Deferred(funciton(defer){ defer.resolve;.. })
            if ( func ) {
                func.call( deferred, deferred );
            }

            return deferred;
        },

        // 异步队列的工具函数
        // 提供一种方法来执行一个或多个对象的回调函数，延迟对象通常表示异步事件
        when: function( firstParam ) { // firstParam为一个或多个延迟对象，或者普通的JavaScript对象
            var args = arguments,
                i = 0,
                length = args.length,
                count = length,
                deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
                    firstParam :
                    jQuery.Deferred();
            function resolveFunc( i ) {
                return function( value ) {
                    args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
                    if ( !( --count ) ) {
                        // Strange bug in FF4:
                        // Values changed onto the arguments object sometimes end up as undefined values
                        // outside the $.when method. Cloning the object into a fresh array solves the issue
                        deferred.resolveWith( deferred, sliceDeferred.call( args, 0 ) );
                    }
                };
            }
            if ( length > 1 ) {
                for( ; i < length; i++ ) {
                    if ( args[ i ] && jQuery.isFunction( args[ i ].promise ) ) {
                        args[ i ].promise().then( resolveFunc(i), deferred.reject );
                    } else {
                        --count;
                    }
                }
                if ( !count ) {
                    deferred.resolveWith( deferred, args );
                }
            } else if ( deferred !== firstParam ) {
                deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
            }
            return deferred.promise();
        }
    });


    /*! 第3部分：浏览器特性检测 */

    jQuery.support = (function() {

        var div = document.createElement( "div" ), // 构造一个用于测试的div
            documentElement = document.documentElement, // 文档根节点document
            all,
            a,
            select,
            opt,
            input,
            marginDiv,
            support,
            fragment,
            body,
            bodyStyle,
            tds,
            events,
            eventName,
            i,
            isSupported;

		// 尝试使用setAttribute设置className来设置class属性
        div.setAttribute("className", "t");
		// 这个div包括了空白开头、空table元素、行内元素a、opacity、float、没有指定值的复选框等
        div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

        all = div.getElementsByTagName( "*" );
        a = div.getElementsByTagName( "a" )[ 0 ];

        // 无法提供最基本的支持，返回空的support对象
        if ( !all || !all.length || !a ) {
            return {};
        }

        // 构造一个用于测试的select，它只含有一个option
        select = document.createElement( "select" );
        opt = select.appendChild( document.createElement("option") );
        input = div.getElementsByTagName( "input" )[ 0 ];

		// 构造最终返回的support对象
        support = {
			// IE在使用innerHTML时会把开头的空格去掉，所以nodeType不是3（文本）
            leadingWhitespace: ( div.firstChild.nodeType === 3 ),

			// IE会为空的table自动插入tbody，而其他浏览器不会，所以length不同
            tbody: !div.getElementsByTagName( "tbody" ).length,

			// IE不允许用这种方式插入link元素，IE6~8会直接过滤掉link标签，而chrome会保留，但是innerHTML被更改为'  <link>'
            htmlSerialize: !!div.getElementsByTagName( "link" ).length,

            // 检测能否通过getAttribute获取style的属性值，IE不行，需要获取cssText的属性值
			// 注：IE6/7中有style属性，但是无法使用getAttribute方法中读取style的值
            style: /top/.test( a.getAttribute("style") ),

			// 判断a的href属性是否是原始指定的字符串，IE会修改为以http开头的绝对路径
            hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

            // 检测opacity属性是否存在，IE使用filter
            // 这里使用了正则表达式，是为了绕过WebKit的5145号bug
            opacity: /^0.55$/.test( a.style.opacity ),

            // 对于浮动，IE使用styleFloat，而其他浏览器使用cssFloat
            cssFloat: !!a.style.cssFloat,

            // 对于没有指定值的复选框，webkit默认value属性值为""，而IE和Firefox为"on"
			// 注：这里是value属性，不是checked属性
            checkOn: ( input.value === "on" ),

			// 这个select只有一个option元素，所以渲染时这个option是默认选中的，selected应该为true
            // webkit默认为false；若在optgroup中，则IE也为false
            optSelected: opt.selected,

            // 尝试使用setAttribute设置className来设置class属性。IE6/7下为false，即可以这样使用；其他浏览器则不行，需要使用setAttribute class
            getSetAttribute: div.className !== "t",

            // 这些特性将在后面进行检测
            submitBubbles: true, // submit事件是否冒泡
            changeBubbles: true, // change事件是否冒泡
            focusinBubbles: false, // focusin事件是否冒泡
            deleteExpando: true, // 测试是否可以删除一个元素上的扩展属性（expando），IE为false
            noCloneEvent: true, // 拷贝的元素时是否会连带事件处理函数一起拷贝，IE为false（IE会拷贝）
            inlineBlockNeedsLayout: false, // 检测block元素在设置display:inline并触发hasLayout（zoom:1）后能否表现为inline-block。IE6/7为true，其他浏览器为false
            shrinkWrapBlocks: false, // 检测元素在触发hasLayout的情况下是否会撑大父节点，只有IE6是true
            reliableMarginRight: true // 当div有显式的宽度，但是没有margin-right时，检测margin-right的计算是否正确。旧版本WebKit有问题（见3333、13343号bug）
        };

        // 检测是否克隆复选框的checked属性，IE为false
        input.checked = true;
        support.noCloneChecked = input.cloneNode( true ).checked;

        // 检测已经disabled的select元素中的option元素是否默认为disabled，webkit默认为disabled
        select.disabled = true;
        support.optDisabled = !opt.disabled;

        // 测试是否可以删除一个元素上的扩展属性（expando），IE为false
        try {
            delete div.test;
        } catch( e ) {
            support.deleteExpando = false;
        }

		// 拷贝的元素时是否会连带事件处理函数一起拷贝，而IE会拷贝
        if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
            div.attachEvent( "onclick", function click() { // 针对IE，为div绑定一个click事件的回调函数，在回调函数中设置相关特性检测的值，并移除绑定的事件处理函数
                support.noCloneEvent = false;
                div.detachEvent( "onclick", click );
            });
            div.cloneNode( true ).fireEvent( "onclick" ); // 在克隆div（深复制）后生成的节点上触发click事件
        }

        // 测试单选按钮在append到DOM元素上之后是否能保持它的value属性值
        input = document.createElement("input");
        input.value = "t";
        input.setAttribute("type", "radio");
        support.radioValue = input.value === "t";

        input.setAttribute("checked", "checked");
        div.appendChild( input );
        fragment = document.createDocumentFragment();
        fragment.appendChild( div.firstChild );

		// webkit在克隆fragment片段中的单选按钮或复选框时不保留选中checked状态
        support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

        div.innerHTML = ""; // 在进行完前面的测试后，清空用于测试的div

        // 判断W3C的盒模型是否正常工作
        div.style.width = div.style.paddingLeft = "1px"; // width和padding-left都设置为1px

        // 自己创建一个看不见的body
        body = document.createElement( "body" );
        bodyStyle = {
            visibility: "hidden",
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: "none" // 设置背景为none，避免IE在移除这个body时崩溃 (#9028)
        };
        for ( i in bodyStyle ) {
            body.style[ i ] = bodyStyle[ i ];
        }
        body.appendChild( div ); // 把最初创建的div添加到body下
        documentElement.insertBefore( body, documentElement.firstChild ); // 把自己创建的body挂载到根节点document下

        // 检测一个复选框在被移动到DOM的其他地方后能否保持它的选中状态 (IE6/7)
        support.appendChecked = input.checked;

		// 检测是否根据W3C CSS的盒模型进行渲染
		// W3C盒模型：width和height仅包含content的大小
		// IE盒模型： width和height包含content + padding + border的大小
        support.boxModel = div.offsetWidth === 2; // width: 1px, padding-left: 1px, offsetWidth == width + padding

        if ( "zoom" in div.style ) {
            // 检测block元素在设置display:inline并触发hasLayout（zoom:1）后能否表现为inline-block（IE6/7）
            div.style.display = "inline";
            div.style.zoom = 1;
            support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

            // 检测元素在触发hasLayout的情况下是否会撑大父节点，只有IE6是true
            div.style.display = "";
            div.innerHTML = "<div style='width:4px;'></div>";
            support.shrinkWrapBlocks = ( div.offsetWidth !== 2 ); // IE6下为4
        }

		// 创建一个测试用的table
        div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
        tds = div.getElementsByTagName( "td" );

        // 检测table cells在设置display:none后是否还有offsetWidth/Height属性，是否还显示可见的表格
		// 在IE8中，使用display:none时offsetWidth/Height不可靠（见4512号bug）
        // 只有IE8有这个问题，为false
        isSupported = ( tds[ 0 ].offsetHeight === 0 );

        tds[ 0 ].style.display = "";
        tds[ 1 ].style.display = "none";

        // 将一个td设置display:none后，相邻td是否还有offsetWidth/Height属性
		// 在IE6/7中把td设为display:none是不保险的
        support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 ); // IE8及以下版本为false，其他浏览器为true
        div.innerHTML = "";

		// 当div有显式的宽度，但是没有margin-right时，检测margin-right的计算是否正确。旧版本WebKit有问题（见3333号bug）
        // 而13343号bug为getComputedStyle返回错误的margin-right值
        if ( document.defaultView && document.defaultView.getComputedStyle ) {
            marginDiv = document.createElement( "div" );
            marginDiv.style.width = "0";
            marginDiv.style.marginRight = "0";
            div.appendChild( marginDiv );
            support.reliableMarginRight =
                ( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
        }

        // 删除自己创建的body元素
        body.innerHTML = "";
        documentElement.removeChild( body );

        // 检测几个事件的冒泡特性，来自Juriy Zaytsev的技术
		// 原注释中提到的技术参考文章链接已经失效，需自行搜索Detecting event support without browser sniffing
        // 这里实际上只检查了IE，其他浏览器都是前面设置的默认值，即submit为true、change为true、focusin为false
        if ( div.attachEvent ) { // 只有IE的事件模型使用attachEvent
            for( i in {
                submit: 1,
                change: 1,
                focusin: 1
            } ) {
                eventName = "on" + i;
                isSupported = ( eventName in div ); // 检测div中是否存在相应的onxxx属性
                if ( !isSupported ) { // 若不存在，则使用setAttribute设置相应的onxxx属性后检测它是不是function类型
                    div.setAttribute( eventName, "return;" );
                    isSupported = ( typeof div[ eventName ] === "function" );
                }
                support[ i + "Bubbles" ] = isSupported; // 特性检测赋值
            }
        }

        return support;
    })();

    // Keep track of boxModel
    jQuery.boxModel = jQuery.support.boxModel;


    /*! 第4部分：数据缓存Data、Cache */

    var rbrace = /^(?:\{.*\}|\[.*\])$/,
        rmultiDash = /([a-z])([A-Z])/g;

    jQuery.extend({
        cache: {},

        // Please use with caution
        uuid: 0,

        // Unique for each copy of jQuery on the page
        // Non-digits removed to match rinlinejQuery
		// expando是扩展属性，可以将信息附加到DOM元素上
        expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

        // The following elements throw uncatchable exceptions if you
        // attempt to add expando properties to them.
        noData: {
            "embed": true,
            // Ban all objects except for Flash (which handle expandos)
            "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            "applet": true
        },

        hasData: function( elem ) {
            elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];

            return !!elem && !isEmptyDataObject( elem );
        },

        data: function( elem, name, data, pvt /* Internal Use Only */ ) {
            if ( !jQuery.acceptData( elem ) ) {
                return;
            }

            var internalKey = jQuery.expando, getByName = typeof name === "string", thisCache,

                // We have to handle DOM nodes and JS objects differently because IE6-7
                // can't GC object references properly across the DOM-JS boundary
                isNode = elem.nodeType,

                // Only DOM nodes need the global jQuery cache; JS object data is
                // attached directly to the object so GC can occur automatically
                cache = isNode ? jQuery.cache : elem,

                // Only defining an ID for JS objects if its cache already exists allows
                // the code to shortcut on the same path as a DOM node with no cache
                id = isNode ? elem[ jQuery.expando ] : elem[ jQuery.expando ] && jQuery.expando;

            // Avoid doing any more work than we need to when trying to get data on an
            // object that has no data at all
            if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
                return;
            }

            if ( !id ) {
                // Only DOM nodes need a new unique ID for each element since their data
                // ends up in the global cache
                if ( isNode ) {
                    elem[ jQuery.expando ] = id = ++jQuery.uuid;
                } else {
                    id = jQuery.expando;
                }
            }

            if ( !cache[ id ] ) {
                cache[ id ] = {};

                // TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
                // metadata on plain JS objects when the object is serialized using
                // JSON.stringify
                if ( !isNode ) {
                    cache[ id ].toJSON = jQuery.noop;
                }
            }

            // An object can be passed to jQuery.data instead of a key/value pair; this gets
            // shallow copied over onto the existing cache
            if ( typeof name === "object" || typeof name === "function" ) {
                if ( pvt ) {
                    cache[ id ][ internalKey ] = jQuery.extend(cache[ id ][ internalKey ], name);
                } else {
                    cache[ id ] = jQuery.extend(cache[ id ], name);
                }
            }

            thisCache = cache[ id ];

            // Internal jQuery data is stored in a separate object inside the object's data
            // cache in order to avoid key collisions between internal data and user-defined
            // data
            if ( pvt ) {
                if ( !thisCache[ internalKey ] ) {
                    thisCache[ internalKey ] = {};
                }

                thisCache = thisCache[ internalKey ];
            }

            if ( data !== undefined ) {
                thisCache[ jQuery.camelCase( name ) ] = data;
            }

            // TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
            // not attempt to inspect the internal events object using jQuery.data, as this
            // internal data object is undocumented and subject to change.
            if ( name === "events" && !thisCache[name] ) {
                return thisCache[ internalKey ] && thisCache[ internalKey ].events;
            }

            return getByName ? thisCache[ jQuery.camelCase( name ) ] : thisCache;
        },

        removeData: function( elem, name, pvt /* Internal Use Only */ ) {
            if ( !jQuery.acceptData( elem ) ) {
                return;
            }

            var internalKey = jQuery.expando, isNode = elem.nodeType,

                // See jQuery.data for more information
                cache = isNode ? jQuery.cache : elem,

                // See jQuery.data for more information
                id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

            // If there is already no cache entry for this object, there is no
            // purpose in continuing
            if ( !cache[ id ] ) {
                return;
            }

            if ( name ) {
                var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

                if ( thisCache ) {
                    delete thisCache[ name ];

                    // If there is no data left in the cache, we want to continue
                    // and let the cache object itself get destroyed
                    if ( !isEmptyDataObject(thisCache) ) {
                        return;
                    }
                }
            }

            // See jQuery.data for more information
            if ( pvt ) {
                delete cache[ id ][ internalKey ];

                // Don't destroy the parent cache unless the internal data object
                // had been the only thing left in it
                if ( !isEmptyDataObject(cache[ id ]) ) {
                    return;
                }
            }

            var internalCache = cache[ id ][ internalKey ];

            // Browsers that fail expando deletion also refuse to delete expandos on
            // the window, but it will allow it on all other JS objects; other browsers
            // don't care
            if ( jQuery.support.deleteExpando || cache != window ) {
                delete cache[ id ];
            } else {
                cache[ id ] = null;
            }

            // We destroyed the entire user cache at once because it's faster than
            // iterating through each key, but we need to continue to persist internal
            // data if it existed
            if ( internalCache ) {
                cache[ id ] = {};
                // TODO: This is a hack for 1.5 ONLY. Avoids exposing jQuery
                // metadata on plain JS objects when the object is serialized using
                // JSON.stringify
                if ( !isNode ) {
                    cache[ id ].toJSON = jQuery.noop;
                }

                cache[ id ][ internalKey ] = internalCache;

            // Otherwise, we need to eliminate the expando on the node to avoid
            // false lookups in the cache for entries that no longer exist
            } else if ( isNode ) {
                // IE does not allow us to delete expando properties from nodes,
                // nor does it have a removeAttribute function on Document nodes;
                // we must handle all of these cases
                if ( jQuery.support.deleteExpando ) {
                    delete elem[ jQuery.expando ];
                } else if ( elem.removeAttribute ) {
                    elem.removeAttribute( jQuery.expando );
                } else {
                    elem[ jQuery.expando ] = null;
                }
            }
        },

        // For internal use only.
        _data: function( elem, name, data ) {
            return jQuery.data( elem, name, data, true );
        },

        // A method for determining if a DOM node can handle the data expando
        acceptData: function( elem ) {
            if ( elem.nodeName ) {
                var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

                if ( match ) {
                    return !(match === true || elem.getAttribute("classid") !== match);
                }
            }

            return true;
        }
    });

    jQuery.fn.extend({
        data: function( key, value ) {
            var data = null;

            if ( typeof key === "undefined" ) {
                if ( this.length ) {
                    data = jQuery.data( this[0] );

                    if ( this[0].nodeType === 1 ) {
                    var attr = this[0].attributes, name;
                        for ( var i = 0, l = attr.length; i < l; i++ ) {
                            name = attr[i].name;

                            if ( name.indexOf( "data-" ) === 0 ) {
                                name = jQuery.camelCase( name.substring(5) );

                                dataAttr( this[0], name, data[ name ] );
                            }
                        }
                    }
                }

                return data;

            } else if ( typeof key === "object" ) {
                return this.each(function() {
                    jQuery.data( this, key );
                });
            }

            var parts = key.split(".");
            parts[1] = parts[1] ? "." + parts[1] : "";

            if ( value === undefined ) {
                data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

                // Try to fetch any internally stored data first
                if ( data === undefined && this.length ) {
                    data = jQuery.data( this[0], key );
                    data = dataAttr( this[0], key, data );
                }

                return data === undefined && parts[1] ?
                    this.data( parts[0] ) :
                    data;

            } else {
                return this.each(function() {
                    var $this = jQuery( this ),
                        args = [ parts[0], value ];

                    $this.triggerHandler( "setData" + parts[1] + "!", args );
                    jQuery.data( this, key, value );
                    $this.triggerHandler( "changeData" + parts[1] + "!", args );
                });
            }
        },

        removeData: function( key ) {
            return this.each(function() {
                jQuery.removeData( this, key );
            });
        }
    });

    function dataAttr( elem, key, data ) {
        // If nothing was found internally, try to fetch any
        // data from the HTML5 data-* attribute
        if ( data === undefined && elem.nodeType === 1 ) {
            var name = "data-" + key.replace( rmultiDash, "$1-$2" ).toLowerCase();

            data = elem.getAttribute( name );

            if ( typeof data === "string" ) {
                try {
                    data = data === "true" ? true :
                    data === "false" ? false :
                    data === "null" ? null :
                    !jQuery.isNaN( data ) ? parseFloat( data ) :
                        rbrace.test( data ) ? jQuery.parseJSON( data ) :
                        data;
                } catch( e ) {}

                // Make sure we set the data so it isn't changed later
                jQuery.data( elem, key, data );

            } else {
                data = undefined;
            }
        }

        return data;
    }

    // TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
    // property to be considered empty objects; this property always exists in
    // order to make sure JSON.stringify does not expose internal metadata
    function isEmptyDataObject( obj ) {
        for ( var name in obj ) {
            if ( name !== "toJSON" ) {
                return false;
            }
        }

        return true;
    }


    /*! 第5部分：队列Queue */

    // Queue队列也是一个jQuery库内部使用的基础设施
    // 具体应用：动画效果

    function handleQueueMarkDefer( elem, type, src ) {
        var deferDataKey = type + "defer",
            queueDataKey = type + "queue",
            markDataKey = type + "mark",
            defer = jQuery.data( elem, deferDataKey, undefined, true );
        if ( defer &&
            ( src === "queue" || !jQuery.data( elem, queueDataKey, undefined, true ) ) &&
            ( src === "mark" || !jQuery.data( elem, markDataKey, undefined, true ) ) ) {
            // Give room for hard-coded callbacks to fire first
            // and eventually mark/queue something else on the element
            setTimeout( function() {
                if ( !jQuery.data( elem, queueDataKey, undefined, true ) &&
                    !jQuery.data( elem, markDataKey, undefined, true ) ) {
                    jQuery.removeData( elem, deferDataKey, true );
                    defer.resolve();
                }
            }, 0 );
        }
    }

    jQuery.extend({

        _mark: function( elem, type ) {
            if ( elem ) {
                type = (type || "fx") + "mark";
                jQuery.data( elem, type, (jQuery.data(elem,type,undefined,true) || 0) + 1, true );
            }
        },

        _unmark: function( force, elem, type ) {
            if ( force !== true ) {
                type = elem;
                elem = force;
                force = false;
            }
            if ( elem ) {
                type = type || "fx";
                var key = type + "mark",
                    count = force ? 0 : ( (jQuery.data( elem, key, undefined, true) || 1 ) - 1 );
                if ( count ) {
                    jQuery.data( elem, key, count, true );
                } else {
                    jQuery.removeData( elem, key, true );
                    handleQueueMarkDefer( elem, type, "mark" );
                }
            }
        },

        queue: function( elem, type, data ) {
            if ( elem ) {
                type = (type || "fx") + "queue";
                var q = jQuery.data( elem, type, undefined, true );
                // Speed up dequeue by getting out quickly if this is just a lookup
                if ( data ) {
                    if ( !q || jQuery.isArray(data) ) {
                        q = jQuery.data( elem, type, jQuery.makeArray(data), true );
                    } else {
                        q.push( data );
                    }
                }
                return q || [];
            }
        },

        dequeue: function( elem, type ) {
            type = type || "fx";

            var queue = jQuery.queue( elem, type ),
                fn = queue.shift(),
                defer;

            // If the fx queue is dequeued, always remove the progress sentinel
            if ( fn === "inprogress" ) {
                fn = queue.shift();
            }

            if ( fn ) {
                // Add a progress sentinel to prevent the fx queue from being
                // automatically dequeued
                if ( type === "fx" ) {
                    queue.unshift("inprogress");
                }

                fn.call(elem, function() {
                    jQuery.dequeue(elem, type);
                });
            }

            if ( !queue.length ) {
                jQuery.removeData( elem, type + "queue", true );
                handleQueueMarkDefer( elem, type, "queue" );
            }
        }
    });

    jQuery.fn.extend({
        queue: function( type, data ) {
            if ( typeof type !== "string" ) {
                data = type;
                type = "fx";
            }

            if ( data === undefined ) {
                return jQuery.queue( this[0], type );
            }
            return this.each(function() {
                var queue = jQuery.queue( this, type, data );

                if ( type === "fx" && queue[0] !== "inprogress" ) {
                    jQuery.dequeue( this, type );
                }
            });
        },
        dequeue: function( type ) {
            return this.each(function() {
                jQuery.dequeue( this, type );
            });
        },
        // Based off of the plugin by Clint Helfers, with permission.
        // http://blindsignals.com/index.php/2009/07/jquery-delay/
        delay: function( time, type ) {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";

            return this.queue( type, function() {
                var elem = this;
                setTimeout(function() {
                    jQuery.dequeue( elem, type );
                }, time );
            });
        },
        clearQueue: function( type ) {
            return this.queue( type || "fx", [] );
        },
        // Get a promise resolved when queues of a certain type
        // are emptied (fx is the type by default)
        promise: function( type, object ) {
            if ( typeof type !== "string" ) {
                object = type;
                type = undefined;
            }
            type = type || "fx";
            var defer = jQuery.Deferred(),
                elements = this,
                i = elements.length,
                count = 1,
                deferDataKey = type + "defer",
                queueDataKey = type + "queue",
                markDataKey = type + "mark",
                tmp;
            function resolve() {
                if ( !( --count ) ) {
                    defer.resolveWith( elements, [ elements ] );
                }
            }
            while( i-- ) {
                if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
                        ( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
                            jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
                        jQuery.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
                    count++;
                    tmp.done( resolve );
                }
            }
            resolve();
            return defer.promise();
        }
    });


    /*! 第6部分：属性操作 */

    var rclass = /[\n\t\r]/g,
        rspace = /\s+/,
        rreturn = /\r/g,
        rtype = /^(?:button|input)$/i,
        rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea)?$/i,
        rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        rinvalidChar = /\:/,
        formHook, boolHook;

    jQuery.fn.extend({
        attr: function( name, value ) {
            return jQuery.access( this, name, value, true, jQuery.attr );
        },

        removeAttr: function( name ) {
            return this.each(function() {
                jQuery.removeAttr( this, name );
            });
        },

        prop: function( name, value ) {
            return jQuery.access( this, name, value, true, jQuery.prop );
        },

        removeProp: function( name ) {
            name = jQuery.propFix[ name ] || name;
            return this.each(function() {
                // try/catch handles cases where IE balks (such as removing a property on window)
                try {
                    this[ name ] = undefined;
                    delete this[ name ];
                } catch( e ) {}
            });
        },

        addClass: function( value ) {
            if ( jQuery.isFunction( value ) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.addClass( value.call(this, i, self.attr("class") || "") );
                });
            }

            if ( value && typeof value === "string" ) {
                var classNames = (value || "").split( rspace );

                for ( var i = 0, l = this.length; i < l; i++ ) {
                    var elem = this[i];

                    if ( elem.nodeType === 1 ) {
                        if ( !elem.className ) {
                            elem.className = value;

                        } else {
                            var className = " " + elem.className + " ",
                                setClass = elem.className;

                            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                                if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
                                    setClass += " " + classNames[c];
                                }
                            }
                            elem.className = jQuery.trim( setClass );
                        }
                    }
                }
            }

            return this;
        },

        removeClass: function( value ) {
            if ( jQuery.isFunction(value) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.removeClass( value.call(this, i, self.attr("class")) );
                });
            }

            if ( (value && typeof value === "string") || value === undefined ) {
                var classNames = (value || "").split( rspace );

                for ( var i = 0, l = this.length; i < l; i++ ) {
                    var elem = this[i];

                    if ( elem.nodeType === 1 && elem.className ) {
                        if ( value ) {
                            var className = (" " + elem.className + " ").replace(rclass, " ");
                            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                                className = className.replace(" " + classNames[c] + " ", " ");
                            }
                            elem.className = jQuery.trim( className );

                        } else {
                            elem.className = "";
                        }
                    }
                }
            }

            return this;
        },

        toggleClass: function( value, stateVal ) {
            var type = typeof value,
                isBool = typeof stateVal === "boolean";

            if ( jQuery.isFunction( value ) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
                });
            }

            return this.each(function() {
                if ( type === "string" ) {
                    // toggle individual class names
                    var className,
                        i = 0,
                        self = jQuery( this ),
                        state = stateVal,
                        classNames = value.split( rspace );

                    while ( (className = classNames[ i++ ]) ) {
                        // check each className given, space seperated list
                        state = isBool ? state : !self.hasClass( className );
                        self[ state ? "addClass" : "removeClass" ]( className );
                    }

                } else if ( type === "undefined" || type === "boolean" ) {
                    if ( this.className ) {
                        // store className if set
                        jQuery._data( this, "__className__", this.className );
                    }

                    // toggle whole className
                    this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
                }
            });
        },

        hasClass: function( selector ) {
            var className = " " + selector + " ";
            for ( var i = 0, l = this.length; i < l; i++ ) {
                if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
                    return true;
                }
            }

            return false;
        },

        val: function( value ) {
            var hooks, ret,
                elem = this[0];

            if ( !arguments.length ) {
                if ( elem ) {
                    hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

                    if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                        return ret;
                    }

                    return (elem.value || "").replace(rreturn, "");
                }

                return undefined;
            }

            var isFunction = jQuery.isFunction( value );

            return this.each(function( i ) {
                var self = jQuery(this), val;

                if ( this.nodeType !== 1 ) {
                    return;
                }

                if ( isFunction ) {
                    val = value.call( this, i, self.val() );
                } else {
                    val = value;
                }

                // Treat null/undefined as ""; convert numbers to string
                if ( val == null ) {
                    val = "";
                } else if ( typeof val === "number" ) {
                    val += "";
                } else if ( jQuery.isArray( val ) ) {
                    val = jQuery.map(val, function ( value ) {
                        return value == null ? "" : value + "";
                    });
                }

                hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

                // If set returns undefined, fall back to normal setting
                if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                    this.value = val;
                }
            });
        }
    });

    jQuery.extend({
        valHooks: {
            option: {
                get: function( elem ) {
                    // attributes.value is undefined in Blackberry 4.7 but
                    // uses .value. See #6932
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            select: {
                get: function( elem ) {
                    var value,
                        index = elem.selectedIndex,
                        values = [],
                        options = elem.options,
                        one = elem.type === "select-one";

                    // Nothing was selected
                    if ( index < 0 ) {
                        return null;
                    }

                    // Loop through all the selected options
                    for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
                        var option = options[ i ];

                        // Don't return options that are disabled or in a disabled optgroup
                        if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
                                (!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

                            // Get the specific value for the option
                            value = jQuery( option ).val();

                            // We don't need an array for one selects
                            if ( one ) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push( value );
                        }
                    }

                    // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
                    if ( one && !values.length && options.length ) {
                        return jQuery( options[ index ] ).val();
                    }

                    return values;
                },

                set: function( elem, value ) {
                    var values = jQuery.makeArray( value );

                    jQuery(elem).find("option").each(function() {
                        this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
                    });

                    if ( !values.length ) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        },

        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },

        attrFix: {
            // Always normalize to ensure hook usage
            tabindex: "tabIndex"
        },

        attr: function( elem, name, value, pass ) {
            var nType = elem.nodeType;

            // don't get/set attributes on text, comment and attribute nodes
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return undefined;
            }

            if ( pass && name in jQuery.attrFn ) {
                return jQuery( elem )[ name ]( value );
            }

            // Fallback to prop when attributes are not supported
            if ( !("getAttribute" in elem) ) {
                return jQuery.prop( elem, name, value );
            }

            var ret, hooks,
                notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

            // Normalize the name if needed
            name = notxml && jQuery.attrFix[ name ] || name;

            hooks = jQuery.attrHooks[ name ];

            if ( !hooks ) {
                // Use boolHook for boolean attributes
                if ( rboolean.test( name ) &&
                    (typeof value === "boolean" || value === undefined || value.toLowerCase() === name.toLowerCase()) ) {

                    hooks = boolHook;

                // Use formHook for forms and if the name contains certain characters
                } else if ( formHook && (jQuery.nodeName( elem, "form" ) || rinvalidChar.test( name )) ) {
                    hooks = formHook;
                }
            }

            if ( value !== undefined ) {

                if ( value === null ) {
                    jQuery.removeAttr( elem, name );
                    return undefined;

                } else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
                    return ret;

                } else {
                    elem.setAttribute( name, "" + value );
                    return value;
                }

            } else if ( hooks && "get" in hooks && notxml ) {
                return hooks.get( elem, name );

            } else {

                ret = elem.getAttribute( name );

                // Non-existent attributes return null, we normalize to undefined
                return ret === null ?
                    undefined :
                    ret;
            }
        },

        removeAttr: function( elem, name ) {
            var propName;
            if ( elem.nodeType === 1 ) {
                name = jQuery.attrFix[ name ] || name;

                if ( jQuery.support.getSetAttribute ) {
                    // Use removeAttribute in browsers that support it
                    elem.removeAttribute( name );
                } else {
                    jQuery.attr( elem, name, "" );
                    elem.removeAttributeNode( elem.getAttributeNode( name ) );
                }

                // Set corresponding property to false for boolean attributes
                if ( rboolean.test( name ) && (propName = jQuery.propFix[ name ] || name) in elem ) {
                    elem[ propName ] = false;
                }
            }
        },

        attrHooks: {
            type: {
                set: function( elem, value ) {
                    // We can't allow the type property to be changed (since it causes problems in IE)
                    if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
                        jQuery.error( "type property can't be changed" );
                    } else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
                        // Setting the type on a radio button after the value resets the value in IE6-9
                        // Reset value to it's default in case type is set after value
                        // This is for element creation
                        var val = elem.value;
                        elem.setAttribute( "type", value );
                        if ( val ) {
                            elem.value = val;
                        }
                        return value;
                    }
                }
            },
            tabIndex: {
                get: function( elem ) {
                    // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                    // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                    var attributeNode = elem.getAttributeNode("tabIndex");

                    return attributeNode && attributeNode.specified ?
                        parseInt( attributeNode.value, 10 ) :
                        rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
                            0 :
                            undefined;
                }
            }
        },

        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },

        prop: function( elem, name, value ) {
            var nType = elem.nodeType;

            // don't get/set properties on text, comment and attribute nodes
            if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
                return undefined;
            }

            var ret, hooks,
                notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

            // Try to normalize/fix the name
            name = notxml && jQuery.propFix[ name ] || name;

            hooks = jQuery.propHooks[ name ];

            if ( value !== undefined ) {
                if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
                    return ret;

                } else {
                    return (elem[ name ] = value);
                }

            } else {
                if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== undefined ) {
                    return ret;

                } else {
                    return elem[ name ];
                }
            }
        },

        propHooks: {}
    });

    // Hook for boolean attributes
    boolHook = {
        get: function( elem, name ) {
            // Align boolean attributes with corresponding properties
            return elem[ jQuery.propFix[ name ] || name ] ?
                name.toLowerCase() :
                undefined;
        },
        set: function( elem, value, name ) {
            var propName;
            if ( value === false ) {
                // Remove boolean attributes when set to false
                jQuery.removeAttr( elem, name );
            } else {
                // value is true since we know at this point it's type boolean and not false
                // Set boolean attributes to the same name and set the DOM property
                propName = jQuery.propFix[ name ] || name;
                if ( propName in elem ) {
                    // Only set the IDL specifically if it already exists on the element
                    elem[ propName ] = value;
                }

                elem.setAttribute( name, name.toLowerCase() );
            }
            return name;
        }
    };

    // Use the value property for back compat
    // Use the formHook for button elements in IE6/7 (#1954)
    jQuery.attrHooks.value = {
        get: function( elem, name ) {
            if ( formHook && jQuery.nodeName( elem, "button" ) ) {
                return formHook.get( elem, name );
            }
            return elem.value;
        },
        set: function( elem, value, name ) {
            if ( formHook && jQuery.nodeName( elem, "button" ) ) {
                return formHook.set( elem, value, name );
            }
            // Does not return so that setAttribute is also used
            elem.value = value;
        }
    };

    // IE6/7 do not support getting/setting some attributes with get/setAttribute
    if ( !jQuery.support.getSetAttribute ) {

        // propFix is more comprehensive and contains all fixes
        jQuery.attrFix = jQuery.propFix;

        // Use this for any attribute on a form in IE6/7
        formHook = jQuery.attrHooks.name = jQuery.valHooks.button = {
            get: function( elem, name ) {
                var ret;
                ret = elem.getAttributeNode( name );
                // Return undefined if nodeValue is empty string
                return ret && ret.nodeValue !== "" ?
                    ret.nodeValue :
                    undefined;
            },
            set: function( elem, value, name ) {
                // Check form objects in IE (multiple bugs related)
                // Only use nodeValue if the attribute node exists on the form
                var ret = elem.getAttributeNode( name );
                if ( ret ) {
                    ret.nodeValue = value;
                    return value;
                }
            }
        };

        // Set width and height to auto instead of 0 on empty string( Bug #8150 )
        // This is for removals
        jQuery.each([ "width", "height" ], function( i, name ) {
            jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
                set: function( elem, value ) {
                    if ( value === "" ) {
                        elem.setAttribute( name, "auto" );
                        return value;
                    }
                }
            });
        });
    }


    // Some attributes require a special call on IE
    if ( !jQuery.support.hrefNormalized ) {
        jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
            jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
                get: function( elem ) {
                    var ret = elem.getAttribute( name, 2 );
                    return ret === null ? undefined : ret;
                }
            });
        });
    }

    if ( !jQuery.support.style ) {
        jQuery.attrHooks.style = {
            get: function( elem ) {
                // Return undefined in the case of empty string
                // Normalize to lowercase since IE uppercases css property names
                return elem.style.cssText.toLowerCase() || undefined;
            },
            set: function( elem, value ) {
                return (elem.style.cssText = "" + value);
            }
        };
    }

    // Safari mis-reports the default selected property of an option
    // Accessing the parent's selectedIndex property fixes it
    if ( !jQuery.support.optSelected ) {
        jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
            get: function( elem ) {
                var parent = elem.parentNode;

                if ( parent ) {
                    parent.selectedIndex;

                    // Make sure that it also works with optgroups, see #5701
                    if ( parent.parentNode ) {
                        parent.parentNode.selectedIndex;
                    }
                }
            }
        });
    }

    // Radios and checkboxes getter/setter
    if ( !jQuery.support.checkOn ) {
        jQuery.each([ "radio", "checkbox" ], function() {
            jQuery.valHooks[ this ] = {
                get: function( elem ) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                }
            };
        });
    }
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
            set: function( elem, value ) {
                if ( jQuery.isArray( value ) ) {
                    return (elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0);
                }
            }
        });
    });


    /*! 第7部分：事件处理 */

    var hasOwn = Object.prototype.hasOwnProperty,
        rnamespaces = /\.(.*)$/,
        rformElems = /^(?:textarea|input|select)$/i,
        rperiod = /\./g,
        rspaces = / /g,
        rescape = /[^\w\s.|`]/g,
        fcleanup = function( nm ) {
            return nm.replace(rescape, "\\$&");
        };

    /*
     * A number of helper functions used for managing events.
     * Many of the ideas behind this code originated from
     * Dean Edwards' addEvent library.
     */
    jQuery.event = {

        // Bind an event to an element
        // Original by Dean Edwards
        add: function( elem, types, handler, data ) {
            if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
                return;
            }

            if ( handler === false ) {
                handler = returnFalse;
            } else if ( !handler ) {
                // Fixes bug #7229. Fix recommended by jdalton
                return;
            }

            var handleObjIn, handleObj;

            if ( handler.handler ) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
            }

            // Make sure that the function being executed has a unique ID
            if ( !handler.guid ) {
                handler.guid = jQuery.guid++;
            }

            // Init the element's event structure
            var elemData = jQuery._data( elem );

            // If no elemData is found then we must be trying to bind to one of the
            // banned noData elements
            if ( !elemData ) {
                return;
            }

            var events = elemData.events,
                eventHandle = elemData.handle;

            if ( !events ) {
                elemData.events = events = {};
            }

            if ( !eventHandle ) {
                elemData.handle = eventHandle = function( e ) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
                        jQuery.event.handle.apply( eventHandle.elem, arguments ) :
                        undefined;
                };
            }

            // Add elem as a property of the handle function
            // This is to prevent a memory leak with non-native events in IE.
            eventHandle.elem = elem;

            // Handle multiple events separated by a space
            // jQuery(...).bind("mouseover mouseout", fn);
            types = types.split(" ");

            var type, i = 0, namespaces;

            while ( (type = types[ i++ ]) ) {
                handleObj = handleObjIn ?
                    jQuery.extend({}, handleObjIn) :
                    { handler: handler, data: data };

                // Namespaced event handlers
                if ( type.indexOf(".") > -1 ) {
                    namespaces = type.split(".");
                    type = namespaces.shift();
                    handleObj.namespace = namespaces.slice(0).sort().join(".");

                } else {
                    namespaces = [];
                    handleObj.namespace = "";
                }

                handleObj.type = type;
                if ( !handleObj.guid ) {
                    handleObj.guid = handler.guid;
                }

                // Get the current list of functions bound to this event
                var handlers = events[ type ],
                    special = jQuery.event.special[ type ] || {};

                // Init the event handler queue
                if ( !handlers ) {
                    handlers = events[ type ] = [];

                    // Check for a special event handler
                    // Only use addEventListener/attachEvent if the special
                    // events handler returns false
                    if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
                        // Bind the global event handler to the element
                        if ( elem.addEventListener ) {
                            elem.addEventListener( type, eventHandle, false );

                        } else if ( elem.attachEvent ) {
                            elem.attachEvent( "on" + type, eventHandle );
                        }
                    }
                }

                if ( special.add ) {
                    special.add.call( elem, handleObj );

                    if ( !handleObj.handler.guid ) {
                        handleObj.handler.guid = handler.guid;
                    }
                }

                // Add the function to the element's handler list
                handlers.push( handleObj );

                // Keep track of which events have been used, for event optimization
                jQuery.event.global[ type ] = true;
            }

            // Nullify elem to prevent memory leaks in IE
            elem = null;
        },

        global: {},

        // Detach an event or set of events from an element
        remove: function( elem, types, handler, pos ) {
            // don't do events on text and comment nodes
            if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
                return;
            }

            if ( handler === false ) {
                handler = returnFalse;
            }

            var ret, type, fn, j, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
                elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
                events = elemData && elemData.events;

            if ( !elemData || !events ) {
                return;
            }

            // types is actually an event object here
            if ( types && types.type ) {
                handler = types.handler;
                types = types.type;
            }

            // Unbind all events for the element
            if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
                types = types || "";

                for ( type in events ) {
                    jQuery.event.remove( elem, type + types );
                }

                return;
            }

            // Handle multiple events separated by a space
            // jQuery(...).unbind("mouseover mouseout", fn);
            types = types.split(" ");

            while ( (type = types[ i++ ]) ) {
                origType = type;
                handleObj = null;
                all = type.indexOf(".") < 0;
                namespaces = [];

                if ( !all ) {
                    // Namespaced event handlers
                    namespaces = type.split(".");
                    type = namespaces.shift();

                    namespace = new RegExp("(^|\\.)" +
                        jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)");
                }

                eventType = events[ type ];

                if ( !eventType ) {
                    continue;
                }

                if ( !handler ) {
                    for ( j = 0; j < eventType.length; j++ ) {
                        handleObj = eventType[ j ];

                        if ( all || namespace.test( handleObj.namespace ) ) {
                            jQuery.event.remove( elem, origType, handleObj.handler, j );
                            eventType.splice( j--, 1 );
                        }
                    }

                    continue;
                }

                special = jQuery.event.special[ type ] || {};

                for ( j = pos || 0; j < eventType.length; j++ ) {
                    handleObj = eventType[ j ];

                    if ( handler.guid === handleObj.guid ) {
                        // remove the given handler for the given type
                        if ( all || namespace.test( handleObj.namespace ) ) {
                            if ( pos == null ) {
                                eventType.splice( j--, 1 );
                            }

                            if ( special.remove ) {
                                special.remove.call( elem, handleObj );
                            }
                        }

                        if ( pos != null ) {
                            break;
                        }
                    }
                }

                // remove generic event handler if no more handlers exist
                if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
                    if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
                        jQuery.removeEvent( elem, type, elemData.handle );
                    }

                    ret = null;
                    delete events[ type ];
                }
            }

            // Remove the expando if it's no longer used
            if ( jQuery.isEmptyObject( events ) ) {
                var handle = elemData.handle;
                if ( handle ) {
                    handle.elem = null;
                }

                delete elemData.events;
                delete elemData.handle;

                if ( jQuery.isEmptyObject( elemData ) ) {
                    jQuery.removeData( elem, undefined, true );
                }
            }
        },

        // Events that are safe to short-circuit if no handlers are attached.
        // Native DOM events should not be added, they may have inline handlers.
        customEvent: {
            "getData": true,
            "setData": true,
            "changeData": true
        },

        trigger: function( event, data, elem, onlyHandlers ) {
            // Event object or event type
            var type = event.type || event,
                namespaces = [],
                exclusive;

            if ( type.indexOf("!") >= 0 ) {
                // Exclusive events trigger only for the exact event (no namespaces)
                type = type.slice(0, -1);
                exclusive = true;
            }

            if ( type.indexOf(".") >= 0 ) {
                // Namespaced trigger; create a regexp to match event type in handle()
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }

            if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
                // No jQuery handlers for this event type, and it can't have inline handlers
                return;
            }

            // Caller can pass in an Event, Object, or just an event type string
            event = typeof event === "object" ?
                // jQuery.Event object
                event[ jQuery.expando ] ? event :
                // Object literal
                new jQuery.Event( type, event ) :
                // Just the event type (string)
                new jQuery.Event( type );

            event.type = type;
            event.exclusive = exclusive;
            event.namespace = namespaces.join(".");
            event.namespace_re = new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)");

            // triggerHandler() and global events don't bubble or run the default action
            if ( onlyHandlers || !elem ) {
                event.preventDefault();
                event.stopPropagation();
            }

            // Handle a global trigger
            if ( !elem ) {
                // TODO: Stop taunting the data cache; remove global events and always attach to document
                jQuery.each( jQuery.cache, function() {
                    // internalKey variable is just used to make it easier to find
                    // and potentially change this stuff later; currently it just
                    // points to jQuery.expando
                    var internalKey = jQuery.expando,
                        internalCache = this[ internalKey ];
                    if ( internalCache && internalCache.events && internalCache.events[ type ] ) {
                        jQuery.event.trigger( event, data, internalCache.handle.elem );
                    }
                });
                return;
            }

            // Don't do events on text and comment nodes
            if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
                return;
            }

            // Clean up the event in case it is being reused
            event.result = undefined;
            event.target = elem;

            // Clone any incoming data and prepend the event, creating the handler arg list
            data = data ? jQuery.makeArray( data ) : [];
            data.unshift( event );

            var cur = elem,
                // IE doesn't like method names with a colon (#3533, #8272)
                ontype = type.indexOf(":") < 0 ? "on" + type : "";

            // Fire event on the current element, then bubble up the DOM tree
            do {
                var handle = jQuery._data( cur, "handle" );

                event.currentTarget = cur;
                if ( handle ) {
                    handle.apply( cur, data );
                }

                // Trigger an inline bound script
                if ( ontype && jQuery.acceptData( cur ) && cur[ ontype ] && cur[ ontype ].apply( cur, data ) === false ) {
                    event.result = false;
                    event.preventDefault();
                }

                // Bubble up to document, then to window
                cur = cur.parentNode || cur.ownerDocument || cur === event.target.ownerDocument && window;
            } while ( cur && !event.isPropagationStopped() );

            // If nobody prevented the default action, do it now
            if ( !event.isDefaultPrevented() ) {
                var old,
                    special = jQuery.event.special[ type ] || {};

                if ( (!special._default || special._default.call( elem.ownerDocument, event ) === false) &&
                    !(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

                    // Call a native DOM method on the target with the same name name as the event.
                    // Can't use an .isFunction)() check here because IE6/7 fails that test.
                    // IE<9 dies on focus to hidden element (#1486), may want to revisit a try/catch.
                    try {
                        if ( ontype && elem[ type ] ) {
                            // Don't re-trigger an onFOO event when we call its FOO() method
                            old = elem[ ontype ];

                            if ( old ) {
                                elem[ ontype ] = null;
                            }

                            jQuery.event.triggered = type;
                            elem[ type ]();
                        }
                    } catch ( ieError ) {}

                    if ( old ) {
                        elem[ ontype ] = old;
                    }

                    jQuery.event.triggered = undefined;
                }
            }

            return event.result;
        },

        handle: function( event ) {
            event = jQuery.event.fix( event || window.event );
            // Snapshot the handlers list since a called handler may add/remove events.
            var handlers = ((jQuery._data( this, "events" ) || {})[ event.type ] || []).slice(0),
                run_all = !event.exclusive && !event.namespace,
                args = Array.prototype.slice.call( arguments, 0 );

            // Use the fix-ed Event rather than the (read-only) native event
            args[0] = event;
            event.currentTarget = this;

            for ( var j = 0, l = handlers.length; j < l; j++ ) {
                var handleObj = handlers[ j ];

                // Triggered event must 1) be non-exclusive and have no namespace, or
                // 2) have namespace(s) a subset or equal to those in the bound event.
                if ( run_all || event.namespace_re.test( handleObj.namespace ) ) {
                    // Pass in a reference to the handler function itself
                    // So that we can later remove it
                    event.handler = handleObj.handler;
                    event.data = handleObj.data;
                    event.handleObj = handleObj;

                    var ret = handleObj.handler.apply( this, args );

                    if ( ret !== undefined ) {
                        event.result = ret;
                        if ( ret === false ) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }

                    if ( event.isImmediatePropagationStopped() ) {
                        break;
                    }
                }
            }
            return event.result;
        },

        props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

        fix: function( event ) {
            if ( event[ jQuery.expando ] ) {
                return event;
            }

            // store a copy of the original event object
            // and "clone" to set read-only properties
            var originalEvent = event;
            event = jQuery.Event( originalEvent );

            for ( var i = this.props.length, prop; i; ) {
                prop = this.props[ --i ];
                event[ prop ] = originalEvent[ prop ];
            }

            // Fix target property, if necessary
            if ( !event.target ) {
                // Fixes #1925 where srcElement might not be defined either
                event.target = event.srcElement || document;
            }

            // check if target is a textnode (safari)
            if ( event.target.nodeType === 3 ) {
                event.target = event.target.parentNode;
            }

            // Add relatedTarget, if necessary
            if ( !event.relatedTarget && event.fromElement ) {
                event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
            }

            // Calculate pageX/Y if missing and clientX/Y available
            if ( event.pageX == null && event.clientX != null ) {
                var eventDocument = event.target.ownerDocument || document,
                    doc = eventDocument.documentElement,
                    body = eventDocument.body;

                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
            }

            // Add which for key events
            if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
                event.which = event.charCode != null ? event.charCode : event.keyCode;
            }

            // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if ( !event.metaKey && event.ctrlKey ) {
                event.metaKey = event.ctrlKey;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if ( !event.which && event.button !== undefined ) {
                event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
            }

            return event;
        },

        // Deprecated, use jQuery.guid instead
        guid: 1E8,

        // Deprecated, use jQuery.proxy instead
        proxy: jQuery.proxy,

        special: {
            ready: {
                // Make sure the ready event is setup
                setup: jQuery.bindReady,
                teardown: jQuery.noop
            },

            live: {
                add: function( handleObj ) {
                    jQuery.event.add( this,
                        liveConvert( handleObj.origType, handleObj.selector ),
                        jQuery.extend({}, handleObj, {handler: liveHandler, guid: handleObj.handler.guid}) );
                },

                remove: function( handleObj ) {
                    jQuery.event.remove( this, liveConvert( handleObj.origType, handleObj.selector ), handleObj );
                }
            },

            beforeunload: {
                setup: function( data, namespaces, eventHandle ) {
                    // We only want to do this special case on windows
                    if ( jQuery.isWindow( this ) ) {
                        this.onbeforeunload = eventHandle;
                    }
                },

                teardown: function( namespaces, eventHandle ) {
                    if ( this.onbeforeunload === eventHandle ) {
                        this.onbeforeunload = null;
                    }
                }
            }
        }
    };

    jQuery.removeEvent = document.removeEventListener ?
        function( elem, type, handle ) {
            if ( elem.removeEventListener ) {
                elem.removeEventListener( type, handle, false );
            }
        } :
        function( elem, type, handle ) {
            if ( elem.detachEvent ) {
                elem.detachEvent( "on" + type, handle );
            }
        };

    jQuery.Event = function( src, props ) {
        // Allow instantiation without the 'new' keyword
        if ( !this.preventDefault ) {
            return new jQuery.Event( src, props );
        }

        // Event object
        if ( src && src.type ) {
            this.originalEvent = src;
            this.type = src.type;

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            this.isDefaultPrevented = (src.defaultPrevented || src.returnValue === false ||
                src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

        // Event type
        } else {
            this.type = src;
        }

        // Put explicitly provided properties onto the event object
        if ( props ) {
            jQuery.extend( this, props );
        }

        // timeStamp is buggy for some events on Firefox(#3843)
        // So we won't rely on the native value
        this.timeStamp = jQuery.now();

        // Mark it as fixed
        this[ jQuery.expando ] = true;
    };

    function returnFalse() {
        return false;
    }
    function returnTrue() {
        return true;
    }

    // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    jQuery.Event.prototype = {
        preventDefault: function() {
            this.isDefaultPrevented = returnTrue;

            var e = this.originalEvent;
            if ( !e ) {
                return;
            }

            // if preventDefault exists run it on the original event
            if ( e.preventDefault ) {
                e.preventDefault();

            // otherwise set the returnValue property of the original event to false (IE)
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function() {
            this.isPropagationStopped = returnTrue;

            var e = this.originalEvent;
            if ( !e ) {
                return;
            }
            // if stopPropagation exists run it on the original event
            if ( e.stopPropagation ) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            e.cancelBubble = true;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        },
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse
    };

    // Checks if an event happened on an element within another element
    // Used in jQuery.event.special.mouseenter and mouseleave handlers
    var withinElement = function( event ) {
        // Check if mouse(over|out) are still within the same parent element
        var parent = event.relatedTarget;

        // set the correct event type
        event.type = event.data;

        // Firefox sometimes assigns relatedTarget a XUL element
        // which we cannot access the parentNode property of
        try {

            // Chrome does something similar, the parentNode property
            // can be accessed but is null.
            if ( parent && parent !== document && !parent.parentNode ) {
                return;
            }

            // Traverse up the tree
            while ( parent && parent !== this ) {
                parent = parent.parentNode;
            }

            if ( parent !== this ) {
                // handle event if we actually just moused on to a non sub-element
                jQuery.event.handle.apply( this, arguments );
            }

        // assuming we've left the element since we most likely mousedover a xul element
        } catch(e) { }
    },

    // In case of event delegation, we only need to rename the event.type,
    // liveHandler will take care of the rest.
    delegate = function( event ) {
        event.type = event.data;
        jQuery.event.handle.apply( this, arguments );
    };

    // Create mouseenter and mouseleave events
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function( orig, fix ) {
        jQuery.event.special[ orig ] = {
            setup: function( data ) {
                jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
            },
            teardown: function( data ) {
                jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
            }
        };
    });

    // submit delegation
    if ( !jQuery.support.submitBubbles ) {

        jQuery.event.special.submit = {
            setup: function( data, namespaces ) {
                if ( !jQuery.nodeName( this, "form" ) ) {
                    jQuery.event.add(this, "click.specialSubmit", function( e ) {
                        var elem = e.target,
                            type = elem.type;

                        if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
                            trigger( "submit", this, arguments );
                        }
                    });

                    jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
                        var elem = e.target,
                            type = elem.type;

                        if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
                            trigger( "submit", this, arguments );
                        }
                    });

                } else {
                    return false;
                }
            },

            teardown: function( namespaces ) {
                jQuery.event.remove( this, ".specialSubmit" );
            }
        };

    }

    // change delegation, happens here so we have bind.
    if ( !jQuery.support.changeBubbles ) {

        var changeFilters,

        getVal = function( elem ) {
            var type = elem.type, val = elem.value;

            if ( type === "radio" || type === "checkbox" ) {
                val = elem.checked;

            } else if ( type === "select-multiple" ) {
                val = elem.selectedIndex > -1 ?
                    jQuery.map( elem.options, function( elem ) {
                        return elem.selected;
                    }).join("-") :
                    "";

            } else if ( jQuery.nodeName( elem, "select" ) ) {
                val = elem.selectedIndex;
            }

            return val;
        },

        testChange = function testChange( e ) {
            var elem = e.target, data, val;

            if ( !rformElems.test( elem.nodeName ) || elem.readOnly ) {
                return;
            }

            data = jQuery._data( elem, "_change_data" );
            val = getVal(elem);

            // the current data will be also retrieved by beforeactivate
            if ( e.type !== "focusout" || elem.type !== "radio" ) {
                jQuery._data( elem, "_change_data", val );
            }

            if ( data === undefined || val === data ) {
                return;
            }

            if ( data != null || val ) {
                e.type = "change";
                e.liveFired = undefined;
                jQuery.event.trigger( e, arguments[1], elem );
            }
        };

        jQuery.event.special.change = {
            filters: {
                focusout: testChange,

                beforedeactivate: testChange,

                click: function( e ) {
                    var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

                    if ( type === "radio" || type === "checkbox" || jQuery.nodeName( elem, "select" ) ) {
                        testChange.call( this, e );
                    }
                },

                // Change has to be called before submit
                // Keydown will be called before keypress, which is used in submit-event delegation
                keydown: function( e ) {
                    var elem = e.target, type = jQuery.nodeName( elem, "input" ) ? elem.type : "";

                    if ( (e.keyCode === 13 && !jQuery.nodeName( elem, "textarea" ) ) ||
                        (e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
                        type === "select-multiple" ) {
                        testChange.call( this, e );
                    }
                },

                // Beforeactivate happens also before the previous element is blurred
                // with this event you can't trigger a change event, but you can store
                // information
                beforeactivate: function( e ) {
                    var elem = e.target;
                    jQuery._data( elem, "_change_data", getVal(elem) );
                }
            },

            setup: function( data, namespaces ) {
                if ( this.type === "file" ) {
                    return false;
                }

                for ( var type in changeFilters ) {
                    jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
                }

                return rformElems.test( this.nodeName );
            },

            teardown: function( namespaces ) {
                jQuery.event.remove( this, ".specialChange" );

                return rformElems.test( this.nodeName );
            }
        };

        changeFilters = jQuery.event.special.change.filters;

        // Handle when the input is .focus()'d
        changeFilters.focus = changeFilters.beforeactivate;
    }

    function trigger( type, elem, args ) {
        // Piggyback on a donor event to simulate a different one.
        // Fake originalEvent to avoid donor's stopPropagation, but if the
        // simulated event prevents default then we do the same on the donor.
        // Don't pass args or remember liveFired; they apply to the donor event.
        var event = jQuery.extend( {}, args[ 0 ] );
        event.type = type;
        event.originalEvent = {};
        event.liveFired = undefined;
        jQuery.event.handle.call( elem, event );
        if ( event.isDefaultPrevented() ) {
            args[ 0 ].preventDefault();
        }
    }

    // Create "bubbling" focus and blur events
    if ( !jQuery.support.focusinBubbles ) {
        jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

            // Attach a single capturing handler while someone wants focusin/focusout
            var attaches = 0;

            jQuery.event.special[ fix ] = {
                setup: function() {
                    if ( attaches++ === 0 ) {
                        document.addEventListener( orig, handler, true );
                    }
                },
                teardown: function() {
                    if ( --attaches === 0 ) {
                        document.removeEventListener( orig, handler, true );
                    }
                }
            };

            function handler( donor ) {
                // Donor event is always a native one; fix it and switch its type.
                // Let focusin/out handler cancel the donor focus/blur event.
                var e = jQuery.event.fix( donor );
                e.type = fix;
                e.originalEvent = {};
                jQuery.event.trigger( e, null, e.target );
                if ( e.isDefaultPrevented() ) {
                    donor.preventDefault();
                }
            }
        });
    }

    jQuery.each(["bind", "one"], function( i, name ) {
        jQuery.fn[ name ] = function( type, data, fn ) {
            var handler;

            // Handle object literals
            if ( typeof type === "object" ) {
                for ( var key in type ) {
                    this[ name ](key, data, type[key], fn);
                }
                return this;
            }

            if ( arguments.length === 2 || data === false ) {
                fn = data;
                data = undefined;
            }

            if ( name === "one" ) {
                handler = function( event ) {
                    jQuery( this ).unbind( event, handler );
                    return fn.apply( this, arguments );
                };
                handler.guid = fn.guid || jQuery.guid++;
            } else {
                handler = fn;
            }

            if ( type === "unload" && name !== "one" ) {
                this.one( type, data, fn );

            } else {
                for ( var i = 0, l = this.length; i < l; i++ ) {
                    jQuery.event.add( this[i], type, handler, data );
                }
            }

            return this;
        };
    });

    jQuery.fn.extend({
        unbind: function( type, fn ) {
            // Handle object literals
            if ( typeof type === "object" && !type.preventDefault ) {
                for ( var key in type ) {
                    this.unbind(key, type[key]);
                }

            } else {
                for ( var i = 0, l = this.length; i < l; i++ ) {
                    jQuery.event.remove( this[i], type, fn );
                }
            }

            return this;
        },

        delegate: function( selector, types, data, fn ) {
            return this.live( types, data, fn, selector );
        },

        undelegate: function( selector, types, fn ) {
            if ( arguments.length === 0 ) {
                return this.unbind( "live" );

            } else {
                return this.die( types, null, fn, selector );
            }
        },

        trigger: function( type, data ) {
            return this.each(function() {
                jQuery.event.trigger( type, data, this );
            });
        },

        triggerHandler: function( type, data ) {
            if ( this[0] ) {
                return jQuery.event.trigger( type, data, this[0], true );
            }
        },

        toggle: function( fn ) {
            // Save reference to arguments for access in closure
            var args = arguments,
                guid = fn.guid || jQuery.guid++,
                i = 0,
                toggler = function( event ) {
                    // Figure out which function to execute
                    var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
                    jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

                    // Make sure that clicks stop
                    event.preventDefault();

                    // and execute the function
                    return args[ lastToggle ].apply( this, arguments ) || false;
                };

            // link all the functions, so any of them can unbind this click handler
            toggler.guid = guid;
            while ( i < args.length ) {
                args[ i++ ].guid = guid;
            }

            return this.click( toggler );
        },

        hover: function( fnOver, fnOut ) {
            return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
        }
    });

    var liveMap = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };

    jQuery.each(["live", "die"], function( i, name ) {
        jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
            var type, i = 0, match, namespaces, preType,
                selector = origSelector || this.selector,
                context = origSelector ? this : jQuery( this.context );

            if ( typeof types === "object" && !types.preventDefault ) {
                for ( var key in types ) {
                    context[ name ]( key, data, types[key], selector );
                }

                return this;
            }

            if ( name === "die" && !types &&
                        origSelector && origSelector.charAt(0) === "." ) {

                context.unbind( origSelector );

                return this;
            }

            if ( data === false || jQuery.isFunction( data ) ) {
                fn = data || returnFalse;
                data = undefined;
            }

            types = (types || "").split(" ");

            while ( (type = types[ i++ ]) != null ) {
                match = rnamespaces.exec( type );
                namespaces = "";

                if ( match )  {
                    namespaces = match[0];
                    type = type.replace( rnamespaces, "" );
                }

                if ( type === "hover" ) {
                    types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
                    continue;
                }

                preType = type;

                if ( liveMap[ type ] ) {
                    types.push( liveMap[ type ] + namespaces );
                    type = type + namespaces;

                } else {
                    type = (liveMap[ type ] || type) + namespaces;
                }

                if ( name === "live" ) {
                    // bind live handler
                    for ( var j = 0, l = context.length; j < l; j++ ) {
                        jQuery.event.add( context[j], "live." + liveConvert( type, selector ),
                            { data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
                    }

                } else {
                    // unbind live handler
                    context.unbind( "live." + liveConvert( type, selector ), fn );
                }
            }

            return this;
        };
    });

    function liveHandler( event ) {
        var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
            elems = [],
            selectors = [],
            events = jQuery._data( this, "events" );

        // Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
        if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
            return;
        }

        if ( event.namespace ) {
            namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
        }

        event.liveFired = this;

        var live = events.live.slice(0);

        for ( j = 0; j < live.length; j++ ) {
            handleObj = live[j];

            if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
                selectors.push( handleObj.selector );

            } else {
                live.splice( j--, 1 );
            }
        }

        match = jQuery( event.target ).closest( selectors, event.currentTarget );

        for ( i = 0, l = match.length; i < l; i++ ) {
            close = match[i];

            for ( j = 0; j < live.length; j++ ) {
                handleObj = live[j];

                if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
                    elem = close.elem;
                    related = null;

                    // Those two events require additional checking
                    if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
                        event.type = handleObj.preType;
                        related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];

                        // Make sure not to accidentally match a child element with the same selector
                        if ( related && jQuery.contains( elem, related ) ) {
                            related = elem;
                        }
                    }

                    if ( !related || related !== elem ) {
                        elems.push({ elem: elem, handleObj: handleObj, level: close.level });
                    }
                }
            }
        }

        for ( i = 0, l = elems.length; i < l; i++ ) {
            match = elems[i];

            if ( maxLevel && match.level > maxLevel ) {
                break;
            }

            event.currentTarget = match.elem;
            event.data = match.handleObj.data;
            event.handleObj = match.handleObj;

            ret = match.handleObj.origHandler.apply( match.elem, arguments );

            if ( ret === false || event.isPropagationStopped() ) {
                maxLevel = match.level;

                if ( ret === false ) {
                    stop = false;
                }
                if ( event.isImmediatePropagationStopped() ) {
                    break;
                }
            }
        }

        return stop;
    }

    function liveConvert( type, selector ) {
        return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspaces, "&");
    }

    jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error").split(" "), function( i, name ) {

        // Handle event binding
        jQuery.fn[ name ] = function( data, fn ) {
            if ( fn == null ) {
                fn = data;
                data = null;
            }

            return arguments.length > 0 ?
                this.bind( name, data, fn ) :
                this.trigger( name );
        };

        if ( jQuery.attrFn ) {
            jQuery.attrFn[ name ] = true;
        }
    });


    /*! 第8部分：选择器Sizzle（jQuery依赖的一个独立项目） */

    /*!
     * Sizzle CSS Selector Engine
     *  Copyright 2011, The Dojo Foundation
     *  Released under the MIT, BSD, and GPL Licenses.
     *  More information: http://sizzlejs.com/
     */
    (function(){
		// 块分割器，处理选择器中的第一个并列的选择器表达式（以逗号分割），并将其中的各个块表达式分离出来
		// 注意不要与选择器的上下文进行混淆，$(selector, context, rootjQuery)，这里的并列选择器表达式都在selector内，而选择器的上下文是另一个参数context
		// 第一个并列的选择器表达式：((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])
		// 逗号，并列选择器表达式分隔符：(\s*,\s*)?
		// 其他选择器表达式：((?:.|\r|\n)*)
		// 细节见http://www.cnblogs.com/nuysoft/archive/2011/11/23/2260877.html
		// 注：选择器中可以有“.”，但要转义，例如$('#project\\.id')
        var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
            done = 0, // 块间过滤的缓存优化中使用
            toString = Object.prototype.toString,
            hasDuplicate = false, // 数组中是否有重复元素，默认为没有
            baseHasDuplicate = true, // 对于Array.sort的比较函数，是否对相同元素的比较进行优化，默认为进行了优化
            rBackslash = /\\/g, // Sizzle定义的选择器中可以有点，例如“$(#project\\.id)”中的ID为“project.id”
            rNonWord = /\W/;

		// 首先检测js引擎是否应用了某些优化
        [0, 0].sort(function() {
            baseHasDuplicate = false; // 对于数组中的相同元素，如果执行了比较，则标记浏览器没有对重复元素的排序比较进行优化
            return 0;
        });

		// Sizzle的入口：根据选择器返回相应的DOM元素
		//  参数：选择器、上下文（查找范围）、结果集、种子（即候选集。种子只在Sizzle.matches、Sizzle.matchesSelector、Expr.preFilter.PSEUDO的:not中使用）
        var Sizzle = function( selector, context, results, seed ) {
            results = results || []; // 若原始结果集不存在，初始化results为空数组
            context = context || document; // 如果没有执行上下文，则初始化context为document

            var origContext = context; // 缓存最初的上下文，在对其他并列表达式调用Sizzle时使用

            if ( context.nodeType !== 1 && context.nodeType !== 9 ) { // 若上下文不是元素节点或者根节点，返回空的结果集
                return [];
            }

            if ( !selector || typeof selector !== "string" ) { // 若选择器为空，或选择器不是string类型，直接返回结果集
                return results;
            }

            var m, set, checkSet, extra, ret, cur, pop, i, // set是候选集，是查找和过滤后的结果。checkSet是映射集，是候选集set的副本，对于未通过过滤的DOM元素可在其上直接标记false，关系过滤器Expr.relative使用它进行过滤
                prune = true, // 标记第一个并列表达式是否含有多个块表达式，多个为true，单个为false
                contextXML = Sizzle.isXML( context ), // 上下文节点是否在XML文档中（或者是一个XML文档）
                parts = [], // 存放第一个并列表达式中的各个块
                soFar = selector;

			// 使用块分割器循环从选择器中分割出第一个并列表达式中的各个块
			//  示例：soFar = "#id1[type='input']>.class:eq(3),#id2"
			//  每次循环后的结果：
			//  ①m[0]：#id1[type='input']>.class:eq(3),#id2，m[1]：#id1[type='input']，m[2]：undefined，m[3]：>.class:eq(3),#id2
			//  ②m[0]：>.class:eq(3),#id2，m[1]：>，m[2]：undefined，m[3]：.class:eq(3),#id2
			//  ③m[0]：.class:eq(3),#id2，m[1]：.class:eq(3)，m[2]：,，m[3]：#id2
			//	最终分割出的块parts：['#id1[type='input']', '>', '.class:eq(3)']
			// 相比于split(',')和split('' )，使用块分割器可以获取更多信息，也便于整个Sizzle选择器引擎的流程处理。缺点是降低了效率
            do {
                chunker.exec( "" ); // 更新全局RegExp对象的属性，以清理上次匹配结果，主要是为了让lastIndex属性复位
                m = chunker.exec( soFar );

                if ( m ) {
                    soFar = m[3]; // 其他选择器表达式（第一个并列表达式的当前块之后的部分）

                    parts.push( m[1] ); // 把第一个并列表达式的当前块存到parts中

                    if ( m[2] ) { // 存在逗号。注意此捕获组用的是“?”，只有当捕获到逗号时，才算分割完第一个并列选择器表达式
                        extra = m[3]; // 将其他并列选择器表达式存到extra中
                        break; // 跳出循环
                    }
                }
            } while ( m );

			// 匹配到多个块，并且含有位置过滤器（伪类的一种） /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
            if ( parts.length > 1 && origPOS.exec( selector ) ) { // origPOS = Expr.match.POS
				// 从左向右查找、过滤。因为位置过滤器所在的块表达式的过滤结果，依赖于它前一个的块表达式查找/过滤的结果
                if ( parts.length === 2 && Expr.relative[ parts[0] ] ) { // 第一个块表达式是块间关系选择符（~、+、>、""），形如“>div”的情况（从左到右匹配中使用）
                    set = posProcess( parts[0] + parts[1], context ); // 换成类似“>div”的形式调用位置选择器posProcess（从左到右的块间过滤）

                } else {
                    set = Expr.relative[ parts[0] ] ?
                        [ context ] : // 若第一个块表达式是块间关系选择符，则用上下文context作为候选集（从左到右匹配中使用）
                        Sizzle( parts.shift(), context ); // 否则取出第一个块选择器表达式，调用Sizzle函数执行完整的查找、过滤，得到候选集set

                    while ( parts.length ) {
                        selector = parts.shift(); // 从左向右遍历

                        if ( Expr.relative[ selector ] ) { // 如果遇到块间关系过滤器，再取一个块表达式
                            selector += parts.shift();
                        }

                        set = posProcess( selector, set ); // 调用位置选择器posProcess，候选集set作为上下文，并将返回的结果作为下一个块表达式的上下文
                    }
                }

            }
			
			else {
				// 从右向左查找、过滤
				
                // 当根选择器为ID时重设上下文走捷径 (but not if it'll be faster if the inner selector is an ID)
				// 优化：没有候选集、当选择器第一个块含有ID、最后一个块不含有ID、上下文是文档根元素时，重新设置上下文context，因为根据ID获取到的元素少
                if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

                    ret = Sizzle.find( parts.shift(), context, contextXML ); // 取出第一个块选择器表达式，调用Sizzle.find进行查找
                    context = ret.expr ?
                        Sizzle.filter( ret.expr, ret.set )[0] : // 若匹配ID后还有剩余的表达式expr，再调用过滤器Sizzle.filter进行过滤，上下文context设置为经过滤后的候选集数组的第一个元素（上一步根据ID查找就返回一个DOM元素，若没有通过过滤上下文就为undefined了）
                        ret.set[0]; // 否则，上下文context就设置为找到的ID
                }

				// 要存在上下文（经上一步优化后可能就没有上下文了，因为没有根据ID找到对应的DOM元素）
                if ( context ) {
					// 第一步：查找
                    ret = seed ?
                        { expr: parts.pop(), set: makeArray(seed) } : // 若有种子，则不用查找，把把种子作为候选集，获取parts中最右边的选择器块表达式作为过滤表达式，直接进行过滤
						
						// 若没有种子，则用parts中最右边的选择器块表达式调用Sizzle.find进行查找，获取候选集。注意当第一个块表达式是关系选择器为兄弟选择器（~）或相邻选择器（+）时（从左到右匹配中使用），因为要查找同级的兄弟节点，所以上下文context会被设置为它的父节点（这样无法匹配到，checkSet中标记为false）
                        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

					// 第二步：过滤
                    set = ret.expr ?
                        Sizzle.filter( ret.expr, ret.set ) : // 若经查找匹配删除后还存在块表达式，则用剩余的块表达式和候选集进行过滤
                        ret.set;

                    if ( parts.length > 0 ) {
                        checkSet = makeArray( set ); // checkSet是映射集，是候选集set的副本

                    } else { // 当前并列表达式就只有一个块（查找时已经parts.pop()了，此时parts.length === 0）
                        prune = false;
						// 注意：此时映射集checkSet没有被赋值
                    }

					// 第三步：块间关系过滤
                    while ( parts.length ) { // 从右向左遍历各个块表达式
						// 从右向左弹出块表达式，cur是块表达式是关系选择符（~、+、>、""），pop是前面一个选择器块表达式
                        cur = parts.pop();
                        pop = cur;

                        if ( !Expr.relative[ cur ] ) { // 弹出的是选择器块表达式，则是后代选择器
                            cur = ""; // 后代选择器
                        } else { // 弹出的是关系选择符：~、+、>
                            pop = parts.pop(); // 再弹出前面一个选择器块表达式
                        }

                        if ( pop == null ) { // 若前面没有块表达式了（part[0]为~、+、>的情况），则把上下文context作为第一个块
                            pop = context;
                        }

                        Expr.relative[ cur ]( checkSet, pop, contextXML ); // 在映射集checkSet上进行块间关系过滤
                    }

                } else { // 若没有上下文context，则映射集为空数组
                    checkSet = parts = [];
                }
            }

            if ( !checkSet ) { // 最后都是要根据映射集checkSet对候选集set进行筛选，因此若映射集checkSet没有被赋值，将checkSet赋值为候选集set
                checkSet = set;
            }

            if ( !checkSet ) { // 即使候选集set为空，也是[]，若为null或undefined，则报错
                Sizzle.error( cur || selector );
            }

            if ( toString.call(checkSet) === "[object Array]" ) { // checkSet是js原生Array数组
                if ( !prune ) { // 当前并列表达式就只有一个块，直接把checkSet追加到results中
                    results.push.apply( results, checkSet );

                } else if ( context && context.nodeType === 1 ) { // 上下文是DOM元素的情况，checkSet[i]不能为null或false（在块间过滤调用dirCheck时可能标记为true），为DOM元素且上下文元素必须包含它
                    for ( i = 0; checkSet[i] != null; i++ ) {
                        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
                            results.push( set[i] );
                        }
                    }

                } else { // 上下文是文档document的情况，checkSet[i]不能为null或false，保留元素节点
                    for ( i = 0; checkSet[i] != null; i++ ) {
                        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
                            results.push( set[i] );
                        }
                    }
                }

            } else { // checkSet为NodeList（checkSet = set时可能会出现这种情况，见Sizzle.find的TAG返回的是NodeList）
                makeArray( checkSet, results ); // 把checkSet追加到results中
            }

			// 如果存在其他并列选择器
            if ( extra ) {
                Sizzle( extra, origContext, results, seed ); // 递归，继续处理其他的并列选择器表达式，并合并结果集
                Sizzle.uniqueSort( results ); // 删除结果集中的重复的DOM元素，并按顺序排列。如果仅有一个选择器表达式，没有并列选择器表达式，不需要排序
            }

            return results;
        };

		// 对于DOM元素数组，删除数组中的重复元素，并按顺序排列；而对于普通数组，只能删除重复元素，不能排序（这么设计的原因在sortOrder函数定义处的注释中）
		// 也是jQuery.unique的定义
        Sizzle.uniqueSort = function( results ) {
            if ( sortOrder ) { // 定义了比较函数
                hasDuplicate = baseHasDuplicate;
                results.sort( sortOrder ); // 使用比较函数对数组进行排序（比较函数sortOrder中会修改数组中是否有重复元素的标记hasDuplicate）

                if ( hasDuplicate ) { // 数组中有重复元素
                    for ( var i = 1; i < results.length; i++ ) {
                        if ( results[i] === results[ i - 1 ] ) { // 因为已经排过序了，所以只需要比较相邻元素（当前元素和它前一个元素进行比较），看是否重复
                            results.splice( i--, 1 ); // 若重复，则删除当前元素的前一个元素
                        }
                    }
                }
            }

            return results;
        };

		// 返回set中匹配选择器expr的DOM元素
        Sizzle.matches = function( expr, set ) {
            return Sizzle( expr, null, null, set );
        };

		// 判断DOM元素node是否匹配选择器expr
        Sizzle.matchesSelector = function( node, expr ) {
            return Sizzle( expr, null, null, [node] ).length > 0;
        };

		// Sizzle的查找器
		// expr是查找表达式（一个块表达式），context是查找的范围
		// 返回候选集set和经匹配删除后剩余的查找表达式部分expr
        Sizzle.find = function( expr, context, isXML ) {
            var set;

            if ( !expr ) { // 无查找表达式，返回空数组
                return [];
            }

            for ( var i = 0, l = Expr.order.length; i < l; i++ ) { // 依次匹配，顺序：ID、NAME、TAG。如果浏览器支持原生的getElementsByClassName的，则查找器查找顺序变为ID、CLASS、NAME、TAG，联系5100多行处
                var match,
                    type = Expr.order[i];

                if ( (match = Expr.leftMatch[ type ].exec( expr )) ) { // 使用leftMatch定义的正则表达式，碰到有ID、（CLASS）、NAME、TAG查找器的匹配
                    var left = match[1];
                    match.splice( 1, 1 ); // 因为leftMatch在match的头部添加了一个新的分组，所以现在提取第一个分组到left里面，然后删除这个分组，之后match[1]中就是捕获到的ID、NAME或TAG值

                    if ( left.substr( left.length - 1 ) !== "\\" ) { // 开头不为“\”。若有类似“\#className”的选择器，开头的#不作为ID处理
                        match[1] = (match[1] || "").replace( rBackslash, "" ); // /\\/替换为""，针对选择器中的点选择块，例如$('#project\\.id')被匹配后的id为“#project\.id”，将转义符去掉后留下原有的id为“#project.id”
                        set = Expr.find[ type ]( match, context, isXML ); // 分配相应的查找器Expr.find根据对应的ID、NAME或TAG值执行查找，返回候选集
						// 注意Expr.find的定义中：即使没有查找到ID、（CLASS）、TAG值对应的DOM元素，ID返回[]、（CLASS）或TAG返回空的NodeList，都不为null。但如果没有查找到NAME值对应的DOM元素，则返回null

                        if ( set != null ) { // 若查找到的候选集set不为null
                            expr = expr.replace( Expr.match[ type ], "" ); // 删除查找表达式expr中已经被匹配的部分
                            break; // 只要一匹配到DOM元素，候选集中有了初始的DOM元素就跳出查找步骤，以后将执行过滤
                        }
						
						// 注意：如果没有查找到ID、（CLASS）、TAG值对应的DOM元素，则删除查找表达式expr中的ID、（CLASS）、TAG值匹配部分；而如果没有查找到NAME值对应的DOM元素，则不删除找表达式expr中的NAME值匹配部分，留到ATTR过滤中使用
                    }
                }
            }

			// 当选择器块表达式中都没有ID、（CLASS）、NAME、TAG，或者有NAME值却没有匹配到对应的DOM元素时，直接把context范围内的所有节点作为候选集set
            if ( !set ) {
                set = typeof context.getElementsByTagName !== "undefined" ?
                    context.getElementsByTagName( "*" ) : // 注：此处有可能返回注释节点，但是这些多余的注释节点会在后面被过滤掉，只保留元素节点
                    [];
            }

            return { set: set, expr: expr }; // 返回候选集set和经匹配删除后剩余的查找表达式部分expr
        };

		// Sizzle的过滤器
		// expr是过滤表达式，set是候选集，inplace表示是否原地修改，not表示是否取补集
		// 注：关于inplace，①为true，在块间关系过滤时使用原地修改，在候选集curLoop上修改，若不匹配标注false；②为false，其他情况时都非原地修改，通过result重新构建经过过滤的候选集
		// 返回过滤后的候选集curLoop
		Sizzle.filter = function( expr, set, inplace, not ) {
            var match, anyFound, // anyFound表示有DOM元素通过了过滤
                old = expr,
                result = [], // 当非原地修改时，result保存过滤后的候选集，然后在每一步过滤后把result赋值给候选集curLoop
                curLoop = set, // curLoop是最终整个过滤器返回的经过过滤后的候选集，初始值赋值为查找过后的候选集set
                isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

            while ( expr && set.length ) { // 有过滤表达式，且候选集set不为空
                for ( var type in Expr.filter ) { // 顺序为Expr.filter中定义的顺序：PSEUDO、CHILD、ID、TAG、CLASS、ATTR、POS
                    if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) { // 匹配到过滤器
                        var found, item,
                            filter = Expr.filter[ type ],
                            left = match[1];

                        anyFound = false;

                        match.splice(1,1); // 因为leftMatch在match的头部添加了一个新的分组，所以现在提取第一个分组到left里面，然后删除这个分组，之后match[1]就对应了Expr.match中正则表达式中的第一个分组的捕获值

                        if ( left.substr( left.length - 1 ) === "\\" ) { // 开头不为“\”，否则跳过。若有类似“\#className”的选择器，开头的#不作为ID处理
                            continue;
                        }

                        if ( curLoop === result ) { // 清空result（针对非原地过滤）
                            result = [];
                        }

						// 首先进行预过滤，为了之后的过滤步骤处理一些形式和兼容性的问题，修正match
                        if ( Expr.preFilter[ type ] ) {
                            match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

                            if ( !match ) { // 当type为CLASS或PSEUDO的:not含有的是简单选择器（只含有一个不以TAG开头的块）时，会把match赋值为false
                                anyFound = found = true;

                            } else if ( match === true ) { // 同样是伪类选择器，当使用PSEUDO匹配时发现是POS或CHILD，则跳过PSEUDO的匹配
                                continue;
                            }
                        }

						// 然后才进行过滤
                        if ( match ) {
                            for ( var i = 0; (item = curLoop[i]) != null; i++ ) { // 判断候选集中的每个DOM元素
                                if ( item ) {
                                    found = filter( item, match, i, curLoop ); // 过滤
                                    var pass = not ^ !!found; // pass为true，没有被过滤；为false则被过滤掉

                                    if ( inplace && found != null ) {
                                        if ( pass ) {
                                            anyFound = true;

                                        } else {
                                            curLoop[i] = false; // 原地修改
                                        }

                                    } else if ( pass ) { // 非原地修改
                                        result.push( item ); // 把curLoop中经过滤后的DOM元素添加到result中
                                        anyFound = true;
                                    }
                                }
                            }
                        }

                        if ( found !== undefined ) { // 若当前有过滤匹配
                            if ( !inplace ) { // 非原地修改，把预过滤后的result赋值给候选集curLoop
                                curLoop = result;
                            }

                            expr = expr.replace( Expr.match[ type ], "" ); // 删除过滤表达式expr中已经被匹配的部分

                            if ( !anyFound ) { // 若当前没有任何DOM元素通过了过滤，再进行过滤就没有必要了，所以在此直接返回空的候选集
                                return [];
                            }

                            break; // 跳出循环，开始下一步过滤
                        }
                    }
                } // end of for

                // 不正确的过滤表达式
                if ( expr === old ) { // 经一次过滤后过滤表达式没有变化
                    if ( anyFound == null ) { // 若没有DOM元素通过了过滤，则报错
                        Sizzle.error( expr );

                    } else { // 否则跳出循环，开始下一步过滤
                        break;
                    }
                }

                old = expr;
            }

            return curLoop; // 返回过滤后的候选集
        };

		// 错误，抛出异常
        Sizzle.error = function( msg ) {
            throw "Syntax error, unrecognized expression: " + msg;
        };

        var Expr = Sizzle.selectors = {
			// 查找器Sizzle.find调用Expr.find查找的顺序，即原生选择器调用的顺序。制定这个顺序的原则：原生API获取元素节点的数量越少越先调用，因为这样后面过滤起来会更轻松
			// 如果浏览器支持原生的getElementsByClassName的，则查找器查找顺序Expr.order变为ID、CLASS、NAME、TAG，联系5100多行处
            order: [ "ID", "NAME", "TAG" ],

			// Sizzle的选择器的正则表达式
			// 除了CHILD和POS，其他选择器中可以有“.”，但要转义，例如$('#project\\.id')
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/, // 子元素过滤器
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/, // 位置过滤器
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/ // 伪类过滤器
            },

			// 上述match中的正则表达式并没有直接被使用，而是进行了进一步的处理，最后被使用的正则表达式被存储在leftMatch中
			// 处理过程在4700行左右处定义，在fescape函数定义的后面
            leftMatch: {},

            attrMap: { // 元素属性转换
                "class": "className", // elem.className
                "for": "htmlFor" // 对于label元素的for属性，应该使用elem.htmlFor
            },

            attrHandle: { // 获取属性值
                href: function( elem ) { // 不能直接用elem.href获取，因为IE在获取href时有时会获取到绝对路径，还有编码问题
                    return elem.getAttribute( "href" ); // 在4900多行处修正：如果想得到href里的未经转换、未经编码的原始内容，IE浏览器下全部使用getAttribute("href", 2)
                },
                type: function( elem ) { // 不能直接用elem.type获取，因为一些浏览器无法识别HTML5新定义的一些type
                    return elem.getAttribute( "type" );
                }
            },

			// 块间关系过滤器
			// 下面的4个函数中，checkSet是映射集（候选集set的副本，可在上面对未通过过滤的DOM元素直接标记false）；part是下一个过滤选择器块表达式，若part[0]是>、~、+，则为上下文DOM元素context
            relative: {
				// 相邻选择器（prev + next，prev后紧跟的一个兄弟节点）
                "+": function(checkSet, part){
                    var isPartStr = typeof part === "string", // part是过滤选择器块表达式
                        isTag = isPartStr && !rNonWord.test( part ), // part只是一个TAG
                        isPartStrNotTag = isPartStr && !isTag; // part是过滤选择器块表达式，但不是只是一个TAG

                    if ( isTag ) { // 若part只是一个TAG，把TAG小写
                        part = part.toLowerCase();
                    }

                    for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
                        if ( (elem = checkSet[i]) ) {
                            while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {} // 对于checkSet中每一个DOM元素，找到它前一个类型为“元素”的兄弟

                            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                                elem || false : // 如果是TAG，直接进行匹配，若不匹配TAG，则直接标记为false，否则将checkSet中的元素变为set中对应元素的前一个兄弟元素（checkSet与set不同，便于根据前一个兄弟进行过滤）
                                elem === part; // part是context的情况（从左到右匹配中使用，context是set中的一个元素）
                        }
                    }

                    if ( isPartStrNotTag ) {
                        Sizzle.filter( part, checkSet, true ); // 如果不是TAG，则需要根据过滤选择器块表达式调用Sizzle.filter在映射集checkSet（与候选集set中每个元素的前一个兄弟元素对应）上进行原地过滤
                    }
                },

				// 子选择器
                ">": function( checkSet, part ) {
                    var elem,
                        isPartStr = typeof part === "string",
                        i = 0,
                        l = checkSet.length;

                    if ( isPartStr && !rNonWord.test( part ) ) { // part只是一个TAG
                        part = part.toLowerCase(); // 把TAG小写

                        for ( ; i < l; i++ ) {
                            elem = checkSet[i];

                            if ( elem ) {
                                var parent = elem.parentNode;
                                checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false; // 如果是TAG，直接比较父元素的TAG进行过滤
                            }
                        }

                    } else { // part是过滤选择器块表达式，但不是只是一个TAG，把映射集checkSet中的每个DOM元素换成与候选集set中相应的元素的父元素，然后调用过滤器Sizzle.filter进行原地过滤
                        for ( ; i < l; i++ ) {
                            elem = checkSet[i];

                            if ( elem ) {
                                checkSet[i] = isPartStr ?
                                    elem.parentNode :
                                    elem.parentNode === part; // part是context的情况（从左到右匹配中使用，context是set中的一个元素）
                            }
                        }

                        if ( isPartStr ) {
                            Sizzle.filter( part, checkSet, true );
                        }
                    }
                },

				// 后代选择器
                "": function(checkSet, part, isXML){
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck; // 路径检查

                    if ( typeof part === "string" && !rNonWord.test( part ) ) { // part只是一个TAG
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck; // 路径节点检查
                    }

                    checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML ); // 检查parentNode
                },

				// 兄弟选择器（prev + siblings，prev之后的所有兄弟节点）。与后代选择器的实现大致相同，最后检查的是previousSibling
                "~": function( checkSet, part, isXML ) {
                    var nodeCheck,
                        doneName = done++,
                        checkFn = dirCheck;

                    if ( typeof part === "string" && !rNonWord.test( part ) ) { 
                        part = part.toLowerCase();
                        nodeCheck = part;
                        checkFn = dirNodeCheck;
                    }

                    checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
                }
            },

			// 查找器Sizzle.find分配给Expr.find根据具体类型进行查找，返回候选集
			// match[1]中就是捕获到的ID、NAME或TAG名
            find: {
                ID: function( match, context, isXML ) {
                    if ( typeof context.getElementById !== "undefined" && !isXML ) {
                        var m = context.getElementById(match[1]); // 使用原生的getElementById方法
						// 检测parentNode，因为Blackberry 4.6会返回不在文档中的节点，见#6963
                        return m && m.parentNode ? [m] : [];
						
						// 注：在4900多行被修复两个bug：某些浏览器中getElementById可能会根据name选择元素，可能参数不区分大小写
                    }
                },

                NAME: function( match, context ) {
                    if ( typeof context.getElementsByName !== "undefined" ) {
                        var ret = [],
                            results = context.getElementsByName( match[1] ); // 使用原生的getElementsByName方法

						// 再用name属性值过滤一遍，因为IE6~8中getElementsByName方法的参数不区分大小写。见http://www.w3help.org/zh-cn/causes/SD9012
                        for ( var i = 0, l = results.length; i < l; i++ ) {
                            if ( results[i].getAttribute("name") === match[1] ) {
                                ret.push( results[i] );
                            }
                        }

                        return ret.length === 0 ? null : ret;
                    }
                },

                TAG: function( match, context ) {
                    if ( typeof context.getElementsByTagName !== "undefined" ) {
                        return context.getElementsByTagName( match[1] ); // 使用原生的getElementsByTagName方法。上面的ID和NAME都返回了Array，但是这里TAG却返回了NodeList
                    }
                }
            },
			
			// 过滤器Sizzle.filter分配给Expr.preFilter根据具体类型进行预过滤，为了之后的过滤步骤处理一些形式和兼容性的问题
			// match是选择器块中对应过滤器中特定类型的匹配，expr是过滤表达式，curLoop是当前经过滤后的候选集，inplace表示是否原地修改（为true时在候选集set上修改），not表示是否取补集
            preFilter: {
                CLASS: function( match, curLoop, inplace, result, not, isXML ) { // /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/
                    match = " " + match[1].replace( rBackslash, "" ) + " "; // 去掉/\\/，前后加空格便于在DOM元素的className中进行匹配

                    if ( isXML ) {
                        return match;
                    }

                    for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
                        if ( elem ) {
                            if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) { // 是否取补集用异或操作
                                if ( !inplace ) { // 若不原地修改，则把符合条件的DOM元素放到result数组中
                                    result.push( elem );
                                }

                            } else if ( inplace ) { // 原地修改，直接在curLoop上标记
                                curLoop[i] = false;
                            }
                        }
                    }

                    return false; // 预过滤已经处理完了CLASS类型，直接返回false，即在过滤器Sizzle.filter中match变为了false，不用再进行过滤步骤了
                },

                ID: function( match ) { // 预处理中ID和TAG都是去掉了其中的转义符号
                    return match[1].replace( rBackslash, "" );
                },

                TAG: function( match, curLoop ) {
                    return match[1].replace( rBackslash, "" ).toLowerCase();
                },

                CHILD: function( match ) { // /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/
                    if ( match[1] === "nth" ) {
                        if ( !match[2] ) { // 若在nth-child后面没有匹配到索引或者一个基于n的方程式（在match[2]中），则报错
                            Sizzle.error( match[0] );
                        }

                        match[2] = match[2].replace(/^\+|\s*/g, ''); // 去掉方程式前面的+号和空格

                        // 修正并解析match[2]，把诸如'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'之类的方程式，变成 -(first)n+(last) 的格式
                        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
                            match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || // 把even变成2n，odd变成2n+1
                            !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]); // 把纯数字的前面补上“0n+”

                        // 计算 (first)n+(last) 的值，包括它的正负号，修改match，match[2]存first，match[3]存last
                        match[2] = (test[1] + (test[2] || 1)) - 0; // -0是为了把字符串转换为数字
                        match[3] = test[3] - 0;
                    }
                    else if ( match[2] ) { // 若选择器中为(only|first|last)-child，若捕获到索引或者一个基于n的方程式（在match[2]中），则报错
                        Sizzle.error( match[0] );
                    }

                    // TODO: Move to normal caching system
                    match[0] = done++;

                    return match; // 返回修正后的match
                },

                ATTR: function( match, curLoop, inplace, result, not, isXML ) { // /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/
                    var name = match[1] = match[1].replace( rBackslash, "" ); // match[1]是属性名

                    if ( !isXML && Expr.attrMap[name] ) { // 修正js中的HTML属性名：class => className、for => htmlFor
                        match[1] = Expr.attrMap[name];
                    }

                    // Handle if an un-quoted value was used
                    match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" ); // match[4]是属性值

                    if ( match[2] === "~=" ) { // match[2]是属性操作符。“~=”表示属性值以空格分隔包含xxx，给匹配到的属性值前后加上空格
                        match[4] = " " + match[4] + " ";
                    }

                    return match;
                },

                PSEUDO: function( match, curLoop, inplace, result, not ) { // /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                    if ( match[1] === "not" ) {
                        // :not后面括号中的选择器是一个复杂的选择器，含有多个块表达式（比较复杂），或者只含有一个块表达式以[0-9A-Z_a-z]开头（即标签，因为此时标签的范围会比候选集大）
                        if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) { // match[3]中是:not后面括号中的选择器
                            match[3] = Sizzle(match[3], null, null, curLoop); // 对于上述两种情况，先以curLoop作为种子，对表达式match[3]调用Sizzle先进行查找，保存到match[3]中，然后再调用过滤器Sizzle.filter进行过滤

                        } else { // 否则，对于简单的:not伪类（只含有一个不以TAG开头的块），直接在curLoop上调用过滤器Sizzle.filter进行过滤
                            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                            if ( !inplace ) { // 若不原地修改，则把符合条件的DOM元素放到result数组中
                                result.push.apply( result, ret );
                            }

                            return false; // 预过滤已经处理了简单的:not伪类过滤，不用再进行过滤步骤了
                        }

                    } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) { // 当使用PSEUDO匹配时发现是POS或CHILD，返回true，过滤器Sizzle.filter则会跳过PSEUDO的匹配
                        return true;
                    }

                    return match; // 对于复杂的:not伪类过滤和其他的伪类过滤，返回修正后的match
                },

                POS: function( match ) { // /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
                    match.unshift( true ); // 往match头部添加一个元素，仅为了修正下标，把匹配到的位置索引放到match[3]中

                    return match;
                }
            },

			// 伪类过滤函数（在Expr.filter['PSEUDO']中使用），返回true或false
			// jQuery.expr[":"] = Sizzle.selectors.filters; 选择器扩展接口就是扩展的这里
			// 选择器扩展接口使用实例：
			//  // 定义自己的选择器，以实现某些过滤功能：
			//	jQuery.expr[":"] = Sizzle.selectors.filters;
			//	$.extend($.expr[':'], {
			//		hasSpan: function(e) {
			//		    return $(e).find('span').length > 0;
			//	    }
			//  });
			//  // 具体使用：
			//  $('div:hasSpan')....
            filters: {
                enabled: function( elem ) {
                    return elem.disabled === false && elem.type !== "hidden";
                },

                disabled: function( elem ) {
                    return elem.disabled === true;
                },

                checked: function( elem ) { // 被选中的radio和checkbook元素
                    return elem.checked === true;
                },

                selected: function( elem ) { // 被选中<option>元素
					// 访问这个属性，让默认选择的<option>在Safari中正确工作
                    if ( elem.parentNode ) {
                        elem.parentNode.selectedIndex;
                    }

                    return elem.selected === true;
                },

                parent: function( elem ) { // 所有含有子元素或者文本的父级元素，与:empty相反
                    return !!elem.firstChild;
                },

                empty: function( elem ) { // 所有不含子元素或者文本的元素
                    return !elem.firstChild;
                },

                has: function( elem, i, match ) { // 含有选择器所匹配的至少一个元素的元素，match[3]为has后括号中的选择器
                    return !!Sizzle( match[3], elem ).length; // 若找到has的DOM元素，则返回true    /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                },

                header: function( elem ) { // 所有标题元素h1~h6
                    return (/h\d/i).test( elem.nodeName ); // 其实nodeName属性都是大写，但是正则表达式中使用了i修饰符，忽略大小写
                },

                text: function( elem ) { // 所有类型为text的input元素。$(':text')等价于$('[type=text]')。如同其他伪类选择器（那些以“:”开始）建议前面加上一个标记名称或其他选择器;否则，通用选择("*")被默认使用。换句话说$(':text') 等同于 $('*:text')，所以应该使用$('input:text')
                    var attr = elem.getAttribute( "type" ), type = elem.type;
					// IE 6/7将一些HTML5的input类型（如search等）归为text类型，不能只使用type属性判断，还需要用getAttribute进行甄别
                    return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
                },

                radio: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
                },

                checkbox: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
                },

                file: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
                },

                password: function( elem ) {
                    return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
                },

                submit: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "submit" === elem.type; // input和button都有submit类型的
                },

                image: function( elem ) { // input的image控件，它会创建一个图像控件，该控件单击后将导致表单立即被提交
                    return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
                },

                reset: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return (name === "input" || name === "button") && "reset" === elem.type; // input和button都有reset类型的
                },

                button: function( elem ) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && "button" === elem.type || name === "button"; // input元素的button类型或button元素
                },

                input: function( elem ) { // 所有input、textarea、select、button元素
                    return (/input|select|textarea|button/i).test( elem.nodeName );
                },

                focus: function( elem ) {
                    return elem === elem.ownerDocument.activeElement; // document.activeElement：指向当前获得焦点的元素（文档加载期间为null，刚加载完指向document.body）
					// 如同其他伪类选择器（那些以":"开始），建议:focus前面用标记名称或其他选择;否则，通用选择("*")是不言而喻的。换句话说，$(':focus')等同为$('*:focus')。如果你正在寻找当前的焦点元素，$( document.activeElement )将检索，而不必搜索整个DOM树。
				}
            },
			
			// 集合的位置过滤函数（在Expr.filter['POS']中使用），返回true或false
			// match[3]为位置选择器的括号中的基于0的索引值（本来在match[2]，预过滤时在match头部插入了一个true） /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
            setFilters: {
                first: function( elem, i ) {
                    return i === 0;
                },

                last: function( elem, i, match, array ) {
                    return i === array.length - 1;
                },

                even: function( elem, i ) {
                    return i % 2 === 0;
                },

                odd: function( elem, i ) {
                    return i % 2 === 1;
                },

                lt: function( elem, i, match ) {
                    return i < match[3] - 0; // -0是为了把字符串转换为数字
                },

                gt: function( elem, i, match ) {
                    return i > match[3] - 0;
                },

                nth: function( elem, i, match ) {
                    return match[3] - 0 === i;
                },

                eq: function( elem, i, match ) {
                    return match[3] - 0 === i;
                }
            },
			
			// 过滤器Sizzle.filter分配给Expr.filter根据具体类型进行预过滤
			// elem是一个DOM元素，match是选择器块中对应过滤器中特定类型的匹配，i是基于0的下标，array是当前的候选集curLoop
            filter: {
                PSEUDO: function( elem, match, i, array ) { // /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                    var name = match[1], // 伪类类型
                        filter = Expr.filters[ name ]; // 伪类过滤函数

                    if ( filter ) { // 找到对应的伪类过滤函数
                        return filter( elem, i, match, array ); // 若元素匹配，则返回true，否则返回false

					// 在Expr.filters中没有定义contains和not的的伪类过滤函数
                    } else if ( name === "contains" ) { // 包含文本
                        return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

                    } else if ( name === "not" ) {
                        var not = match[3];
						// 若用Sizzle选出的DOM元素中包含了elem，则返回false
                        for ( var j = 0, l = not.length; j < l; j++ ) {
                            if ( not[j] === elem ) {
                                return false;
                            }
                        }

                        return true;

                    } else { // 伪类过滤函数没有定义，报错
                        Sizzle.error( name );
                    }
                },

                CHILD: function( elem, match ) { // /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/
                    var type = match[1],
                        node = elem;

                    switch ( type ) {
                        case "only": // 其父元素下只有一个子元素的元素
                        case "first":
                            while ( (node = node.previousSibling) )     {
                                if ( node.nodeType === 1 ) {
                                    return false; // 有previousSibling，only-child和first-child都为false
                                }
                            }

                            if ( type === "first" ) { // 无previousSibling，first-child为true
                                return true;
                            }

                            node = elem;

                        case "last":
                            while ( (node = node.nextSibling) )     {
                                if ( node.nodeType === 1 ) {
                                    return false; // 有nextSibling，only-child和last-child都为false
                                }
                            }

                            return true; // 无nextSibling，last-child为true。若type === "only"，也无previousSibling，only-child为true

                        case "nth": // nth-child(n)是严格来自CSS规范，索引值n从1开始计数
                            var first = match[2], // 经预过滤Expr.preFilter处理过
                                last = match[3];

                            if ( first === 1 && last === 0 ) { // :nth-child(n)，所有子元素都匹配
                                return true;
                            }

                            var doneName = match[0],
                                parent = elem.parentNode;

                            if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) { // 没有针对当前的nth-child过滤器对节点进行过标注、或者标注过但当前子元素节点却没有被标注（父元素的子元素发生变化）
                                var count = 0;

                                for ( node = parent.firstChild; node; node = node.nextSibling ) {
                                    if ( node.nodeType === 1 ) {
                                        node.nodeIndex = ++count; // 标注子元素节点的序号
                                    }
                                }

                                parent.sizcache = doneName; // 父节点的sizcache属性缓存当前的nth-child过滤器
                            }

							// 匹配(first)n+(last)，注意此处n的取值为1,2,3...，不能为0或负值
                            var diff = elem.nodeIndex - last;
                            if ( first === 0 ) {
                                return diff === 0;
                            } else {
                                return ( diff % first === 0 && diff / first >= 0 );
                            }
                    }
                },

                ID: function( elem, match ) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match;
                },

                TAG: function( elem, match ) {
                    return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match; // 若为*则所有标签都符合
                },

                CLASS: function( elem, match ) {
                    return (" " + (elem.className || elem.getAttribute("class")) + " ")
                        .indexOf( match ) > -1;
                },

                ATTR: function( elem, match ) { // /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/
                    var name = match[1], // match[1]是属性名
                        result = Expr.attrHandle[ name ] ? // 首先对href和type尝试调用getAttribute，因为IE在获取href时有时会获取到绝对路径，还有编码问题；因为一些浏览器无法识别HTML5新定义的一些type
                            Expr.attrHandle[ name ]( elem ) :
                            elem[ name ] != null ? // 然后尝试elem的属性值
                                elem[ name ] :
                                elem.getAttribute( name ), // 最后使用getAttribute获取
                        value = result + "", //将result转换为字符串
                        type = match[2], // match[2]是属性操作符
                        check = match[4]; // match[4]是属性值

                    return result == null ?
                        type === "!=" : // 不存在指定属性，或者指定的属性值不等于给定值
                        type === "=" ?
                        value === check :
                        type === "*=" ? // 属性值包含xxx
                        value.indexOf(check) >= 0 :
                        type === "~=" ? // 属性值用空格分隔包含xxx
                        (" " + value + " ").indexOf(check) >= 0 :
                        !check ?
                        value && result !== false :
                        type === "!=" ?
                        value !== check :
                        type === "^=" ? // 属性值以xxx开头
                        value.indexOf(check) === 0 :
                        type === "$=" ? // 属性值以xxx结尾
                        value.substr(value.length - check.length) === check :
                        type === "|=" ? // 属性值以xxx为前缀（后跟连字符“-”）
                        value === check || value.substr(0, check.length + 1) === check + "-" :
                        false;
                },

                POS: function( elem, match, i, array ) { // /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
                    var name = match[2],
                        filter = Expr.setFilters[ name ];

                    if ( filter ) { // 找到对应的集合位置过滤函数进行过滤
                        return filter( elem, i, match, array );
                    }
                }
            }
        }; // var Expr = Sizzle.selectors结束

        var origPOS = Expr.match.POS, // /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
            fescape = function(all, num){ // 把正则表达式中存在的分组引用\n往后挪一个
                return "\\" + (num - 0 + 1); // -0是为了把字符串转换为数字
            };

		// 将match转换为leftMatch
        for ( var type in Expr.match ) {
            Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) ); // 添加一个后瞻，接下来不能出现一个特定的字符集
            Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) ); // 在头部增加了一个捕获型分组，并使用fescape函数把正则表达式中存在的分组引用\n往后挪一个，比如\2变为了\3
        }

		// 创建数组
		// 有1个参数：将NodeList伪数组array转换为js数组Array
		// 有2个参数：将NodeList伪数组array追加到数组results中
        var makeArray = function( array, results ) {
            array = Array.prototype.slice.call( array, 0 );

            if ( results ) { // 若有第二个参数results，则把array追加到results数组后
                results.push.apply( results, array );
                return results;
            }

            return array;
        };

		// 检测浏览器是否能使用内建方法（Array原型上的slice方法）把NodeList转换为数组，并且数组中仍然是DOM元素（Blackberry浏览器中不行）
        try {
            Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType; // 使用Array原型上的slice方法转换为数组后检查元素的nodeType方法

        // 如果使用Array原型上的slice方法转换有异常，则把makeArray定义为下面的回退方法
        } catch( e ) {
            makeArray = function( array, results ) {
                var i = 0,
                    ret = results || [];

                if ( toString.call(array) === "[object Array]" ) { // 若array是数组类型，直接使用Array原型上的push方法追加到ret中
                    Array.prototype.push.apply( ret, array );

                } else { // 否则遍历array并依次push每个元素到ret中
                    if ( typeof array.length === "number" ) {
                        for ( var l = array.length; i < l; i++ ) {
                            ret.push( array[i] );
                        }

                    } else {
                        for ( ; array[i]; i++ ) {
                            ret.push( array[i] );
                        }
                    }
                }

                return ret;
            };
        }

        var sortOrder, siblingCheck;

		// sortOrder是一个sort函数的比较函数，在Sizzle.uniqueSort中被调用
        if ( document.documentElement.compareDocumentPosition ) { // 可以利用compareDocumentPosition
            sortOrder = function( a, b ) {
                if ( a === b ) { // 两元素相等，有重复，返回0
                    hasDuplicate = true;
                    return 0;
                }

				// 可以想到的异常情况很多，比如数组中掺有非DOM元素，或者数组是普通数组，或者DOM元素已经脱离了文档，要比较的情况太多了，因此为了简便，Sizzle.uniqueSort（即jQuery.unique）在去重的前提下，只对DOM元素数组进行排序
                if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1; // &4表示a在b前，返回-1；否则返回1
            };

        } else { // 不能利用compareDocumentPosition
            sortOrder = function( a, b ) {
                if ( a === b ) { // 两元素相等，有重复，返回0
                    hasDuplicate = true;
                    return 0;

				// 在IE中的回退方法，可以使用特有的sourceIndex属性判断DOM元素的先后位置
                } else if ( a.sourceIndex && b.sourceIndex ) {
                    return a.sourceIndex - b.sourceIndex;
                }

                var al, bl,
                    ap = [],
                    bp = [],
                    aup = a.parentNode,
                    bup = b.parentNode,
                    cur = aup;

                // 若a、b的父节点相同，则a、b为兄弟节点，只需要比较兄弟节点的位置关系
                if ( aup === bup ) {
                    return siblingCheck( a, b );

				// 若没有找到父元素，则DOM元素已经脱离了文档。同上面的异常情况处理
                } else if ( !aup ) {
                    return -1;

                } else if ( !bup ) {
                    return 1;
                }

				// 否则，首先获取a、b的所有祖先节点，然后进行比较
                while ( cur ) {
                    ap.unshift( cur ); // 每获取父节点，都从数组的最前面插入
                    cur = cur.parentNode;
                }

                cur = bup;

                while ( cur ) {
                    bp.unshift( cur );
                    cur = cur.parentNode;
                }

                al = ap.length;
                bl = bp.length;

				// 可以画图来看下面的逻辑
                // Start walking down the tree looking for a discrepancy
				// 从上往下遍历，若有祖先节点不同，对这一组不同的的祖先节点调用兄弟节点检查
                for ( var i = 0; i < al && i < bl; i++ ) {
                    if ( ap[i] !== bp[i] ) {
                        return siblingCheck( ap[i], bp[i] );
                    }
                }

                // We ended someplace up the tree so do a sibling check
				// 已经遍历完了a或b的祖先节点
                return i === al ?
                    siblingCheck( a, bp[i], -1 ) :
                    siblingCheck( ap[i], b, 1 );
            };

			// 兄弟节点检查
            siblingCheck = function( a, b, ret ) {
                if ( a === b ) { // 对比上面的几行代码，a是b的父节点或b是a的父节点
                    return ret;
                }

				// 遍历a的所有下一个兄弟节点进行比较
                var cur = a.nextSibling;

                while ( cur ) {
                    if ( cur === b ) {
                        return -1; // a在b前
                    }

                    cur = cur.nextSibling;
                }

                return 1; // a在b后
            };
        }

        // 得到匹配元素集合中每个元素的文本内容，包括他们的后代
        Sizzle.getText = function( elems ) {
            var ret = "", elem;

            for ( var i = 0; elems[i]; i++ ) {
                elem = elems[i];

                // 文本节点和CDATA节点
                if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
                    ret += elem.nodeValue; // 返回nodeValue属性值

                // 遍历当前节点的所有子孙节点，除了注释节点
                } else if ( elem.nodeType !== 8 ) {
                    ret += Sizzle.getText( elem.childNodes );
                }
            }

            return ret;
        };
		
		// 后面的每个用匿名函数创建的块级作用域都是用来进行浏览器特性检测的，可以使用浏览器新提供的API来对Sizzle定义的一些方法提供更高效的实现，或修正一些兼容性bug

        // 检测浏览器在调用getElementById时，会不会根据name选择元素，若存在，则重新定义Expr.find.ID和Expr.filter.ID，以处理兼容性。受影响的浏览器是IE6、IE7、IE8(Q)、某些版本的Opera
		// 同时也修改了getElementById方法参数不区分大小写的bug，因为受影响的浏览器是IE6、IE7、IE8(Q)
        (function(){
            // 先创建一个测试用的div节点，如<div><a name="script20120215"></a></div>
            var form = document.createElement("div"),
                id = "script" + (new Date()).getTime(),
                root = document.documentElement;

            form.innerHTML = "<a name='" + id + "'/>";

			// 在根节点下注入，检测完马上移除它
            root.insertBefore( form, root.firstChild );

            // 若getElementById根据name返回元素，则重新定义Expr.find.ID和Expr.filter.ID，以处理兼容性
            if ( document.getElementById( id ) ) {
                Expr.find.ID = function( match, context, isXML ) {
                    if ( typeof context.getElementById !== "undefined" && !isXML ) {
                        var m = context.getElementById(match[1]);

                        return m ? // 使用元素的id属性节点值再判断一下
                            m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                                [m] :
                                undefined :
                            [];
                    }
                };

                Expr.filter.ID = function( elem, match ) {
                    var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id"); // 使用元素的id属性节点值再判断一下

                    return elem.nodeType === 1 && node && node.nodeValue === match;
                };
            }

            root.removeChild( form ); // 移除注入的节点

            // 释放IE的内存
            root = form = null;
        })();

		// 检测浏览器在调用getElementsByTagName("*")时，是否只返回元素节点
        (function(){

            // 创建一个测试用的div节点，有注释子节点
            var div = document.createElement("div");
            div.appendChild( document.createComment("") );

            // 若返回注释节点，则重新定义Expr.find.TAG，以处理兼容性
            if ( div.getElementsByTagName("*").length > 0 ) {
                Expr.find.TAG = function( match, context ) {
                    var results = context.getElementsByTagName( match[1] );

                    if ( match[1] === "*" ) { // 对于getElementsByTagName("*")返回的NodeList，只保留其中的元素节点（nodeType为1）
                        var tmp = [];

                        for ( var i = 0; results[i]; i++ ) {
                            if ( results[i].nodeType === 1 ) {
                                tmp.push( results[i] );
                            }
                        }

                        results = tmp;
                    }

                    return results;
                };
            }

            // 如果想得到href里的未经转换、未经编码的原始内容，IE浏览器下全部使用getAttribute("href", 2)
            div.innerHTML = "<a href='#'></a>";

            if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
                    div.firstChild.getAttribute("href") !== "#" ) {

                Expr.attrHandle.href = function( elem ) {
                    return elem.getAttribute( "href", 2 );
                };
            }

            // 释放IE的内存
            div = null;
        })();

		// 如果浏览器支持document.querySelectorAll方法，用它来加速Sizzle
        if ( document.querySelectorAll ) {
            (function(){
                var oldSizzle = Sizzle, // 缓存已有的Sizzle定义
                    div = document.createElement("div"),
                    id = "__sizzle__";

                div.innerHTML = "<p class='TEST'></p>";

                // Safari在怪癖模式下不能处理大写或Unicode字符
                if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
                    return;
                }

                Sizzle = function( query, context, extra, seed ) { // 对比原Sizzle的定义：var Sizzle = function( selector, context, results, seed ) { ... }
                    context = context || document;

                    // 只在非XML文档上调用querySelectorAll（因为ID选择器不在非HTML文档上工作）
                    if ( !seed && !Sizzle.isXML(context) ) {
                        // 检测是否找到一个能被加速的选择器
                        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query ); // match[1]是单独的TAG，match[2]是单独的CLASS，match[3]是单独的ID

                        if ( match && (context.nodeType === 1 || context.nodeType === 9) ) { // 上下文为文档根元素或DOM元素
                            // 加速Sizzle("TAG")
                            if ( match[1] ) {
                                return makeArray( context.getElementsByTagName( query ), extra );

                            // 加速Sizzle(".CLASS")
                            } else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
                                return makeArray( context.getElementsByClassName( match[2] ), extra );
                            }
                        }

                        if ( context.nodeType === 9 ) { // 上下文为文档根元素
                            // 加速Sizzle("body")
                            if ( query === "body" && context.body ) {
                                return makeArray( [ context.body ], extra );

                            // 加速Sizzle("#ID")
                            } else if ( match && match[3] ) {
                                var elem = context.getElementById( match[3] );

                                // 检查parentNode，因为Blackberry 4.6会返回已经不在文档中的DOM元素，见#6963
                                if ( elem && elem.parentNode ) {
                                    // 处理IE和Opera中getElementById可能会根据name返回的bug，同时也处理getElementById不区分ID大小写的bug
                                    if ( elem.id === match[3] ) {
                                        return makeArray( [ elem ], extra );
                                    }

                                } else {
                                    return makeArray( [], extra ); // 没有根据ID找到DOM元素，返回空
                                }
                            }

                            try {
                                return makeArray( context.querySelectorAll(query), extra ); // 当上下文为根节点时可以放心地使用querySelectorAll
                            } catch(qsaError) {} // 在调用querySelectorAll时捕捉到异常，不会return，最终还是会调用原来定义的Sizzle

                        // querySelectorAll在上下文为DOM元素而文档非根元素时的策略与jQuery不同，见http://www.w3help.org/zh-cn/casestudies/003
                        // 处理这种情况的hack方法：使用一个额外的ID（Andrew Dupont提供的方法）
                        // IE8的object元素不支持这个方法
                        } else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                            var oldContext = context,
                                old = context.getAttribute( "id" ),
                                nid = old || id, // var id = "__sizzle__";
                                hasParent = context.parentNode,
                                relativeHierarchySelector = /^\s*[+~]/.test( query ); // 标记选择器块表达式中是否以相邻选择器或兄弟选择器开头

                            if ( !old ) {
                                context.setAttribute( "id", nid ); // 在上下文DOM元素上添加额外的ID
                            } else {
                                nid = nid.replace( /'/g, "\\$&" );
                            }
                            if ( relativeHierarchySelector && hasParent ) { // 若选择器块表达式以相邻选择器“+”或兄弟选择器“~”开头，则上下文变为原上下文的父节点（从左到右匹配中使用）
                                context = context.parentNode;
                            }

                            try {
                                if ( !relativeHierarchySelector || hasParent ) {
                                    return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra ); // 在querySelectorAll的选择器参数前面加上上下文节点的ID，这样就能保证所有中间节点也在上下文节点之下了
                                }

                            } catch(pseudoError) {
                            } finally {
                                if ( !old ) {
                                    oldContext.removeAttribute( "id" ); // 最后，去掉给上下文DOM元素额外添加的ID
                                }
                            }
                        }
                    }

                    return oldSizzle(query, context, extra, seed); // 对于没有加速的情况，调用原来定义的Sizzle
                };

                for ( var prop in oldSizzle ) { // 复制原先定义的Sizzle的各种属性方法到新的Sizzle定义中
                    Sizzle[ prop ] = oldSizzle[ prop ];
                }

                // 释放IE的内存
                div = null;
            })();
        }

		// 判断浏览器是否支持原生的matchesSelector方法，若支持，则重新定义已经在4000多行处定义的Sizzle.matchesSelector(node, expr)方法
        (function(){
            var html = document.documentElement,
                matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector; // 各浏览器是否存在私有的实现

            if ( matches ) {
                // 检测是否能在脱离文档的DOM元素上调用matchesSelector方法（IE9返回false）
                var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
                    pseudoWorks = false;

                try {
                    // 这样使用会抛出异常，但是Gecko则会返回false，即不能正确处理伪类选择器
                    matches.call( document.documentElement, "[test!='']:sizzle" );

                } catch( pseudoError ) { // 捕捉到异常，则能够正确处理伪类选择器
                    pseudoWorks = true;
                }

                Sizzle.matchesSelector = function( node, expr ) { // 重新定义已经在4000多行处定义的Sizzle.matchesSelector(node, expr)方法
                    // 确保属性选择器中的属性值两边有引号
                    expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                    if ( !Sizzle.isXML( node ) ) {
                        try {
                            if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) { // 能正确处理伪类选择器 || 不是Expr.match.PSEUDO中定义的伪类过滤器 || 不含“!=”
                                var ret = matches.call( node, expr );

                                if ( ret || !disconnectedMatch || // IE9的matchesSelector对于脱离文档的DOM元素返回false
                                        // 在IE9中，脱离文档的DOM元素被当作一个文档片段（nodeType为11）
                                        node.document && node.document.nodeType !== 11 ) {
                                    return ret;
                                }
                            }
                        } catch(e) {}
                    }
					
                    return Sizzle(expr, null, null, [node]).length > 0; // 若没有使用浏览器原生方法加速成功，则使用原Sizzle.matchesSelector的定义
                };
            }
        })();

		// 如果浏览器支持原生的getElementsByClassName的，则查找器查找顺序Expr.order变为ID、CLASS、NAME、TAG
        (function(){
            var div = document.createElement("div");

            div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            // Opera 9.6不能找到以空格分隔的第二个class
            // 确保支持getElementsByClassName方法
            if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
                return;
            }

            // Safari 3.2无法捕捉修改后的class属性
            div.lastChild.className = "e";
            if ( div.getElementsByClassName("e").length === 1 ) {
                return;
            }

			// 查找器查找顺序Expr.order变为ID、CLASS、NAME、TAG，并定义Expr.find.CLASS
            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function( match, context, isXML ) {
                if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
                    return context.getElementsByClassName(match[1]); // 使用原生的getElementsByClassName方法，match[1]中就是捕获到的CLASS名
                }
            };

            // 释放IE的内存
            div = null;
        })();

		// 路径节点检查（块间关系过滤器Expr.relative的后代选择器""和兄弟选择器~中使用，针对选择器表达式块只是一个TAG的情况）
        function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) { // dir为parentNode或previousSibling，cur是选择器块表达式
            for ( var i = 0, l = checkSet.length; i < l; i++ ) { // 遍历映射集checkSet中的每一个DOM元素
                var elem = checkSet[i];

                if ( elem ) {
                    var match = false;

                    elem = elem[dir];

                    while ( elem ) {
                        if ( elem.sizcache === doneName ) { // 使用缓存。elem的sizcache和sizset是一种缓存，方便快速匹配
                            match = checkSet[elem.sizset];
                            break; // 通过过滤，跳出循环
                        }

                        if ( elem.nodeType === 1 && !isXML ){ // 添加缓存
                            elem.sizcache = doneName;
                            elem.sizset = i;
                        }

                        if ( elem.nodeName.toLowerCase() === cur ) { // 前面的父节点或兄弟节点的TAG与选择器块表达式相匹配
                            match = elem;
                            break; // 通过过滤，跳出循环
                        }

                        elem = elem[dir]; // 沿parantNode向上（后代选择器） / 沿previousSibling向前（兄弟选择器）遍历
                    }

                    checkSet[i] = match; // match的初始值为false，只有匹配后才被赋值为相应的父节点或兄弟节点，最后把match赋值给checkSet[i]
                }
            }
        }

		// 路径检查（块间关系过滤器Expr.relative的后代选择器""和兄弟选择器~中使用，针对其他情况，与dirNodeCheck的实现逻辑大致相似，只是需要调用过滤器Sizzle.filter进行过滤）
        function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) { // dir为parentNode或previousSibling，cur是选择器块表达式
            for ( var i = 0, l = checkSet.length; i < l; i++ ) { // 遍历映射集checkSet中的每一个DOM元素
                var elem = checkSet[i];

                if ( elem ) {
                    var match = false;

                    elem = elem[dir];

                    while ( elem ) {
                        if ( elem.sizcache === doneName ) { // 使用缓存。elem的sizcache和sizset是一种缓存，方便快速匹配
                            match = checkSet[elem.sizset];
                            break; // 通过过滤，跳出循环
                        }

                        if ( elem.nodeType === 1 ) {
                            if ( !isXML ) { // 添加缓存
                                elem.sizcache = doneName;
                                elem.sizset = i;
                            }

                            if ( typeof cur !== "string" ) { // cur不是块表达式，而是DOM元素的情况（从左向右匹配中使用）
                                if ( elem === cur ) { // 若cur是elem，则把match标记为true
                                    match = true;
                                    break; // 通过过滤，跳出循环
                                }

                            } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) { // 以cur为块表达式，[elem]为候选集，调用过滤器Sizzle.filter进行过滤
                                match = elem;
                                break; // 通过过滤，跳出循环
                            }
                        }

                        elem = elem[dir]; // 沿parantNode向上（后代选择器） / 沿previousSibling向前（兄弟选择器）遍历
                    }

                    checkSet[i] = match; // match的初始值为false，只有匹配后才被赋值为相应的父节点或兄弟节点，最后把match赋值给checkSet[i]
                }
            }
        }

		// 检查一个节点是否包含在另一个节点之内
        if ( document.documentElement.contains ) { // 浏览器中有原生的contains方法
            Sizzle.contains = function( a, b ) {
                return a !== b && (a.contains ? a.contains(b) : true);
            };

        } else if ( document.documentElement.compareDocumentPosition ) { // 若没有原生的contains方法，则可以使用compareDocumentPosition方法比较元素之间的位置
            Sizzle.contains = function( a, b ) {
                return !!(a.compareDocumentPosition(b) & 16); // 比较元素之间的位置，5位二进制表示不同的值，由高到低分别为祖先、后代、前面、后面、自身，所以要&16
            };

        } else { // 否则，直接返回不包含。但是Zakas在《JavaScript高级程序设计》中还会进行手动比较，通过parentNode上溯寻找祖先节点
            Sizzle.contains = function() {
                return false;
            };
        }

		// 检查一个DOM元素是否在XML文档中（或者是一个XML文档）
        Sizzle.isXML = function( elem ) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

            return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

		// 位置选择器posProcess，在块表达式中含有位置过滤器而从左向右的查找、过滤中使用
        var posProcess = function( selector, context ) { // selector是选择器块表达式，如果遇到块间关系过滤器，再取一个块表达式。context是上下文，即候选集set
            var match,
                tmpSet = [],
                later = "",
                root = context.nodeType ? [context] : context; // 把context转换为数组root

            // Position selectors must be done after the filter
            // And so must :not(positional) so we move all PSEUDOs to the end
            while ( (match = Expr.match.PSEUDO.exec( selector )) ) { // 将块表达式中的伪类全部提取出来，存入伪类变量later，并删除块表达式中匹配的伪类
                later += match[0];
                selector = selector.replace( Expr.match.PSEUDO, "" );
            }

            selector = Expr.relative[selector] ? selector + "*" : selector;

            for ( var i = 0, l = root.length; i < l; i++ ) { // 以set中的每一个元素作为上下文，对剔除了伪类的块表达式，调用Sizzle函数执行完整的查找、过滤，并将将结果集合并，存储在tmpSet
                Sizzle( selector, root[i], tmpSet ); // 此处selector[0]可能为块间选择符>、+、~，这种情况在Sizzle主流程和Expr.relative中都有相应的处理
            }

            return Sizzle.filter( later, tmpSet ); // 将结果集tmpSet作为候选集，调用过滤器Sizzle.filter，将伪类作为过滤表达式，进行过滤，将返回的结果候选集作为下一个块表达式的上下文
        };

        // 暴露给jQuery的接口
        jQuery.find = Sizzle; // jQuery的静态find方法即为Sizzle，会被jQuery的包装集find方法调用
        jQuery.expr = Sizzle.selectors; // 即var Expr的定义（仅内部使用，不作为jQuery的API使用）
        jQuery.expr[":"] = jQuery.expr.filters; // 选择器扩展接口，扩展伪类过滤器（filters在4400多行定义）
        jQuery.unique = Sizzle.uniqueSort; // 对于DOM元素数组，删除数组中的重复元素，并按顺序排列；而对于普通数组，只能删除重复元素，不能排序
        jQuery.text = Sizzle.getText; // 得到匹配元素集合中每个元素的文本内容结合,包括他们的后代
        jQuery.isXMLDoc = Sizzle.isXML; // 检查一个DOM元素是否在XML文档中（或者是一个XML文档）
        jQuery.contains = Sizzle.contains; // 检查一个节点是否包含在另一个节点之内
    })();


    /*! 第9部分：DOM操作 */

    var runtil = /Until$/,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        // Note: This RegExp should be improved, or likely pulled from Sizzle
        rmultiselector = /,/,
        isSimple = /^.[^:#\[\.,]*$/,
        slice = Array.prototype.slice,
        POS = jQuery.expr.match.POS,
        // methods guaranteed to produce a unique set when starting from a unique set
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };

    jQuery.fn.extend({
        find: function( selector ) {
            var self = this,
                i, l;

            if ( typeof selector !== "string" ) {
                return jQuery( selector ).filter(function() {
                    for ( i = 0, l = self.length; i < l; i++ ) {
                        if ( jQuery.contains( self[ i ], this ) ) {
                            return true;
                        }
                    }
                });
            }

            var ret = this.pushStack( "", "find", selector ),
                length, n, r;

            for ( i = 0, l = this.length; i < l; i++ ) {
                length = ret.length;
                jQuery.find( selector, this[i], ret );

                if ( i > 0 ) {
                    // Make sure that the results are unique
                    for ( n = length; n < ret.length; n++ ) {
                        for ( r = 0; r < length; r++ ) {
                            if ( ret[r] === ret[n] ) {
                                ret.splice(n--, 1);
                                break;
                            }
                        }
                    }
                }
            }

            return ret;
        },

        has: function( target ) {
            var targets = jQuery( target );
            return this.filter(function() {
                for ( var i = 0, l = targets.length; i < l; i++ ) {
                    if ( jQuery.contains( this, targets[i] ) ) {
                        return true;
                    }
                }
            });
        },

        not: function( selector ) {
            return this.pushStack( winnow(this, selector, false), "not", selector);
        },

        filter: function( selector ) {
            return this.pushStack( winnow(this, selector, true), "filter", selector );
        },

        is: function( selector ) {
            return !!selector && ( typeof selector === "string" ?
                jQuery.filter( selector, this ).length > 0 :
                this.filter( selector ).length > 0 );
        },

        closest: function( selectors, context ) {
            var ret = [], i, l, cur = this[0];

            // Array
            if ( jQuery.isArray( selectors ) ) {
                var match, selector,
                    matches = {},
                    level = 1;

                if ( cur && selectors.length ) {
                    for ( i = 0, l = selectors.length; i < l; i++ ) {
                        selector = selectors[i];

                        if ( !matches[ selector ] ) {
                            matches[ selector ] = POS.test( selector ) ?
                                jQuery( selector, context || this.context ) :
                                selector;
                        }
                    }

                    while ( cur && cur.ownerDocument && cur !== context ) {
                        for ( selector in matches ) {
                            match = matches[ selector ];

                            if ( match.jquery ? match.index( cur ) > -1 : jQuery( cur ).is( match ) ) {
                                ret.push({ selector: selector, elem: cur, level: level });
                            }
                        }

                        cur = cur.parentNode;
                        level++;
                    }
                }

                return ret;
            }

            // String
            var pos = POS.test( selectors ) || typeof selectors !== "string" ?
                    jQuery( selectors, context || this.context ) :
                    0;

            for ( i = 0, l = this.length; i < l; i++ ) {
                cur = this[i];

                while ( cur ) {
                    if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
                        ret.push( cur );
                        break;

                    } else {
                        cur = cur.parentNode;
                        if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
                            break;
                        }
                    }
                }
            }

            ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

            return this.pushStack( ret, "closest", selectors );
        },

        // Determine the position of an element within
        // the matched set of elements
        index: function( elem ) {
            if ( !elem || typeof elem === "string" ) {
                return jQuery.inArray( this[0],
                    // If it receives a string, the selector is used
                    // If it receives nothing, the siblings are used
                    elem ? jQuery( elem ) : this.parent().children() );
            }
            // Locate the position of the desired element
            return jQuery.inArray(
                // If it receives a jQuery object, the first element is used
                elem.jquery ? elem[0] : elem, this );
        },

        add: function( selector, context ) {
            var set = typeof selector === "string" ?
                    jQuery( selector, context ) :
                    jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
                all = jQuery.merge( this.get(), set );

            return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
                all :
                jQuery.unique( all ) );
        },

        andSelf: function() {
            return this.add( this.prevObject );
        }
    });

    // A painfully simple check to see if an element is disconnected
    // from a document (should be improved, where feasible).
    function isDisconnected( node ) {
        return !node || !node.parentNode || node.parentNode.nodeType === 11;
    }

    jQuery.each({
        parent: function( elem ) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function( elem ) {
            return jQuery.dir( elem, "parentNode" );
        },
        parentsUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "parentNode", until );
        },
        next: function( elem ) {
            return jQuery.nth( elem, 2, "nextSibling" );
        },
        prev: function( elem ) {
            return jQuery.nth( elem, 2, "previousSibling" );
        },
        nextAll: function( elem ) {
            return jQuery.dir( elem, "nextSibling" );
        },
        prevAll: function( elem ) {
            return jQuery.dir( elem, "previousSibling" );
        },
        nextUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "nextSibling", until );
        },
        prevUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "previousSibling", until );
        },
        siblings: function( elem ) {
            return jQuery.sibling( elem.parentNode.firstChild, elem );
        },
        children: function( elem ) {
            return jQuery.sibling( elem.firstChild );
        },
        contents: function( elem ) {
            return jQuery.nodeName( elem, "iframe" ) ?
                elem.contentDocument || elem.contentWindow.document :
                jQuery.makeArray( elem.childNodes );
        }
    }, function( name, fn ) {
        jQuery.fn[ name ] = function( until, selector ) {
            var ret = jQuery.map( this, fn, until ),
                // The variable 'args' was introduced in
                // https://github.com/jquery/jquery/commit/52a0238
                // to work around a bug in Chrome 10 (Dev) and should be removed when the bug is fixed.
                // http://code.google.com/p/v8/issues/detail?id=1050
                args = slice.call(arguments);

            if ( !runtil.test( name ) ) {
                selector = until;
            }

            if ( selector && typeof selector === "string" ) {
                ret = jQuery.filter( selector, ret );
            }

            ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

            if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
                ret = ret.reverse();
            }

            return this.pushStack( ret, name, args.join(",") );
        };
    });

    jQuery.extend({
        filter: function( expr, elems, not ) {
            if ( not ) {
                expr = ":not(" + expr + ")";
            }

            return elems.length === 1 ?
                jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
                jQuery.find.matches(expr, elems);
        },

        dir: function( elem, dir, until ) {
            var matched = [],
                cur = elem[ dir ];

            while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
                if ( cur.nodeType === 1 ) {
                    matched.push( cur );
                }
                cur = cur[dir];
            }
            return matched;
        },

        nth: function( cur, result, dir, elem ) {
            result = result || 1;
            var num = 0;

            for ( ; cur; cur = cur[dir] ) {
                if ( cur.nodeType === 1 && ++num === result ) {
                    break;
                }
            }

            return cur;
        },

        sibling: function( n, elem ) {
            var r = [];

            for ( ; n; n = n.nextSibling ) {
                if ( n.nodeType === 1 && n !== elem ) {
                    r.push( n );
                }
            }

            return r;
        }
    });

    // Implement the identical functionality for filter and not
    function winnow( elements, qualifier, keep ) {

        // Can't pass null or undefined to indexOf in Firefox 4
        // Set to 0 to skip string check
        qualifier = qualifier || 0;

        if ( jQuery.isFunction( qualifier ) ) {
            return jQuery.grep(elements, function( elem, i ) {
                var retVal = !!qualifier.call( elem, i, elem );
                return retVal === keep;
            });

        } else if ( qualifier.nodeType ) {
            return jQuery.grep(elements, function( elem, i ) {
                return (elem === qualifier) === keep;
            });

        } else if ( typeof qualifier === "string" ) {
            var filtered = jQuery.grep(elements, function( elem ) {
                return elem.nodeType === 1;
            });

            if ( isSimple.test( qualifier ) ) {
                return jQuery.filter(qualifier, filtered, !keep);
            } else {
                qualifier = jQuery.filter( qualifier, filtered );
            }
        }

        return jQuery.grep(elements, function( elem, i ) {
            return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
        });
    }

    var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
        rleadingWhitespace = /^\s+/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rtagName = /<([\w:]+)/,
        rtbody = /<tbody/i,
        rhtml = /<|&#?\w+;/,
        rnocache = /<(?:script|object|embed|option|style)/i,
        // checked="checked" or checked
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /\/(java|ecma)script/i,
        rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
        wrapMap = {
            option: [ 1, "<select multiple='multiple'>", "</select>" ],
            legend: [ 1, "<fieldset>", "</fieldset>" ],
            thead: [ 1, "<table>", "</table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
            area: [ 1, "<map>", "</map>" ],
            _default: [ 0, "", "" ]
        };

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    // IE can't serialize <link> and <script> tags normally
    if ( !jQuery.support.htmlSerialize ) {
        wrapMap._default = [ 1, "div<div>", "</div>" ];
    }

    jQuery.fn.extend({
        text: function( text ) {
            if ( jQuery.isFunction(text) ) {
                return this.each(function(i) {
                    var self = jQuery( this );

                    self.text( text.call(this, i, self.text()) );
                });
            }

            if ( typeof text !== "object" && text !== undefined ) {
                return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
            }

            return jQuery.text( this );
        },

        wrapAll: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function(i) {
                    jQuery(this).wrapAll( html.call(this, i) );
                });
            }

            if ( this[0] ) {
                // The elements to wrap the target around
                var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

                if ( this[0].parentNode ) {
                    wrap.insertBefore( this[0] );
                }

                wrap.map(function() {
                    var elem = this;

                    while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
                        elem = elem.firstChild;
                    }

                    return elem;
                }).append( this );
            }

            return this;
        },

        wrapInner: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function(i) {
                    jQuery(this).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = jQuery( this ),
                    contents = self.contents();

                if ( contents.length ) {
                    contents.wrapAll( html );

                } else {
                    self.append( html );
                }
            });
        },

        wrap: function( html ) {
            return this.each(function() {
                jQuery( this ).wrapAll( html );
            });
        },

        unwrap: function() {
            return this.parent().each(function() {
                if ( !jQuery.nodeName( this, "body" ) ) {
                    jQuery( this ).replaceWith( this.childNodes );
                }
            }).end();
        },

        append: function() {
            return this.domManip(arguments, true, function( elem ) {
                if ( this.nodeType === 1 ) {
                    this.appendChild( elem );
                }
            });
        },

        prepend: function() {
            return this.domManip(arguments, true, function( elem ) {
                if ( this.nodeType === 1 ) {
                    this.insertBefore( elem, this.firstChild );
                }
            });
        },

        before: function() {
            if ( this[0] && this[0].parentNode ) {
                return this.domManip(arguments, false, function( elem ) {
                    this.parentNode.insertBefore( elem, this );
                });
            } else if ( arguments.length ) {
                var set = jQuery(arguments[0]);
                set.push.apply( set, this.toArray() );
                return this.pushStack( set, "before", arguments );
            }
        },

        after: function() {
            if ( this[0] && this[0].parentNode ) {
                return this.domManip(arguments, false, function( elem ) {
                    this.parentNode.insertBefore( elem, this.nextSibling );
                });
            } else if ( arguments.length ) {
                var set = this.pushStack( this, "after", arguments );
                set.push.apply( set, jQuery(arguments[0]).toArray() );
                return set;
            }
        },

        // keepData is for internal use only--do not document
        remove: function( selector, keepData ) {
            for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
                if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
                    if ( !keepData && elem.nodeType === 1 ) {
                        jQuery.cleanData( elem.getElementsByTagName("*") );
                        jQuery.cleanData( [ elem ] );
                    }

                    if ( elem.parentNode ) {
                        elem.parentNode.removeChild( elem );
                    }
                }
            }

            return this;
        },

        empty: function() {
            for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
                // Remove element nodes and prevent memory leaks
                if ( elem.nodeType === 1 ) {
                    jQuery.cleanData( elem.getElementsByTagName("*") );
                }

                // Remove any remaining nodes
                while ( elem.firstChild ) {
                    elem.removeChild( elem.firstChild );
                }
            }

            return this;
        },

        clone: function( dataAndEvents, deepDataAndEvents ) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

            return this.map( function () {
                return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
            });
        },

        html: function( value ) {
            if ( value === undefined ) {
                return this[0] && this[0].nodeType === 1 ?
                    this[0].innerHTML.replace(rinlinejQuery, "") :
                    null;

            // See if we can take a shortcut and just use innerHTML
            } else if ( typeof value === "string" && !rnocache.test( value ) &&
                (jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
                !wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

                value = value.replace(rxhtmlTag, "<$1></$2>");

                try {
                    for ( var i = 0, l = this.length; i < l; i++ ) {
                        // Remove element nodes and prevent memory leaks
                        if ( this[i].nodeType === 1 ) {
                            jQuery.cleanData( this[i].getElementsByTagName("*") );
                            this[i].innerHTML = value;
                        }
                    }

                // If using innerHTML throws an exception, use the fallback method
                } catch(e) {
                    this.empty().append( value );
                }

            } else if ( jQuery.isFunction( value ) ) {
                this.each(function(i){
                    var self = jQuery( this );

                    self.html( value.call(this, i, self.html()) );
                });

            } else {
                this.empty().append( value );
            }

            return this;
        },

        replaceWith: function( value ) {
            if ( this[0] && this[0].parentNode ) {
                // Make sure that the elements are removed from the DOM before they are inserted
                // this can help fix replacing a parent with child elements
                if ( jQuery.isFunction( value ) ) {
                    return this.each(function(i) {
                        var self = jQuery(this), old = self.html();
                        self.replaceWith( value.call( this, i, old ) );
                    });
                }

                if ( typeof value !== "string" ) {
                    value = jQuery( value ).detach();
                }

                return this.each(function() {
                    var next = this.nextSibling,
                        parent = this.parentNode;

                    jQuery( this ).remove();

                    if ( next ) {
                        jQuery(next).before( value );
                    } else {
                        jQuery(parent).append( value );
                    }
                });
            } else {
                return this.length ?
                    this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
                    this;
            }
        },

        detach: function( selector ) {
            return this.remove( selector, true );
        },

        domManip: function( args, table, callback ) {
            var results, first, fragment, parent,
                value = args[0],
                scripts = [];

            // We can't cloneNode fragments that contain checked, in WebKit
            if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
                return this.each(function() {
                    jQuery(this).domManip( args, table, callback, true );
                });
            }

            if ( jQuery.isFunction(value) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    args[0] = value.call(this, i, table ? self.html() : undefined);
                    self.domManip( args, table, callback );
                });
            }

            if ( this[0] ) {
                parent = value && value.parentNode;

                // If we're in a fragment, just use that instead of building a new one
                if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
                    results = { fragment: parent };

                } else {
                    results = jQuery.buildFragment( args, this, scripts );
                }

                fragment = results.fragment;

                if ( fragment.childNodes.length === 1 ) {
                    first = fragment = fragment.firstChild;
                } else {
                    first = fragment.firstChild;
                }

                if ( first ) {
                    table = table && jQuery.nodeName( first, "tr" );

                    for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
                        callback.call(
                            table ?
                                root(this[i], first) :
                                this[i],
                            // Make sure that we do not leak memory by inadvertently discarding
                            // the original fragment (which might have attached data) instead of
                            // using it; in addition, use the original fragment object for the last
                            // item instead of first because it can end up being emptied incorrectly
                            // in certain situations (Bug #8070).
                            // Fragments from the fragment cache must always be cloned and never used
                            // in place.
                            results.cacheable || (l > 1 && i < lastIndex) ?
                                jQuery.clone( fragment, true, true ) :
                                fragment
                        );
                    }
                }

                if ( scripts.length ) {
                    jQuery.each( scripts, evalScript );
                }
            }

            return this;
        }
    });

    function root( elem, cur ) {
        return jQuery.nodeName(elem, "table") ?
            (elem.getElementsByTagName("tbody")[0] ||
            elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
            elem;
    }

    function cloneCopyEvent( src, dest ) {

        if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
            return;
        }

        var internalKey = jQuery.expando,
            oldData = jQuery.data( src ),
            curData = jQuery.data( dest, oldData );

        // Switch to use the internal data object, if it exists, for the next
        // stage of data copying
        if ( (oldData = oldData[ internalKey ]) ) {
            var events = oldData.events;
                    curData = curData[ internalKey ] = jQuery.extend({}, oldData);

            if ( events ) {
                delete curData.handle;
                curData.events = {};

                for ( var type in events ) {
                    for ( var i = 0, l = events[ type ].length; i < l; i++ ) {
                        jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
                    }
                }
            }
        }
    }

    function cloneFixAttributes( src, dest ) {
        var nodeName;

        // We do not need to do anything for non-Elements
        if ( dest.nodeType !== 1 ) {
            return;
        }

        // clearAttributes removes the attributes, which we don't want,
        // but also removes the attachEvent events, which we *do* want
        if ( dest.clearAttributes ) {
            dest.clearAttributes();
        }

        // mergeAttributes, in contrast, only merges back on the
        // original attributes, not the events
        if ( dest.mergeAttributes ) {
            dest.mergeAttributes( src );
        }

        nodeName = dest.nodeName.toLowerCase();

        // IE6-8 fail to clone children inside object elements that use
        // the proprietary classid attribute value (rather than the type
        // attribute) to identify the type of content to display
        if ( nodeName === "object" ) {
            dest.outerHTML = src.outerHTML;

        } else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
            // IE6-8 fails to persist the checked state of a cloned checkbox
            // or radio button. Worse, IE6-7 fail to give the cloned element
            // a checked appearance if the defaultChecked value isn't also set
            if ( src.checked ) {
                dest.defaultChecked = dest.checked = src.checked;
            }

            // IE6-7 get confused and end up setting the value of a cloned
            // checkbox/radio button to an empty string instead of "on"
            if ( dest.value !== src.value ) {
                dest.value = src.value;
            }

        // IE6-8 fails to return the selected option to the default selected
        // state when cloning options
        } else if ( nodeName === "option" ) {
            dest.selected = src.defaultSelected;

        // IE6-8 fails to set the defaultValue to the correct value when
        // cloning other types of input fields
        } else if ( nodeName === "input" || nodeName === "textarea" ) {
            dest.defaultValue = src.defaultValue;
        }

        // Event data gets referenced instead of copied if the expando
        // gets copied too
        dest.removeAttribute( jQuery.expando );
    }

    jQuery.buildFragment = function( args, nodes, scripts ) {
        var fragment, cacheable, cacheresults,
            doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

        // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
        // Cloning options loses the selected state, so don't cache them
        // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
        // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
        if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
            args[0].charAt(0) === "<" && !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

            cacheable = true;

            cacheresults = jQuery.fragments[ args[0] ];
            if ( cacheresults && cacheresults !== 1 ) {
                fragment = cacheresults;
            }
        }

        if ( !fragment ) {
            fragment = doc.createDocumentFragment();
            jQuery.clean( args, doc, fragment, scripts );
        }

        if ( cacheable ) {
            jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
        }

        return { fragment: fragment, cacheable: cacheable };
    };

    jQuery.fragments = {};

    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function( name, original ) {
        jQuery.fn[ name ] = function( selector ) {
            var ret = [],
                insert = jQuery( selector ),
                parent = this.length === 1 && this[0].parentNode;

            if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
                insert[ original ]( this[0] );
                return this;

            } else {
                for ( var i = 0, l = insert.length; i < l; i++ ) {
                    var elems = (i > 0 ? this.clone(true) : this).get();
                    jQuery( insert[i] )[ original ]( elems );
                    ret = ret.concat( elems );
                }

                return this.pushStack( ret, name, insert.selector );
            }
        };
    });

    function getAll( elem ) {
        if ( "getElementsByTagName" in elem ) {
            return elem.getElementsByTagName( "*" );

        } else if ( "querySelectorAll" in elem ) {
            return elem.querySelectorAll( "*" );

        } else {
            return [];
        }
    }

    // Used in clean, fixes the defaultChecked property
    function fixDefaultChecked( elem ) {
        if ( elem.type === "checkbox" || elem.type === "radio" ) {
            elem.defaultChecked = elem.checked;
        }
    }
    // Finds all inputs and passes them to fixDefaultChecked
    function findInputs( elem ) {
        if ( jQuery.nodeName( elem, "input" ) ) {
            fixDefaultChecked( elem );
        } else if ( elem.getElementsByTagName ) {
            jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
        }
    }

    jQuery.extend({
        clone: function( elem, dataAndEvents, deepDataAndEvents ) {
            var clone = elem.cloneNode(true),
                    srcElements,
                    destElements,
                    i;

            if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
                    (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
                // IE copies events bound via attachEvent when using cloneNode.
                // Calling detachEvent on the clone will also remove the events
                // from the original. In order to get around this, we use some
                // proprietary methods to clear the events. Thanks to MooTools
                // guys for this hotness.

                cloneFixAttributes( elem, clone );

                // Using Sizzle here is crazy slow, so we use getElementsByTagName
                // instead
                srcElements = getAll( elem );
                destElements = getAll( clone );

                // Weird iteration because IE will replace the length property
                // with an element if you are cloning the body and one of the
                // elements on the page has a name or id of "length"
                for ( i = 0; srcElements[i]; ++i ) {
                    cloneFixAttributes( srcElements[i], destElements[i] );
                }
            }

            // Copy the events from the original to the clone
            if ( dataAndEvents ) {
                cloneCopyEvent( elem, clone );

                if ( deepDataAndEvents ) {
                    srcElements = getAll( elem );
                    destElements = getAll( clone );

                    for ( i = 0; srcElements[i]; ++i ) {
                        cloneCopyEvent( srcElements[i], destElements[i] );
                    }
                }
            }

            // Return the cloned set
            return clone;
        },

        clean: function( elems, context, fragment, scripts ) {
            var checkScriptType;

            context = context || document;

            // !context.createElement fails in IE with an error but returns typeof 'object'
            if ( typeof context.createElement === "undefined" ) {
                context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            }

            var ret = [], j;

            for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
                if ( typeof elem === "number" ) {
                    elem += "";
                }

                if ( !elem ) {
                    continue;
                }

                // Convert html string into DOM nodes
                if ( typeof elem === "string" ) {
                    if ( !rhtml.test( elem ) ) {
                        elem = context.createTextNode( elem );
                    } else {
                        // Fix "XHTML"-style tags in all browsers
                        elem = elem.replace(rxhtmlTag, "<$1></$2>");

                        // Trim whitespace, otherwise indexOf won't work as expected
                        var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
                            wrap = wrapMap[ tag ] || wrapMap._default,
                            depth = wrap[0],
                            div = context.createElement("div");

                        // Go to html and back, then peel off extra wrappers
                        div.innerHTML = wrap[1] + elem + wrap[2];

                        // Move to the right depth
                        while ( depth-- ) {
                            div = div.lastChild;
                        }

                        // Remove IE's autoinserted <tbody> from table fragments
                        if ( !jQuery.support.tbody ) {

                            // String was a <table>, *may* have spurious <tbody>
                            var hasBody = rtbody.test(elem),
                                tbody = tag === "table" && !hasBody ?
                                    div.firstChild && div.firstChild.childNodes :

                                    // String was a bare <thead> or <tfoot>
                                    wrap[1] === "<table>" && !hasBody ?
                                        div.childNodes :
                                        [];

                            for ( j = tbody.length - 1; j >= 0 ; --j ) {
                                if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                                    tbody[ j ].parentNode.removeChild( tbody[ j ] );
                                }
                            }
                        }

                        // IE completely kills leading whitespace when innerHTML is used
                        if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
                            div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
                        }

                        elem = div.childNodes;
                    }
                }

                // Resets defaultChecked for any radios and checkboxes
                // about to be appended to the DOM in IE 6/7 (#8060)
                var len;
                if ( !jQuery.support.appendChecked ) {
                    if ( elem[0] && typeof (len = elem.length) === "number" ) {
                        for ( j = 0; j < len; j++ ) {
                            findInputs( elem[j] );
                        }
                    } else {
                        findInputs( elem );
                    }
                }

                if ( elem.nodeType ) {
                    ret.push( elem );
                } else {
                    ret = jQuery.merge( ret, elem );
                }
            }

            if ( fragment ) {
                checkScriptType = function( elem ) {
                    return !elem.type || rscriptType.test( elem.type );
                };
                for ( i = 0; ret[i]; i++ ) {
                    if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
                        scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

                    } else {
                        if ( ret[i].nodeType === 1 ) {
                            var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

                            ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
                        }
                        fragment.appendChild( ret[i] );
                    }
                }
            }

            return ret;
        },

        cleanData: function( elems ) {
            var data, id, cache = jQuery.cache, internalKey = jQuery.expando, special = jQuery.event.special,
                deleteExpando = jQuery.support.deleteExpando;

            for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
                if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
                    continue;
                }

                id = elem[ jQuery.expando ];

                if ( id ) {
                    data = cache[ id ] && cache[ id ][ internalKey ];

                    if ( data && data.events ) {
                        for ( var type in data.events ) {
                            if ( special[ type ] ) {
                                jQuery.event.remove( elem, type );

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                            } else {
                                jQuery.removeEvent( elem, type, data.handle );
                            }
                        }

                        // Null the DOM reference to avoid IE6/7/8 leak (#7054)
                        if ( data.handle ) {
                            data.handle.elem = null;
                        }
                    }

                    if ( deleteExpando ) {
                        delete elem[ jQuery.expando ];

                    } else if ( elem.removeAttribute ) {
                        elem.removeAttribute( jQuery.expando );
                    }

                    delete cache[ id ];
                }
            }
        }
    });

    function evalScript( i, elem ) {
        if ( elem.src ) {
            jQuery.ajax({
                url: elem.src,
                async: false,
                dataType: "script"
            });
        } else {
            jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
        }

        if ( elem.parentNode ) {
            elem.parentNode.removeChild( elem );
        }
    }


    /*! 第10部分：CSS操作 */

    var ralpha = /alpha\([^)]*\)/i,
        ropacity = /opacity=([^)]*)/,
        rdashAlpha = /-([a-z])/ig,
        // fixed for IE9, see #8346
        rupper = /([A-Z]|^ms)/g,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/,
        rrelNum = /^[+\-]=/,
        rrelNumFilter = /[^+\-\.\de]+/g,

        cssShow = { position: "absolute", visibility: "hidden", display: "block" },
        cssWidth = [ "Left", "Right" ],
        cssHeight = [ "Top", "Bottom" ],
        curCSS,

        getComputedStyle,
        currentStyle,

        fcamelCase = function( all, letter ) {
            return letter.toUpperCase();
        };

    jQuery.fn.css = function( name, value ) {
        // Setting 'undefined' is a no-op
        if ( arguments.length === 2 && value === undefined ) {
            return this;
        }

        return jQuery.access( this, name, value, true, function( elem, name, value ) {
            return value !== undefined ?
                jQuery.style( elem, name, value ) :
                jQuery.css( elem, name );
        });
    };

    jQuery.extend({
        // Add in style property hooks for overriding the default
        // behavior of getting and setting a style property
        cssHooks: {
            opacity: {
                get: function( elem, computed ) {
                    if ( computed ) {
                        // We should always get a number back from opacity
                        var ret = curCSS( elem, "opacity", "opacity" );
                        return ret === "" ? "1" : ret;

                    } else {
                        return elem.style.opacity;
                    }
                }
            }
        },

        // Exclude the following css properties to add px
        cssNumber: {
            "zIndex": true,
            "fontWeight": true,
            "opacity": true,
            "zoom": true,
            "lineHeight": true,
            "widows": true,
            "orphans": true
        },

        // Add in properties whose names you wish to fix before
        // setting or getting the value
        cssProps: {
            // normalize float css property
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },

        // Get and set the style property on a DOM Node
        style: function( elem, name, value, extra ) {
            // Don't set styles on text and comment nodes
            if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
                return;
            }

            // Make sure that we're working with the right name
            var ret, type, origName = jQuery.camelCase( name ),
                style = elem.style, hooks = jQuery.cssHooks[ origName ];

            name = jQuery.cssProps[ origName ] || origName;

            // Check if we're setting a value
            if ( value !== undefined ) {
                type = typeof value;

                // Make sure that NaN and null values aren't set. See: #7116
                if ( type === "number" && isNaN( value ) || value == null ) {
                    return;
                }

                // convert relative number strings (+= or -=) to relative numbers. #7345
                if ( type === "string" && rrelNum.test( value ) ) {
                    value = +value.replace( rrelNumFilter, "" ) + parseFloat( jQuery.css( elem, name ) );
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
                    value += "px";
                }

                // If a hook was provided, use that value, otherwise just set the specified value
                if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
                    // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
                    // Fixes bug #5509
                    try {
                        style[ name ] = value;
                    } catch(e) {}
                }

            } else {
                // If a hook was provided get the non-computed value from there
                if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
                    return ret;
                }

                // Otherwise just get the value from the style object
                return style[ name ];
            }
        },

        css: function( elem, name, extra ) {
            var ret, hooks;

            // Make sure that we're working with the right name
            name = jQuery.camelCase( name );
            hooks = jQuery.cssHooks[ name ];
            name = jQuery.cssProps[ name ] || name;

            // cssFloat needs a special treatment
            if ( name === "cssFloat" ) {
                name = "float";
            }

            // If a hook was provided get the computed value from there
            if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
                return ret;

            // Otherwise, if a way to get the computed value exists, use that
            } else if ( curCSS ) {
                return curCSS( elem, name );
            }
        },

        // A method for quickly swapping in/out CSS properties to get correct calculations
        swap: function( elem, options, callback ) {
            var old = {};

            // Remember the old values, and insert the new ones
            for ( var name in options ) {
                old[ name ] = elem.style[ name ];
                elem.style[ name ] = options[ name ];
            }

            callback.call( elem );

            // Revert the old values
            for ( name in options ) {
                elem.style[ name ] = old[ name ];
            }
        },

        camelCase: function( string ) {
            return string.replace( rdashAlpha, fcamelCase );
        }
    });

    // DEPRECATED, Use jQuery.css() instead
    jQuery.curCSS = jQuery.css;

    jQuery.each(["height", "width"], function( i, name ) {
        jQuery.cssHooks[ name ] = {
            get: function( elem, computed, extra ) {
                var val;

                if ( computed ) {
                    if ( elem.offsetWidth !== 0 ) {
                        val = getWH( elem, name, extra );

                    } else {
                        jQuery.swap( elem, cssShow, function() {
                            val = getWH( elem, name, extra );
                        });
                    }

                    if ( val <= 0 ) {
                        val = curCSS( elem, name, name );

                        if ( val === "0px" && currentStyle ) {
                            val = currentStyle( elem, name, name );
                        }

                        if ( val != null ) {
                            // Should return "auto" instead of 0, use 0 for
                            // temporary backwards-compat
                            return val === "" || val === "auto" ? "0px" : val;
                        }
                    }

                    if ( val < 0 || val == null ) {
                        val = elem.style[ name ];

                        // Should return "auto" instead of 0, use 0 for
                        // temporary backwards-compat
                        return val === "" || val === "auto" ? "0px" : val;
                    }

                    return typeof val === "string" ? val : val + "px";
                }
            },

            set: function( elem, value ) {
                if ( rnumpx.test( value ) ) {
                    // ignore negative width and height values #1599
                    value = parseFloat(value);

                    if ( value >= 0 ) {
                        return value + "px";
                    }

                } else {
                    return value;
                }
            }
        };
    });

    if ( !jQuery.support.opacity ) {
        jQuery.cssHooks.opacity = {
            get: function( elem, computed ) {
                // IE uses filters for opacity
                return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
                    ( parseFloat( RegExp.$1 ) / 100 ) + "" :
                    computed ? "1" : "";
            },

            set: function( elem, value ) {
                var style = elem.style,
                    currentStyle = elem.currentStyle;

                // IE has trouble with opacity if it does not have layout
                // Force it by setting the zoom level
                style.zoom = 1;

                // Set the alpha filter to set the opacity
                var opacity = jQuery.isNaN( value ) ?
                    "" :
                    "alpha(opacity=" + value * 100 + ")",
                    filter = currentStyle && currentStyle.filter || style.filter || "";

                style.filter = ralpha.test( filter ) ?
                    filter.replace( ralpha, opacity ) :
                    filter + " " + opacity;
            }
        };
    }

    jQuery(function() {
        // This hook cannot be added until DOM ready because the support test
        // for it is not run until after DOM ready
        if ( !jQuery.support.reliableMarginRight ) {
            jQuery.cssHooks.marginRight = {
                get: function( elem, computed ) {
                    // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                    // Work around by temporarily setting element display to inline-block
                    var ret;
                    jQuery.swap( elem, { "display": "inline-block" }, function() {
                        if ( computed ) {
                            ret = curCSS( elem, "margin-right", "marginRight" );
                        } else {
                            ret = elem.style.marginRight;
                        }
                    });
                    return ret;
                }
            };
        }
    });

    if ( document.defaultView && document.defaultView.getComputedStyle ) {
        getComputedStyle = function( elem, name ) {
            var ret, defaultView, computedStyle;

            name = name.replace( rupper, "-$1" ).toLowerCase();

            if ( !(defaultView = elem.ownerDocument.defaultView) ) {
                return undefined;
            }

            if ( (computedStyle = defaultView.getComputedStyle( elem, null )) ) {
                ret = computedStyle.getPropertyValue( name );
                if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
                    ret = jQuery.style( elem, name );
                }
            }

            return ret;
        };
    }

    if ( document.documentElement.currentStyle ) {
        currentStyle = function( elem, name ) {
            var left,
                ret = elem.currentStyle && elem.currentStyle[ name ],
                rsLeft = elem.runtimeStyle && elem.runtimeStyle[ name ],
                style = elem.style;

            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
                // Remember the original values
                left = style.left;

                // Put in the new values to get a computed value out
                if ( rsLeft ) {
                    elem.runtimeStyle.left = elem.currentStyle.left;
                }
                style.left = name === "fontSize" ? "1em" : (ret || 0);
                ret = style.pixelLeft + "px";

                // Revert the changed values
                style.left = left;
                if ( rsLeft ) {
                    elem.runtimeStyle.left = rsLeft;
                }
            }

            return ret === "" ? "auto" : ret;
        };
    }

    curCSS = getComputedStyle || currentStyle;

    function getWH( elem, name, extra ) {
        var which = name === "width" ? cssWidth : cssHeight,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

        if ( extra === "border" ) {
            return val;
        }

        jQuery.each( which, function() {
            if ( !extra ) {
                val -= parseFloat(jQuery.css( elem, "padding" + this )) || 0;
            }

            if ( extra === "margin" ) {
                val += parseFloat(jQuery.css( elem, "margin" + this )) || 0;

            } else {
                val -= parseFloat(jQuery.css( elem, "border" + this + "Width" )) || 0;
            }
        });

        return val;
    }

    if ( jQuery.expr && jQuery.expr.filters ) {
        jQuery.expr.filters.hidden = function( elem ) {
            var width = elem.offsetWidth,
                height = elem.offsetHeight;

            return (width === 0 && height === 0) || (!jQuery.support.reliableHiddenOffsets && (elem.style.display || jQuery.css( elem, "display" )) === "none");
        };

        jQuery.expr.filters.visible = function( elem ) {
            return !jQuery.expr.filters.hidden( elem );
        };
    }


    /*! 第11部分：Ajax操作 */

    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rhash = /#.*$/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
        // #7653, #8125, #8152: local protocol detection
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rprotocol = /^\/\//,
        rquery = /\?/,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        rselectTextarea = /^(?:select|textarea)/i,
        rspacesAjax = /\s+/,
        rts = /([?&])_=[^&]*/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

        // Keep a copy of the old load method
        _load = jQuery.fn.load,

        /* Prefilters
         * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
         * 2) These are called:
         *    - BEFORE asking for a transport
         *    - AFTER param serialization (s.data is a string if s.processData is true)
         * 3) key is the dataType
         * 4) the catchall symbol "*" can be used
         * 5) execution will start with transport dataType and THEN continue down to "*" if needed
         */
        prefilters = {},

        /* Transports bindings
         * 1) key is the dataType
         * 2) the catchall symbol "*" can be used
         * 3) selection will start with transport dataType and THEN go to "*" if needed
         */
        transports = {},

        // Document location
        ajaxLocation,

        // Document location segments
        ajaxLocParts;

    // #8138, IE may throw an exception when accessing
    // a field from window.location if document.domain has been set
    try {
        ajaxLocation = location.href;
    } catch( e ) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        ajaxLocation = document.createElement( "a" );
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }

    // Segment location into parts
    ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

    // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports( structure ) {

        // dataTypeExpression is optional and defaults to "*"
        return function( dataTypeExpression, func ) {

            if ( typeof dataTypeExpression !== "string" ) {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            if ( jQuery.isFunction( func ) ) {
                var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
                    i = 0,
                    length = dataTypes.length,
                    dataType,
                    list,
                    placeBefore;

                // For each dataType in the dataTypeExpression
                for(; i < length; i++ ) {
                    dataType = dataTypes[ i ];
                    // We control if we're asked to add before
                    // any existing element
                    placeBefore = /^\+/.test( dataType );
                    if ( placeBefore ) {
                        dataType = dataType.substr( 1 ) || "*";
                    }
                    list = structure[ dataType ] = structure[ dataType ] || [];
                    // then we add to the structure accordingly
                    list[ placeBefore ? "unshift" : "push" ]( func );
                }
            }
        };
    }

    // Base inspection function for prefilters and transports
    function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
            dataType /* internal */, inspected /* internal */ ) {

        dataType = dataType || options.dataTypes[ 0 ];
        inspected = inspected || {};

        inspected[ dataType ] = true;

        var list = structure[ dataType ],
            i = 0,
            length = list ? list.length : 0,
            executeOnly = ( structure === prefilters ),
            selection;

        for(; i < length && ( executeOnly || !selection ); i++ ) {
            selection = list[ i ]( options, originalOptions, jqXHR );
            // If we got redirected to another dataType
            // we try there if executing only and not done already
            if ( typeof selection === "string" ) {
                if ( !executeOnly || inspected[ selection ] ) {
                    selection = undefined;
                } else {
                    options.dataTypes.unshift( selection );
                    selection = inspectPrefiltersOrTransports(
                            structure, options, originalOptions, jqXHR, selection, inspected );
                }
            }
        }
        // If we're only executing or nothing was selected
        // we try the catchall dataType if not done already
        if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
            selection = inspectPrefiltersOrTransports(
                    structure, options, originalOptions, jqXHR, "*", inspected );
        }
        // unnecessary when only executing (prefilters)
        // but it'll be ignored by the caller in that case
        return selection;
    }

    jQuery.fn.extend({
        load: function( url, params, callback ) {
            if ( typeof url !== "string" && _load ) {
                return _load.apply( this, arguments );

            // Don't do a request if no elements are being requested
            } else if ( !this.length ) {
                return this;
            }

            var off = url.indexOf( " " );
            if ( off >= 0 ) {
                var selector = url.slice( off, url.length );
                url = url.slice( 0, off );
            }

            // Default to a GET request
            var type = "GET";

            // If the second parameter was provided
            if ( params ) {
                // If it's a function
                if ( jQuery.isFunction( params ) ) {
                    // We assume that it's the callback
                    callback = params;
                    params = undefined;

                // Otherwise, build a param string
                } else if ( typeof params === "object" ) {
                    params = jQuery.param( params, jQuery.ajaxSettings.traditional );
                    type = "POST";
                }
            }

            var self = this;

            // Request the remote document
            jQuery.ajax({
                url: url,
                type: type,
                dataType: "html",
                data: params,
                // Complete callback (responseText is used internally)
                complete: function( jqXHR, status, responseText ) {
                    // Store the response as specified by the jqXHR object
                    responseText = jqXHR.responseText;
                    // If successful, inject the HTML into all the matched elements
                    if ( jqXHR.isResolved() ) {
                        // #4825: Get the actual response in case
                        // a dataFilter is present in ajaxSettings
                        jqXHR.done(function( r ) {
                            responseText = r;
                        });
                        // See if a selector was specified
                        self.html( selector ?
                            // Create a dummy div to hold the results
                            jQuery("<div>")
                                // inject the contents of the document in, removing the scripts
                                // to avoid any 'Permission Denied' errors in IE
                                .append(responseText.replace(rscript, ""))

                                // Locate the specified elements
                                .find(selector) :

                            // If not, just inject the full result
                            responseText );
                    }

                    if ( callback ) {
                        self.each( callback, [ responseText, status, jqXHR ] );
                    }
                }
            });

            return this;
        },

        serialize: function() {
            return jQuery.param( this.serializeArray() );
        },

        serializeArray: function() {
            return this.map(function(){
                return this.elements ? jQuery.makeArray( this.elements ) : this;
            })
            .filter(function(){
                return this.name && !this.disabled &&
                    ( this.checked || rselectTextarea.test( this.nodeName ) ||
                        rinput.test( this.type ) );
            })
            .map(function( i, elem ){
                var val = jQuery( this ).val();

                return val == null ?
                    null :
                    jQuery.isArray( val ) ?
                        jQuery.map( val, function( val, i ){
                            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                        }) :
                        { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
            }).get();
        }
    });

    // Attach a bunch of functions for handling common AJAX events
    jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
        jQuery.fn[ o ] = function( f ){
            return this.bind( o, f );
        };
    });

    jQuery.each( [ "get", "post" ], function( i, method ) {
        jQuery[ method ] = function( url, data, callback, type ) {
            // shift arguments if data argument was omitted
            if ( jQuery.isFunction( data ) ) {
                type = type || callback;
                callback = data;
                data = undefined;
            }

            return jQuery.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });

    jQuery.extend({

        getScript: function( url, callback ) {
            return jQuery.get( url, undefined, callback, "script" );
        },

        getJSON: function( url, data, callback ) {
            return jQuery.get( url, data, callback, "json" );
        },

        // Creates a full fledged settings object into target
        // with both ajaxSettings and settings fields.
        // If target is omitted, writes into ajaxSettings.
        ajaxSetup: function ( target, settings ) {
            if ( !settings ) {
                // Only one parameter, we extend ajaxSettings
                settings = target;
                target = jQuery.extend( true, jQuery.ajaxSettings, settings );
            } else {
                // target was provided, we extend into it
                jQuery.extend( true, target, jQuery.ajaxSettings, settings );
            }
            // Flatten fields we don't want deep extended
            for( var field in { context: 1, url: 1 } ) {
                if ( field in settings ) {
                    target[ field ] = settings[ field ];
                } else if( field in jQuery.ajaxSettings ) {
                    target[ field ] = jQuery.ajaxSettings[ field ];
                }
            }
            return target;
        },

        ajaxSettings: {
            url: ajaxLocation,
            isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            /*
            timeout: 0,
            data: null,
            dataType: null,
            username: null,
            password: null,
            cache: null,
            traditional: false,
            headers: {},
            */

            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": "*/*"
            },

            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },

            // List of data converters
            // 1) key format is "source_type destination_type" (a single space in-between)
            // 2) the catchall symbol "*" can be used for source_type
            converters: {

                // Convert anything to text
                "* text": window.String,

                // Text to html (true = no transformation)
                "text html": true,

                // Evaluate text as a json expression
                "text json": jQuery.parseJSON,

                // Parse text as xml
                "text xml": jQuery.parseXML
            }
        },

        ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
        ajaxTransport: addToPrefiltersOrTransports( transports ),

        // Main method
        ajax: function( url, options ) {

            // If url is an object, simulate pre-1.5 signature
            if ( typeof url === "object" ) {
                options = url;
                url = undefined;
            }

            // Force options to be an object
            options = options || {};

            var // Create the final options object
                s = jQuery.ajaxSetup( {}, options ),
                // Callbacks context
                callbackContext = s.context || s,
                // Context for global events
                // It's the callbackContext if one was provided in the options
                // and if it's a DOM node or a jQuery collection
                globalEventContext = callbackContext !== s &&
                    ( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
                            jQuery( callbackContext ) : jQuery.event,
                // Deferreds
                deferred = jQuery.Deferred(),
                completeDeferred = jQuery._Deferred(),
                // Status-dependent callbacks
                statusCode = s.statusCode || {},
                // ifModified key
                ifModifiedKey,
                // Headers (they are sent all at once)
                requestHeaders = {},
                requestHeadersNames = {},
                // Response headers
                responseHeadersString,
                responseHeaders,
                // transport
                transport,
                // timeout handle
                timeoutTimer,
                // Cross-domain detection vars
                parts,
                // The jqXHR state
                state = 0,
                // To know if global events are to be dispatched
                fireGlobals,
                // Loop variable
                i,
                // Fake xhr
                jqXHR = {

                    readyState: 0,

                    // Caches the header
                    setRequestHeader: function( name, value ) {
                        if ( !state ) {
                            var lname = name.toLowerCase();
                            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                            requestHeaders[ name ] = value;
                        }
                        return this;
                    },

                    // Raw string
                    getAllResponseHeaders: function() {
                        return state === 2 ? responseHeadersString : null;
                    },

                    // Builds headers hashtable if needed
                    getResponseHeader: function( key ) {
                        var match;
                        if ( state === 2 ) {
                            if ( !responseHeaders ) {
                                responseHeaders = {};
                                while( ( match = rheaders.exec( responseHeadersString ) ) ) {
                                    responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
                                }
                            }
                            match = responseHeaders[ key.toLowerCase() ];
                        }
                        return match === undefined ? null : match;
                    },

                    // Overrides response content-type header
                    overrideMimeType: function( type ) {
                        if ( !state ) {
                            s.mimeType = type;
                        }
                        return this;
                    },

                    // Cancel the request
                    abort: function( statusText ) {
                        statusText = statusText || "abort";
                        if ( transport ) {
                            transport.abort( statusText );
                        }
                        done( 0, statusText );
                        return this;
                    }
                };

            // Callback for when everything is done
            // It is defined here because jslint complains if it is declared
            // at the end of the function (which would be more logical and readable)
            function done( status, statusText, responses, headers ) {

                // Called once
                if ( state === 2 ) {
                    return;
                }

                // State is "done" now
                state = 2;

                // Clear timeout if it exists
                if ( timeoutTimer ) {
                    clearTimeout( timeoutTimer );
                }

                // Dereference transport for early garbage collection
                // (no matter how long the jqXHR object will be used)
                transport = undefined;

                // Cache response headers
                responseHeadersString = headers || "";

                // Set readyState
                jqXHR.readyState = status ? 4 : 0;

                var isSuccess,
                    success,
                    error,
                    response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
                    lastModified,
                    etag;

                // If successful, handle type chaining
                if ( status >= 200 && status < 300 || status === 304 ) {

                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if ( s.ifModified ) {

                        if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
                            jQuery.lastModified[ ifModifiedKey ] = lastModified;
                        }
                        if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
                            jQuery.etag[ ifModifiedKey ] = etag;
                        }
                    }

                    // If not modified
                    if ( status === 304 ) {

                        statusText = "notmodified";
                        isSuccess = true;

                    // If we have data
                    } else {

                        try {
                            success = ajaxConvert( s, response );
                            statusText = "success";
                            isSuccess = true;
                        } catch(e) {
                            // We have a parsererror
                            statusText = "parsererror";
                            error = e;
                        }
                    }
                } else {
                    // We extract error from statusText
                    // then normalize statusText and status for non-aborts
                    error = statusText;
                    if( !statusText || status ) {
                        statusText = "error";
                        if ( status < 0 ) {
                            status = 0;
                        }
                    }
                }

                // Set data for the fake xhr object
                jqXHR.status = status;
                jqXHR.statusText = statusText;

                // Success/Error
                if ( isSuccess ) {
                    deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
                } else {
                    deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
                }

                // Status-dependent callbacks
                jqXHR.statusCode( statusCode );
                statusCode = undefined;

                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
                            [ jqXHR, s, isSuccess ? success : error ] );
                }

                // Complete
                completeDeferred.resolveWith( callbackContext, [ jqXHR, statusText ] );

                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxComplete", [ jqXHR, s] );
                    // Handle the global AJAX counter
                    if ( !( --jQuery.active ) ) {
                        jQuery.event.trigger( "ajaxStop" );
                    }
                }
            }

            // Attach deferreds
            deferred.promise( jqXHR );
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            jqXHR.complete = completeDeferred.done;

            // Status-dependent callbacks
            jqXHR.statusCode = function( map ) {
                if ( map ) {
                    var tmp;
                    if ( state < 2 ) {
                        for( tmp in map ) {
                            statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
                        }
                    } else {
                        tmp = map[ jqXHR.status ];
                        jqXHR.then( tmp, tmp );
                    }
                }
                return this;
            };

            // Remove hash character (#7531: and string promotion)
            // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
            // We also use the url parameter if available
            s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

            // Extract dataTypes list
            s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

            // Determine if a cross-domain request is in order
            if ( s.crossDomain == null ) {
                parts = rurl.exec( s.url.toLowerCase() );
                s.crossDomain = !!( parts &&
                    ( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
                            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
                );
            }

            // Convert data if not already a string
            if ( s.data && s.processData && typeof s.data !== "string" ) {
                s.data = jQuery.param( s.data, s.traditional );
            }

            // Apply prefilters
            inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

            // If request was aborted inside a prefiler, stop there
            if ( state === 2 ) {
                return false;
            }

            // We can fire global events as of now if asked to
            fireGlobals = s.global;

            // Uppercase the type
            s.type = s.type.toUpperCase();

            // Determine if request has content
            s.hasContent = !rnoContent.test( s.type );

            // Watch for a new set of requests
            if ( fireGlobals && jQuery.active++ === 0 ) {
                jQuery.event.trigger( "ajaxStart" );
            }

            // More options handling for requests with no content
            if ( !s.hasContent ) {

                // If data is available, append data to url
                if ( s.data ) {
                    s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
                }

                // Get ifModifiedKey before adding the anti-cache parameter
                ifModifiedKey = s.url;

                // Add anti-cache in url if needed
                if ( s.cache === false ) {

                    var ts = jQuery.now(),
                        // try replacing _= if it is there
                        ret = s.url.replace( rts, "$1_=" + ts );

                    // if nothing was replaced, add timestamp to the end
                    s.url = ret + ( (ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
                }
            }

            // Set the correct header, if data is being sent
            if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
                jqXHR.setRequestHeader( "Content-Type", s.contentType );
            }

            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
            if ( s.ifModified ) {
                ifModifiedKey = ifModifiedKey || s.url;
                if ( jQuery.lastModified[ ifModifiedKey ] ) {
                    jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
                }
                if ( jQuery.etag[ ifModifiedKey ] ) {
                    jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
                }
            }

            // Set the Accepts header for the server, depending on the dataType
            jqXHR.setRequestHeader(
                "Accept",
                s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
                    s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", */*; q=0.01" : "" ) :
                    s.accepts[ "*" ]
            );

            // Check for headers option
            for ( i in s.headers ) {
                jqXHR.setRequestHeader( i, s.headers[ i ] );
            }

            // Allow custom headers/mimetypes and early abort
            if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
                    // Abort if not done already
                    jqXHR.abort();
                    return false;

            }

            // Install callbacks on deferreds
            for ( i in { success: 1, error: 1, complete: 1 } ) {
                jqXHR[ i ]( s[ i ] );
            }

            // Get transport
            transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

            // If no transport, we auto-abort
            if ( !transport ) {
                done( -1, "No Transport" );
            } else {
                jqXHR.readyState = 1;
                // Send global event
                if ( fireGlobals ) {
                    globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
                }
                // Timeout
                if ( s.async && s.timeout > 0 ) {
                    timeoutTimer = setTimeout( function(){
                        jqXHR.abort( "timeout" );
                    }, s.timeout );
                }

                try {
                    state = 1;
                    transport.send( requestHeaders, done );
                } catch (e) {
                    // Propagate exception as error if not done
                    if ( status < 2 ) {
                        done( -1, e );
                    // Simply rethrow otherwise
                    } else {
                        jQuery.error( e );
                    }
                }
            }

            return jqXHR;
        },

        // Serialize an array of form elements or a set of
        // key/values into a query string
        param: function( a, traditional ) {
            var s = [],
                add = function( key, value ) {
                    // If value is a function, invoke it and return its value
                    value = jQuery.isFunction( value ) ? value() : value;
                    s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
                };

            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if ( traditional === undefined ) {
                traditional = jQuery.ajaxSettings.traditional;
            }

            // If an array was passed in, assume that it is an array of form elements.
            if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
                // Serialize the form elements
                jQuery.each( a, function() {
                    add( this.name, this.value );
                });

            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for ( var prefix in a ) {
                    buildParams( prefix, a[ prefix ], traditional, add );
                }
            }

            // Return the resulting serialization
            return s.join( "&" ).replace( r20, "+" );
        }
    });

    function buildParams( prefix, obj, traditional, add ) {
        if ( jQuery.isArray( obj ) ) {
            // Serialize array item.
            jQuery.each( obj, function( i, v ) {
                if ( traditional || rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );

                } else {
                    // If array item is non-scalar (array or object), encode its
                    // numeric index to resolve deserialization ambiguity issues.
                    // Note that rack (as of 1.0.0) can't currently deserialize
                    // nested arrays properly, and attempting to do so may cause
                    // a server error. Possible fixes are to modify rack's
                    // deserialization algorithm or to provide an option or flag
                    // to force array serialization to be shallow.
                    buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
                }
            });

        } else if ( !traditional && obj != null && typeof obj === "object" ) {
            // Serialize object item.
            for ( var name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }

        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    }

    // This is still on the jQuery object... for now
    // Want to move this to jQuery.ajax some day
    jQuery.extend({

        // Counter for holding the number of active queries
        active: 0,

        // Last-Modified header cache for next request
        lastModified: {},
        etag: {}

    });

    /* Handles responses to an ajax request:
     * - sets all responseXXX fields accordingly
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     */
    function ajaxHandleResponses( s, jqXHR, responses ) {

        var contents = s.contents,
            dataTypes = s.dataTypes,
            responseFields = s.responseFields,
            ct,
            type,
            finalDataType,
            firstDataType;

        // Fill responseXXX fields
        for( type in responseFields ) {
            if ( type in responses ) {
                jqXHR[ responseFields[type] ] = responses[ type ];
            }
        }

        // Remove auto dataType and get content-type in the process
        while( dataTypes[ 0 ] === "*" ) {
            dataTypes.shift();
            if ( ct === undefined ) {
                ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
            }
        }

        // Check if we're dealing with a known content-type
        if ( ct ) {
            for ( type in contents ) {
                if ( contents[ type ] && contents[ type ].test( ct ) ) {
                    dataTypes.unshift( type );
                    break;
                }
            }
        }

        // Check to see if we have a response for the expected dataType
        if ( dataTypes[ 0 ] in responses ) {
            finalDataType = dataTypes[ 0 ];
        } else {
            // Try convertible dataTypes
            for ( type in responses ) {
                if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
                    finalDataType = type;
                    break;
                }
                if ( !firstDataType ) {
                    firstDataType = type;
                }
            }
            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }

        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if ( finalDataType ) {
            if ( finalDataType !== dataTypes[ 0 ] ) {
                dataTypes.unshift( finalDataType );
            }
            return responses[ finalDataType ];
        }
    }

    // Chain conversions given the request and the original response
    function ajaxConvert( s, response ) {

        // Apply the dataFilter if provided
        if ( s.dataFilter ) {
            response = s.dataFilter( response, s.dataType );
        }

        var dataTypes = s.dataTypes,
            converters = {},
            i,
            key,
            length = dataTypes.length,
            tmp,
            // Current and previous dataTypes
            current = dataTypes[ 0 ],
            prev,
            // Conversion expression
            conversion,
            // Conversion function
            conv,
            // Conversion functions (transitive conversion)
            conv1,
            conv2;

        // For each dataType in the chain
        for( i = 1; i < length; i++ ) {

            // Create converters map
            // with lowercased keys
            if ( i === 1 ) {
                for( key in s.converters ) {
                    if( typeof key === "string" ) {
                        converters[ key.toLowerCase() ] = s.converters[ key ];
                    }
                }
            }

            // Get the dataTypes
            prev = current;
            current = dataTypes[ i ];

            // If current is auto dataType, update it to prev
            if( current === "*" ) {
                current = prev;
            // If no auto and dataTypes are actually different
            } else if ( prev !== "*" && prev !== current ) {

                // Get the converter
                conversion = prev + " " + current;
                conv = converters[ conversion ] || converters[ "* " + current ];

                // If there is no direct converter, search transitively
                if ( !conv ) {
                    conv2 = undefined;
                    for( conv1 in converters ) {
                        tmp = conv1.split( " " );
                        if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
                            conv2 = converters[ tmp[1] + " " + current ];
                            if ( conv2 ) {
                                conv1 = converters[ conv1 ];
                                if ( conv1 === true ) {
                                    conv = conv2;
                                } else if ( conv2 === true ) {
                                    conv = conv1;
                                }
                                break;
                            }
                        }
                    }
                }
                // If we found no converter, dispatch an error
                if ( !( conv || conv2 ) ) {
                    jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
                }
                // If found converter is not an equivalence
                if ( conv !== true ) {
                    // Convert with 1 or 2 converters accordingly
                    response = conv ? conv( response ) : conv2( conv1(response) );
                }
            }
        }
        return response;
    }




    var jsc = jQuery.now(),
        jsre = /(\=)\?(&|$)|\?\?/i;

    // Default jsonp settings
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            return jQuery.expando + "_" + ( jsc++ );
        }
    });

    // Detect, normalize options and install callbacks for jsonp requests
    jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

        var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
            ( typeof s.data === "string" );

        if ( s.dataTypes[ 0 ] === "jsonp" ||
            s.jsonp !== false && ( jsre.test( s.url ) ||
                    inspectData && jsre.test( s.data ) ) ) {

            var responseContainer,
                jsonpCallback = s.jsonpCallback =
                    jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
                previous = window[ jsonpCallback ],
                url = s.url,
                data = s.data,
                replace = "$1" + jsonpCallback + "$2";

            if ( s.jsonp !== false ) {
                url = url.replace( jsre, replace );
                if ( s.url === url ) {
                    if ( inspectData ) {
                        data = data.replace( jsre, replace );
                    }
                    if ( s.data === data ) {
                        // Add callback manually
                        url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
                    }
                }
            }

            s.url = url;
            s.data = data;

            // Install callback
            window[ jsonpCallback ] = function( response ) {
                responseContainer = [ response ];
            };

            // Clean-up function
            jqXHR.always(function() {
                // Set callback back to previous value
                window[ jsonpCallback ] = previous;
                // Call if it was a function and we have a response
                if ( responseContainer && jQuery.isFunction( previous ) ) {
                    window[ jsonpCallback ]( responseContainer[ 0 ] );
                }
            });

            // Use data converter to retrieve json after script execution
            s.converters["script json"] = function() {
                if ( !responseContainer ) {
                    jQuery.error( jsonpCallback + " was not called" );
                }
                return responseContainer[ 0 ];
            };

            // force json dataType
            s.dataTypes[ 0 ] = "json";

            // Delegate to script
            return "script";
        }
    });




    // Install script dataType
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function( text ) {
                jQuery.globalEval( text );
                return text;
            }
        }
    });

    // Handle cache's special case and global
    jQuery.ajaxPrefilter( "script", function( s ) {
        if ( s.cache === undefined ) {
            s.cache = false;
        }
        if ( s.crossDomain ) {
            s.type = "GET";
            s.global = false;
        }
    });

    // Bind script tag hack transport
    jQuery.ajaxTransport( "script", function(s) {

        // This transport only deals with cross domain requests
        if ( s.crossDomain ) {

            var script,
                head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

            return {

                send: function( _, callback ) {

                    script = document.createElement( "script" );

                    script.async = "async";

                    if ( s.scriptCharset ) {
                        script.charset = s.scriptCharset;
                    }

                    script.src = s.url;

                    // Attach handlers for all browsers
                    script.onload = script.onreadystatechange = function( _, isAbort ) {

                        if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

                            // Handle memory leak in IE
                            script.onload = script.onreadystatechange = null;

                            // Remove the script
                            if ( head && script.parentNode ) {
                                head.removeChild( script );
                            }

                            // Dereference the script
                            script = undefined;

                            // Callback if not abort
                            if ( !isAbort ) {
                                callback( 200, "success" );
                            }
                        }
                    };
                    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                    // This arises when a base node is used (#2709 and #4378).
                    head.insertBefore( script, head.firstChild );
                },

                abort: function() {
                    if ( script ) {
                        script.onload( 0, 1 );
                    }
                }
            };
        }
    });




    var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
        xhrOnUnloadAbort = window.ActiveXObject ? function() {
            // Abort all pending requests
            for ( var key in xhrCallbacks ) {
                xhrCallbacks[ key ]( 0, 1 );
            }
        } : false,
        xhrId = 0,
        xhrCallbacks;

    // Functions to create xhrs
    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch( e ) {}
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject( "Microsoft.XMLHTTP" );
        } catch( e ) {}
    }

    // Create the request object
    // (This is still attached to ajaxSettings for backward compatibility)
    jQuery.ajaxSettings.xhr = window.ActiveXObject ?
        /* Microsoft failed to properly
         * implement the XMLHttpRequest in IE7 (can't request local files),
         * so we use the ActiveXObject when it is available
         * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
         * we need a fallback.
         */
        function() {
            return !this.isLocal && createStandardXHR() || createActiveXHR();
        } :
        // For all other browsers, use the standard XMLHttpRequest object
        createStandardXHR;

    // Determine support properties
    (function( xhr ) {
        jQuery.extend( jQuery.support, {
            ajax: !!xhr,
            cors: !!xhr && ( "withCredentials" in xhr )
        });
    })( jQuery.ajaxSettings.xhr() );

    // Create transport if the browser can provide an xhr
    if ( jQuery.support.ajax ) {

        jQuery.ajaxTransport(function( s ) {
            // Cross domain only allowed if supported through XMLHttpRequest
            if ( !s.crossDomain || jQuery.support.cors ) {

                var callback;

                return {
                    send: function( headers, complete ) {

                        // Get a new xhr
                        var xhr = s.xhr(),
                            handle,
                            i;

                        // Open the socket
                        // Passing null username, generates a login popup on Opera (#2865)
                        if ( s.username ) {
                            xhr.open( s.type, s.url, s.async, s.username, s.password );
                        } else {
                            xhr.open( s.type, s.url, s.async );
                        }

                        // Apply custom fields if provided
                        if ( s.xhrFields ) {
                            for ( i in s.xhrFields ) {
                                xhr[ i ] = s.xhrFields[ i ];
                            }
                        }

                        // Override mime type if needed
                        if ( s.mimeType && xhr.overrideMimeType ) {
                            xhr.overrideMimeType( s.mimeType );
                        }

                        // X-Requested-With header
                        // For cross-domain requests, seeing as conditions for a preflight are
                        // akin to a jigsaw puzzle, we simply never set it to be sure.
                        // (it can always be set on a per-request basis or even using ajaxSetup)
                        // For same-domain requests, won't change header if already provided.
                        if ( !s.crossDomain && !headers["X-Requested-With"] ) {
                            headers[ "X-Requested-With" ] = "XMLHttpRequest";
                        }

                        // Need an extra try/catch for cross domain requests in Firefox 3
                        try {
                            for ( i in headers ) {
                                xhr.setRequestHeader( i, headers[ i ] );
                            }
                        } catch( _ ) {}

                        // Do send the request
                        // This may raise an exception which is actually
                        // handled in jQuery.ajax (so no try/catch here)
                        xhr.send( ( s.hasContent && s.data ) || null );

                        // Listener
                        callback = function( _, isAbort ) {

                            var status,
                                statusText,
                                responseHeaders,
                                responses,
                                xml;

                            // Firefox throws exceptions when accessing properties
                            // of an xhr when a network error occured
                            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                            try {

                                // Was never called and is aborted or complete
                                if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                                    // Only called once
                                    callback = undefined;

                                    // Do not keep as active anymore
                                    if ( handle ) {
                                        xhr.onreadystatechange = jQuery.noop;
                                        if ( xhrOnUnloadAbort ) {
                                            delete xhrCallbacks[ handle ];
                                        }
                                    }

                                    // If it's an abort
                                    if ( isAbort ) {
                                        // Abort it manually if needed
                                        if ( xhr.readyState !== 4 ) {
                                            xhr.abort();
                                        }
                                    } else {
                                        status = xhr.status;
                                        responseHeaders = xhr.getAllResponseHeaders();
                                        responses = {};
                                        xml = xhr.responseXML;

                                        // Construct response list
                                        if ( xml && xml.documentElement /* #4958 */ ) {
                                            responses.xml = xml;
                                        }
                                        responses.text = xhr.responseText;

                                        // Firefox throws an exception when accessing
                                        // statusText for faulty cross-domain requests
                                        try {
                                            statusText = xhr.statusText;
                                        } catch( e ) {
                                            // We normalize with Webkit giving an empty statusText
                                            statusText = "";
                                        }

                                        // Filter status for non standard behaviors

                                        // If the request is local and we have data: assume a success
                                        // (success with no data won't get notified, that's the best we
                                        // can do given current implementations)
                                        if ( !status && s.isLocal && !s.crossDomain ) {
                                            status = responses.text ? 200 : 404;
                                        // IE - #1450: sometimes returns 1223 when it should be 204
                                        } else if ( status === 1223 ) {
                                            status = 204;
                                        }
                                    }
                                }
                            } catch( firefoxAccessException ) {
                                if ( !isAbort ) {
                                    complete( -1, firefoxAccessException );
                                }
                            }

                            // Call complete if needed
                            if ( responses ) {
                                complete( status, statusText, responses, responseHeaders );
                            }
                        };

                        // if we're in sync mode or it's in cache
                        // and has been retrieved directly (IE6 & IE7)
                        // we need to manually fire the callback
                        if ( !s.async || xhr.readyState === 4 ) {
                            callback();
                        } else {
                            handle = ++xhrId;
                            if ( xhrOnUnloadAbort ) {
                                // Create the active xhrs callbacks list if needed
                                // and attach the unload handler
                                if ( !xhrCallbacks ) {
                                    xhrCallbacks = {};
                                    jQuery( window ).unload( xhrOnUnloadAbort );
                                }
                                // Add to list of active xhrs callbacks
                                xhrCallbacks[ handle ] = callback;
                            }
                            xhr.onreadystatechange = callback;
                        }
                    },

                    abort: function() {
                        if ( callback ) {
                            callback(0,1);
                        }
                    }
                };
            }
        });
    }


    /*! 第12部分：动画效果 */

    var elemdisplay = {},
        iframe, iframeDoc,
        rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        timerId,
        fxAttrs = [
            // height animations
            [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
            // width animations
            [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
            // opacity animations
            [ "opacity" ]
        ],
        fxNow,
        requestAnimationFrame = window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame;

    jQuery.fn.extend({
        show: function( speed, easing, callback ) {
            var elem, display;

            if ( speed || speed === 0 ) {
                return this.animate( genFx("show", 3), speed, easing, callback);

            } else {
                for ( var i = 0, j = this.length; i < j; i++ ) {
                    elem = this[i];

                    if ( elem.style ) {
                        display = elem.style.display;

                        // Reset the inline display of this element to learn if it is
                        // being hidden by cascaded rules or not
                        if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
                            display = elem.style.display = "";
                        }

                        // Set elements which have been overridden with display: none
                        // in a stylesheet to whatever the default browser style is
                        // for such an element
                        if ( display === "" && jQuery.css( elem, "display" ) === "none" ) {
                            jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
                        }
                    }
                }

                // Set the display of most of the elements in a second loop
                // to avoid the constant reflow
                for ( i = 0; i < j; i++ ) {
                    elem = this[i];

                    if ( elem.style ) {
                        display = elem.style.display;

                        if ( display === "" || display === "none" ) {
                            elem.style.display = jQuery._data(elem, "olddisplay") || "";
                        }
                    }
                }

                return this;
            }
        },

        hide: function( speed, easing, callback ) {
            if ( speed || speed === 0 ) {
                return this.animate( genFx("hide", 3), speed, easing, callback);

            } else {
                for ( var i = 0, j = this.length; i < j; i++ ) {
                    if ( this[i].style ) {
                        var display = jQuery.css( this[i], "display" );

                        if ( display !== "none" && !jQuery._data( this[i], "olddisplay" ) ) {
                            jQuery._data( this[i], "olddisplay", display );
                        }
                    }
                }

                // Set the display of the elements in a second loop
                // to avoid the constant reflow
                for ( i = 0; i < j; i++ ) {
                    if ( this[i].style ) {
                        this[i].style.display = "none";
                    }
                }

                return this;
            }
        },

        // Save the old toggle function
        _toggle: jQuery.fn.toggle,

        toggle: function( fn, fn2, callback ) {
            var bool = typeof fn === "boolean";

            if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
                this._toggle.apply( this, arguments );

            } else if ( fn == null || bool ) {
                this.each(function() {
                    var state = bool ? fn : jQuery(this).is(":hidden");
                    jQuery(this)[ state ? "show" : "hide" ]();
                });

            } else {
                this.animate(genFx("toggle", 3), fn, fn2, callback);
            }

            return this;
        },

        fadeTo: function( speed, to, easing, callback ) {
            return this.filter(":hidden").css("opacity", 0).show().end()
                        .animate({opacity: to}, speed, easing, callback);
        },

        animate: function( prop, speed, easing, callback ) {
            var optall = jQuery.speed(speed, easing, callback);

            if ( jQuery.isEmptyObject( prop ) ) {
                return this.each( optall.complete, [ false ] );
            }

            // Do not change referenced properties as per-property easing will be lost
            prop = jQuery.extend( {}, prop );

            return this[ optall.queue === false ? "each" : "queue" ](function() {
                // XXX 'this' does not always have a nodeName when running the
                // test suite

                if ( optall.queue === false ) {
                    jQuery._mark( this );
                }

                var opt = jQuery.extend( {}, optall ),
                    isElement = this.nodeType === 1,
                    hidden = isElement && jQuery(this).is(":hidden"),
                    name, val, p,
                    display, e,
                    parts, start, end, unit;

                // will store per property easing and be used to determine when an animation is complete
                opt.animatedProperties = {};

                for ( p in prop ) {

                    // property name normalization
                    name = jQuery.camelCase( p );
                    if ( p !== name ) {
                        prop[ name ] = prop[ p ];
                        delete prop[ p ];
                    }

                    val = prop[ name ];

                    // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
                    if ( jQuery.isArray( val ) ) {
                        opt.animatedProperties[ name ] = val[ 1 ];
                        val = prop[ name ] = val[ 0 ];
                    } else {
                        opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
                    }

                    if ( val === "hide" && hidden || val === "show" && !hidden ) {
                        return opt.complete.call( this );
                    }

                    if ( isElement && ( name === "height" || name === "width" ) ) {
                        // Make sure that nothing sneaks out
                        // Record all 3 overflow attributes because IE does not
                        // change the overflow attribute when overflowX and
                        // overflowY are set to the same value
                        opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

                        // Set display property to inline-block for height/width
                        // animations on inline elements that are having width/height
                        // animated
                        if ( jQuery.css( this, "display" ) === "inline" &&
                                jQuery.css( this, "float" ) === "none" ) {
                            if ( !jQuery.support.inlineBlockNeedsLayout ) {
                                this.style.display = "inline-block";

                            } else {
                                display = defaultDisplay( this.nodeName );

                                // inline-level elements accept inline-block;
                                // block-level elements need to be inline with layout
                                if ( display === "inline" ) {
                                    this.style.display = "inline-block";

                                } else {
                                    this.style.display = "inline";
                                    this.style.zoom = 1;
                                }
                            }
                        }
                    }
                }

                if ( opt.overflow != null ) {
                    this.style.overflow = "hidden";
                }

                for ( p in prop ) {
                    e = new jQuery.fx( this, opt, p );
                    val = prop[ p ];

                    if ( rfxtypes.test(val) ) {
                        e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();

                    } else {
                        parts = rfxnum.exec( val );
                        start = e.cur();

                        if ( parts ) {
                            end = parseFloat( parts[2] );
                            unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

                            // We need to compute starting value
                            if ( unit !== "px" ) {
                                jQuery.style( this, p, (end || 1) + unit);
                                start = ((end || 1) / e.cur()) * start;
                                jQuery.style( this, p, start + unit);
                            }

                            // If a +=/-= token was provided, we're doing a relative animation
                            if ( parts[1] ) {
                                end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
                            }

                            e.custom( start, end, unit );

                        } else {
                            e.custom( start, val, "" );
                        }
                    }
                }

                // For JS strict compliance
                return true;
            });
        },

        stop: function( clearQueue, gotoEnd ) {
            if ( clearQueue ) {
                this.queue([]);
            }

            this.each(function() {
                var timers = jQuery.timers,
                    i = timers.length;
                // clear marker counters if we know they won't be
                if ( !gotoEnd ) {
                    jQuery._unmark( true, this );
                }
                while ( i-- ) {
                    if ( timers[i].elem === this ) {
                        if (gotoEnd) {
                            // force the next step to be the last
                            timers[i](true);
                        }

                        timers.splice(i, 1);
                    }
                }
            });

            // start the next in the queue if the last step wasn't forced
            if ( !gotoEnd ) {
                this.dequeue();
            }

            return this;
        }

    });

    // Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout( clearFxNow, 0 );
        return ( fxNow = jQuery.now() );
    }

    function clearFxNow() {
        fxNow = undefined;
    }

    // Generate parameters to create a standard animation
    function genFx( type, num ) {
        var obj = {};

        jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
            obj[ this ] = type;
        });

        return obj;
    }

    // Generate shortcuts for custom animations
    jQuery.each({
        slideDown: genFx("show", 1),
        slideUp: genFx("hide", 1),
        slideToggle: genFx("toggle", 1),
        fadeIn: { opacity: "show" },
        fadeOut: { opacity: "hide" },
        fadeToggle: { opacity: "toggle" }
    }, function( name, props ) {
        jQuery.fn[ name ] = function( speed, easing, callback ) {
            return this.animate( props, speed, easing, callback );
        };
    });

    jQuery.extend({
        speed: function( speed, easing, fn ) {
            var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn && easing ||
                    jQuery.isFunction( speed ) && speed,
                duration: speed,
                easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
            };

            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

            // Queueing
            opt.old = opt.complete;
            opt.complete = function( noUnmark ) {
                if ( opt.queue !== false ) {
                    jQuery.dequeue( this );
                } else if ( noUnmark !== false ) {
                    jQuery._unmark( this );
                }

                if ( jQuery.isFunction( opt.old ) ) {
                    opt.old.call( this );
                }
            };

            return opt;
        },

        easing: {
            linear: function( p, n, firstNum, diff ) {
                return firstNum + diff * p;
            },
            swing: function( p, n, firstNum, diff ) {
                return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
            }
        },

        timers: [],

        fx: function( elem, options, prop ) {
            this.options = options;
            this.elem = elem;
            this.prop = prop;

            options.orig = options.orig || {};
        }

    });

    jQuery.fx.prototype = {
        // Simple function for setting a style value
        update: function() {
            if ( this.options.step ) {
                this.options.step.call( this.elem, this.now, this );
            }

            (jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
        },

        // Get the current size
        cur: function() {
            if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
                return this.elem[ this.prop ];
            }

            var parsed,
                r = jQuery.css( this.elem, this.prop );
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
        },

        // Start an animation from one number to another
        custom: function( from, to, unit ) {
            var self = this,
                fx = jQuery.fx,
                raf;

            this.startTime = fxNow || createFxNow();
            this.start = from;
            this.end = to;
            this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
            this.now = this.start;
            this.pos = this.state = 0;

            function t( gotoEnd ) {
                return self.step(gotoEnd);
            }

            t.elem = this.elem;

            if ( t() && jQuery.timers.push(t) && !timerId ) {
                // Use requestAnimationFrame instead of setInterval if available
                if ( requestAnimationFrame ) {
                    timerId = 1;
                    raf = function() {
                        // When timerId gets set to null at any point, this stops
                        if ( timerId ) {
                            requestAnimationFrame( raf );
                            fx.tick();
                        }
                    };
                    requestAnimationFrame( raf );
                } else {
                    timerId = setInterval( fx.tick, fx.interval );
                }
            }
        },

        // Simple 'show' function
        show: function() {
            // Remember where we started, so that we can go back to it later
            this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
            this.options.show = true;

            // Begin the animation
            // Make sure that we start at a small width/height to avoid any
            // flash of content
            this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

            // Start by showing the element
            jQuery( this.elem ).show();
        },

        // Simple 'hide' function
        hide: function() {
            // Remember where we started, so that we can go back to it later
            this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
            this.options.hide = true;

            // Begin the animation
            this.custom(this.cur(), 0);
        },

        // Each step of an animation
        step: function( gotoEnd ) {
            var t = fxNow || createFxNow(),
                done = true,
                elem = this.elem,
                options = this.options,
                i, n;

            if ( gotoEnd || t >= options.duration + this.startTime ) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();

                options.animatedProperties[ this.prop ] = true;

                for ( i in options.animatedProperties ) {
                    if ( options.animatedProperties[i] !== true ) {
                        done = false;
                    }
                }

                if ( done ) {
                    // Reset the overflow
                    if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

                        jQuery.each( [ "", "X", "Y" ], function (index, value) {
                            elem.style[ "overflow" + value ] = options.overflow[index];
                        });
                    }

                    // Hide the element if the "hide" operation was done
                    if ( options.hide ) {
                        jQuery(elem).hide();
                    }

                    // Reset the properties, if the item has been hidden or shown
                    if ( options.hide || options.show ) {
                        for ( var p in options.animatedProperties ) {
                            jQuery.style( elem, p, options.orig[p] );
                        }
                    }

                    // Execute the complete function
                    options.complete.call( elem );
                }

                return false;

            } else {
                // classical easing cannot be used with an Infinity duration
                if ( options.duration == Infinity ) {
                    this.now = t;
                } else {
                    n = t - this.startTime;
                    this.state = n / options.duration;

                    // Perform the easing function, defaults to swing
                    this.pos = jQuery.easing[ options.animatedProperties[ this.prop ] ]( this.state, n, 0, 1, options.duration );
                    this.now = this.start + ((this.end - this.start) * this.pos);
                }
                // Perform the next step of the animation
                this.update();
            }

            return true;
        }
    };

    jQuery.extend( jQuery.fx, {
        tick: function() {
            for ( var timers = jQuery.timers, i = 0 ; i < timers.length ; ++i ) {
                if ( !timers[i]() ) {
                    timers.splice(i--, 1);
                }
            }

            if ( !timers.length ) {
                jQuery.fx.stop();
            }
        },

        interval: 13,

        stop: function() {
            clearInterval( timerId );
            timerId = null;
        },

        speeds: {
            slow: 600,
            fast: 200,
            // Default speed
            _default: 400
        },

        step: {
            opacity: function( fx ) {
                jQuery.style( fx.elem, "opacity", fx.now );
            },

            _default: function( fx ) {
                if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
                    fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
                } else {
                    fx.elem[ fx.prop ] = fx.now;
                }
            }
        }
    });

    if ( jQuery.expr && jQuery.expr.filters ) {
        jQuery.expr.filters.animated = function( elem ) {
            return jQuery.grep(jQuery.timers, function( fn ) {
                return elem === fn.elem;
            }).length;
        };
    }

    // Try to restore the default display value of an element
    function defaultDisplay( nodeName ) {

        if ( !elemdisplay[ nodeName ] ) {

            var elem = jQuery( "<" + nodeName + ">" ).appendTo( "body" ),
                display = elem.css( "display" );

            elem.remove();

            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if ( display === "none" || display === "" ) {
                // No iframe to use yet, so create it
                if ( !iframe ) {
                    iframe = document.createElement( "iframe" );
                    iframe.frameBorder = iframe.width = iframe.height = 0;
                }

                document.body.appendChild( iframe );

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake html
                // document to it, Webkit & Firefox won't allow reusing the iframe document
                if ( !iframeDoc || !iframe.createElement ) {
                    iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
                    iframeDoc.write( "<!doctype><html><body></body></html>" );
                }

                elem = iframeDoc.createElement( nodeName );

                iframeDoc.body.appendChild( elem );

                display = jQuery.css( elem, "display" );

                document.body.removeChild( iframe );
            }

            // Store the correct default display
            elemdisplay[ nodeName ] = display;
        }

        return elemdisplay[ nodeName ];
    }


    /*! 第13部分：坐标和大小 */

    var rtable = /^t(?:able|d|h)$/i,
        rroot = /^(?:body|html)$/i;

    if ( "getBoundingClientRect" in document.documentElement ) {
        jQuery.fn.offset = function( options ) {
            var elem = this[0], box;

            if ( options ) {
                return this.each(function( i ) {
                    jQuery.offset.setOffset( this, options, i );
                });
            }

            if ( !elem || !elem.ownerDocument ) {
                return null;
            }

            if ( elem === elem.ownerDocument.body ) {
                return jQuery.offset.bodyOffset( elem );
            }

            try {
                box = elem.getBoundingClientRect();
            } catch(e) {}

            var doc = elem.ownerDocument,
                docElem = doc.documentElement;

            // Make sure we're not dealing with a disconnected DOM node
            if ( !box || !jQuery.contains( docElem, elem ) ) {
                return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
            }

            var body = doc.body,
                win = getWindow(doc),
                clientTop  = docElem.clientTop  || body.clientTop  || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
                scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
                top  = box.top  + scrollTop  - clientTop,
                left = box.left + scrollLeft - clientLeft;

            return { top: top, left: left };
        };

    } else {
        jQuery.fn.offset = function( options ) {
            var elem = this[0];

            if ( options ) {
                return this.each(function( i ) {
                    jQuery.offset.setOffset( this, options, i );
                });
            }

            if ( !elem || !elem.ownerDocument ) {
                return null;
            }

            if ( elem === elem.ownerDocument.body ) {
                return jQuery.offset.bodyOffset( elem );
            }

            jQuery.offset.initialize();

            var computedStyle,
                offsetParent = elem.offsetParent,
                prevOffsetParent = elem,
                doc = elem.ownerDocument,
                docElem = doc.documentElement,
                body = doc.body,
                defaultView = doc.defaultView,
                prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
                top = elem.offsetTop,
                left = elem.offsetLeft;

            while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
                if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
                    break;
                }

                computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
                top  -= elem.scrollTop;
                left -= elem.scrollLeft;

                if ( elem === offsetParent ) {
                    top  += elem.offsetTop;
                    left += elem.offsetLeft;

                    if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
                        top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
                        left += parseFloat( computedStyle.borderLeftWidth ) || 0;
                    }

                    prevOffsetParent = offsetParent;
                    offsetParent = elem.offsetParent;
                }

                if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
                    top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
                    left += parseFloat( computedStyle.borderLeftWidth ) || 0;
                }

                prevComputedStyle = computedStyle;
            }

            if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
                top  += body.offsetTop;
                left += body.offsetLeft;
            }

            if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
                top  += Math.max( docElem.scrollTop, body.scrollTop );
                left += Math.max( docElem.scrollLeft, body.scrollLeft );
            }

            return { top: top, left: left };
        };
    }

    jQuery.offset = {
        initialize: function() {
            var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.css(body, "marginTop") ) || 0,
                html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

            jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

            container.innerHTML = html;
            body.insertBefore( container, body.firstChild );
            innerDiv = container.firstChild;
            checkDiv = innerDiv.firstChild;
            td = innerDiv.nextSibling.firstChild.firstChild;

            this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
            this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

            checkDiv.style.position = "fixed";
            checkDiv.style.top = "20px";

            // safari subtracts parent border width here which is 5px
            this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
            checkDiv.style.position = checkDiv.style.top = "";

            innerDiv.style.overflow = "hidden";
            innerDiv.style.position = "relative";

            this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

            this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

            body.removeChild( container );
            jQuery.offset.initialize = jQuery.noop;
        },

        bodyOffset: function( body ) {
            var top = body.offsetTop,
                left = body.offsetLeft;

            jQuery.offset.initialize();

            if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
                top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
                left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
            }

            return { top: top, left: left };
        },

        setOffset: function( elem, options, i ) {
            var position = jQuery.css( elem, "position" );

            // set position first, in-case top/left are set even on static elem
            if ( position === "static" ) {
                elem.style.position = "relative";
            }

            var curElem = jQuery( elem ),
                curOffset = curElem.offset(),
                curCSSTop = jQuery.css( elem, "top" ),
                curCSSLeft = jQuery.css( elem, "left" ),
                calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
                props = {}, curPosition = {}, curTop, curLeft;

            // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
            if ( calculatePosition ) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat( curCSSTop ) || 0;
                curLeft = parseFloat( curCSSLeft ) || 0;
            }

            if ( jQuery.isFunction( options ) ) {
                options = options.call( elem, i, curOffset );
            }

            if (options.top != null) {
                props.top = (options.top - curOffset.top) + curTop;
            }
            if (options.left != null) {
                props.left = (options.left - curOffset.left) + curLeft;
            }

            if ( "using" in options ) {
                options.using.call( elem, props );
            } else {
                curElem.css( props );
            }
        }
    };


    jQuery.fn.extend({
        position: function() {
            if ( !this[0] ) {
                return null;
            }

            var elem = this[0],

            // Get *real* offsetParent
            offsetParent = this.offsetParent(),

            // Get correct offsets
            offset       = this.offset(),
            parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
            offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

            // Add offsetParent borders
            parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
            parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

            // Subtract the two offsets
            return {
                top:  offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },

        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || document.body;
                while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent;
            });
        }
    });


    // Create scrollLeft and scrollTop methods
    jQuery.each( ["Left", "Top"], function( i, name ) {
        var method = "scroll" + name;

        jQuery.fn[ method ] = function( val ) {
            var elem, win;

            if ( val === undefined ) {
                elem = this[ 0 ];

                if ( !elem ) {
                    return null;
                }

                win = getWindow( elem );

                // Return the scroll offset
                return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
                    jQuery.support.boxModel && win.document.documentElement[ method ] ||
                        win.document.body[ method ] :
                    elem[ method ];
            }

            // Set the scroll offset
            return this.each(function() {
                win = getWindow( this );

                if ( win ) {
                    win.scrollTo(
                        !i ? val : jQuery( win ).scrollLeft(),
                         i ? val : jQuery( win ).scrollTop()
                    );

                } else {
                    this[ method ] = val;
                }
            });
        };
    });

    function getWindow( elem ) {
        return jQuery.isWindow( elem ) ?
            elem :
            elem.nodeType === 9 ?
                elem.defaultView || elem.parentWindow :
                false;
    }




    // Create innerHeight, innerWidth, outerHeight and outerWidth methods
    jQuery.each([ "Height", "Width" ], function( i, name ) {

        var type = name.toLowerCase();

        // innerHeight and innerWidth
        jQuery.fn["inner" + name] = function() {
            return this[0] ?
                parseFloat( jQuery.css( this[0], type, "padding" ) ) :
                null;
        };

        // outerHeight and outerWidth
        jQuery.fn["outer" + name] = function( margin ) {
            return this[0] ?
                parseFloat( jQuery.css( this[0], type, margin ? "margin" : "border" ) ) :
                null;
        };

        jQuery.fn[ type ] = function( size ) {
            // Get window width or height
            var elem = this[0];
            if ( !elem ) {
                return size == null ? null : this;
            }

            if ( jQuery.isFunction( size ) ) {
                return this.each(function( i ) {
                    var self = jQuery( this );
                    self[ type ]( size.call( this, i, self[ type ]() ) );
                });
            }

            if ( jQuery.isWindow( elem ) ) {
                // Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
                // 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
                var docElemProp = elem.document.documentElement[ "client" + name ];
                return elem.document.compatMode === "CSS1Compat" && docElemProp ||
                    elem.document.body[ "client" + name ] || docElemProp;

            // Get document width or height
            } else if ( elem.nodeType === 9 ) {
                // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
                return Math.max(
                    elem.documentElement["client" + name],
                    elem.body["scroll" + name], elem.documentElement["scroll" + name],
                    elem.body["offset" + name], elem.documentElement["offset" + name]
                );

            // Get or set width or height on the element
            } else if ( size === undefined ) {
                var orig = jQuery.css( elem, type ),
                    ret = parseFloat( orig );

                return jQuery.isNaN( ret ) ? orig : ret;

            // Set the width or height on the element (default to pixels if value is unitless)
            } else {
                return this.css( type, typeof size === "string" ? size : size + "px" );
            }
        };

    });

    // 在引入jQuery库的时候，将构造的jQuety对象和别名$赋值设置为window对象的属性
    window.jQuery = window.$ = jQuery;
})(window);
