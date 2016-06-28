;
angular
	.module('apiGateway', [])
		.provider('apiGateway', function () {
		    var module_getter = {};
		    STATUS = {
		        succeed: "succeed",
		        failed: "failed",
		        compelete: "pending",
		        pending: "pending"
		    }
		    return {
		        getter: function (type, getter) {
		            module_getter[type] = getter;
		        },
		        init: function () {
		            //api = new apiGateway();
		        },
		        $get: ['$rootScope', '$state', '_', "$resource", function ($rootScope, $state, _, $resource) {

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
		                                        if (options.setter[k]) {
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
		                                _db[contextName][actionName]._config.then = thenCallback;
		                                return this;
		                            },
		                            "catch": function (catchCallback) {
		                                _db[contextName][actionName]._config.catch = catchCallback;
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
		                            Fn._config = {};
		                            Fn.$promise = {
		                                "then": function (thenCallback) {
		                                    _db[contextName][actionName]._config.then = thenCallback;
		                                    return this;
		                                },
		                                "catch": function (catchCallback) {
		                                    _db[contextName][actionName]._config.catch = catchCallback;
		                                    return this;
		                                }
		                            }
		                            Fn.prototype.actionName = actionName;

		                            return Fn;
		                        })(cFn, contextName, actionName);
		                    return this;
		                    //return (!angular.isArray(actionNames)) ? _model[contextName] : _model[contextName][actionNames];
		                };
		                var add_method_to_context = function (contextName, methodName, method) {
		                    if (!angular.isFunction(method)) return;

		                    _db[contextName][methodName] = function (actionInstance/*args*/) {
		                        var that = this;
		                        var options = options;
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

		                            args[0] = sendingObjectModel.$$toModel();
		                            prepare_model_for_sending_to_server(sendingObjectModel)
		                            var requiredFieldValidation = sendingObjectModel.haveReauiredField();

		                            var request = (requiredFieldValidation.result)
                                        ? method.apply(_db[contextName], args)
                                        : new _model[contextName][requiredFieldValidation.model]();
		                        } else {
		                            var request = method.apply(_db[contextName], args);
		                        }
		                        if (request.$promise)
		                            if (_notification[contextName][methodName])
		                                $rootScope.$$$notify.info(_notification[contextName][methodName]);

		                        //#region call on response

		                        request.$promise.then(function (result) {
		                            $rootScope.$$$notify.success();
		                            //var deformedResultAccordingType = deform_with_type_getter(actionInstance, result)
		                            //var deformedResultAccordingPath = deform_with_getter(actionInstance, result);
		                            //var deformedResult = _.update(deformedResultAccordingType, deformedResultAccordingPath);
		                            var deformedResult = deform_with_getter(actionInstance, result);
		                            actionInstance.$update(deformedResult);
		                            debugger;
		                            actionInstance.$$status = STATUS.succeed;
		                            _db[contextName][methodName]._config.then && _db[contextName][methodName]._config.then.apply(args, arguments);;
		                        }).catch(function () {
		                            $rootScope.$$$notify.error();
		                            _db[contextName][methodName]._config.catch && _db[contextName][methodName]._config.catch.apply(args, arguments);
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

		                    _db[contextName][methodName]._config = {};
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
		                var add_api = function (contextName, actionName, methodType) {
		                    this.actionName = actionName;
		                    var actions = {}
		                    actions[actionName] = { method: methodType, params: {} };
		                    var api = $resource('/' + _.camelCase(contextName) + '/' + actionName, {}, actions);
		                    add_method_to_context(contextName, actionName, api[actionName]);
		                    return this;
		                };
		                var prepare_model_for_sending_to_server = function (model) {
		                    var function_that_prepare_model_for_sending_to_server = _.leftCurry(_.deformPathValue)(model);

		                    _.each(model.options.setter, function_that_prepare_model_for_sending_to_server);
		                }
		                var deform_with_getter = function (model, response) {
		                    var function_that_change_data_with_model_getter = _.leftCurry(_.deformPathValue)(response);
		                    _.each(model.options.getter, function_that_change_data_with_model_getter);

		                    // virtual properties deformer
		                    _.each(model.options.virtuals, function (value, key) {
		                        if (!(key in model.options.getter)) return;
		                        model[key] = model.options.getter[key].call(response, model[key]);
		                        //_.deformPathValue(obj, key, model.options.getter[key]);
		                    })
		                    return response;
		                }
		                var deform_with_type_getter = function (actionInstance, result) {
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

		                var create_model_accordiong_to_schema = function (schema, virtuals) {
		                    var property_model = function () {
		                        this.Name = '';
		                        this.Default = '';
		                        this.Type = "string";
		                        this.IsRequired = false;
		                    }
		                    var isObjectType = function (obj) {
		                        var result = false;

		                        for (var i in obj) {
		                            if (_.is.object(obj[i])) {
		                                result = true;
		                            }
		                        }

		                        return result;
		                    }
		                    var interperate = function (schema) {
		                        var res = {};

		                        for (var k in schema) {
		                            if (_.is.array(schema[k])) {
		                                var sample = schema[k][0] || new property_model;
		                                res[k] = [];
		                                res[k].push(interperate(sample));
		                                //this[k] = _.is.defined(sample.default) ? sample.default : "";
		                            } else if (isObjectType(schema[k])) {
		                                res[k] = {};
		                                for (var kk in schema[k]) {
		                                    res[k][kk] = schema[k][kk].Default || "";
		                                }
		                            } else {
		                                res[k] = schema[k].Default || "";
		                            }
		                        }
		                        return res;
		                    }
		                    var model = interperate(schema);
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
		                    setter: {},
		                    config: {},
		                    virtuals: {},
		                    context: contextName
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
		                var model = function (model) {
		                    options.model = model;
		                    return this;
		                };
		                var schema = function (schema) {
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
		                var config = function (key, value) {
		                    options.config[key] = value;
		                    return this;
		                };
		                var done = function () {
		                    apiGateway.prototype[contextName] = apiGateway.prototype[contextName] || {};
		                    apiGateway.prototype.db[contextName] = apiGateway.prototype.db[contextName] || {};
		                    apiGateway.prototype.notification[contextName] = apiGateway.prototype.notification[contextName] || {};

		                    options.model = create_model_accordiong_to_schema(options.schema, options.virtuals);
		                    add_model_to_context(options);
		                    add_api(options.context, options.actionName, options.methodType);
		                    add_notification_to_context(options.context, options.actionName, options.notification);
		                }

		                //#endregion

		                return {
		                    done: done,
		                    notification: notification,
		                    action: action,
		                    type: type,
		                    method: method,
		                    model: model,
		                    schema: schema,
		                    virtual: virtual,
		                    getter: getter,
		                    setter: setter,
		                    config: config
		                }
		            };
		            ///#endregion

		            return apiGateway;
		        }]
		    }
		})
;