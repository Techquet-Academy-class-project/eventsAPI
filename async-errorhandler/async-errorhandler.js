module.exports.asyncErrorhandler = function(callback){
    return async function(req, res, next){
        try{
            await callback(req, res, next)
        }catch(err){
            console.log('error caught!!!');

            return res.status(500).json({data: null, success: false, message: err.message});
        };
    }
};