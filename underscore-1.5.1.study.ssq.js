//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
//     songsiqi - 源码学习 注释

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {}; // 空对象常量，用于中断forEach循环

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray, // 这两个方法在构造函数上，不在原型上
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { // 创建Underscore对象
    if (obj instanceof _) return obj; // 防止包装集的重复封装
    if (!(this instanceof _)) return new _(obj); // 作用域安全的构造函数
    this._wrapped = obj; // 如果传递了参数，即把Underscore对象当做包装集使用，则使用内部的_wrapped保存原始值；否则这个属性为undefined
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) { // 数组。此处采用鸭式辨型，判断length属性是否为Number类型。注意对于类数组（如NodeList,arguments），要避免length不固定
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else { // 对象
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) { // 从左归结
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) { // 如果没有设置初始值，就设置obj中的第一个值为初始值，然后把initial标记为true
        memo = value;
        initial = true;
      } else { // 进行迭代，迭代结果归结到momo
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo; // 返回最终归结结果memo
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) { // 从右归结
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    /* ----- 1.3版本中的实现方法 -----
    // 逆转集合中的元素顺序
    var reversed = _.toArray(obj).reverse();
      if (context && !initial)
        iterator = _.bind(iterator, context);
      // 通过reduce方法处理数据
      return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
    */
    var length = obj.length; // 在1.3版本中，这里是通过先逆转集合中的元素顺序、再调用reduce方法实现的
    if (length !== +length) { // 对象没有length属性，这里变为undefined !== NaN
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index]; //  如果没有设置初始值，就设置最后一个作为初始值
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list); // value变成了obj[index]，index递减，还是反向迭代
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity); // 如果没有传入迭代器函数，就是用默认迭代器，返回与传入参数相等的值
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) { // 包含：原生调用indexOf，非原生调用_.any
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) { // 在每个元素上执行method方法
    var args = slice.call(arguments, 2); // 第二个参数后面的所有参数都传递给method
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args); // method如果不是函数，则当做value的方法调用
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  // 萃取对象数组中某属性值，返回一个由它们组成的数组
  /* 例子：
     var stooges = [{name : 'moe', age : 40}, {name : 'larry', age : 50}, {name : 'curly', age : 60}];
     _.pluck(stooges, 'name');
     => ["moe", "larry", "curly"]
  */
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  // （类似于SQL中的where语句）遍历list中的每一个值，返回一个数组，这个数组包含attrs所列出的属性的所有的键 - 值对
  /* 例子：
     _.where(listOfPlays, {author: "Shakespeare", year: 1611});
     => [{title: "Cymbeline", author: "Shakespeare", year: 1611}, {title: "The Tempest", author: "Shakespeare", year: 1611}]
  */
  _.where = function(obj, attrs, first) { // first标记是否只返回第一个，被用于_.findWhere
    if (_.isEmpty(attrs)) return first ? void 0 : []; // 没有指定attrs，返回undefined或[]
    return _[first ? 'find' : 'filter'](obj, function(value) { // 如果只返回第一个用_.find，否则用_.filter
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  // 同_.where，但只返回第一个
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  /* 如果传递iterator参数，iterator将作为list排序的依据。例如：
     var stooges = [{name : 'moe', age : 40}, {name : 'larry', age : 50}, {name : 'curly', age : 60}];
     _.max(stooges, function(stooge) { return stooge.age; });
     => {name : 'curly', age : 60};
  */
  _.max = function(obj, iterator, context) {
    // 如果集合是一个数组, 且没有使用处理器, 一般会是在一个数组存储了一系列Number类型的数据，则使用Math.max获取最大值
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) { // 长度不能超过65535，否则webkit可能有bug
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity; // 对于空值, 直接返回负无穷大
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value; // 如果有iterator作为排序依据，则computed是它的计算值
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) { // 思路同_.max
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) { // 使用了Fisher Yates洗牌算法
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  // value是一个iterator函数，或者是一个对象的属性
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) { // value是一个iterator函数，或者是一个对象的属性
    var iterator = lookupIterator(value);
    // 调用顺序: _.pluck(_.map().sort());
    // 调用_.map()方法遍历集合，并将集合中的元素放到value属性、下标放到index属性，将元素中需要进行比较的数据放到criteria属性
    // 调用sort()方法将集合中的元素按照criteria属性中的数据进行顺序排序
    // 调用pluck只萃取结果数组中的每个对象的value属性值，构成一个数组返回
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index; // 相等了还保持原来的顺序
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) { // behavior为_.groupBy、_.indexBy、_.countBy在调用group时定义的对返回对象result的具体操作
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj); // iterator的返回值作为key
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  // 根据iterator或对象的属性对集合进行分组
  /* 例如：
     _.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); });
     => {1: [1.3], 2: [2.1, 2.4]}
     _.groupBy(['one', 'two', 'three'], 'length');
     => {3: ["one", "two"], 5: ["three"]}
  */
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  // 同_.groupBy，只不过每个分组只有1个元素
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  // 排序一个列表组成一个组，并且返回各组中的对象的数量的计数。类似_.groupBy，只不过返回个数，而不是列表
  /* 例如：
     _.countBy([1, 2, 3, 4, 5], function(num) { return num % 2 == 0 ? 'even' : 'odd'; });
     => {odd: 3, even: 2}
  */
  _.countBy = group(function(result, key, value) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  // 使用二分查找确定obj在array中的位置序号，obj按此序号插入能保持array原有的排序。如果传递iterator参数，iterator将作为array排序的依据
  /* 例如：
     _.sortedIndex([10, 20, 30, 40, 50], 35);
     => 3
     var stooges = [{name : 'moe', age : 40}, {name : 'curly', age : 60}];
     _.sortedIndex(stooges, {name : 'larry', age : 50}, 'age');
     => 1
  */
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low; // 返回插入的位置
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj); // 如果已经是数组，返回一个原数组的克隆，还可以用obj.concat()
    if (obj.length === +obj.length) return _.map(obj, _.identity); // 针对类数组的情况，使用_.map，iterator使用默认的_.identity，返回value自身
    return _.values(obj); // 返回由object的所有属性值组成的数组
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length; // 如果是对象，用键值数组的长度
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) { // guard参数用于确定只返回第一个元素, 当guard为true时, 指定数量n无效
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) { // 返回数组中除了最后n个元素外的其他全部元素。guard作用同_.first
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0)); // 此处不能变为负数，否则会加上array.length，结果不对
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) { // 返回数组中除了前n个元素外的其他全部元素
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  // 返回一个除去所有false值的array副本。false, null, 0, "", undefined和NaN都是false值
  _.compact = function(array) {
    return _.filter(array, _.identity); // 使用_.filter过滤。iterator使用_.identity，除了false值其他的都会转换为true
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) { // shallow参数为true，且input数组每个元素都是数组，调用concat就能实现减少一层嵌套。
      return concat.apply(output, input); // 这里output为undefined
    }
    each(input, function(value) { // 遍历input的每个元素
      if (_.isArray(value) || _.isArguments(value)) { // 数组或类数组
        shallow ? push.apply(output, value) : flatten(value, shallow, output); // shallow直接push，不shallow递归调用flatten
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  // 将一个嵌套多层（可以是任何层数）的数组转换为只有一层的数组。如果shallow参数为true，则原数组只比减少一维的嵌套
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  // 返回一个删除所有values值的array副本
  /* 例如：
     _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     => [2, 3, 4]
  */
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1)); // 把其他传进来的参数作为一个数组，调用_.difference
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  // 把isSorted赋值为true值，此函数将运行的更快的算法。如果要处理对象元素, 传参iterator来获取要对比的属性
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) { // 没传isSorted，但传了iterator
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array; // 传参iterator来获取对象要对比的属性
    var results = []; // 存放去重的结果
    var seen = []; // 存放已存在的值
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() { // 并集
    return _.uniq(_.flatten(arguments, true)); // 先调用_.flatten合并arguments中的数组，再调用_.uniq去重
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) { // 交集
    var rest = slice.call(arguments, 1); // 由除第一个数组之外的其他数组组成的数组rest
    return _.filter(_.uniq(array), function(item) { // 对第一个数组去重，然后过滤留下在rest每个数组中都存在的元素
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) { // 返回差集
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1)); // 对第2个参数开始的所有参数合并为1个数组rest
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  // 将每个相应位置的arrays的值合并在一起
  /* 例如：
     _.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false]);
     => [["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]
  */
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0)); // 计算每一个数组的长度, 并返回其中最大长度值
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i); // 萃取每一个对象（数组）的i属性，组成一个数组
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  // 将数组转换为对象。传递任何一个单独[key, value]对的列表，或者一个键的列表和一个值得列表
  /* 例如：
     _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
     => {moe: 30, larry: 40, curly: 50}
     _.object([['moe', 30], ['larry', 40], ['curly', 50]]);
     => {moe: 30, larry: 40, curly: 50}
  */
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) { // 上面例子的第1种情况
        result[list[i]] = values[i];
      } else { // 上面例子的第2种情况
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') { // isSorted是开始搜索的索引
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted); // 小于0时加上数组的长度
      } else { // isSorted为ture时调用_.sortedIndex对已排序的数组使用二分查找
        i = _.sortedIndex(array, item); // 返回的i是插入位置
        return array[i] === item ? i : -1; // 如果插入位置不是要找的元素，则返回-1
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){}; // 空的构造函数，用于bind返回的函数被用作构造函数的情形

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) { // 绑定上下文this为context
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1)); // 原生bind的参数：context, arg1, arg2, ...
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2); // 预先传入的参数
    return bound = function() {
      // bind返回的函数作为普通函数调用
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));

      // bind返回的函数作为构造函数被调用，需要模仿bind的行为
      ctor.prototype = func.prototype; // 空的构造函数使用func的原型，new一个对象，再把原型清为null
      var self = new ctor;
      ctor.prototype = null; // ES5的bind返回的函数不含有prototype属性
      var result = func.apply(self, args.concat(slice.call(arguments))); // 首先调用func作为构造函数创建对象，忽略bind传入的上下文this，只拼接参数
      if (Object(result) === result) return result; // 如果返回的是一个对象，则使用func作为构造函数创建的对象
      return self; // 否则使用自己通过ctor创建的对象
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  // 为函数预先添加任意参数
  /* 例如：
     var add = function(a, b) { return a + b; };
     add5 = _.partial(add, 5);
     add5(10);
     => 15
  */
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  // 把methodNames参数指定的方法绑定到obj上，这些方法就会在对象的上下文环境中执行，适合于事件处理函数
  /* 例如：
     var buttonView = {
       label   : 'underscore',
       onClick : function(){ alert('clicked: ' + this.label); },
       onHover : function(){ console.log('hovering: ' + this.label); }
     };
     _.bindAll(buttonView, 'onClick', 'onHover');
     jQuery('#underscore_button').bind('click', buttonView.onClick); // 此时this的值正确
  */
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); }); // 遍历函数列表，每个函数都调用_.bind绑定一遍
    return obj;
  };

  // Memoize an expensive function by storing its results.
  // 缓存某些函数的计算结果
  /* 例如：
     var fibonacci = _.memoize(function(n) {
       return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     });
  */
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity); // hasher的返回值作为key。如果没有传入就调用_identity返回自身（对应上例fibonacci中回调函数的参数n）
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) { // 使用setTimeout延迟函数的调用
    var args = slice.call(arguments, 2); // 后面还可以传入func的参数
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  // 调用setTimeout(func, 1)的效果，即延迟调用func直到当前调用栈清空为止，适合执行开销大的计算和无阻塞UI线程的HTML渲染
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  // 函数节流
  // 默认情况下，throttle将在调用的第一时间尽快执行func，并且在wait周期内调用任意次数的函数，都将尽快的被覆盖（同腾讯AlloyTeam的每隔一段时间必须执行一次）
  // 禁用第一次首先执行传递{leading: false}，禁用最后一次执行传递{trailing: false}
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0; // 上次执行的时间
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now; // 禁用第一次首先执行
      var remaining = wait - (now - previous); // 离下次可以执行的时间
      context = this;
      args = arguments;
      if (remaining <= 0) { // 可以执行
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) { // 只要不禁用最后一次执行，延后remaining时间再执行
        timeout = setTimeout(later, remaining); // 如果在wait周期内调用任意次数的函数，定时器都将尽快的被覆盖掉
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  // 延迟函数的执行，真正的执行要在函数最后一次调用时刻的wait时间之后
  // 对于必须在一些输入（多是一些用户操作）停止到达之后执行的行为有帮助。例如: 渲染一个Markdown格式的评论预览, 当窗口停止改变大小之后重新计算布局
  // 传参immediate为true会让debounce在前面没有调用函数的情况下立即执行函数，在类似不小心点了提交按钮两下而提交了两次的情况下很有用（只执行第一次，第二次不执行）
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args); // 立即执行的情况虽然也调用了setTimeout，但是这里没有执行
      };
      var callNow = immediate && !timeout; // 要立即执行 && 前面没有等待执行的函数
      clearTimeout(timeout); // 每次调用都先清除定时器，覆盖前面的调用
      timeout = setTimeout(later, wait); // 延迟执行的情况
      if (callNow) result = func.apply(context, args); // 立即执行的情况
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  // 创建一个只能调用一次的函数。重复调用没有效果，只会返回第一次调用的结果，适用于初始化函数的调用
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo; // 重复调用只会返回第一次调用的结果
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  // 将第一个函数func封装到函数wrapper里面, 并把func作为第一个参数传给wrapper，这样可以让wrapper在func运行之前和之后执行代码（AOP的效果）
  /* 例如：
     var hello = function(name) { return "hello: " + name; };
     hello = _.wrap(hello, function(func) {
       return "before, " + func("moe") + ", after";
     });
     hello();
     => 'before, hello: moe, after'
  */
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func]; // 把func作为第一个参数传给wrapper
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  // 类似数学中的符合函数，参数为函数列表，从右向左，一个函数在执行完之后把返回的结果作为参数传递给下一个函数执行
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  // 创建一个函数，只有在运行了count次之后才有效果。常被用于在处理同组异步请求，类似于Promise的when，只有都返回之后，才能继续执行后面的动作
  /* 例如：
     var renderNotes = _.after(notes.length, render);
     _.each(notes, function(note) {
       note.asyncSave({success: renderNotes}); // renderNotes只在所有note都被保存后执行一次
     });
  */
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object'); // 判断是否是Object类型
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key); // 先for-in，再hasOwnProperty
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  /* 例子：
     _.pairs({one: 1, two: 2, three: 3});
     => [["one", 1], ["two", 2], ["three", 3]]
  */
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) { // 键和值对换
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  // 返回对象里面的每个方法名，并排序
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop]; // 如果有重复的属性，后面的值会覆盖前面的
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  // 返回一个object副本，只过滤出keys参数指定的属性值
  /* 例子：
  _.pick({name : 'moe', age: 50, userid : 'moe1'}, 'name', 'age');
     => {name : 'moe', age : 50}
  */
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1)); // 在外面调用concat是为了减少一层数组的嵌套，见https://github.com/jashkenas/underscore/issues/1129
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

  // Return a copy of the object without the blacklisted properties.
  // 返回一个object副本，过滤掉keys参数指定的属性值
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) { // 同_.extend，但如果有重复属性则不覆盖
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj; // 不是Object类型直接返回
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj); // 浅复制数组或对象
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  // 用 object作为参数来调用函数interceptor，然后返回object。这种方法的主要意图是作为函数链式调用的一环
  /* 例子：
     _.chain([1,2,3,200]).filter(function(num) { return num % 2 == 0; }).tap(alert).map(function(num) { return num * num }).value();
     => // [2, 200] (alerted)
     => [4, 40000]
  */
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    // 检查两个简单数据类型的值是否相等。如果被比较的值其中包含0，则检查另一个值是否为-0
    // 0 === -0返回true。对于eq则返回false，所以使用了如下判断：1 / 0 == 1 / -0不成立（一个Infinity一个-Infinity）
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    // 如果进行比较的数据是一个Underscore包装集对象，则将对象解封后获取本身的数据（通过_wrapped访问）再比较
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        // 通过+a将a转成一个Number，如果a被转换之前与转换之后不相等。则认为a是一个NaN类型
        // 因为NaN与NaN是不相等的，因此当a值为NaN时，无法简单地使用a == b进行匹配，而是用相同的方法检查b是否为NaN
        // 当a值是一个非NaN的数据时，需要检测0和-0（同上）
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    // 当执行到此时，a、b两个数据应该为类型相同的对象或数组类型
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) { // 处理循环引用
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) && // 考虑不同框架的构造函数
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') { // 数组
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length; // 首先要长度相等
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) { // 一项一项递归比较
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else { // 对象
      // Deep compare objects.
      for (var key in a) { // 深比较a和d的属性
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) { // 判断b的属性数量是否与a相等
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']'; // 都是用Object.prototype.toString判断
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) { // _.isArguments的回退，使用鸭式辨型，判断是否有callee属性
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  // 如果用typeof操作一个正则表达式字面量返回function，则只能通过上面的Object.prototype.toString方法判断
  // 如果返回object，则可以使用typeof来判断函数了
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0; // 或typeof obj === 'undefined'
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) { // _.has就是hasOwnProperty
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() { // 放弃对"_"的控制，返回一个Underscore对象的引用
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) { // 返回与传入参数相等的值，相当于f(x) = x，在Underscore里被用作默认的迭代器iterator
    return value;
  };

  // Run a function **n** times.
  // 调用给定的迭代函数n次，每一次传递index参数，返回一个由它们的返回值组成的数组
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape); // 反转义，使用_.invert使对象的键值互换

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = { // 转换为正则表达式，在转义的replace时使用
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  // _.escape和_.unescape的定义
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  // 如果对象object中的属性property是函数，则调用它；否则返回属性值
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  // 扩展Underscore对象的方法
  /* 例如：
     _.mixin({
       capitalize : function(string) {
         return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
       }
     });
     _("fabio").capitalize();
     => "Fabio"
     _.capitalize("fabio");
     => "Fabio"
  */
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) { // _.functions(obj)返回obj中的所有方法名
      var func = _[name] = obj[name]; // 扩展静态方法
      _.prototype[name] = function() { // 扩展包装集方法，添加到_.prototype上
        var args = [this._wrapped]; // 先从内部的_wrapped属性中获取第一个参数
        push.apply(args, arguments); // 参数拼接
        return result.call(this, func.apply(_, args)); // 根据_chain判断是返回一个包装集对象还是对象本身。result在后面的OOP部分定义：var result = function(obj) {return this._chain ? _(obj).chain() : obj };
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  // 为需要的客户端模型或DOM元素生成一个全局唯一的id。如果prefix参数存在，id将附加给它
  /* 例如：
     _.uniqueId('contact_');
     => 'contact_104'
  */
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = { // 模板转换配置（可以使用_.template方法的第三个参数settings去覆盖这个配置）
    evaluate    : /<%([\s\S]+?)%>/g, // 需要执行的js代码（非贪婪）
    interpolate : /<%=([\s\S]+?)%>/g, // 需要输出的变量值
    escape      : /<%-([\s\S]+?)%>/g // 需要输出的变量值，并进行HTML转义
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/; // 修改_.templateSettings时，如果去掉了evaluate、interpolate或escape，则定义这个正则表达式以保证没有匹配

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028', // 行分隔符
    '\u2029': 'u2029' // 段落分隔符
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters（定界符）, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  /* 例子：
     var list = "<% _.each(people, function(name) { %> <li><%= name %></li> <% }); %>";
     _.template(list, {people : ['moe', 'curly', 'larry']});
     => "<li>moe</li><li>curly</li><li>larry</li>"
     var template = _.template("<b><%- value %></b>");
     template({value : '<script>'});
     => "<b>&lt;script&gt;</b>"
     var compiled = _.template("<% print('Hello ' + epithet); %>"); // 可以使用print代替<%= %>
     compiled({epithet: "stooge"});
     => "Hello stooge."
     _.template默认使用with获取data的属性和值。可以设置settings的属性variable为一个变量名，这样将不使用with，提高性能
     _.template("Using 'with': <%= data.answer %>", {answer: 'no'}, {variable: 'data'});
     => "Using 'with': no"
     source属性用于预编译和调试
     <script>
       JST.project = <%= _.template(jstText).source %>;
     </script>
  */
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings); // 合并配置信息，不覆盖自定义配置

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([ // 把分界符合并成一个正则表达式
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='"; // source用于拼接编译后的函数体代码
    //调用replace进行编译，按照_.templateSettings中定义的分界符规则去匹配，在回调函数中定义替换规则
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) { // match时匹配项，escape、interpolate、evaluate分别对应相应捕获组的捕获项，offset是匹配位置
      // 首先考虑模板中的HTML部分（index到offset）
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; }); // 需要转义特殊符号

      // 然后考虑模板中需要输出的变量值或执行的js代码（offset之后）
      if (escape) { // 需要输出的变量值，并进行HTML转义
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) { // 需要输出的变量值
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) { // 需要执行的js代码
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n'; // 如果没有设置settings.variable，使用with获取传入的obj的属性。如果设置了settings.variable，则不使用with

    source = "var __t,__p='',__j=Array.prototype.join," + // source是编译后的函数代码。“__t”是局部变量，用于获取变量的值。"__p"是用于拼接模板
      "print=function(){__p+=__j.call(arguments,'');};\n" + // print用于打印变量值，同<%= %>
      source + "return __p;\n";

    try { // 使用try-catch，出错后方便调试
      render = new Function(settings.variable || 'obj', '_', source); // 使用new Function创建编译后的函数。还传入了Underscore对象“_”
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _); // 如果传递了data，则返回编译后的模板
    var template = function(data) { // 预编译函数
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}'; // 可以使用source属性查看编译后的函数，方便调试

    return template; // 如果没有传递data，则返回预编译函数
  };

  // Add a "chain" function, which will delegate to the wrapper.
  // 开始链式调用，返回一个Underscore包装集的对象，在包装集对象上调用方法会返回包装集对象对象本身，直到调用了value方法为止
  // 参考_.prototype.chain和_.prototype.value方法
  /* 例如：
     var stooges = [{name : 'curly', age : 25}, {name : 'moe', age : 21}, {name : 'larry', age : 23}];
     var youngest = _.chain(stooges) // 此处或_(stooges).chain()
       .sortBy(function(stooge){ return stooge.age; })
       .map(function(stooge){ return stooge.name + ' is ' + stooge.age; })
       .first()
       .value();
     => "moe is 21"
  */
  _.chain = function(obj) {
    return _(obj).chain(); // 使用OOP的链式调用。链式调用会生成包装集对象，调用包装集方法
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  // 用于在构造方法链时返回Underscore包装集对象。如果当前Underscore调用了chain()方法（即_chain属性为true），则返回一个被包装的Underscore对象, 否则返回对象本身
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_); // 将静态方法复制到_.prototype中，为了Underscore包装集也能使用这些方法

  // Add all mutator Array functions to the wrapper.
  // 将Array.prototype中的相关方法添加到Underscore对象中, 因此Underscore包装集对象也可以直接调用Array.prototype中的方法
  // 在返回时需要调用result，根据_chain判断是返回一个包装集对象还是对象本身
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped; // 从_wrapped属性取出原始值进行调用
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0]; // 解决一个IE bug：见https://github.com/jashkenas/underscore/issues/397
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  // 同上，区别在于这几个Array.prototype上的方法会返回一个Array，而前面的那些方法不会，所以对于前面那些方法不能直接使用它们的返回值
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    // 开始链式调用。参考_.chain
    chain: function() {
      this._chain = true; // 设置_chain标记
      return this; // 返回Underscore包装集对象本身
    },

    // Extracts the result from a wrapped and chained object.
    // 通过内部的_wrapped属性获取Underscore包装集对象的原始值，用于结束链式调用
    /* 例如：
       _([1, 2, 3]).value();
       => [1, 2, 3]
    */
    value: function() {
      return this._wrapped;
    }

  });

}).call(this); // 在this上调用，而不是像jQuery那样传入window。因为jQuery只面对浏览器环境，underscore浏览器和服务器端都要适用
