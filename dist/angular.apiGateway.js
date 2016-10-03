;
angular
	.module('apiGateway', [])
		.provider('apiGateway', function () {
		    var module_getter = {};
		    var apiInstance;
		    STATUS = {
		        succeed: "succeed",
		        failed: "failed",
		        compelete: "pending",
		        pending: "pending"
		    }
		    var dataTypeSchema = {},
		        dataTypeGetter = {},
		        dataTypeGetterAccordingValue = {},
		        dataTypeSetter = {};
		    return {
		        getter: function (type, getter) {
		            module_getter[type] = getter;
		        },
		        set_data_type_schema: function (dataType) {
		            dataTypeSchema = dataType;
		        },
		        set_data_type_getter: function (getters) {
		            dataTypeGetter = getters;
		        },
		        set_data_type_getter_according_value: function (getters) {
		            dataTypeGetterAccordingValue = getters;
		        },
		        set_data_type_setter: function (setters) {
		            dataTypeSetter = setters;
		        },
		        $get: ['$rootScope', '$state', '_', "$resource", "$q", function ($rootScope, $state, _, $resource, $q) {
		            var apiGateway = function apiGateway() { }

		            //#region apiGateway Prototype
		            apiGateway.prototype.db = apiGateway.prototype.db || {};
		            apiGateway.prototype.notification = apiGateway.prototype.notification || {};
		            //#endregion

		            //#region apiGateway Constructor Object Methods

		            apiGateway.context = function (contextName) {
		                var _db = apiGateway.prototype.db;
		                var _model = apiGateway.prototype;
		                var _notification = apiGateway.prototype.notification;

		                //#region instance prototype 

		                var __proto = function (options) {
		                    this.options = options;
		                    this.$$schema = this.options.schema || {};
		                    this.$$status = "";
		                    this.$$toModel = function () {
		                        var obj = {};
		                        for (var k in this) {
		                            //TODO : check sub Model
		                            if (this.hasOwnProperty(k))
		                                if (k[0].toUpperCase() == k[0] && k[0] != '_')
		                                    if (!angular.isFunction(this[k]))
		                                        if (options.setter[k] && false) {
		                                            obj[k] = options.setter[k](this[k]);
		                                        } else {
		                                            obj[k] = this[k];
		                                        }
		                        }
		                        return obj;
		                    };
		                    //TODO think about this mrthod functionality
		                    this.getGetter = function (k) {
		                        //TODO define property getter;
		                        return (this.options.getter[k]) ? this.options.getter[k] : function (i) { return i; }

		                        var fn = function (i) { return i };

		                        this.options.getter[k];

		                        return fn;
		                    }
		                    this.$update = function (obj) {
		                        var getter = function (i) { return i; };
		                        for (var k in this) {
		                            if (this.hasOwnProperty(k))
		                                //if (_.is.defined(obj[k])) {
		                                if (k in obj) {
		                                    this[k] = getter(obj[k]);
		                                }
		                                else if (_.is.defined(obj[_.pascalCase(k)])) {
		                                    this[k] = getter(obj[_.pascalCase(k)]);
		                                }
		                                else if (_.is.defined(obj[_.camelCase(k)])) {
		                                    this[k] = getter(obj[_.camelCase(k)]);
		                                }
		                                else if (obj[k.toLowerCase()]) {
		                                    this[k] = getter(obj[k.toLowerCase()]);
		                                }
		                        }
		                        return this;
		                    };
		                    this.extend = function (obj) {
		                    }
		                    this.haveReauiredField = function () {
		                        if (this.options && this.options.concrete)
		                            for (var i = 0, field; field = this.options.required[i]; i++)
		                                if (!this[field]) return { result: false, model: this.options.returnModel };
		                        return { result: true };
		                    }
		                    this.id = function () {
		                        return this.ModelType && this[this.ModelType + 'Id'];
		                    }
		                    this.$isNew = function () {
		                        return (this.ModelType && (this[this.ModelType + 'Id'] || this[this.ModelType + 'Code'])) ? false : true;
		                    }
		                    this.$invoke = function () {
		                        return _db[contextName][this.options.actionName](this);
		                    };
		                    this.$promise = (function (actionName) {
		                        return {
		                            "then": function (thenCallback) {
		                                var isNew = true;
		                                _.each(_db[contextName][actionName]._config.then, function (fn) {
		                                    if (fn.toString() == thenCallback.toString()) {
		                                        isNew = false;
		                                    }
		                                });

		                                isNew && _db[contextName][actionName]._config.then.push(thenCallback);
		                                return this;
		                            },
		                            "catch": function (catchCallback) {
		                                var isNew = true;
		                                _.each(_db[contextName][actionName]._config.catch, function (fn) {
		                                    if (fn.toString() == catchCallback.toString()) {
		                                        isNew = false;
		                                    }
		                                });

		                                isNew && _db[contextName][actionName]._config.catch.push(catchCallback);
		                                return this;
		                            }
		                        }
		                    })(options.actionName);
		                    this.$reset = function () {
		                        var temp = _model[contextName][this.options.actionName](true);
		                        return this.$update(temp);
		                    };
		                    this.$reset_virtuals = function () {
		                        _.each(this.options.virtuals, function (defaultValue, name) { this[name] = defaultValue }, this);
		                        return this;
		                    };
		                    this.$$$$deform_with_getter = function (model,response) {
		                        _.extend(this, model);
		                        deform_with_getter(this, this);
		                    }
		                }
		                //#endregion

		                

		                var add_model_to_context = function (options) {
		                    var actionNames = options.actionName;
		                    var contextName = options.context;
		                    var cFn = options.model;
		                    var proto = new __proto(options);

		                    _.each(options.methods, function (fn, name) {
		                        proto[name] = fn;
		                    });

		                    if (!_.is.array(actionNames)) actionNames = [actionNames];
		                    //TODO : think about it

		                    for (var i = 0, actionName ; actionName = actionNames[i]; i++)
		                        _model[contextName][actionName] = (function (cFn, contextName, actionName) {
		                            var Fn = function apiGatewayModelConstructor(reset) {
		                                if (Fn.$$instance && !reset) return Fn.$$instance;

		                                var obj = {};
		                                cFn.prototype = proto;
		                                obj = new cFn();

		                                if (this.uiModelPropertiesConstructor)
		                                    _.extend(obj, this.uiModelPropertiesConstructor);
		                                return Fn.$$instance = obj;
		                            }
		                            Fn.$$instance = null;
		                            Fn.$action = _db[contextName][actionName];
		                            Fn.$init = function (invokeAction) {
		                                var instance = new Fn();
		                                if (invokeAction) instance.$invoke();
		                                return instance;
		                            };
		                            Fn._config = { then: [], "catch": [] };
		                            Fn.$promise = {
		                                "then": function (thenCallback) {
		                                    var itemIndex = -1;
		                                    _.each(_db[contextName][actionName]._config.then, function (fn, idx) {
		                                        if (fn.toString() == thenCallback.toString()) {
		                                            itemIndex = idx;
		                                        }
		                                    });
		                                    if (itemIndex == -1) {
		                                        _db[contextName][actionName]._config.then.push(thenCallback);
		                                    } else {
		                                        _db[contextName][actionName]._config.then[parseInt(itemIndex)] = thenCallback;
		                                    }
		                                    return this;
		                                },
		                                "catch": function (catchCallback) {
		                                    var itemIndex = -1;
		                                    _.each(_db[contextName][actionName]._config.catch, function (fn, idx) {
		                                        if (fn.toString() == thenCallback.toString()) {
		                                            itemIndex = idx;
		                                        }
		                                    });
		                                    if (itemIndex == -1) {
		                                        _db[contextName][actionName]._config.catch.push(thenCallback);
		                                    } else {
		                                        _db[contextName][actionName]._config.catch[parseInt(itemIndex)] = thenCallback;
		                                    }
		                                    return this;
		                                }
		                            }
		                            Fn.prototype.actionName = actionName;
		                            Fn();
		                            return Fn;
		                        })(cFn, contextName, actionName);
		                    return this;
		                    //return (!angular.isArray(actionNames)) ? _model[contextName] : _model[contextName][actionNames];
		                };
		                var add_method_to_context = function (contextName, methodName, method) {
		                    if (!angular.isFunction(method)) return;

		                    _db[contextName][methodName] = function (actionInstance/*args*/) {
		                        var request,
		                            that = this;

		                        var loadFromLocalStorage = _.localStorage.load(contextName + "_" + methodName);

		                        if (actionInstance.options.cache.expiredTime && loadFromLocalStorage && loadFromLocalStorage.isFresh) {
		                            request = $q.defer();
		                            request.$promise = request.promise;
		                            request.resolve(loadFromLocalStorage.value);
		                        } else {
		                            var args = _.argToArray(arguments);
		                            _.removeEventArg(args);
		                            if (_.is.equalText(actionInstance.$$status, STATUS.pending)) return;
		                            actionInstance.$$status = STATUS.pending;
		                            //_.assignIfNotDefined(db[contextName].Models[methodName], add_model_to_context, methodName, _.fn());
		                            //if (!_model[contextName][methodName]) _model[contextName][methodName] = add_model_to_context(methodName, _.fn());
		                            if (_model[contextName][methodName]) {
		                                var sendingObjectModel = new _model[contextName][methodName]();
		                                if (!angular.isFunction(args[0]) && !angular.isObject(args[0]) && angular._.is.defined(args[0])) {
		                                    createObj: for (var i in sendingObjectModel) {
		                                        //TODO: isValue
		                                        if (!angular.isFunction(args[0]) && angular._.is.defined(args[0])) {
		                                            sendingObjectModel[i] = args.shift();
		                                        } else {
		                                            args.unshift(sendingObjectModel);
		                                            break createObj;
		                                        }
		                                    }
		                                }
		                                //extract url params
		                                sendingObjectModel.$update($state.params);
		                                if (_.is.object(args[0])) sendingObjectModel.$update(args[0]);
		                                if (_.is.function(args[0])) args.unshift({});

		                                prepare_model_for_sending_to_server(sendingObjectModel)
		                                var requiredFieldValidation = sendingObjectModel.haveReauiredField();

		                                args[0] = sendingObjectModel.$$toModel();

		                                //#region create and send request


		                                //TODO
		                                //var request;
		                                //debugger
		                                //if (sendingObjectModel.options.cache.expiredTime) {
		                                //    request = $q
		                                //    } else {
		                                //    request = (requiredFieldValidation.result)
		                                //        ? method.apply(_db[contextName], args) : false;
		                                //}


		                                request = (requiredFieldValidation.result)
                                            ? method.apply(_db[contextName], args)
                                            : new _model[contextName][requiredFieldValidation.model]();

		                                //#endregion

		                            } else {
		                                var request = method.apply(_db[contextName], args);
		                            }
		                        }

		                        if (request.$promise)
		                            if (_notification[contextName][methodName])
		                                $rootScope.$$$notify.info(_notification[contextName][methodName]);


		                        //#region call on response

		                        request.$promise.then(function (result) {
		                            if (actionInstance.options.lazyModel) {
		                                actionInstance.options.schema = result.schema
		                                actionInstance.options.model = create_model_accordiong_to_schema(actionInstance.options.schema, actionInstance.options.virtuals, result.model);
		                                add_model_to_context(actionInstance.options);
		                            }

		                            $rootScope.$$$notify.success();
		                            //var deformedResultAccordingType = deform_with_type_getter(actionInstance, result)
		                            //var deformedResultAccordingPath = deform_with_getter(actionInstance, result);
		                            //var deformedResult = _.update(deformedResultAccordingType, deformedResultAccordingPath);

		                            var deformedResult = deform_with_getter(actionInstance, result);
		                            actionInstance.$update(deformedResult);
		                            actionInstance.$$status = STATUS.succeed;
		                            if (_db[contextName][methodName]._config.then.length > 0) {
		                                for (var i = 0; i < _db[contextName][methodName]._config.then.length; i++) {
		                                    _db[contextName][methodName]._config.then[i].apply(args, arguments);;
		                                }
		                            }

		                            if (actionInstance.options.cache.expiredTime) {
		                                _.localStorage.save(contextName + "_" + methodName, JSON.stringify(result), actionInstance.options.cache.expiredTime);
		                            }
		                        }).catch(function () {
		                            $rootScope.$$$notify.error();
		                            if (_db[contextName][methodName]._config.catch.length > 0) {
		                                for (var i = 0; i < _db[contextName][methodName]._config.catch.length; i++) {
		                                    _db[contextName][methodName]._config.catch[i].apply(args, arguments);
		                                }
		                            }
		                            actionInstance.$$status = STATUS.failed;
		                        });

		                        //#endregion

		                        //#region call for request finally

		                        request.$promise && request.$promise.finally(function () {
		                        });

		                        //#endregion

		                        //#region return then/catch for use later in conntroller and call function on response

		                        if (_.is.scalar(request))
		                            return { result: request };
		                        else return {
		                            'then': function onRequestPromiseSuccess(placeToSaveResultOrCallbackOrEmitter/*placeToSaveResult object or callback function*/, assignKey) {
		                                var callback;
		                                if (_.is.function(placeToSaveResultOrCallbackOrEmitter)) {
		                                    callback = placeToSaveResultOrCallbackOrEmitter;
		                                }
		                                    //TODO : sendEmitter
		                                else if (_.isString(placeToSaveResultOrCallbackOrEmitter)) {
		                                    callback = _.leftCurry()(placeToSaveResultOrCallbackOrEmitter);
		                                } else {
		                                    callback = function (res) {
		                                        var assignValue = (assignKey) ? _.getValue(res, assignKey) : res;
		                                        //convert to model
		                                        if (_model[contextName][methodName])
		                                            if (_model[contextName][_model[contextName][methodName]().options.returnModel])
		                                                var assignValue = new _model[contextName][_model[contextName][methodName]().options.returnModel]().$update(assignValue);
		                                        console.log(that)
		                                        placeToSaveResultOrCallbackOrEmitter && _.safeAssign(placeToSaveResultOrCallbackOrEmitter, assignValue, true);
		                                    }
		                                }
		                                if (request.$promise) {
		                                    request.$promise.then(callback);
		                                } else {
		                                    callback(request)
		                                }

		                                return this;
		                            },
		                            'catch': function onRequestPromiseFailed(/*object or callback function*/) {
		                                var args = _.argToArray(arguments);
		                                var arg = args.shift();
		                                var obj;
		                                var callback;

		                                if (_.is.function(arg)) {
		                                    callback = arg;
		                                } else {
		                                    callback = function (res) {
		                                        placeToSaveResult = res;
		                                    }
		                                }

		                                request.$promise.catch(callback);
		                                return this;
		                            }
		                        };

		                        //#endregion
		                    }

		                    _db[contextName][methodName]._config = { then: [], "catch": [] };
		                };

		                var add_notification_to_context = function (context, actions, message) {
		                    if (!_.is.array(actions)) actions = [actions];

		                    _.each(actions, function (action) {
		                        _notification[context][action] = message;
		                    });
		                };
		                var addWrapperToContext = function (methodName, method, options) {
		                    _db[contextName][methodName] = function () {
		                        var args = _.argToArray(arguments);
		                        var res = method.apply(_db[contextName], args);
		                        return res.fn.apply(_db[contextName], res.args);
		                    }
		                };
		                var addUpsertToContext = function (methodName, addMethod, updateMethod) {
		                    var addMethod = addMethod;
		                    var updateMethod = updateMethod;
		                    _db[contextName][methodName] = function (entityModel) {
		                        var args = _.argToArray(arguments);

		                        var fn = (entityModel.isNew())
                                        ? _db[contextName][addMethod]
                                        : _db[contextName][updateMethod];
		                        return fn.apply(_db[contextName], args);
		                    }
		                };
		                var add_api = function (contextName, actionName, methodType, route) {
		                    this.actionName = actionName;
		                    var actions = {}
		                    actions[actionName] = { method: methodType, params: {} };
		                    var api;
		                    if (route) {
		                        api = $resource('/' + route, {}, actions);
		                    } else {
		                        api = $resource('/' + _.camelCase(contextName) + '/' + actionName, {}, actions);
		                    }
		                    add_method_to_context(contextName, actionName, api[actionName]);
		                    return this;
		                };
		                var prepare_model_for_sending_to_server = function (model) {
		                    var function_that_prepare_model_for_sending_to_server = _.leftCurry(_.deformPathValue)(model);
		                    _.each(model.options.setter, function_that_prepare_model_for_sending_to_server);

		                    var paths = _.filter(_.report(model.$$schema), function (i) { return i.name == "Type" });
		                    _.each(paths, function (item) {
		                        var type = _.getValue(model.$$schema, item.path);
		                        type = (_.is.array(type)) ? type[0] : type;
		                        if (!(type in dataTypeSetter)) return;

		                        var path = item.path.split('.');
		                        path.pop();
		                        path = path.join('.');

		                        _.deformPathValue(model, dataTypeSetter[type], path);
		                    });
		                }


		                var deform_with_getter = function (model, response) {
		                    //if (model.options.lazyModel) return model;
		                    //#region deform by path

		                    var function_that_change_data_with_model_getter = _.leftCurry(_.deformPathValue)(response);
		                    _.each(model.options.getter, function_that_change_data_with_model_getter);

		                    //#endregion

		                    //#region deform by type getters

		                    var paths = _.filter(_.report(model.$$schema), function (i) { return (i.name.toLowerCase() == "type") });
		                    _.each(paths, function (item) {
		                        var type = _.getValue(model.$$schema, item.path);
		                        type = (_.is.array(type)) ? type[0] : type;
		                        if (!(type in dataTypeGetter)) return;

		                        var path = item.path.split('.');
		                        path.pop();
		                        path = path.join('.');

		                        _.deformPathValue(response, dataTypeGetter[type], path);
		                    });

		                    //#endregion

		                    //#region deform by value of schema items

		                    //var paths = _.filter(_.report(model.$$schema), function (i) { return i.name.toLowerCase() == "value" });
		                    //_.each(paths, function (item) {
		                    //    var value = _.getValue(model.$$schema, item.path);
		                    //    value = (_.is.array(value)) ? value[0] : value;

		                    //    if (!(value in dataTypeGetter)) return;

		                    //    var path = item.path.split('.');
		                    //    path.pop();
		                    //    path = path.join('.');

		                    //    _.deformPathValue(response, dataTypeGetter[value], path);
		                    //});

		                    //#endregion

		                    //#region virtual properties deformer

		                    function_that_change_data_with_model_getter = _.leftCurry(_.deformPathValue)(response);
		                    _.each(model.options.virtuals, function (value, key) {
		                        var deformer = model.options.getter[key];
		                        if (!deformer) return;

		                        _.deformPathValue(response, function (item) {
		                            return deformer.call(item, _.getValue(model, key) || _.getValue(model.options.virtuals, key));
		                        }, key, true);
		                    })

		                    //#endregion

		                    return response;
		                }

		                var deform_with_type_getter = function (actionInstance, result) {
		                    if (model.options.lazyModel) return actionInstance;

		                    //_.each(module_getter, function (value, key) {
		                    //    var props = _.filter(_.report(this.options.schema), function (item) { return item.isLastNode });
		                    //    _.each(props, function (item) {
		                    //        get
		                    //    })
		                    //});
		                    _.each(result, function (item, key) {
		                        if (_.is.array(item)) return;
		                        if (_.is.object(item)) return;
		                        var type = (actionInstance.options.schema[key].Type) ? actionInstance.options.schema[key].Type : 'string';
		                        if (module_getter[type]) {
		                            result[key] = module_getter[type](result[key]);
		                        }
		                    })
		                    return result
		                }

		                //#region build model according to schema

		                var create_model_accordiong_to_schema = function (schema, virtuals, defaultValues) {
		                    defaultValues = defaultValues || {};
		                    var property_model = function () {
		                        this.name = '';
		                        this.default = '';
		                        this.value = '';
		                        this.type = "string";
		                        this.required = false;
		                    }
		                    var isModelItemType = function (obj) {
		                        var result = false;

		                        return !isObjectType(obj) && _.is.not.array(obj);
		                    }
		                    var isObjectType = function (obj) {
		                        var result = false;

		                        if (_.is.object(obj))
		                            for (var i in obj)
		                                if (_.is.object(obj[i]) || (i != "options" && _.is.array(obj[i])))
		                                    result = true;

		                        return result;
		                    }
		                    var interperate = function (schema, name) {
		                        var res = {};

		                        if (isModelItemType(schema)) {
		                            return res = defaultValues[name] || schema.value || schema.default || schema.Value || schema.Default || "";
		                        }
		                        if (_.is.array(schema)) {
		                            var sample = schema[0] || new property_model;
		                            res = [];
		                            res.push(interperate(sample, name));
		                            return res;
		                        }
		                        for (var k in schema) {
		                            res[k] = interperate(schema[k], k);
		                            //if (isObjectType(schema[k]) || true) {
		                            //    for (var kk in schema[k]) {
		                            //        res[k][kk] = interperate(schema[k][kk])
		                            //    }
		                            //}
		                        }

		                        return res;
		                    }

		                    var model = interperate(schema || {}, 'model');
		                    return function () {
		                        var properties = _.merge(model, virtuals);
		                        _.extend(this, properties);
		                    };
		                }

		                //#endregion

		                //#region Costumizer functions that fill the option and then create model and actions according options.

		                var options = {
		                    getter: {},
		                    methods: {},
		                    methodType: {},
		                    route: null,
		                    setter: {},
		                    config: {},
		                    virtuals: {},
		                    sync: {},
		                    cache: {
		                        saveLocal: true,
		                        cahceTime: 5000
		                    },
		                    context: contextName,
		                    lazyModel: false,
		                    schema: false
		                };
		                var action = function (actionName) {
		                    options.actionName = actionName;
		                    return this;
		                };
		                var type = function (methodType) {
		                    options.methodType = methodType.toUpperCase();
		                    return this;
		                };
		                var method = function (name, method) {
		                    options.methods["$" + _.underscoreCase(name)] = method;
		                    return this;
		                };
		                var route = function (route) {
		                    options.route = route;
		                    return this;
		                };
		                var model = function (model) {
		                    options.model = model;
		                    return this;
		                };
		                var schema = function (schema) {
		                    var paths = _.report(schema);
		                    var existsPath = [];
		                    _.each(paths, function (item) {
		                        if (!(item.name in dataTypeSchema)) return;
		                        existsPath.push(item);
		                    });

		                    _.array.sort(existsPath, "depts");
		                    _.each(existsPath, function (item) {
		                        _.setValue(schema, dataTypeSchema[item.name], item.path);
		                    });

		                    options.schema = schema;
		                    return this;
		                };
		                var virtual = function (name, defaultValue) {
		                    options.virtuals[name] = defaultValue || null;
		                    return this;
		                };
		                var getter = function (key, deformer) {
		                    options.getter[key] = deformer;
		                    return this;
		                };
		                var setter = function (key, deformer) {
		                    options.setter[key] = deformer;
		                    return this;
		                };
		                var notification = function (notification) {
		                    options.notification = notification;
		                    return this;
		                };
		                var cache = function (expiredTime, saveLocal) {
		                    //var timeWord = {
		                    //    "second": 1000,
		                    //    "minute": timeWord.second * 60,
		                    //    "hour": timeWord.minute * 60,
		                    //    "day": timeWord.hour * 24,
		                    //    "weak": "",
		                    //    "month": "",
		                    //    "year": ""
		                    //}
		                    var timeWord = _.dictionary.new();
		                    timeWord.add("second", 1000);
		                    timeWord.add("minute", 1000 * 60);
		                    timeWord.add("hour", 1000 * 60 * 60);
		                    timeWord.add("day", 1000 * 60 * 60 * 24);
		                    timeWord.add("weak", 1000 * 60 * 60 * 24 * 7);
		                    timeWord.add("month", 1000 * 60 * 60 * 24 * 7 * 4);
		                    timeWord.add("year", 1000 * 60 * 60 * 24 * 7 * 4 * 12);

		                    var amount = { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10 }

		                    if (_.is.string(expiredTime)) {
		                        var parts = _.spliteAndTrim(expiredTime.toLowerCase());
		                        options.cache.expiredTime = amount[parts[0]] * timeWord[parts[1]];
		                    } else {
		                        options.cache.expiredTime = expiredTime;
		                    }
		                    //options.cache.saveLocal = saveLocal;
		                    return this;
		                };
		                var sync = function (config) {
		                    _.update(options.sync, config);
		                    return this;
		                };
		                var config = function (key, value) {
		                    options.config[key] = value;
		                    return this;
		                };
		                var lazy_model = function () {
		                    options.lazyModel = true;

		                    return this;
		                }
		                var done = function () {
		                    apiGateway.prototype[contextName] = apiGateway.prototype[contextName] || {};
		                    apiGateway.prototype.db[contextName] = apiGateway.prototype.db[contextName] || {};
		                    apiGateway.prototype.notification[contextName] = apiGateway.prototype.notification[contextName] || {};

		                    //if lazy load
		                    if (!options.schema)
		                        options.lazyModel = true;

		                    options.model = create_model_accordiong_to_schema(options.schema, options.virtuals);
		                    add_model_to_context(options);

		                    add_api(options.context, options.actionName, options.methodType, options.route);
		                    add_notification_to_context(options.context, options.actionName, options.notification);
		                }

		                //#endregion

		                return {
		                    done: done,
		                    notification: notification,
		                    action: action,
		                    type: type,
		                    method: method,
		                    route: route,
		                    model: model,
		                    schema: schema,
		                    virtual: virtual,
		                    getter: getter,
		                    setter: setter,
		                    cache: cache,
		                    config: config,
		                    lazy_model: lazy_model
		                }
		            };

		            ///#endregion

		            apiGateway.init = function () {
		                return (apiInstance)
                            ? apiInstance
                            : apiInstance = new apiGateway();
		            }
		            return apiGateway;
		        }]
		    }
		})
;