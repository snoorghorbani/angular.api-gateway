/**set action modal and data contract
 *  maybe : apiGateway.db('voucher')
 *              .route("/voucher/search")
 *              .post()
 *              .model()
 *              .datacontract()
 *              .getter()
 *              .setter()
 *              .notification();
 **/
angular
    .module('request')
        .run(['$resource', 'locale', 'apiGateway', function ($resource, locale, apiGateway) {

            apiGateway
                .context('request')
                .action("AddNoteToRequest")
                .type('POST')
                .query_string_params(["RequestId"])
                .schema({
                    "RequestId": "",
                    "RequestType": "",
                    "NewNote": "",
                    "Note": "",
                    "Result": {
                    }
                })
                .setter("Result", function (value) { return [] })
                .notification("request.FieldsOfRequest of request start")
                .done()
            ;
        }])
;
