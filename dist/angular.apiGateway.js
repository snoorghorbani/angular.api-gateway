angular
	.module('apiGateway', [])
		.service('angular.apiGateway', ['$rootScope', '$state', '_', function ($rootScope, $state, _) {
		    var CS_DB_COMMAND_PREFIX = 'cs.db.';

		    var proxyService = function proxyService(scope, identifier) {
		        this.scope = scope;
		        this.identifier = identifier;

		        scope.CONTROLLER_NAME = identifier;

		        //scope.cs = this;
		    }

		    //#region proxyService Prototype
		    proxyService.prototype.db = proxyService.prototype.db || {};
		    //proxyService.prototype.model = proxyService.prototype.model || {};
		    proxyService.prototype.notification = proxyService.prototype.notification || {};
		    //#endregion

		    //#region proxyService Constructor Object Methods

		    proxyService.db = function (contextName) {
		        proxyService.prototype.db[contextName] = proxyService.prototype.db[contextName] || {};
		        proxyService.prototype[contextName] = proxyService.prototype[contextName] || {};
		        proxyService.prototype.notification[contextName] = proxyService.prototype.notification[contextName] || {};

		        var db = proxyService.prototype.db;
		        var model = proxyService.prototype;
		        var notification = proxyService.prototype.notification;
		        var contextName = contextName;

		        var addModelToContext = function (actionNames, cFn, options) {
		            if (!_.is.array(actionNames)) actionNames = [actionNames];

		            //TODO : think about it
		            var proto = {};
		            proto.options = options || {};
		            proto.config = proto.config || {};
		            proto.options.setter = proto.options.setter || {};
		            proto.options.getter = proto.options.getter || {};
		            proto.toModel = function () {
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
		            proto.getGetter = function (k) {
		                //TODO define property getter;
		                return (this.options.getter[k]) ? this.options.getter[k] : function (i) { return i }

		                var fn = function (i) { return i };

		                this.options.getter[k];

		                return fn;
		            }
		            proto.update = function (obj) {
		                var getter;
		                for (var k in this) {
		                    getter = this.getGetter(k);;
		                    if (this.hasOwnProperty(k))
		                        //if (_.is.defined(obj[k])) {
		                        if (k in obj) {
		                            this[k] = getter(obj[k]);
		                        } else if (_.is.defined(obj[_.pascalCase(k)])) {
		                            this[k] = getter(obj[_.pascalCase(k)]);
		                        } else if (_.is.defined(obj[_.camelCase(k)])) {
		                            this[k] = getter(obj[_.camelCase(k)]);
		                        } else if (obj[k.toLowerCase()]) {
		                            this[k] = getter(obj[k.toLowerCase()]);
		                        }
		                }
		                return this;
		            };
		            proto.extend = function (obj) {
		            }
		            proto.haveReauiredField = function () {
		                if (this.options && this.options.concrete)
		                    for (var i = 0, field; field = this.options.required[i]; i++)
		                        if (!this[field]) return { result: false, model: this.options.returnModel };
		                return { result: true };
		            }
		            proto.id = function () {
		                return this.ModelType && this[this.ModelType + 'Id'];
		            }
		            proto.$isNew = function () {
		                return (this.ModelType && (this[this.ModelType + 'Id'] || this[this.ModelType + 'Code'])) ? false : true;
		            }
		            proto.$invoke = function () {
		                return db[contextName][this.model](this);
		            };
		            proto.$reset = function () {
		                var temp = model[contextName][this.model](true);
		                return this.update(temp);
		            };

		            for (var i = 0, actionName ; actionName = actionNames[i]; i++)
		                model[contextName][actionName] = (function (cFn, contextName, actionName) {
		                    var Fn = function proxyServiceModelConstructor(reset) {
		                        if (Fn.$$instance && !reset) return Fn.$$instance;

		                        var obj = {};
		                        cFn.prototype = _.cloneObj(proto);
		                        cFn.prototype.model = actionName;
		                        obj = new cFn();

		                        if (this.uiModelPropertiesConstructor)
		                            _.extend(obj, this.uiModelPropertiesConstructor);
		                        return Fn.$$instance = obj;
		                    }
		                    Fn.$$instance = null;
		                    Fn.$action = db[contextName][actionName];
		                    Fn.$init = function (invokeAction) {
		                        var instance = new Fn();
		                        if (invokeAction) instance.$invoke();
		                        return instance;
		                    };
		                    Fn._config = {};
		                    Fn.$promise = {
		                        "then": function (thenCallback) {
		                            //db[contextName][actionName]._config = db[contextName][actionName]._config || {};
		                            db[contextName][actionName]._config.then = thenCallback;
		                            return this;
		                        },
		                        "catch": function (catchCallback) {
		                            //db[contextName][actionName]._config = db[contextName][actionName]._config || {};
		                            db[contextName][actionName]._config.catch = catchCallback;
		                            return this;
		                        }
		                    }

		                    return Fn;
		                })(cFn, contextName, actionName);

		            return (!angular.isArray(actionNames)) ? model[contextName] : model[contextName][actionNames];
		        };
		        var addMethodToContext = function (methodName, method, options) {
		            if (angular.isFunction(method)) {
		                db[contextName][methodName] = function (actionInstance/*args*/) {
		                    var that = this;
		                    var options = options;
		                    var args = _.argToArray(arguments);
		                    _.removeEventArg(args);

		                    //_.assignIfNotDefined(db[contextName].Models[methodName], addModelToContext, methodName, _.fn());
		                    //if (!model[contextName][methodName]) model[contextName][methodName] = addModelToContext(methodName, _.fn());
		                    var removeNotify = null;
		                    if (model[contextName][methodName]) {
		                        var sendingObjectModel = new model[contextName][methodName]();
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
		                        sendingObjectModel.update($state.params);
		                        if (_.is.object(args[0])) sendingObjectModel.update(args[0]);
		                        if (_.is.function(args[0])) args.unshift({});

		                        args[0] = sendingObjectModel.toModel();

		                        //var request = api[methodName].apply(db[contextName], args);
		                        var requiredFieldValidation = sendingObjectModel.haveReauiredField();

		                        var request = (requiredFieldValidation.result)
                                    ? method.apply(db[contextName], args)
                                    : new model[contextName][requiredFieldValidation.model]();
		                    } else {
		                        var request = method.apply(db[contextName], args);
		                    }
		                    if (request.$promise)
		                        if (notification[contextName][methodName])
		                            removeNotify = $rootScope.$$$notify.info(notification[contextName][methodName]);

		                    request.$promise && request.$promise.finally(function () {
		                        if (removeNotify) setTimeout(removeNotify, 333);
		                    });

		                    request.$promise.then(function (result) {
		                        $rootScope.$$$notify.success();
		                        var deformedResult = deformWithGetter(actionInstance, result);
		                        actionInstance.update(deformedResult);
		                        db[contextName][methodName]._config.then && db[contextName][methodName]._config.then.apply(args, arguments);;
		                    }).catch(function () {
		                        $rootScope.$$$notify.error();
		                        db[contextName][methodName]._config.catch && db[contextName][methodName]._config.catch.apply(args, arguments);
		                    });
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
		                                    if (model[contextName][methodName])
		                                        if (model[contextName][model[contextName][methodName]().options.returnModel])
		                                            var assignValue = new model[contextName][model[contextName][methodName]().options.returnModel]().update(assignValue);
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
		                }

		                db[contextName][methodName]._config = {};

		            }
		        };
		        var addWrapperToContext = function (methodName, method, options) {
		            db[contextName][methodName] = function () {
		                var args = _.argToArray(arguments);
		                var res = method.apply(db[contextName], args);
		                return res.fn.apply(db[contextName], res.args);
		            }
		        };
		        var addUpsertToContext = function (methodName, addMethod, updateMethod) {
		            var addMethod = addMethod;
		            var updateMethod = updateMethod;
		            db[contextName][methodName] = function (entityModel) {
		                var args = _.argToArray(arguments);

		                var fn = (entityModel.isNew())
                                ? db[contextName][addMethod]
                                : db[contextName][updateMethod];
		                return fn.apply(db[contextName], args);
		            }
		        };
		        var addNotificationToContext = function (actionNames, message) {
		            if (!_.is.array(actionNames)) actionNames = [actionNames];

		            _.each(actionNames, function (methodName) {
		                notification[contextName][methodName] = message;
		            });
		        };
		        var addApi = function (api) {
		            _.each(api, function (action, actionKey) {
		                addMethodToContext(actionKey, action);
		            }, this, true);
		        };

		        return {
		            model: addModelToContext,
		            method: addMethodToContext,
		            wrapper: addWrapperToContext,
		            upsert: addUpsertToContext,
		            notification: addNotificationToContext,
		            api: addApi,
		            uiModel: proxyService.prototype.uiModel
		        };
		    };

		    ///#endregion

		    //#region register command handler

		    var commandHandler = function (command) {
		        var fn;
		        //var command = Emitter.prototype.parse(command);
		        var action = '';
		        if (command.identifier.search(CS_DB_COMMAND_PREFIX) > -1) {
		            action = command.identifier.substr(CS_DB_COMMAND_PREFIX.length);
		            var actionPath = action.split('.')
		            if (!proxyService.prototype.db[actionPath[0]][actionPath[1]]) alert('incorrect command: ' + CS_DB_COMMAND_PREFIX + command);

		            fn = proxyService.prototype.db[actionPath[0]][actionPath[1]];
		        } else return null;

		        return {
		            fn: fn,
		            command: null
		        }
		    }
		    //Emitter.handler(commandHandler);

		    //#endregion
		    var deformWithGetter = function (model, obj) {
		        debugger;
		        var function_That_Change_Data_With_Model_Getter = _.leftCurry(_.deformPathValue)(obj);
		        _.each(model.options.getter, function_That_Change_Data_With_Model_Getter);
		        return obj;
		    }

		    return proxyService;
		}]);